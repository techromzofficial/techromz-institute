import { runInteractiveSmtpDiagnostic } from './institute-smtp-diagnostic-lib.mjs';
import { APPROVED_SMTP_HOST, APPROVED_SMTP_PORT, APPROVED_SMTP_SENDER } from '../src/features/education/administration/smtpRuntime.mjs';

const args = process.argv.slice(2);
if (args.some((value) => value.startsWith('--recipient') || value.startsWith('--password'))) throw new Error('Recipient and password arguments are forbidden. Enter them only through the interactive terminal prompts.');
if (args.some((value) => !['--dry-run', '--send'].includes(value)) || (args.includes('--dry-run') && args.includes('--send'))) throw new Error('Use either --dry-run or --send.');
const send = args.includes('--send');

if (!send) {
  process.stdout.write(`${JSON.stringify({ mode: 'dry-run', host: APPROVED_SMTP_HOST, port: APPROVED_SMTP_PORT, secure: true, sender: APPROVED_SMTP_SENDER, recipientSource: 'interactive TTY only', passwordSource: 'hidden interactive TTY only', requiresConfirmation: true, databaseAccess: false, createsRegistrationChallenge: false, sendsEmail: false }, null, 2)}\n`);
  process.exit(0);
}

try {
  await runInteractiveSmtpDiagnostic({ input: process.stdin, output: process.stdout });
  process.stdout.write('SMTP provider accepted one controlled diagnostic email.\n');
} catch (error) {
  const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : '';
  let message = 'SMTP diagnostic failed safely. No retry was attempted.';
  if (code === 'EAUTH') message = 'SMTP authentication failed. No retry was attempted.';
  else if (['ETIMEDOUT', 'ESOCKET', 'ECONNECTION'].includes(code)) message = 'SMTP connection or TLS negotiation timed out. No retry was attempted.';
  else if (error instanceof Error && error.message === 'SMTP_DELIVERY_REJECTED') message = 'SMTP provider rejected the diagnostic recipient. No retry was attempted.';
  else if (error instanceof Error && /cancelled|closed|TTY|exceeded|failed/.test(error.message)) message = error.message;
  process.stderr.write(`${message}\n`); process.exitCode = 1;
}
