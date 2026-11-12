export const PRIVATE_PROJECT_ENV_FILES: string[];
export const STAGING_KEYS: Set<string>;
export function stagingIssues(env: Record<string, string | undefined>): Array<{ setting: string; reason: string }>;
export function stagingDatabaseIssues(env: Record<string, string | undefined>): Array<{ setting: string; reason: string }>;
export function stagingChildEnvironment(parsed: Record<string, string | undefined>, parent?: NodeJS.ProcessEnv): NodeJS.ProcessEnv;
