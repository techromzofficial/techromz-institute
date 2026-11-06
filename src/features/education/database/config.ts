import 'server-only';

export interface InstituteDatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  connectionLimit: number;
  ssl: boolean;
}

export class InstituteDatabaseConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InstituteDatabaseConfigurationError';
  }
}

const SERVER_ONLY_KEYS = ['INSTITUTE_DB_HOST', 'INSTITUTE_DB_PORT', 'INSTITUTE_DB_NAME', 'INSTITUTE_DB_USER', 'INSTITUTE_DB_PASSWORD'] as const;

export function readInstituteDatabaseConfig(environment: NodeJS.ProcessEnv = process.env): InstituteDatabaseConfig {
  for (const key of SERVER_ONLY_KEYS) {
    if (!environment[key]?.trim()) throw new InstituteDatabaseConfigurationError(`Missing required server-only database setting: ${key}`);
  }
  const port = Number(environment.INSTITUTE_DB_PORT);
  const connectionLimit = Number(environment.INSTITUTE_DB_CONNECTION_LIMIT || '5');
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new InstituteDatabaseConfigurationError('INSTITUTE_DB_PORT must be a valid TCP port.');
  if (!Number.isInteger(connectionLimit) || connectionLimit < 1 || connectionLimit > 20) throw new InstituteDatabaseConfigurationError('INSTITUTE_DB_CONNECTION_LIMIT must be between 1 and 20.');
  const sslValue = (environment.INSTITUTE_DB_SSL || 'false').toLowerCase();
  if (!['true', 'false'].includes(sslValue)) throw new InstituteDatabaseConfigurationError('INSTITUTE_DB_SSL must be true or false.');
  return {
    host: environment.INSTITUTE_DB_HOST!.trim(), port, database: environment.INSTITUTE_DB_NAME!.trim(), user: environment.INSTITUTE_DB_USER!.trim(),
    password: environment.INSTITUTE_DB_PASSWORD!, connectionLimit, ssl: sslValue === 'true',
  };
}
