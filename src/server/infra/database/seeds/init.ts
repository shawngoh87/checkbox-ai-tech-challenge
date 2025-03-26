import { Kysely } from 'kysely';
import { v4 as uuidv4 } from 'uuid';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function seed(db: Kysely<any>): Promise<void> {
  await db
    .insertInto('task')
    .values([
      {
        id: uuidv4(),
        name: 'Task 1',
        description: 'Description 1',
        due_at: new Date(),
        version: 0,
      },
      {
        id: uuidv4(),
        name: 'Task 2',
        description: 'Description 2',
        due_at: new Date(),
        version: 0,
      },
    ])
    .execute();
}
