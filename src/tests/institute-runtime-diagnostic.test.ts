// CLI-only, read-only diagnostic. Run this file explicitly; never expose an API.
// INSTITUTE_READ_ONLY_DIAGNOSTIC=true npx vitest run src/tests/institute-runtime-diagnostic.test.ts
import { createHash } from 'node:crypto';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { loadEnvConfig } from '@next/env';
import type { RowDataPacket } from 'mysql2/promise';
import { describe, it } from 'vitest';
import { getInstituteDatabasePool } from '@/features/education/database/pool';

const enabled = process.env.INSTITUTE_READ_ONLY_DIAGNOSTIC === 'true';
(enabled ? describe : describe.skip)('operator-only runtime database diagnostic', () => {
  it('uses the application pool for identity and checksum queries without writes', async () => {
    loadEnvConfig(process.cwd());
    const report: Record<string, unknown> = { scope: 'local process, not deployed Next.js', status: 'BLOCKED', readOnly: true };
    let pool: ReturnType<typeof getInstituteDatabasePool> | undefined;
    try {
      pool = getInstituteDatabasePool();
      const connection = await pool.getConnection();
      try {
        await connection.query('START TRANSACTION READ ONLY');
        const [[probe]] = await connection.query<RowDataPacket[]>('SELECT 1 AS connection_test');
        const [[identity]] = await connection.query<RowDataPacket[]>('SELECT VERSION() AS version, DATABASE() AS database_name, CURRENT_USER() AS current_user');
        const [[server]] = await connection.query<RowDataPacket[]>('SELECT @@hostname AS hostname, @@port AS port');
        const [[count]] = await connection.query<RowDataPacket[]>("SELECT COUNT(*) AS table_count FROM information_schema.tables WHERE table_schema=DATABASE() AND table_type='BASE TABLE'");
        const [applied] = await connection.query<RowDataPacket[]>('SELECT migration_name, sha256 FROM institute_schema_migrations');
        const migrations = [];
        for (const file of (await readdir('database/migrations')).filter(f => /^\d+.*\.sql$/.test(f)).sort()) {
          const checksum = createHash('sha256').update(await readFile(`database/migrations/${file}`)).digest('hex');
          migrations.push({ file, matches: applied.some(row => row.migration_name === file && row.sha256 === checksum) });
        }
        Object.assign(report, { status: probe.connection_test === 1 ? 'PASS' : 'FAIL', identity, server, tableCount: Number(count.table_count), expectedTableCount: 20, migrations });
      } finally { await connection.rollback(); connection.release(); }
    } catch (error) {
      // Never serialize a driver error: it may contain credentials or SQL context.
      Object.assign(report, { failureCategory: error instanceof Error && error.name === 'InstituteDatabaseConfigurationError' ? 'database_configuration_missing_or_invalid' : 'database_query_or_connection_failed' });
    } finally { if (pool) await pool.end(); }
    await mkdir('deployment-output', { recursive: true });
    await writeFile('deployment-output/database-runtime-diagnostic.private.json', JSON.stringify(report, null, 2) + '\n');
    console.info('Read-only diagnostic completed. Inspect deployment-output/database-runtime-diagnostic.private.json privately; do not package it.');
    // Completing the diagnostic is distinct from establishing a connection.
  }, 30000);
});
