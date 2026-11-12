import 'server-only';
import type { Pool, PoolConnection, RowDataPacket } from 'mysql2/promise';
import { secretHash } from './crypto';

export interface RateLimitPolicy { scope: string; maximum: number; windowSeconds: number; }

function validatePolicy(subject: string, policy: RateLimitPolicy) {
  if (!subject || !policy.scope || !Number.isSafeInteger(policy.maximum) || policy.maximum < 1 || !Number.isSafeInteger(policy.windowSeconds) || policy.windowSeconds < 1) throw new Error('INVALID_RATE_LIMIT_CONFIGURATION');
}

export async function consumeSharedRateLimit(pool: Pick<Pool, 'getConnection'>, subject: string, policy: RateLimitPolicy): Promise<{ allowed: boolean; retryAfterSeconds: number }> {
  validatePolicy(subject, policy);
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await consumeSharedRateLimitConnection(connection, subject, policy);
    await connection.commit();
    return result;
  } catch (error) { await connection.rollback(); throw error; } finally { connection.release(); }
}

export async function consumeSharedRateLimitConnection(connection: Pick<PoolConnection, 'execute'>, subject: string, policy: RateLimitPolicy): Promise<{ allowed: boolean; retryAfterSeconds: number }> {
  validatePolicy(subject, policy);
  const subjectHash = secretHash(`${policy.scope}:${subject}`);
  await connection.execute(`INSERT INTO institute_rate_limits (scope, subject_hash, window_started_at, attempt_count, expires_at)
      VALUES (?, ?, UTC_TIMESTAMP(6), 1, DATE_ADD(UTC_TIMESTAMP(6), INTERVAL ? SECOND))
      ON DUPLICATE KEY UPDATE
        attempt_count = IF(expires_at <= UTC_TIMESTAMP(6), 1, attempt_count + 1),
        window_started_at = IF(expires_at <= UTC_TIMESTAMP(6), UTC_TIMESTAMP(6), window_started_at),
        expires_at = IF(expires_at <= UTC_TIMESTAMP(6), DATE_ADD(UTC_TIMESTAMP(6), INTERVAL ? SECOND), expires_at)`, [policy.scope, subjectHash, policy.windowSeconds, policy.windowSeconds]);
  const [rows] = await connection.execute<(RowDataPacket & { attempt_count: number; retry_after: number })[]>(`SELECT attempt_count,
      GREATEST(1, TIMESTAMPDIFF(SECOND, UTC_TIMESTAMP(6), expires_at)) AS retry_after
      FROM institute_rate_limits WHERE scope = ? AND subject_hash = ? FOR UPDATE`, [policy.scope, subjectHash]);
  const current = rows[0];
  if (!current) throw new Error('RATE_LIMIT_STATE_UNAVAILABLE');
  const attempts = Number(current.attempt_count), retryAfter = Number(current.retry_after);
  if (!Number.isSafeInteger(attempts) || attempts < 1 || !Number.isSafeInteger(retryAfter) || retryAfter < 1) throw new Error('RATE_LIMIT_STATE_UNAVAILABLE');
  return attempts <= policy.maximum
    ? { allowed: true, retryAfterSeconds: 0 }
    : { allowed: false, retryAfterSeconds: retryAfter };
}

export function isIdentifierRateLimitMode(environment: NodeJS.ProcessEnv = process.env): boolean {
  return environment.INSTITUTE_ABUSE_PROTECTION_MODE === 'identifier-and-global';
}
