import { Kysely } from 'kysely';
import { v4 as uuidv4 } from 'uuid';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function seed(db: Kysely<any>): Promise<void> {
  const tasks = Array.from({ length: 20000 }, (_, i) => ({
    id: uuidv4(),
    name: `Task ${i + 1}`,
    description: `Description for task ${i + 1}`,
    due_at: new Date(Date.now() + Math.floor(Math.random() * 180) * 24 * 60 * 60 * 1000), // Random due date within next 180 days
    version: 0,
    created_at: new Date(Date.now() - Math.floor(Math.random() * 180) * 24 * 60 * 60 * 1000), // Random creation date within last 180 days
  }));

  const batchSize = 1000;
  for (let i = 0; i < tasks.length; i += batchSize) {
    const batch = tasks.slice(i, i + batchSize);
    await db.insertInto('task').values(batch).execute();
  }
}
