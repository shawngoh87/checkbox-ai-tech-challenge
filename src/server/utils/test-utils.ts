import { Kysely, PostgresDialect } from 'kysely';
import { Migrator } from 'kysely';
import { FileMigrationProvider } from 'kysely';
import { Database } from '../infra/database/types.js';
import { promises as fs } from 'fs';
import path from 'path';
import { Pool } from 'pg';

export async function prepareTestDatabase({
  host,
  port,
  user,
  password,
  database,
}: {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}) {
  const pool = new Pool({
    host,
    port,
    user,
    password,
  });

  try {
    await pool.query(`DROP DATABASE IF EXISTS ${database}`);
    await pool.query(`CREATE DATABASE ${database}`);
  } catch (err: unknown) {
    if (err instanceof Error && 'code' in err && err.code !== '42P04') {
      throw err;
    }
  } finally {
    await pool.end();
  }

  const db = new Kysely<Database>({
    dialect: new PostgresDialect({
      pool: new Pool({
        host,
        port,
        user,
        password,
        database,
      }),
    }),
  });

  await migrateToLatest(db);

  return db;
}

export async function migrateToLatest(db: Kysely<Database>) {
  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder: path.join(__dirname, '../../../src/server/infra/database/migrations'),
    }),
  });

  const { error, results } = await migrator.migrateToLatest();

  if (error) {
    throw error;
  }

  if (results?.some((it) => it.status === 'Error')) {
    throw new Error('failed to migrate');
  }
}
