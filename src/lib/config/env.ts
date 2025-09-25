/**
 * Environment validation and helpers for FinScore Analyzer
 * Ensures required variables are present and provides clear guidance for Google Cloud SQL (PostgreSQL).
 */

export type EnvProblem = {
  level: 'error' | 'warning';
  code: string;
  message: string;
  hint?: string;
};

export function validateEnv(): EnvProblem[] {
  const problems: EnvProblem[] = [];

  // NextAuth secret
  if (!process.env.NEXTAUTH_SECRET && process.env.NODE_ENV === 'production') {
    problems.push({
      level: 'error',
      code: 'NEXTAUTH_SECRET_MISSING',
      message: 'NEXTAUTH_SECRET is not set. NextAuth requires a secret in production.',
      hint: 'Add NEXTAUTH_SECRET to your environment (.env, Cloud Run/Functions env vars). Use `openssl rand -base64 32` to generate.'
    });
  }

  // Database
  const dbUrl = process.env.DATABASE_URL?.trim();
  const hasDiscrete = !!(
    process.env.DB_HOST && process.env.DB_USER && process.env.DB_NAME
  );

  if (!dbUrl && !hasDiscrete) {
    problems.push({
      level: 'error',
      code: 'DATABASE_CONFIG_MISSING',
      message: 'No database configuration found. Provide DATABASE_URL or discrete DB_* variables.',
      hint: 'Example (PostgreSQL): DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DBNAME'
    });
  }

  if (dbUrl?.toLowerCase().startsWith('mysql')) {
    problems.push({
      level: 'error',
      code: 'MYSQL_NOT_SUPPORTED',
      message: 'MySQL connection string detected, but this app is built for PostgreSQL.',
      hint: 'Create a PostgreSQL instance in Google Cloud SQL and use a PostgreSQL connection string. Alternatively, port the codebase to MySQL drivers/queries.'
    });
  }

  // Cloud SQL settings sanity check
  const useConnector = process.env.USE_CLOUD_SQL_CONNECTOR === 'true';
  if (useConnector && !process.env.CLOUD_SQL_INSTANCE_CONNECTION_NAME) {
    problems.push({
      level: 'error',
      code: 'CLOUD_SQL_INSTANCE_MISSING',
      message: 'USE_CLOUD_SQL_CONNECTOR=true but CLOUD_SQL_INSTANCE_CONNECTION_NAME is not set.',
      hint: 'Format is <PROJECT>:<REGION>:<INSTANCE>. Example: myproj:us-central1:finscore-db'
    });
  }

  return problems;
}

export function assertEnvReady(context: string = 'application'): void {
  const problems = validateEnv();
  const errors = problems.filter(p => p.level === 'error');
  if (errors.length) {
    const details = errors.map(e => `- [${e.code}] ${e.message}${e.hint ? `\n  Hint: ${e.hint}` : ''}`).join('\n');
    const msg = `Environment validation failed for ${context}:\n${details}`;
    // Throwing a plain Error keeps stack traces concise in Next runtime
    throw new Error(msg);
  }
}

export function printEnvWarnings(): void {
  const problems = validateEnv();
  const warnings = problems.filter(p => p.level === 'warning');
  for (const w of warnings) {
    console.warn(`⚠️ ENV WARNING [${w.code}]: ${w.message}${w.hint ? `\n   Hint: ${w.hint}` : ''}`);
  }
}
