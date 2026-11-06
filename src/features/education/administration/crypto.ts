import 'server-only';
import { createCipheriv, createDecipheriv, createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
function scrypt(password: string, salt: Buffer, length: number, options: { N: number; r: number; p: number; maxmem: number }): Promise<Buffer> {
  return new Promise((resolve, reject) => scryptCallback(password, salt, length, options, (error, derived) => error ? reject(error) : resolve(derived)));
}

function keyFrom(environment: NodeJS.ProcessEnv, name: string): Buffer {
  const value = environment[name];
  if (!value) throw new Error(`Missing required server-only security setting: ${name}`);
  const key = Buffer.from(value, 'base64');
  if (key.length !== 32) throw new Error(`${name} must be a base64-encoded 32-byte value.`);
  return key;
}

export function encryptPrivateValue(value: string, environment: NodeJS.ProcessEnv = process.env): Buffer {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', keyFrom(environment, 'INSTITUTE_PII_ENCRYPTION_KEY'), iv);
  const encrypted = Buffer.concat([cipher.update(value.trim(), 'utf8'), cipher.final()]);
  return Buffer.concat([Buffer.from([1]), iv, cipher.getAuthTag(), encrypted]);
}

export function decryptPrivateValue(payload: Buffer, environment: NodeJS.ProcessEnv = process.env): string {
  if (payload.length < 30 || payload[0] !== 1) throw new Error('Unsupported encrypted value.');
  const decipher = createDecipheriv('aes-256-gcm', keyFrom(environment, 'INSTITUTE_PII_ENCRYPTION_KEY'), payload.subarray(1, 13));
  decipher.setAuthTag(payload.subarray(13, 29));
  return Buffer.concat([decipher.update(payload.subarray(29)), decipher.final()]).toString('utf8');
}

export function privateLookupHash(value: string, environment: NodeJS.ProcessEnv = process.env): Buffer {
  return createHmac('sha256', keyFrom(environment, 'INSTITUTE_PII_LOOKUP_KEY')).update(value.trim().toLowerCase()).digest();
}

export function secretHash(value: string, environment: NodeJS.ProcessEnv = process.env): Buffer {
  return createHmac('sha256', keyFrom(environment, 'INSTITUTE_SESSION_HASH_KEY')).update(value).digest();
}

export async function hashPassword(password: string): Promise<string> {
  if (password.length < 14 || password.length > 200) throw new Error('Administrator passwords must contain 14 to 200 characters.');
  const salt = randomBytes(16);
  const derived = await scrypt(password, salt, 64, { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
  return `scrypt$32768$8$1$${salt.toString('base64')}$${derived.toString('base64')}`;
}

export async function verifyPassword(password: string, encoded: string): Promise<boolean> {
  const [algorithm, n, r, p, saltValue, hashValue] = encoded.split('$');
  if (algorithm !== 'scrypt' || !saltValue || !hashValue) return false;
  const expected = Buffer.from(hashValue, 'base64');
  const actual = await scrypt(password, Buffer.from(saltValue, 'base64'), expected.length, { N: Number(n), r: Number(r), p: Number(p), maxmem: 64 * 1024 * 1024 });
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
