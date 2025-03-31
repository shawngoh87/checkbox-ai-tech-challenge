import { Container } from 'inversify';
import { getDatabaseServiceIdentifier } from '../../constants.js';
import { Kysely, PostgresDialect } from 'kysely';
import { Database } from './types.js';
import * as pg from 'pg';
const { Pool } = pg.default;

export const registerDatabase = (container: Container) => {
  const dialect = new PostgresDialect({
    pool: new Pool({
      database: process.env.DB_POSTGRES_DB,
      host: process.env.DB_POSTGRES_HOST,
      user: process.env.DB_POSTGRES_USER,
      password: process.env.DB_POSTGRES_PASSWORD,
      port: parseInt(process.env.DB_POSTGRES_PORT || '5432'),
      max: parseInt(process.env.DB_POSTGRES_MAX_CONNECTIONS || '10'),
    }),
  });

  const db = new Kysely<Database>({
    dialect,
  });

  container.bind(getDatabaseServiceIdentifier()).toConstantValue(db);
};
