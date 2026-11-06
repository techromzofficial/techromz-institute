import type { CertificateRepository } from './contracts';
import { getInstituteDatabasePool } from '../database/pool';
import { MySqlCertificateRepository } from './mysqlRepository';

// Fail closed until a durable production adapter is explicitly configured.
// Never replace this with browser storage, a bundled JSON file or demo records.
export function getCertificateRepository(): CertificateRepository | null {
  try {
    return new MySqlCertificateRepository(getInstituteDatabasePool());
  } catch {
    return null;
  }
}

