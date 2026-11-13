import { spawn } from 'node:child_process';
import { mkdirSync, createWriteStream, writeFileSync } from 'node:fs';
import os from 'node:os';
const kind = process.argv[2];
const jobs = {
  jsdom: ['scripts/diagnose-jsdom.mjs'],
  types: ['node_modules/typescript/lib/_tsc.js', '--noEmit', '--extendedDiagnostics', '--traceResolution'],
  lint: ['node_modules/next/dist/bin/next', 'lint'],
  tests: ['node_modules/vitest/vitest.mjs', 'run', '--maxWorkers=1', `--pool=${process.env.VALIDATION_TEST_POOL || 'forks'}`, '--reporter=default', '--reporter=json', '--outputFile=deployment-output/validation/tests-results.json'],
  build: ['node_modules/next/dist/bin/next', 'build'],
};
if (!jobs[kind]) throw new Error('Expected types, lint, tests or build');
mkdirSync('deployment-output/validation', { recursive: true });
const started = Date.now();
writeFileSync(`deployment-output/validation/${kind}.json`, JSON.stringify({ kind, status: 'running', startedAt: new Date(started).toISOString(), node: process.version }));
const file = createWriteStream(`deployment-output/validation/${kind}.log`);
const child = spawn(process.execPath, jobs[kind], { env: { ...process.env, ...(kind === 'jsdom' ? { NODE_DEBUG: 'module' } : {}), NODE_DISABLE_COMPILE_CACHE: '1', NEXT_TELEMETRY_DISABLED: '1' }, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
for (const stream of [child.stdout, child.stderr]) stream.on('data', data => { file.write(data); if (!['types', 'jsdom'].includes(kind)) process.stdout.write(data); });
const limit = kind === 'jsdom' ? 60000 : kind === 'tests' ? 1200000 : kind === 'build' ? 600000 : kind === 'lint' ? 300000 : 180000;
const timer = setTimeout(() => { console.log(`TIMEOUT ${kind} after ${limit/1000} seconds`); if (process.platform === 'win32') spawn('taskkill', ['/PID', String(child.pid), '/T', '/F'], { windowsHide: true }); else child.kill(); }, limit);
const heartbeat = setInterval(() => console.log(`${kind}: ${Math.round((Date.now()-started)/1000)}s, free RAM ${Math.round(os.freemem()/1048576)} MiB`), 15000);
child.on('error', error => { console.error(error); });
child.on('close', (code, signal) => {
  clearTimeout(timer); clearInterval(heartbeat);file.end();
  const report={kind,code,signal,...(kind === 'tests' ? {pool:process.env.VALIDATION_TEST_POOL || 'forks'} : {}),seconds:(Date.now()-started)/1000,node:process.version,freeMemory:os.freemem()};
  writeFileSync(`deployment-output/validation/${kind}.json`,JSON.stringify(report,null,2));
  console.log(JSON.stringify(report));process.exitCode=code===0?0:1;
});
