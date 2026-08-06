import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

const ENV_FILE_NAME = '.env';
const MAX_LOOKUP_DEPTH = 6;

const resolveRootEnvPath = (): string => {
  let current = __dirname;

  for (let depth = 0; depth < MAX_LOOKUP_DEPTH; depth += 1) {
    const candidate = path.join(current, ENV_FILE_NAME);
    const parent = path.dirname(current);

    if (fs.existsSync(candidate)) {
      return candidate;
    }

    if (parent === current) {
      break;
    }

    current = parent;
  }

  return path.join(process.cwd(), ENV_FILE_NAME);
};

dotenv.config({ path: resolveRootEnvPath() });

const readString = (key: string, fallback: string): string => process.env[key] ?? fallback;

const readNumber = (key: string, fallback: number): number => {
  const parsed = Number(process.env[key]);

  return Number.isFinite(parsed) ? parsed : fallback;
};

const readList = (key: string, fallback: string[]): string[] => {
  const raw = process.env[key];

  return raw ? raw.split(',').map((item) => item.trim()).filter(Boolean) : fallback;
};

export const Env = {
  nodeEnv: readString('NODE_ENV', 'development'),
  port: readNumber('PORT', 4000),
  isProduction: readString('NODE_ENV', 'development') === 'production',
  corsOrigins: readList('CORS_ORIGINS', ['http://localhost:8081']),
  defaultTenantKey: readString('DEFAULT_TENANT_KEY', 'demo-fashion'),
  jwtSecret: readString('JWT_SECRET', 'dev_secret'),
  jwtExpiresIn: readString('JWT_EXPIRES_IN', '30d'),
  db: {
    host: readString('PGHOST', 'localhost'),
    port: readNumber('PGPORT', 5432),
    user: readString('PGUSER', 'postgres'),
    password: readString('PGPASSWORD', 'postgres'),
    database: readString('PGDATABASE', 'phenomen_store'),
    max: readNumber('PG_POOL_MAX', 10),
  },
} as const;
