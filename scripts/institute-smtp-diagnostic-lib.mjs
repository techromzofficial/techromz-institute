import nodemailer from 'nodemailer';
import { APPROVED_SMTP_SENDER, hostingerSmtpTransportOptions } from '../src/features/education/administration/smtpRuntime.mjs';

export function validateDiagnosticRecipient(value) {
  const recipient = value?.trim().toLowerCase() ?? '';
  if (recipient.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient) || /[\r\n]/.test(recipient)) throw new Error('A valid approved test recipient is required.');
  return recipient;
}

// Shared non-echoed input for controlled CLI tests. Never print the returned bytes.
export async function readHiddenTerminalValue(input, output, prompt) {
  if (!input?.isTTY || !output?.isTTY || typeof input.setRawMode !== 'function') throw new Error('Interactive TTY required.');
  const terminal = new SequentialTerminalInput(input, output);
  try { return await terminal.readHidden(prompt); } finally { terminal.close(); }
}

export async function sendInstituteSmtpDiagnostic({ recipient, password, createTransport = nodemailer.createTransport }) {
  const approvedRecipient = validateDiagnosticRecipient(recipient);
  const transport = createTransport(hostingerSmtpTransportOptions(password));
  const result = await transport.sendMail({
    from: `Techromz Institute SMTP Test <${APPROVED_SMTP_SENDER}>`,
    to: approvedRecipient,
    envelope: { from: APPROVED_SMTP_SENDER, to: [approvedRecipient] },
    subject: '[SMTP TEST] Techromz Institute controlled delivery test',
    text: 'Techromz Institute controlled SMTP test\n\nThis is an operator-authorized delivery diagnostic. It is not a student registration, verification code, certificate or enrolment message.\n\nNo action is required.\n\nContact: info@techromzit.com',
    html: '<!doctype html><html><body style="font-family:Arial,sans-serif;color:#0f172a"><div style="max-width:600px;margin:32px auto;border:1px solid #dbeafe;border-radius:14px;overflow:hidden"><div style="background:#1d4ed8;color:#fff;padding:22px"><strong style="font-size:22px">Techromz Institute</strong></div><div style="padding:28px"><h1 style="font-size:22px">Controlled SMTP test</h1><p>This is an operator-authorized delivery diagnostic.</p><p><strong>It is not a student registration, verification code, certificate or enrolment message.</strong></p><p>No action is required.</p><p>Contact: <a href="mailto:info@techromzit.com">info@techromzit.com</a></p></div></div></body></html>',
    headers: { 'X-Entity-Ref-ID': 'institute-smtp-diagnostic', 'Auto-Submitted': 'auto-generated' },
    disableFileAccess: true,
    disableUrlAccess: true,
  });
  const accepted = (result.accepted ?? []).some((entry) => (typeof entry === 'string' ? entry : entry.address)?.toLowerCase() === approvedRecipient);
  if (!accepted || (result.rejected?.length ?? 0) > 0) throw new Error('SMTP_DELIVERY_REJECTED');
  return { accepted: true };
}

export async function runInteractiveSmtpDiagnostic({ input, output, sendDiagnostic = sendInstituteSmtpDiagnostic }) {
  if (!input?.isTTY || !output?.isTTY || typeof input.setRawMode !== 'function') throw new Error('The SMTP diagnostic requires an interactive TTY. Piped input and unattended execution are refused.');
  const terminal = new SequentialTerminalInput(input, output);
  let passwordBytes;
  try {
    const recipient = validateDiagnosticRecipient(await terminal.readVisible('Approved test recipient: '));
    passwordBytes = await terminal.readHidden('Hostinger mailbox password: ');
    const confirmation = await terminal.readVisible(`Type SEND TEST TO ${recipient} to authorize one email: `);
    if (confirmation !== `SEND TEST TO ${recipient}`) throw new Error('SMTP test cancelled: confirmation did not match.');
    const password = passwordBytes.toString('utf8');
    if (!password) throw new Error('SMTP test cancelled: mailbox password was empty.');
    return await sendDiagnostic({ recipient, password });
  } finally {
    passwordBytes?.fill(0);
    terminal.close();
  }
}

class SequentialTerminalInput {
  #input; #output; #current = null; #pending = []; #closed = false; #skipLineFeed = false;
  constructor(input, output) {
    this.#input = input; this.#output = output;
    this.onData = this.onData.bind(this); this.onEnd = this.onEnd.bind(this); this.onError = this.onError.bind(this);
    input.on('data', this.onData); input.once('end', this.onEnd); input.once('error', this.onError);
  }
  readVisible(prompt) { return this.read(prompt, false); }
  readHidden(prompt) { return this.read(prompt, true); }
  read(prompt, hidden) {
    if (this.#closed) return Promise.reject(new Error('Terminal input closed.'));
    if (this.#current) return Promise.reject(new Error('A terminal prompt is already active.'));
    this.#output.write(prompt); this.#input.setRawMode(hidden);
    return new Promise((resolve, reject) => {
      this.#current = { bytes: [], hidden, resolve, reject };
      this.#input.resume();
      if (this.#pending.length) { const pending = this.#pending.splice(0); this.consume(pending); }
    });
  }
  onData(chunk) { this.consume([...chunk]); }
  consume(bytes) {
    for (let index = 0; index < bytes.length; index += 1) {
      const byte = bytes[index];
      if (this.#skipLineFeed && byte === 10) { this.#skipLineFeed = false; continue; }
      this.#skipLineFeed = false;
      if (!this.#current) { this.#pending.push(...bytes.slice(index)); return; }
      if (byte === 3) { this.fail(new Error('SMTP diagnostic cancelled by operator.')); return; }
      if (byte === 4) { this.fail(new Error('Terminal input closed.')); return; }
      if (byte === 13 || byte === 10) {
        this.#skipLineFeed = byte === 13;
        const current = this.#current; this.#current = null;
        if (current.hidden) this.#output.write('\n');
        this.#input.setRawMode(false); this.#input.pause();
        const value = current.hidden ? Buffer.from(current.bytes) : Buffer.from(current.bytes).toString('utf8').trim();
        current.resolve(value);
        if (index + 1 < bytes.length) this.#pending.push(...bytes.slice(index + 1));
        return;
      }
      if (byte === 8 || byte === 127) { if (this.#current.bytes.length) this.#current.bytes.pop(); continue; }
      if (byte >= 32 && byte <= 126) {
        if (this.#current.bytes.length >= 512) { this.fail(new Error('Terminal input exceeded the permitted length.')); return; }
        this.#current.bytes.push(byte);
      }
    }
  }
  onEnd() { this.#closed = true; this.fail(new Error('Terminal input closed.')); }
  onError() { this.#closed = true; this.fail(new Error('Terminal input failed.')); }
  fail(error) {
    const current = this.#current; this.#current = null;
    try { this.#input.setRawMode(false); } catch {}
    this.#input.pause();
    if (current) { if (current.hidden) this.#output.write('\n'); current.reject(error); }
  }
  close() {
    this.#closed = true;
    this.#input.off('data', this.onData); this.#input.off('end', this.onEnd); this.#input.off('error', this.onError);
    try { this.#input.setRawMode(false); } catch {}
    this.#input.pause(); this.#pending.fill(0); this.#pending = [];
    if (this.#current) this.fail(new Error('Terminal input closed.'));
  }
}
