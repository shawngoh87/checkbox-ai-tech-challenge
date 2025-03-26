import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import { TaskRepository } from '../../../infra/repository/task/task.repository.js';
import { Database } from '../../../infra/database/types.js';
import { Kysely } from 'kysely';
import { prepareTestDatabase } from '../../test-utils.js';

describe('TaskRepository', () => {
  let taskRepository: TaskRepository;
  let db: Kysely<Database>;

  const tasksFixture = [
    {
      id: '1',
      name: 'Test Task',
      description: 'Test Description',
      due_at: new Date(),
    },
    {
      id: '2',
      name: 'Test Task 2',
      description: 'Test Description 2',
      due_at: new Date(),
    },
  ];

  beforeAll(async () => {
    db = await prepareTestDatabase({
      host: process.env.TEST_DB_POSTGRES_HOST as string,
      port: process.env.TEST_DB_POSTGRES_PORT ? parseInt(process.env.TEST_DB_POSTGRES_PORT) : 5432,
      user: process.env.TEST_DB_POSTGRES_USER as string,
      password: process.env.TEST_DB_POSTGRES_PASSWORD as string,
      database: process.env.TEST_DB_POSTGRES_DB as string,
    });

    await db.insertInto('task').values(tasksFixture).execute();
  });

  beforeEach(() => {
    taskRepository = new TaskRepository(db);
  });

  describe('findAll', () => {
    it('should return all tasks', async () => {
      const tasks = await taskRepository.findAll();
      expect(tasks.length).toEqual(2);
      expect(tasks[0].toPlainObject()).toEqual({
        id: 1,
        name: 'Test Task',
        description: 'Test Description',
        dueAt: tasksFixture[0].due_at,
        createdAt: expect.any(Date),
      });
      expect(tasks[1].toPlainObject()).toEqual({
        id: 2,
        name: 'Test Task 2',
        description: 'Test Description 2',
        dueAt: tasksFixture[1].due_at,
        createdAt: expect.any(Date),
      });
    });
  });
});
