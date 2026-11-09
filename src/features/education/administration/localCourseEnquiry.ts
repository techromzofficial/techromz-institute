import 'server-only';
import { createHmac, randomBytes, randomInt, randomUUID, timingSafeEqual } from 'node:crypto';
import type { CourseEnquiry } from './courseEnquiry';

type LocalChallenge = {
  email: string;
  codeHash: Buffer;
  expiresAt: number;
  failedAttempts: number;
  consumed: boolean;
};

type LocalGrant = { email: string; expiresAt: number; consumed: boolean };
type LocalOutboxEntry = CourseEnquiry & { enquiryId: string; submittedAt: string };
type LocalCourseEnquiryState = {
  hashKey: Buffer;
  challenges: Map<string, LocalChallenge>;
  grants: Map<string, LocalGrant>;
  requestTimes: Map<string, number[]>;
  submissions: Map<string, string>;
  outbox: LocalOutboxEntry[];
};

const stateGlobal = globalThis as typeof globalThis & { __techromzLocalCourseEnquiryState?: LocalCourseEnquiryState };
const state = stateGlobal.__techromzLocalCourseEnquiryState ?? (stateGlobal.__techromzLocalCourseEnquiryState = {
  hashKey: randomBytes(32),
  challenges: new Map<string, LocalChallenge>(),
  grants: new Map<string, LocalGrant>(),
  requestTimes: new Map<string, number[]>(),
  submissions: new Map<string, string>(),
  outbox: [],
});

export function isLocalCourseEnquiryTestMode(environment: NodeJS.ProcessEnv = process.env): boolean {
  return environment.NODE_ENV !== 'production' && environment.INSTITUTE_COURSE_ENQUIRY_LOCAL_TEST_MODE === 'true';
}

export function isLocalCourseEnquiryRequest(request: Request, environment: NodeJS.ProcessEnv = process.env): boolean {
  if (!isLocalCourseEnquiryTestMode(environment)) return false;
  const url = new URL(request.url);
  const requestHostValue = request.headers.get('host')?.toLowerCase();
  const origin = request.headers.get('origin');
  if ((!isLocalTestHost(url.hostname) && !isDevWildcardHost(url.hostname)) || !requestHostValue) return false;
  let requestHost: URL;
  try {
    requestHost = new URL(`${url.protocol}//${requestHostValue}`);
  } catch {
    return false;
  }
  if (!isLocalTestHost(requestHost.hostname) || (url.port && requestHost.port !== url.port)) return false;
  if (!sameLocalTestHost(requestHost.hostname, url.hostname) && !isLoopbackHost(url.hostname) && !isDevWildcardHost(url.hostname)) return false;
  if (!origin) return request.method === 'GET';
  try {
    const parsedOrigin = new URL(origin);
    return parsedOrigin.protocol === url.protocol &&
      parsedOrigin.port === requestHost.port &&
      (!url.port || parsedOrigin.port === url.port) &&
      isLocalTestHost(parsedOrigin.hostname) &&
      sameLocalTestHost(parsedOrigin.hostname, requestHost.hostname);
  } catch {
    return false;
  }
}

export function createLocalCourseEnquiryChallenge(emailValue: string, now = Date.now()): { challengeId: string; developmentCode: string } {
  const email = emailValue.trim().toLowerCase();
  const attempts = (state.requestTimes.get(email) ?? []).filter((requestedAt) => now - requestedAt < 86_400_000);
  if (attempts.length >= 5 || attempts.some((requestedAt) => now - requestedAt < 120_000)) {
    throw new Error('Please wait before requesting another verification code.');
  }
  attempts.push(now);
  state.requestTimes.set(email, attempts);

  for (const challenge of state.challenges.values()) {
    if (challenge.email === email && !challenge.consumed) challenge.consumed = true;
  }
  const developmentCode = String(randomInt(0, 1_000_000)).padStart(6, '0');
  const challengeId = randomUUID();
  state.challenges.set(challengeId, {
    email,
    codeHash: hash(developmentCode),
    expiresAt: now + 5 * 60_000,
    failedAttempts: 0,
    consumed: false,
  });
  return { challengeId, developmentCode };
}

export function verifyLocalCourseEnquiryCode(challengeId: string, code: string, now = Date.now()): { verified: boolean; verificationGrant?: string } {
  const challenge = state.challenges.get(challengeId);
  if (!challenge || challenge.consumed || challenge.expiresAt <= now || challenge.failedAttempts >= 5) {
    return { verified: false };
  }
  const providedHash = hash(code);
  if (!timingSafeEqual(challenge.codeHash, providedHash)) {
    challenge.failedAttempts += 1;
    return { verified: false };
  }
  challenge.consumed = true;
  const verificationGrant = randomBytes(32).toString('base64url');
  state.grants.set(hash(verificationGrant).toString('hex'), { email: challenge.email, expiresAt: now + 15 * 60_000, consumed: false });
  return { verified: true, verificationGrant };
}

export function recordLocalCourseEnquiry(input: CourseEnquiry & { verificationGrant: string; idempotencyKey: string }, now = Date.now()) {
  const existingId = state.submissions.get(input.idempotencyKey);
  if (existingId) return { enquiryId: existingId, duplicate: true };

  const grant = state.grants.get(hash(input.verificationGrant).toString('hex'));
  if (!grant || grant.consumed || grant.expiresAt <= now || grant.email !== input.email.trim().toLowerCase()) {
    throw new Error('Verify your email address before sending the enquiry.');
  }
  grant.consumed = true;
  const enquiryId = randomUUID();
  state.submissions.set(input.idempotencyKey, enquiryId);
  state.outbox.unshift({
    enquiryId,
    fullName: input.fullName,
    email: input.email,
    ...(input.phone ? { phone: input.phone } : {}),
    courseName: input.courseName,
    message: input.message,
    submittedAt: new Date(now).toISOString(),
  });
  return { enquiryId, duplicate: false };
}

export function listLocalCourseEnquiryOutbox(): LocalOutboxEntry[] {
  return state.outbox.map((entry) => ({ ...entry }));
}

export function clearLocalCourseEnquiryState(): void {
  state.challenges.clear();
  state.grants.clear();
  state.requestTimes.clear();
  state.submissions.clear();
  state.outbox.length = 0;
}

function hash(value: string): Buffer {
  return createHmac('sha256', state.hashKey).update(value).digest();
}

function isLoopbackHost(hostname: string): boolean {
  return hostname === 'localhost' || hostname === '127.0.0.1';
}

function isDevWildcardHost(hostname: string): boolean {
  return hostname === '0.0.0.0';
}

function isLocalTestHost(hostname: string): boolean {
  if (isLoopbackHost(hostname)) return true;
  const octets = hostname.split('.').map(Number);
  if (octets.length !== 4 || octets.some((octet) => !Number.isInteger(octet) || octet < 0 || octet > 255)) return false;
  const [first, second] = octets;
  return first === 10 || first === 192 && second === 168 || first === 172 && second! >= 16 && second! <= 31;
}

function sameLocalTestHost(first: string, second: string): boolean {
  return first === second || isLoopbackHost(first) && isLoopbackHost(second);
}
