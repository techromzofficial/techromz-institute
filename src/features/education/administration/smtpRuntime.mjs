export const APPROVED_SMTP_HOST = 'smtp.hostinger.com';
export const APPROVED_SMTP_PORT = 465;
export const APPROVED_SMTP_SENDER = 'enrolments@techromzit.com';

export function hostingerSmtpTransportOptions(password) {
  if (typeof password !== 'string' || password.length === 0) throw new Error('SMTP_PASSWORD_REQUIRED');
  return {
    host: APPROVED_SMTP_HOST,
    port: APPROVED_SMTP_PORT,
    secure: true,
    auth: { user: APPROVED_SMTP_SENDER, pass: password },
    tls: { rejectUnauthorized: true, minVersion: 'TLSv1.2' },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
    logger: false,
    debug: false,
  };
}
