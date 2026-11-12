import 'server-only';
import { timingSafeEqual } from 'node:crypto';

export function isEnquiryWorkerSecretConfigured(environment: NodeJS.ProcessEnv = process.env): boolean {
  // Visible ASCII avoids whitespace/control characters that cannot be sent reliably
  // in an Authorization header. Generate randomly; length alone is not entropy.
  const secret = environment.INSTITUTE_ENQUIRY_WORKER_SECRET ?? '';
  return secret.length >= 32 && secret.length <= 256 && !/[^\x21-\x7e]/.test(secret);
}

export function isAuthorizedEnquiryWorker(request: Request, environment: NodeJS.ProcessEnv = process.env): boolean {
  if (!isEnquiryWorkerSecretConfigured(environment)) return false;
  const actual = Buffer.from(request.headers.get('authorization') ?? '');
  const expected = Buffer.from(`Bearer ${environment.INSTITUTE_ENQUIRY_WORKER_SECRET}`);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
