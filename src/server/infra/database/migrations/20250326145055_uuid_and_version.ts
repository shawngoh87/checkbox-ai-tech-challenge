import { Kysely, sql } from 'kysely';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('task')
    .dropColumn('id')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('version', 'integer', (col) => col.notNull().defaultTo(sql`0`))
    .execute();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('task')
    .dropColumn('id')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .dropColumn('version')
    .execute();
}
