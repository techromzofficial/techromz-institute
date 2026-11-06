import { randomBytes, randomUUID, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { applying, argument, connect, readAuthorization } from './institute-provisioning-common.mjs';

const mode = argument('--mode') ?? 'bootstrap';
const username = argument('--username')?.trim().toLowerCase();
const displayName = argument('--display-name')?.trim();
if (!['bootstrap', 'rotate-password'].includes(mode)) throw new Error('--mode must be bootstrap or rotate-password.');
if (!username || !/^[a-z0-9._-]{3,120}$/.test(username)) throw new Error('A valid --username is required.');
if (mode === 'bootstrap' && (!displayName || displayName.length > 160)) throw new Error('--display-name is required for bootstrap mode.');

if (!applying()) {
  process.stdout.write(JSON.stringify({ mode: 'dry-run', operation: mode, username, valid: true, requiresAuthorizationFile: true, passwordSource: 'interactive TTY only', createsPublicEndpoint: false }, null, 2) + '\n');
} else {
  const authorization = await readAuthorization(argument('--authorization-file'));
  if (!process.stdin.isTTY || !process.stdout.isTTY) throw new Error('Password entry requires an interactive TTY. Passwords are not accepted through arguments or environment variables.');
  const password = await readSecret('New administrator password: ');
  const confirmation = await readSecret('Confirm administrator password: ');
  if (!timingSafeTextEqual(password, confirmation)) throw new Error('Password confirmation does not match.');
  const passwordHash = await hashPassword(password);
  password.fill(0); confirmation.fill(0);
  const connection = await connect();
  try {
    await connection.beginTransaction();
    const [[lock]] = await connection.query("SELECT GET_LOCK('techromz_institute_admin_provisioning', 10) AS acquired");
    if (lock.acquired !== 1) throw new Error('Could not acquire administrator provisioning lock.');
    if (mode === 'bootstrap') {
      const [[count]] = await connection.execute("SELECT COUNT(*) AS total FROM institute_admin_users WHERE role='administrator' FOR UPDATE");
      if (Number(count.total) !== 0) throw new Error('Bootstrap refused: an administrator already exists. Use the password-rotation procedure for an existing account.');
      const id = randomUUID();
      await connection.execute(`INSERT INTO institute_admin_users (id, username, display_name, password_hash, role, status)
        VALUES (?, ?, ?, ?, 'administrator', 'active')`, [id, username, displayName, passwordHash]);
      await connection.execute(`INSERT INTO institute_audit_logs (id, actor_reference, action, entity_type, entity_reference, private_metadata)
        VALUES (UUID(), ?, 'admin.bootstrap', 'admin_user', ?, JSON_OBJECT('approvedBy', ?, 'approvedAt', ?, 'changeTicket', ?))`,
        [id, id, authorization.approvedBy, new Date(authorization.approvedAt), authorization.changeTicket]);
    } else {
      const [users] = await connection.execute("SELECT id FROM institute_admin_users WHERE username=? AND status='active' FOR UPDATE", [username]);
      if (users.length !== 1) throw new Error('Password rotation requires exactly one active matching administrator account.');
      await connection.execute('UPDATE institute_admin_users SET password_hash=?, failed_login_count=0, locked_until=NULL WHERE id=?', [passwordHash, users[0].id]);
      await connection.execute('UPDATE institute_admin_sessions SET revoked_at=UTC_TIMESTAMP(6) WHERE admin_user_id=? AND revoked_at IS NULL', [users[0].id]);
      await connection.execute(`INSERT INTO institute_audit_logs (id, actor_reference, action, entity_type, entity_reference, private_metadata)
        VALUES (UUID(), ?, 'admin.password_rotated', 'admin_user', ?, JSON_OBJECT('approvedBy', ?, 'approvedAt', ?, 'changeTicket', ?))`,
        [users[0].id, users[0].id, authorization.approvedBy, new Date(authorization.approvedAt), authorization.changeTicket]);
    }
    await connection.commit();
    process.stdout.write(`${mode === 'bootstrap' ? 'Administrator provisioned' : 'Administrator password rotated and existing sessions revoked'}.\n`);
  } catch (error) { await connection.rollback(); throw error; }
  finally { try { await connection.query("SELECT RELEASE_LOCK('techromz_institute_admin_provisioning')"); } finally { await connection.end(); } }
}

function hashPassword(password) {
  if (password.length < 14 || password.length > 200) throw new Error('Administrator passwords must contain 14 to 200 characters.');
  const salt = randomBytes(16);
  return new Promise((resolve, reject) => scryptCallback(password, salt, 64, { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 }, (error, derived) => error ? reject(error) : resolve(`scrypt$32768$8$1$${salt.toString('base64')}$${derived.toString('base64')}`)));
}

function timingSafeTextEqual(left, right) { return left.length === right.length && timingSafeEqual(left, right); }

async function readSecret(prompt) {
  process.stdout.write(prompt); process.stdin.setRawMode(true); process.stdin.resume();
  const bytes = [];
  try {
    for await (const chunk of process.stdin) {
      for (const byte of chunk) {
        if (byte === 3) throw new Error('Password entry cancelled.');
        if (byte === 13 || byte === 10) { process.stdout.write('\n'); return Buffer.from(bytes); }
        if ((byte === 8 || byte === 127) && bytes.length) bytes.pop(); else if (byte >= 32 && byte <= 126) bytes.push(byte);
      }
    }
    throw new Error('Password input closed.');
  } finally { process.stdin.setRawMode(false); process.stdin.pause(); }
}
