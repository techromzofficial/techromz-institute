import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import { readCatalogue } from './institute-catalogue-source.mjs';
import { argument, connect, readAuthorization } from './institute-provisioning-common.mjs';

// Adds missing course identities only. Existing rows, intakes and fees are preserved.
const args = process.argv.slice(2);
if (args.some((arg, index) => !['--apply', '--database', '--authorization-file'].includes(arg) && args[index - 1] !== '--authorization-file')) throw new Error('Unsupported argument.');
const apply = args.includes('--apply');
if (apply && !args.includes('--database')) throw new Error('--database is required for apply.');
const catalogue = await readCatalogue();
const initial = JSON.parse(await fs.readFile('config/institute-initial-intakes.json', 'utf8'));
const report = { mode: apply ? 'apply' : 'dry-run', databaseCompared: false, ...catalogue, proposed: [], conflicts: [],
  preserved: 'Existing rows are never updated; no intakes, fee or department schema is invented.' };
function stableId(slug) {
  const approved = initial.courses.find(course => course.slug === slug);
  if (approved) return approved.id;
  const hex = createHash('sha256').update(`techromz:course:${slug}`).digest('hex').slice(0, 32);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
let connection;
try {
  if (apply) await readAuthorization(argument('--authorization-file'));
  if (args.includes('--database')) {
    connection = await connect();
    if (apply) await connection.beginTransaction();
    // InnoDB indexed range lock also serializes concurrent syncs; slug is UNIQUE.
    const [existing] = await connection.query(`SELECT id, slug, title, status FROM institute_courses ORDER BY slug${apply ? ' FOR UPDATE' : ''}`);
    report.databaseCompared = true;
    for (const course of catalogue.courses) {
      const row = existing.find(item => item.slug === course.slug);
      if (row) {
        if (row.title !== course.title || row.status === 'retired') report.conflicts.push({ slug: course.slug, reason: 'existing_title_or_status_requires_review' });
      } else report.proposed.push({ id: stableId(course.slug), slug: course.slug, title: course.title, status: 'planned' });
    }
    const hidden = new Set(catalogue.unpublished.map(c => c.slug));
    if (existing.some(row => hidden.has(row.slug) && row.status === 'active')) report.conflicts.push({ reason: 'hidden_course_active_in_database_requires_review' });
    if (apply) {
      if (report.conflicts.length) throw new Error('CATALOGUE_CONFLICTS_REQUIRE_REVIEW');
      for (const course of report.proposed) await connection.execute("INSERT INTO institute_courses (id, slug, title, status) VALUES (?, ?, ?, 'planned')", [course.id, course.slug, course.title]);
      await connection.commit();
    }
  } else report.proposed = catalogue.courses.map(course => ({ id: stableId(course.slug), slug: course.slug, title: course.title, status: 'planned', conditional: 'only if absent in database' }));
  await fs.mkdir('deployment-output', { recursive: true });
  await fs.writeFile('deployment-output/course-synchronization-review.json', JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ mode: report.mode, databaseCompared: report.databaseCompared, published: catalogue.courses.length, departments: catalogue.departments.length, hidden: catalogue.unpublished.length, proposed: report.proposed.length, conflicts: report.conflicts.length, report: 'deployment-output/course-synchronization-review.json' }, null, 2));
  if (report.conflicts.length) process.exitCode = 1;
} catch (error) {
  if (connection && apply) await connection.rollback();
  // Driver errors may embed SQL and credentials. Do not print them.
  console.error('Catalogue synchronization failed; inspect configuration or review conflicts privately. No existing row was overwritten.');
  process.exitCode = 1;
} finally { if (connection) await connection.end(); }
