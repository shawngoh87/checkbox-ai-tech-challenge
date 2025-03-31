import { Database, TaskFromDB } from '../../database/types.js';
import { Kysely } from 'kysely';
import { Task } from '../../../domain/task/task.model.js';
import logger from '../../../utils/logger.js';
import { inject, injectable } from 'inversify';
import { getDatabaseServiceIdentifier } from '../../../constants.js';

class DatabaseError extends Error {
  constructor(message: string) {
    super(message);
  }
}

class UniqueKeyConstraintError extends DatabaseError {
  constructor() {
    super('Unique key constraint error');
  }
}

@injectable()
export class TaskRepository {
  constructor(@inject(getDatabaseServiceIdentifier()) private readonly db: Kysely<Database>) {}

  static DatabaseError = DatabaseError;
  static UniqueKeyConstraintError = UniqueKeyConstraintError;

  mapToDomain(task: TaskFromDB): Task {
    return new Task({
      id: task.id,
      name: task.name,
      description: task.description,
      dueAt: task.due_at,
      createdAt: task.created_at,
      version: task.version,
    });
  }

  async findAll(): Promise<Task[]> {
    const tasks = await this.db.selectFrom('task').selectAll().execute();
    return tasks.map(this.mapToDomain);
  }

  async create(params: { task: Task }): Promise<Task> {
    const task = params.task.toPlainObject();
    try {
      await this.db
        .insertInto('task')
        .values({
          id: task.id,
          name: task.name,
          description: task.description,
          due_at: task.dueAt,
          created_at: task.createdAt,
          version: 0,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      return params.task;
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === '23505') {
        throw new TaskRepository.UniqueKeyConstraintError();
      }

      logger.error(error);
      throw new TaskRepository.DatabaseError('Failed to create task');
    }
  }

  async updateById(params: { id: string; task: Task }): Promise<Task> {
    const task = params.task.toPlainObject();
    try {
      const result = await this.db
        .updateTable('task')
        .set({
          name: task.name,
          description: task.description,
          due_at: task.dueAt,
          version: task.version + 1,
        })
        .where('id', '=', params.id)
        .where('version', '=', task.version)
        .returningAll()
        .executeTakeFirst();

      if (!result) {
        throw new TaskRepository.DatabaseError('Task not found or version mismatch');
      }

      return this.mapToDomain(result);
    } catch (error) {
      // TODO: Handle not found vs version mismatch separately
      logger.error(error);
      if (error instanceof TaskRepository.DatabaseError) {
        throw error;
      }
      throw new TaskRepository.DatabaseError('Failed to update task');
    }
  }
}
