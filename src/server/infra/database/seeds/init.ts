import { Kysely } from 'kysely';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function seed(db: Kysely<any>): Promise<void> {
  await db
    .insertInto('task')
    .values([
      {
        id: '1',
        name: 'Task 1',
        description: 'Description 1',
        due_at: new Date(),
      },
      {
        id: '2',
        name: 'Task 2',
        description: 'Description 2',
        due_at: new Date(),
      },
    ])
    .execute();
}
