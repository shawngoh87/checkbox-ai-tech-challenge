import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import { TaskRepository } from './task.repository.js';
import { Database } from '../../database/types.js';
import { Kysely } from 'kysely';
import { prepareTestDatabase } from '../../../utils/test-utils.js';
import { v4 as uuidv4 } from 'uuid';
import { Task } from '../../../domain/task/task.model.js';

describe('TaskRepository', () => {
  let taskRepository: TaskRepository;
  let db: Kysely<Database>;

  const tasksFixture = [
    {
      id: uuidv4(),
      name: 'Test Task',
      description: 'Test Description',
      due_at: new Date(),
      version: 0,
    },
    {
      id: uuidv4(),
      name: 'Test Task 2',
      description: 'Test Description 2',
      due_at: new Date(),
      version: 0,
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
        id: tasksFixture[0].id,
        name: tasksFixture[0].name,
        description: tasksFixture[0].description,
        dueAt: tasksFixture[0].due_at,
        createdAt: expect.any(Date),
        version: tasksFixture[0].version,
      });
      expect(tasks[1].toPlainObject()).toEqual({
        id: tasksFixture[1].id,
        name: tasksFixture[1].name,
        description: tasksFixture[1].description,
        dueAt: tasksFixture[1].due_at,
        createdAt: expect.any(Date),
        version: tasksFixture[1].version,
      });
    });
  });

  describe('create', () => {
    it('should create a task', async () => {
      const task = await taskRepository.create({
        task: new Task({
          id: uuidv4(),
          name: 'New Task',
          description: 'New Description',
          dueAt: new Date(),
          createdAt: new Date(),
          version: 0,
        }),
      });

      expect(task.toPlainObject()).toEqual({
        id: expect.any(String),
        name: 'New Task',
        description: 'New Description',
        dueAt: expect.any(Date),
        createdAt: expect.any(Date),
        version: 0,
      });

      // The last task should be the new one
      const tasks = await db.selectFrom('task').orderBy('created_at', 'desc').selectAll().execute();

      expect(tasks.length).toEqual(3);
      expect(tasks[0]).toEqual({
        id: expect.any(String),
        name: 'New Task',
        description: 'New Description',
        due_at: expect.any(Date),
        created_at: expect.any(Date),
        version: 0,
      });
    });

    it('should throw a UniqueKeyConstraintError if the task id already exists', async () => {
      await expect(
        taskRepository.create({
          task: new Task({
            id: tasksFixture[0].id,
            name: 'Test Task',
            description: 'Test Description',
            dueAt: new Date(),
            createdAt: new Date(),
            version: 0,
          }),
        }),
      ).rejects.toThrow(TaskRepository.UniqueKeyConstraintError);
    });
  });

  describe('updateById', () => {
    it('should update a task', async () => {
      const task = await taskRepository.updateById({
        id: tasksFixture[0].id,
        task: new Task({
          id: tasksFixture[0].id,
          name: 'Updated Task',
          description: 'Updated Description',
          dueAt: new Date(),
          createdAt: new Date(),
          version: 0,
        }),
      });

      expect(task.toPlainObject()).toEqual({
        id: tasksFixture[0].id,
        name: 'Updated Task',
        description: 'Updated Description',
        dueAt: expect.any(Date),
        createdAt: expect.any(Date),
        version: 1,
      });

      // Check if task is indeed updated
      const taskInDB = await db.selectFrom('task').where('id', '=', tasksFixture[0].id).selectAll().executeTakeFirst();

      expect(taskInDB).toEqual({
        id: expect.any(String),
        name: 'Updated Task',
        description: 'Updated Description',
        due_at: expect.any(Date),
        created_at: expect.any(Date),
        version: 1,
      });
    });
  });
});
