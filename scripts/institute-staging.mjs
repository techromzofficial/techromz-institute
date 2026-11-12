import fs from 'node:fs/promises';
import path from 'node:path';
import { parseEnv } from 'node:util';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { stagingIssues, stagingDatabaseIssues, stagingChildEnvironment, PRIVATE_PROJECT_ENV_FILES } from './institute-staging-config.mjs';

const modes = ['--check', '--build', '--start', '--db-tests', '--db-diagnostic', '--enquiry-test'];
const args = process.argv.slice(2), mode = modes.find(flag => args.includes(flag))?.slice(2) ?? 'check';
const fileIndex = args.indexOf('--env-file');
if (args.some((arg, index) => ![...modes, '--env-file'].includes(arg) && index !== fileIndex + 1) || modes.filter(flag => args.includes(flag)).length > 1 || fileIndex < 0 || !args[fileIndex + 1]) {
  console.error('Use --env-file <private-staging-file> and one supported mode. Default is disconnected --check.'); process.exit(2);
}
let parsed;
try { parsed = parseEnv(await fs.readFile(path.resolve(args[fileIndex + 1]), 'utf8')); }
catch { console.error('STAGING_ENV_FILE_UNREADABLE'); process.exit(2); }
const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const issues = ['db-tests', 'db-diagnostic'].includes(mode) ? stagingDatabaseIssues(parsed) : stagingIssues(parsed);
if (mode === 'enquiry-test' && parsed.INSTITUTE_COURSE_ENQUIRY_ENABLED !== 'true') issues.push({ setting: 'INSTITUTE_COURSE_ENQUIRY_ENABLED', reason: 'STAGING_ENQUIRY_FLAG_STILL_DISABLED' });
for (const name of PRIVATE_PROJECT_ENV_FILES) {
  try { await fs.access(path.join(root, name)); issues.push({ setting: name, reason: 'USE_CLEAN_STAGING_CHECKOUT_WITHOUT_AMBIENT_ENV_FILES' }); } catch { /* No ambient file. */ }
}
const ready = issues.length === 0;
// Fixed issue codes and setting names only: never serialize environment values.
console.log(JSON.stringify({ phase: 'preflight', mode, status: ready ? 'CONFIGURATION_VALID_NOT_DELIVERY_VERIFIED' : 'BLOCKED', networkAttempted: false, databaseAttempted: false, emailSent: false, issues }, null, 2));
if (!ready) process.exit(2);
if (mode === 'check') process.exit(0);
const env = stagingChildEnvironment(parsed);
env.INSTITUTE_MARIADB_INTEGRATION = mode === 'db-tests' ? 'true' : 'false';
env.INSTITUTE_READ_ONLY_DIAGNOSTIC = mode === 'db-diagnostic' ? 'true' : 'false';
let command;
if (mode === 'db-tests' || mode === 'db-diagnostic') command = [path.join(root, 'node_modules/vitest/vitest.mjs'), 'run', mode === 'db-tests' ? 'src/tests/institute-mariadb-integration.test.ts' : 'src/tests/institute-runtime-diagnostic.test.ts', '--maxWorkers=1', '--reporter=verbose'];
else if (mode === 'enquiry-test') command = [path.join(root, 'scripts/course-enquiry-e2e.mjs'), '--send'];
else command = [path.join(root, 'node_modules/next/dist/bin/next'), mode, ...(mode === 'start' ? ['--hostname', '127.0.0.1', '--port', '3118'] : [])];
const child = spawnSync(process.execPath, command, {
  cwd: root, env, stdio: 'inherit',
});
process.exit(child.status ?? 1);
