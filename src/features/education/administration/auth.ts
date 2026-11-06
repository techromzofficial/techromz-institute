import 'server-only';
import { randomBytes, randomUUID } from 'node:crypto';
import type { Pool, RowDataPacket } from 'mysql2/promise';
import { cookies } from 'next/headers';
import { getInstituteDatabasePool } from '../database/pool';
import { requireInstituteFeature } from './config';
import { secretHash, verifyPassword } from './crypto';

export const ADMIN_SESSION_COOKIE = '__Host-tit_admin';
export const ADMIN_CSRF_COOKIE = '__Host-tit_csrf';
const SESSION_SECONDS = 60 * 60 * 8;

type AdminRow = RowDataPacket & { id: string; display_name: string; password_hash: string; role: AdminRole; status: string; failed_login_count: number; locked_until: Date | null };
type SessionRow = RowDataPacket & { id: string; admin_user_id: string; display_name: string; role: AdminRole; csrf_hash: Buffer; expires_at: Date };
export type AdminRole = 'administrator' | 'registrar' | 'viewer';
export interface AdminSession { sessionId: string; adminUserId: string; displayName: string; role: AdminRole; }

export async function authenticateAdmin(pool: Pick<Pool, 'getConnection'>, username: string, password: string, abuseScopeIdentity: string) {
  requireInstituteFeature('admin');
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const identityHash = secretHash(username);
    const networkHash = secretHash(abuseScopeIdentity);
    const [attempts] = await connection.execute<RowDataPacket[]>(`SELECT
      SUM(identity_hash = ?) AS identity_failures,
      SUM(network_hash = ?) AS global_failures
      FROM institute_auth_attempts
      WHERE succeeded = FALSE AND occurred_at > DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 15 MINUTE)
      AND (identity_hash = ? OR network_hash = ?)`, [identityHash, networkHash, identityHash, networkHash]);
    if (Number(attempts[0]?.identity_failures ?? 0) >= 8 || Number(attempts[0]?.global_failures ?? 0) >= 50) throw new Error('RATE_LIMITED');
    const [users] = await connection.execute<AdminRow[]>('SELECT id, display_name, password_hash, role, status, failed_login_count, locked_until FROM institute_admin_users WHERE username = ? FOR UPDATE', [username]);
    const user = users[0];
    const valid = !!user && user.status === 'active' && (!user.locked_until || user.locked_until <= new Date()) && await verifyPassword(password, user.password_hash);
    await connection.execute('INSERT INTO institute_auth_attempts (identity_hash, network_hash, succeeded) VALUES (?, ?, ?)', [identityHash, networkHash, valid]);
    if (!valid) {
      if (user) await connection.execute(`UPDATE institute_admin_users SET failed_login_count = failed_login_count + 1,
        locked_until = IF(failed_login_count + 1 >= 5, DATE_ADD(UTC_TIMESTAMP(6), INTERVAL 15 MINUTE), locked_until) WHERE id = ?`, [user.id]);
      await connection.commit();
      return null;
    }
    const token = randomBytes(32).toString('base64url');
    const csrf = randomBytes(32).toString('base64url');
    const sessionId = randomUUID();
    await connection.execute(`INSERT INTO institute_admin_sessions (id, admin_user_id, token_hash, csrf_hash, expires_at)
      VALUES (?, ?, ?, ?, DATE_ADD(UTC_TIMESTAMP(6), INTERVAL ? SECOND))`, [sessionId, user.id, secretHash(token), secretHash(csrf), SESSION_SECONDS]);
    await connection.execute('UPDATE institute_admin_users SET failed_login_count = 0, locked_until = NULL, last_login_at = UTC_TIMESTAMP(6) WHERE id = ?', [user.id]);
    await connection.execute(`INSERT INTO institute_audit_logs (id, actor_reference, action, entity_type, entity_reference, private_metadata)
      VALUES (?, ?, 'admin.login', 'admin_session', ?, JSON_OBJECT())`, [randomUUID(), user.id, sessionId]);
    await connection.commit();
    return { token, csrf, expiresAt: new Date(Date.now() + SESSION_SECONDS * 1000) };
  } catch (error) { await connection.rollback(); throw error; } finally { connection.release(); }
}

export async function readAdminSession(pool: Pick<Pool, 'execute'> = getInstituteDatabasePool()): Promise<AdminSession | null> {
  requireInstituteFeature('admin');
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return null;
  const [rows] = await pool.execute<SessionRow[]>(`SELECT s.id, s.admin_user_id, s.csrf_hash, s.expires_at, u.display_name, u.role
    FROM institute_admin_sessions s JOIN institute_admin_users u ON u.id = s.admin_user_id
    WHERE s.token_hash = ? AND s.revoked_at IS NULL AND s.expires_at > UTC_TIMESTAMP(6) AND u.status = 'active' LIMIT 1`, [secretHash(token)]);
  const row = rows[0];
  return row ? { sessionId: row.id, adminUserId: row.admin_user_id, displayName: row.display_name, role: row.role } : null;
}

export async function requireAdminSession(allowed: AdminRole[]): Promise<AdminSession> {
  const session = await readAdminSession();
  if (!session || !allowed.includes(session.role)) throw new Error('UNAUTHORIZED');
  return session;
}

export async function verifyCsrf(request: Request, pool: Pick<Pool, 'execute'> = getInstituteDatabasePool()): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  const csrf = cookieStore.get(ADMIN_CSRF_COOKIE)?.value;
  const header = request.headers.get('x-csrf-token');
  if (!token || !csrf || csrf !== header) return false;
  const origin = request.headers.get('origin');
  if (!origin || new URL(origin).host !== new URL(request.url).host) return false;
  const [rows] = await pool.execute<RowDataPacket[]>('SELECT 1 FROM institute_admin_sessions WHERE token_hash = ? AND csrf_hash = ? AND revoked_at IS NULL AND expires_at > UTC_TIMESTAMP(6)', [secretHash(token), secretHash(csrf)]);
  return rows.length === 1;
}

export async function revokeCurrentSession(pool: Pick<Pool, 'getConnection'> = getInstituteDatabasePool()): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return;
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.execute<(RowDataPacket & { id: string; admin_user_id: string })[]>('SELECT id, admin_user_id FROM institute_admin_sessions WHERE token_hash = ? AND revoked_at IS NULL FOR UPDATE', [secretHash(token)]);
    const session = rows[0];
    if (session) {
      await connection.execute('UPDATE institute_admin_sessions SET revoked_at = UTC_TIMESTAMP(6) WHERE id = ?', [session.id]);
      await connection.execute(`INSERT INTO institute_audit_logs (id, actor_reference, action, entity_type, entity_reference, private_metadata)
        VALUES (?, ?, 'admin.logout', 'admin_session', ?, JSON_OBJECT())`, [randomUUID(), session.admin_user_id, session.id]);
    }
    await connection.commit();
  } catch (error) { await connection.rollback(); throw error; } finally { connection.release(); }
}
