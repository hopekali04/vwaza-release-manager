import { z } from 'zod';

const configSchema = z.object({
  nodeEnv: z.enum(['development', 'production', 'test']),
  port: z.number().int().positive(),
  host: z.string(),
  corsOrigin: z.string(),
  logLevel: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']),
  logFilePath: z.string(),
  database: z.object({
    host: z.string(),
    port: z.number().int().positive(),
    database: z.string(),
    user: z.string(),
    password: z.string(),
  }),
  jwt: z.object({
    secret: z.string(),
    expiresIn: z.string(),
  }),
  aws: z.object({
    region: z.string(),
    accessKeyId: z.string(),
    secretAccessKey: z.string(),
    s3Bucket: z.string(),
  }),
});

export type Config = z.infer<typeof configSchema>;

function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key];
  if (!value && !defaultValue) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value || defaultValue!;
}

function getEnvVarAsNumber(key: string, defaultValue?: number): number {
  const value = process.env[key];
  if (value === undefined) {
    if (defaultValue === undefined) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
    return defaultValue;
  }
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    throw new Error(`Environment variable ${key} must be a number, but got '${value}'`);
  }
  return parsed;
}

export function loadConfig(): Config {
  const rawConfig = {
    nodeEnv: getEnvVar('NODE_ENV', 'development'),
    port: getEnvVarAsNumber('PORT', 3000),
    host: getEnvVar('HOST', '0.0.0.0'),
    corsOrigin: getEnvVar('CORS_ORIGIN', 'http://localhost:5173'),
    logLevel: getEnvVar('LOG_LEVEL', 'info'),
    logFilePath: getEnvVar('LOG_FILE_PATH', './logs/app.log'),
    database: {
      host: getEnvVar('DB_HOST', 'localhost'),
      port: getEnvVarAsNumber('DB_PORT', 5432),
      database: getEnvVar('DB_NAME', 'vwaza_release_manager'),
      user: getEnvVar('DB_USER', 'postgres'),
      password: getEnvVar('DB_PASSWORD', 'postgres'),
    },
    jwt: {
      secret: getEnvVar('JWT_SECRET', 'default-dev-secret'),
      expiresIn: getEnvVar('JWT_EXPIRES_IN', '7d'),
    },
    aws: {
      region: getEnvVar('AWS_REGION', 'us-east-1'),
      accessKeyId: getEnvVar('AWS_ACCESS_KEY_ID', ''),
      secretAccessKey: getEnvVar('AWS_SECRET_ACCESS_KEY', ''),
      s3Bucket: getEnvVar('AWS_S3_BUCKET', ''),
    },
  };

  const result = configSchema.safeParse(rawConfig);
  if (!result.success) {
    throw new Error(`Invalid configuration: ${result.error.message}`);
  }
  return result.data;
}
