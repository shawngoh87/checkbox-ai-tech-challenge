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

  const baseTime = new Date('2024-01-01T00:00:00Z');
  const tasksFixture = [
    {
      id: uuidv4(),
      name: 'Test Task',
      description: 'Test Description',
      due_at: new Date(baseTime.getTime()),
      created_at: new Date(baseTime.getTime()),
      version: 0,
    },
    {
      id: uuidv4(),
      name: 'Test Task 2',
      description: 'Test Description 2',
      due_at: new Date(baseTime.getTime() + 1000),
      created_at: new Date(baseTime.getTime() + 1000),
      version: 0,
    },
    {
      id: uuidv4(),
      name: 'Task 3',
      description: 'Description 3',
      due_at: new Date(baseTime.getTime() + 2000),
      created_at: new Date(baseTime.getTime() + 2000),
      version: 0,
    },
    {
      id: uuidv4(),
      name: 'Task 4',
      description: 'Description 4',
      due_at: new Date(baseTime.getTime() + 3000),
      created_at: new Date(baseTime.getTime() + 3000),
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
  });

  beforeEach(async () => {
    await db.deleteFrom('task').execute();
    await db.insertInto('task').values(tasksFixture).execute();
    taskRepository = new TaskRepository(db);
  });

  describe('decodeCursor', () => {
    it('should decode a created_at cursor', () => {
      const cursor = Buffer.from(
        JSON.stringify({ created_at: tasksFixture[0].created_at, id: tasksFixture[0].id }),
      ).toString('base64');
      const decodedCursor = taskRepository.decodeCursor(cursor);
      expect(decodedCursor).toEqual({ created_at: tasksFixture[0].created_at, id: tasksFixture[0].id });
    });

    it('should decode a due_at cursor', () => {
      const cursor = Buffer.from(JSON.stringify({ due_at: tasksFixture[0].due_at, id: tasksFixture[0].id })).toString(
        'base64',
      );
      const decodedCursor = taskRepository.decodeCursor(cursor);
      expect(decodedCursor).toEqual({ due_at: tasksFixture[0].due_at, id: tasksFixture[0].id });
    });

    it('should throw an InvalidCursorError if the cursor is invalid', () => {
      const cursor = Buffer.from('invalid').toString('base64');
      expect(() => taskRepository.decodeCursor(cursor)).toThrow(TaskRepository.InvalidCursorError);
    });
  });

  describe('findAll', () => {
    it('should return all tasks', async () => {
      const tasks = await taskRepository.findAll();
      expect(tasks.length).toEqual(4);
      expect(tasks[0].toPlainObject()).toEqual({
        id: tasksFixture[3].id,
        name: tasksFixture[3].name,
        description: tasksFixture[3].description,
        dueAt: tasksFixture[3].due_at,
        createdAt: tasksFixture[3].created_at,
        version: tasksFixture[3].version,
      });
      expect(tasks[1].toPlainObject()).toEqual({
        id: tasksFixture[2].id,
        name: tasksFixture[2].name,
        description: tasksFixture[2].description,
        dueAt: tasksFixture[2].due_at,
        createdAt: tasksFixture[2].created_at,
        version: tasksFixture[2].version,
      });
      expect(tasks[2].toPlainObject()).toEqual({
        id: tasksFixture[1].id,
        name: tasksFixture[1].name,
        description: tasksFixture[1].description,
        dueAt: tasksFixture[1].due_at,
        createdAt: tasksFixture[1].created_at,
        version: tasksFixture[1].version,
      });
      expect(tasks[3].toPlainObject()).toEqual({
        id: tasksFixture[0].id,
        name: tasksFixture[0].name,
        description: tasksFixture[0].description,
        dueAt: tasksFixture[0].due_at,
        createdAt: tasksFixture[0].created_at,
        version: tasksFixture[0].version,
      });
    });

    it('should support cursor-based pagination with created_at sorting', async () => {
      const firstPage = await taskRepository.findAll({
        sort: 'created_at:desc',
        limit: 2,
      });
      expect(firstPage.length).toBe(2);
      expect(firstPage[0].toPlainObject().id).toBe(tasksFixture[3].id);
      expect(firstPage[1].toPlainObject().id).toBe(tasksFixture[2].id);

      const secondPage = await taskRepository.findAll({
        sort: 'created_at:desc',
        limit: 2,
        cursor: Buffer.from(
          JSON.stringify({ created_at: tasksFixture[2].created_at, id: tasksFixture[2].id }),
        ).toString('base64'),
      });
      expect(secondPage.length).toBe(2);
      expect(secondPage[0].toPlainObject().id).toBe(tasksFixture[1].id);
      expect(secondPage[1].toPlainObject().id).toBe(tasksFixture[0].id);
    });

    it('should support cursor-based pagination with due_at sorting', async () => {
      const firstPage = await taskRepository.findAll({
        sort: 'due_at:desc',
        limit: 2,
      });
      expect(firstPage.length).toBe(2);
      expect(firstPage[0].toPlainObject()).toEqual({
        id: tasksFixture[3].id,
        name: tasksFixture[3].name,
        description: tasksFixture[3].description,
        dueAt: tasksFixture[3].due_at,
        createdAt: tasksFixture[3].created_at,
        version: tasksFixture[3].version,
      });
      expect(firstPage[1].toPlainObject()).toEqual({
        id: tasksFixture[2].id,
        name: tasksFixture[2].name,
        description: tasksFixture[2].description,
        dueAt: tasksFixture[2].due_at,
        createdAt: tasksFixture[2].created_at,
        version: tasksFixture[2].version,
      });

      const secondPage = await taskRepository.findAll({
        sort: 'due_at:desc',
        limit: 2,
        cursor: Buffer.from(JSON.stringify({ due_at: tasksFixture[2].due_at, id: tasksFixture[2].id })).toString(
          'base64',
        ),
      });
      expect(secondPage.length).toBe(2);
      expect(secondPage[0].toPlainObject()).toEqual({
        id: tasksFixture[1].id,
        name: tasksFixture[1].name,
        description: tasksFixture[1].description,
        dueAt: tasksFixture[1].due_at,
        createdAt: tasksFixture[1].created_at,
        version: tasksFixture[1].version,
      });
      expect(secondPage[1].toPlainObject()).toEqual({
        id: tasksFixture[0].id,
        name: tasksFixture[0].name,
        description: tasksFixture[0].description,
        dueAt: tasksFixture[0].due_at,
        createdAt: tasksFixture[0].created_at,
        version: tasksFixture[0].version,
      });
    });

    it('should handle empty cursor pagination', async () => {
      const tasks = await taskRepository.findAll({
        sort: 'created_at:desc',
        limit: 2,
      });
      expect(tasks.length).toBe(2);
    });
  });

  describe('create', () => {
    it('should create a task', async () => {
      const newTask = new Task({
        id: uuidv4(),
        name: 'New Task',
        description: 'New Description',
        dueAt: new Date(),
        createdAt: new Date(),
        version: 0,
      });

      const task = await taskRepository.create({
        task: newTask,
      });

      expect(task.toPlainObject()).toEqual({
        id: expect.any(String),
        name: 'New Task',
        description: 'New Description',
        dueAt: expect.any(Date),
        createdAt: expect.any(Date),
        version: 0,
      });

      const tasks = await db.selectFrom('task').orderBy('created_at', 'desc').selectAll().execute();

      expect(tasks.length).toEqual(5);
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
