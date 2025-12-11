export interface Config {
  nodeEnv: 'development' | 'production' | 'test';
  port: number;
  host: string;
  corsOrigin: string;
  logLevel: 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';
  database: {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  aws: {
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
    s3Bucket: string;
  };
}

function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key];
  if (!value && !defaultValue) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value || defaultValue!;
}

function getEnvVarAsNumber(key: string, defaultValue?: number): number {
  const value = process.env[key];
  if (!value && defaultValue === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value ? parseInt(value, 10) : defaultValue!;
}

export function loadConfig(): Config {
  return {
    nodeEnv: (getEnvVar('NODE_ENV', 'development') as Config['nodeEnv']),
    port: getEnvVarAsNumber('PORT', 3000),
    host: getEnvVar('HOST', '0.0.0.0'),
    corsOrigin: getEnvVar('CORS_ORIGIN', 'http://localhost:5173'),
    logLevel: (getEnvVar('LOG_LEVEL', 'info') as Config['logLevel']),
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
}
