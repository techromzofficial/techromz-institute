import fs from 'node:fs/promises';
import path from 'node:path';
import { applying, argument, connect, readAuthorization } from './institute-provisioning-common.mjs';

const manifestPath = path.join(process.cwd(), 'config', 'institute-initial-intakes.json');
const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
const errors = [];
if (manifest.courses?.length !== 9) errors.push('Manifest must contain exactly nine approved courses.');
const unique = (field) => new Set(manifest.courses.map((item) => item[field])).size === manifest.courses.length;
for (const field of ['id', 'slug', 'intakeId', 'intakeCode']) if (!unique(field)) errors.push(`${field} values must be unique.`);
for (const course of manifest.courses) {
  if (!Number.isSafeInteger(course.feeMinor) || course.feeMinor <= 0) errors.push(`${course.slug}: approved fee is missing or invalid.`);
  if (!course.registrationDeadlineAt || Number.isNaN(Date.parse(course.registrationDeadlineAt))) errors.push(`${course.slug}: confirmed registration deadline is missing.`);
  if (course.startsAt && Number.isNaN(Date.parse(course.startsAt))) errors.push(`${course.slug}: start date is invalid.`);
}
if (!applying()) {
  const deadlines = Object.fromEntries([...new Set(manifest.courses.map((course) => course.registrationDeadlineAt))].map((deadline) => [deadline, manifest.courses.filter((course) => course.registrationDeadlineAt === deadline).length]));
  process.stdout.write(JSON.stringify({ mode: 'dry-run', courses: manifest.courses.length, maxSeats: 30, currency: 'LKR', deadlines, valid: errors.length === 0, errors }, null, 2) + '\n');
  process.exitCode = errors.length ? 2 : 0;
} else {
  if (errors.length) throw new Error(`Provisioning manifest is not ready:\n- ${errors.join('\n- ')}`);
  const authorization = await readAuthorization(argument('--authorization-file'));
  const connection = await connect();
  try {
    await connection.beginTransaction();
    const [[lock]] = await connection.query("SELECT GET_LOCK('techromz_institute_catalogue_provisioning', 10) AS acquired");
    if (lock.acquired !== 1) throw new Error('Could not acquire catalogue provisioning lock.');
    for (const course of manifest.courses) {
      await connection.execute(`INSERT INTO institute_courses (id, slug, title, status) VALUES (?, ?, ?, 'planned')
        ON DUPLICATE KEY UPDATE title=VALUES(title)`, [course.id, course.slug, course.title]);
      await connection.execute(`INSERT INTO institute_course_intakes
        (id, course_id, intake_code, max_seats, fee_minor, fee_currency, registration_opens_at, registration_deadline_at, starts_at, status)
        VALUES (?, ?, ?, 30, ?, 'LKR', ?, ?, ?, 'draft')
        ON DUPLICATE KEY UPDATE registration_opens_at=VALUES(registration_opens_at), registration_deadline_at=VALUES(registration_deadline_at), starts_at=VALUES(starts_at)`,
        [course.intakeId, course.id, course.intakeCode, course.feeMinor, course.registrationOpensAt ? new Date(course.registrationOpensAt) : null, new Date(course.registrationDeadlineAt), course.startsAt ? new Date(course.startsAt) : null]);
    }
    await connection.execute(`INSERT INTO institute_audit_logs (id, actor_reference, action, entity_type, entity_reference, private_metadata)
      VALUES (UUID(), '00000000-0000-0000-0000-000000000000', 'catalogue.provisioned', 'course_catalogue', '00000000-0000-0000-0000-000000000000', JSON_OBJECT('approvedBy', ?, 'approvedAt', ?, 'changeTicket', ?, 'courseCount', 9))`,
      [authorization.approvedBy, new Date(authorization.approvedAt), authorization.changeTicket]);
    await connection.commit();
    process.stdout.write('Provisioned nine course/intake records in draft state. Feature gates were not changed.\n');
  } catch (error) { await connection.rollback(); throw error; }
  finally { try { await connection.query("SELECT RELEASE_LOCK('techromz_institute_catalogue_provisioning')"); } finally { await connection.end(); } }
}
