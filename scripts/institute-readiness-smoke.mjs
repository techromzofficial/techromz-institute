import fs from 'node:fs/promises';
import { readCatalogue } from './institute-catalogue-source.mjs';

// Deliberately restricted to a local server: no production writes, emails or quota tests.
const origin = new URL(process.argv[2] ?? 'http://127.0.0.1:3117');
if (!['127.0.0.1', 'localhost', '[::1]'].includes(origin.hostname) || origin.username || origin.password || origin.pathname !== '/' || origin.search || origin.hash) throw new Error('LOOPBACK_ORIGIN_REQUIRED');
const catalogue = await readCatalogue();
const results = [];
async function check(path, expected, method = 'GET') {
  try {
    const response = await fetch(new URL(path, origin), { method, redirect: 'manual', signal: AbortSignal.timeout(20000),
      headers: { origin: origin.origin, ...(method === 'POST' ? { 'content-type': 'application/json' } : {}) },
      ...(method === 'POST' ? { body: '{}' } : {}),
    });
    // Drain bodies so pooled sockets remain bounded. No content is logged.
    await response.arrayBuffer();
    results.push({ path, method, expected, actual: response.status, status: response.status === expected ? 'PASS' : 'FAIL' });
  } catch { results.push({ path, method, expected, status: 'FAIL', reason: 'local_request_failed' }); }
}
for (const department of catalogue.departments) await check(`/institute/departments/${department.slug}`, 200);
for (const course of catalogue.courses) await check(`/institute/courses/${course.slug}`, 200);
for (const course of catalogue.unpublished) await check(`/institute/courses/${course.slug}`, 404);
await check('/institute/verify', 200);
await check('/api/institute/course-enquiries', 200);
for (const path of ['/api/institute/course-enquiries', '/api/institute/registrations', '/api/institute/contact-verification/challenge', '/api/institute/contact-verification/verify']) await check(path, 503, 'POST');
await check('/api/institute/admin/enquiries', 503);
await check('/api/institute/admin/dashboard', 503);
await check('/api/institute/course-enquiries/delivery', 401, 'POST');
await check('/api/institute/course-enquiries/local-outbox', 404);
const report = { origin: origin.origin, scope: 'local production server, disabled features; HTTP only, no browser rendering',
  published: catalogue.courses.length, departments: catalogue.departments.length, hidden: catalogue.unpublished.length,
  passed: results.filter(r => r.status === 'PASS').length, failed: results.filter(r => r.status === 'FAIL').length, results };
await fs.mkdir('deployment-output', { recursive: true });
await fs.writeFile('deployment-output/http-smoke-readiness.json', JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ passed: report.passed, failed: report.failed, report: 'deployment-output/http-smoke-readiness.json' }));
if (report.failed) process.exitCode = 1;
