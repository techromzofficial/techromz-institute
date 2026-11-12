// CLI-only, read-only diagnostic. Run this file explicitly; never expose an API.
// INSTITUTE_READ_ONLY_DIAGNOSTIC=true npx vitest run src/tests/institute-runtime-diagnostic.test.ts
import { createHash } from 'node:crypto';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import type { RowDataPacket } from 'mysql2/promise';
import { describe, expect, it } from 'vitest';
import { getInstituteDatabasePool } from '@/features/education/database/pool';
import { readInstituteDatabaseConfig } from '@/features/education/database/config';
import { isCourseEnquiryStorageReady } from '@/features/education/administration/courseEnquiryStore';

const enabled = process.env.INSTITUTE_READ_ONLY_DIAGNOSTIC === 'true';
(enabled ? describe : describe.skip)('operator-only runtime database diagnostic', () => {
  it('uses the application pool for identity and checksum queries without writes', async () => {
    // Inherit only the explicitly loaded staging process environment. Never auto-
    // merge an ambient .env.local or contact an unconfirmed database.
    const report: Record<string, unknown> = { scope: 'local process, not deployed Next.js', status: 'BLOCKED', readOnly: true };
    let pool: ReturnType<typeof getInstituteDatabasePool> | undefined;
    try {
      const config = readInstituteDatabaseConfig();
      if (process.env.INSTITUTE_TEST_DATABASE_NAME !== config.database || config.database.toLowerCase() === 'u969738052_institute') {
        report.failureCategory = 'isolated_test_database_not_confirmed';
        throw new Error('ISOLATED_TEST_DATABASE_REQUIRED');
      }
      pool = getInstituteDatabasePool();
      const schemaReady = await isCourseEnquiryStorageReady(pool);
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
        Object.assign(report, { status: Number(probe.connection_test) === 1 && schemaReady && Number(count.table_count) === 20 && migrations.every(m => m.matches) ? 'PASS' : 'FAIL', identity, server, schemaReady, tableCount: Number(count.table_count), expectedTableCount: 20, migrations });
      } finally { await connection.rollback(); connection.release(); }
    } catch (error) {
      // Never serialize a driver error: it may contain credentials or SQL context.
      Object.assign(report, { failureCategory: report.failureCategory ?? (error instanceof Error && error.name === 'InstituteDatabaseConfigurationError' ? 'database_configuration_missing_or_invalid' : 'database_query_or_connection_failed') });
    } finally { if (pool) await pool.end(); }
    await mkdir('deployment-output', { recursive: true });
    await writeFile('deployment-output/database-runtime-diagnostic.private.json', JSON.stringify(report, null, 2) + '\n');
    console.info('Read-only diagnostic completed. Inspect deployment-output/database-runtime-diagnostic.private.json privately; do not package it.');
    // Explicit diagnostics must not turn unavailable connectivity into a green test.
    expect(report.status).toBe('PASS');
  }, 30000);
});
