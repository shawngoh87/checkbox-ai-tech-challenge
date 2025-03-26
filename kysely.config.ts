import dotenv from 'dotenv';
dotenv.config();

import { defineConfig, getKnexTimestampPrefix } from 'kysely-ctl';
import { PostgresDialect } from 'kysely';
import { Pool } from 'pg';

export default defineConfig({
  dialect: new PostgresDialect({
    pool: new Pool({
      host: process.env.DB_POSTGRES_HOST,
      port: process.env.DB_POSTGRES_PORT ? parseInt(process.env.DB_POSTGRES_PORT) : 5432,
      user: process.env.DB_POSTGRES_USER,
      password: process.env.DB_POSTGRES_PASSWORD,
      database: process.env.DB_POSTGRES_DB,
    }),
  }),
  migrations: {
    allowJS: true,
    allowUnorderedMigrations: false,
    migrationFolder: './src/server/infra/database/migrations',
    getMigrationPrefix: getKnexTimestampPrefix,
  },
  seeds: {
    allowJS: true,
    seedFolder: './src/server/infra/database/seeds',
  },
});
