import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { PassThrough } from 'node:stream';
import { describe, expect, it, vi } from 'vitest';
import { runInteractiveSmtpDiagnostic, sendInstituteSmtpDiagnostic, validateDiagnosticRecipient } from '../../scripts/institute-smtp-diagnostic-lib.mjs';

function fakeTerminal() {
  const input = new PassThrough() as PassThrough & { isTTY: boolean; setRawMode(mode: boolean): void };
  const output = new PassThrough() as PassThrough & { isTTY: boolean };
  input.isTTY = true; input.setRawMode = vi.fn(); output.isTTY = true;
  let transcript = ''; output.on('data', (chunk) => { transcript += chunk.toString('utf8'); });
  return { input, output, transcript: () => transcript };
}

function writeWhenPrompted(terminal: ReturnType<typeof fakeTerminal>, prompt: string, value: string | Buffer) {
  return new Promise<void>((resolve) => {
    const listener = () => { if (terminal.transcript().includes(prompt)) { terminal.output.off('data', listener); terminal.input.write(value); resolve(); } };
    terminal.output.on('data', listener); listener();
  });
}

describe('operator-only SMTP diagnostic', () => {
  it('defaults to a disconnected dry-run with no database or registration effects', () => {
    const result = spawnSync(process.execPath, ['scripts/institute-smtp-diagnostic.mjs'], { cwd: process.cwd(), encoding: 'utf8', env: { NODE_ENV: 'test' } });
    expect(result.status).toBe(0);
    expect(JSON.parse(result.stdout)).toEqual(expect.objectContaining({ mode: 'dry-run', host: 'smtp.hostinger.com', port: 465, secure: true, sender: 'enrolments@techromzit.com', recipientSource: 'interactive TTY only', passwordSource: 'hidden interactive TTY only', requiresConfirmation: true, databaseAccess: false, createsRegistrationChallenge: false, sendsEmail: false }));
    expect(result.stderr).toBe('');
  });

  it('forbids recipient and password command-line arguments', () => {
    for (const argument of ['--recipient=target@example.com', '--password=secret']) {
      const result = spawnSync(process.execPath, ['scripts/institute-smtp-diagnostic.mjs', argument], { cwd: process.cwd(), encoding: 'utf8', env: { NODE_ENV: 'test' } });
      expect(result.status).not.toBe(0); expect(result.stderr).toContain('arguments are forbidden');
    }
  });

  it('uses the shared Hostinger TLS settings and a diagnostic-only fixed message', async () => {
    const sendMail = vi.fn(async (_message: Record<string, unknown>) => ({ accepted: ['approved@example.com'], rejected: [] }));
    const createTransport = vi.fn(() => ({ sendMail }));
    await expect(sendInstituteSmtpDiagnostic({ recipient: 'Approved@example.com', password: 'mock-password', createTransport })).resolves.toEqual({ accepted: true });
    expect(createTransport).toHaveBeenCalledWith(expect.objectContaining({ host: 'smtp.hostinger.com', port: 465, secure: true, tls: { rejectUnauthorized: true, minVersion: 'TLSv1.2' }, logger: false, debug: false }));
    const message = sendMail.mock.calls[0]![0];
    expect(message).toMatchObject({ to: 'approved@example.com', subject: '[SMTP TEST] Techromz Institute controlled delivery test', disableFileAccess: true, disableUrlAccess: true });
    expect(JSON.stringify(message)).toContain('not a student registration'); expect(JSON.stringify(message)).not.toContain('mock-password');
  });

  it('keeps one TTY lifecycle alive across recipient, hidden password and confirmation, then sends once', async () => {
    const terminal = fakeTerminal(); const sendDiagnostic = vi.fn(async () => ({ accepted: true as const }));
    const session = runInteractiveSmtpDiagnostic({ input: terminal.input as never, output: terminal.output as never, sendDiagnostic });
    await writeWhenPrompted(terminal, 'Approved test recipient:', 'Approved@example.com\r');
    await writeWhenPrompted(terminal, 'Hostinger mailbox password:', 'super-secret-password\r');
    await writeWhenPrompted(terminal, 'Type SEND TEST TO approved@example.com', 'SEND TEST TO approved@example.com\r');
    await expect(session).resolves.toEqual({ accepted: true });
    expect(sendDiagnostic).toHaveBeenCalledOnce(); expect(sendDiagnostic).toHaveBeenCalledWith({ recipient: 'approved@example.com', password: 'super-secret-password' });
    expect(terminal.transcript()).not.toContain('super-secret-password');
    expect(terminal.input.setRawMode).toHaveBeenCalledWith(true); expect(terminal.input.setRawMode).toHaveBeenLastCalledWith(false);
  });

  it('rejects an incorrect confirmation before creating an SMTP transport', async () => {
    const terminal = fakeTerminal(); const sendDiagnostic = vi.fn();
    const session = runInteractiveSmtpDiagnostic({ input: terminal.input as never, output: terminal.output as never, sendDiagnostic });
    await writeWhenPrompted(terminal, 'Approved test recipient:', 'approved@example.com\n');
    await writeWhenPrompted(terminal, 'Hostinger mailbox password:', 'hidden-password\n');
    await writeWhenPrompted(terminal, 'Type SEND TEST TO approved@example.com', 'NO\n');
    await expect(session).rejects.toThrow('confirmation did not match'); expect(sendDiagnostic).not.toHaveBeenCalled();
    expect(terminal.transcript()).not.toContain('hidden-password');
  });

  it('handles EOF and Ctrl+C safely without sending', async () => {
    const eofTerminal = fakeTerminal(); const eofSend = vi.fn();
    const eofSession = runInteractiveSmtpDiagnostic({ input: eofTerminal.input as never, output: eofTerminal.output as never, sendDiagnostic: eofSend });
    await writeWhenPrompted(eofTerminal, 'Approved test recipient:', 'approved@example.com\n');
    await writeWhenPrompted(eofTerminal, 'Hostinger mailbox password:', 'hidden-password\n');
    await writeWhenPrompted(eofTerminal, 'Type SEND TEST TO approved@example.com', Buffer.from([4]));
    await expect(eofSession).rejects.toThrow('Terminal input closed'); expect(eofSend).not.toHaveBeenCalled();

    const interruptTerminal = fakeTerminal(); const interruptSend = vi.fn();
    const interruptSession = runInteractiveSmtpDiagnostic({ input: interruptTerminal.input as never, output: interruptTerminal.output as never, sendDiagnostic: interruptSend });
    await writeWhenPrompted(interruptTerminal, 'Approved test recipient:', 'approved@example.com\n');
    await writeWhenPrompted(interruptTerminal, 'Hostinger mailbox password:', Buffer.from([3]));
    await expect(interruptSession).rejects.toThrow('cancelled by operator'); expect(interruptSend).not.toHaveBeenCalled();
  });

  it('rejects unsafe recipients and provider delivery rejection without retry', async () => {
    expect(() => validateDiagnosticRecipient('victim@example.com\r\nBcc: attacker@example.com')).toThrow();
    const sendMail = vi.fn(async () => ({ accepted: [], rejected: ['approved@example.com'] }));
    await expect(sendInstituteSmtpDiagnostic({ recipient: 'approved@example.com', password: 'mock-password', createTransport: () => ({ sendMail }) })).rejects.toThrow('SMTP_DELIVERY_REJECTED');
    expect(sendMail).toHaveBeenCalledOnce();
  });

  it('has no public route or database dependency', () => {
    const script = fs.readFileSync(path.join(process.cwd(), 'scripts/institute-smtp-diagnostic.mjs'), 'utf8');
    const library = fs.readFileSync(path.join(process.cwd(), 'scripts/institute-smtp-diagnostic-lib.mjs'), 'utf8');
    expect(script + library).not.toMatch(/from ['"][^'"]*(mysql|database|registrations|certificates)/i);
    expect(fs.existsSync(path.join(process.cwd(), 'src/app/api/institute/smtp-diagnostic'))).toBe(false);
  });
});
