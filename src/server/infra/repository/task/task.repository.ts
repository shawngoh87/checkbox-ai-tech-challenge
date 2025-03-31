import { Kysely } from 'kysely';
import { Database } from '../../database/types.js';
import { Task } from '../../../domain/task/task.model.js';
import { inject, injectable } from 'inversify';
import { getDatabaseServiceIdentifier } from '../../../constants.js';
import { z } from 'zod';

export type TaskRepositoryFindAllOptions = {
  sort?: 'created_at:asc' | 'created_at:desc' | 'due_at:asc' | 'due_at:desc';
  limit?: number;
  cursor?: string;
};

class DatabaseError extends Error {
  constructor(message: string) {
    super(message);
  }
}

class InvalidCursorError extends DatabaseError {
  constructor() {
    super('Invalid cursor format');
  }
}

class UniqueKeyConstraintError extends DatabaseError {
  constructor() {
    super('Task with the same id already exists');
  }
}

@injectable()
export class TaskRepository {
  static DatabaseError = DatabaseError;
  static UniqueKeyConstraintError = UniqueKeyConstraintError;
  static InvalidCursorError = InvalidCursorError;

  private readonly createdAtCursorSchema = z.object({
    created_at: z.coerce.date(),
    id: z.string(),
  });

  private readonly dueAtCursorSchema = z.object({
    due_at: z.coerce.date(),
    id: z.string(),
  });

  constructor(@inject(getDatabaseServiceIdentifier()) private readonly db: Kysely<Database>) {}

  decodeCursor(cursor: string) {
    try {
      const decodedJson = JSON.parse(Buffer.from(cursor, 'base64').toString());

      const createdAtResult = this.createdAtCursorSchema.safeParse(decodedJson);
      if (createdAtResult.success) {
        return createdAtResult.data;
      }

      const dueAtResult = this.dueAtCursorSchema.safeParse(decodedJson);
      if (dueAtResult.success) {
        return dueAtResult.data;
      }

      throw new TaskRepository.InvalidCursorError();
    } catch {
      throw new TaskRepository.InvalidCursorError();
    }
  }

  encodeCursor(cursor?: { created_at?: Date; due_at?: Date; id: string }) {
    if (!cursor) {
      return undefined;
    }

    return Buffer.from(
      JSON.stringify({
        created_at: cursor.created_at?.toISOString(),
        due_at: cursor.due_at?.toISOString(),
        id: cursor.id,
      }),
    ).toString('base64');
  }

  parseSortParam(sort: string | undefined) {
    if (!sort) {
      return { sortBy: 'created_at' as const, sortOrder: 'desc' as const };
    }

    const [sortBy, sortOrder] = sort.split(':');
    return { sortBy: sortBy as 'created_at' | 'due_at', sortOrder: sortOrder as 'asc' | 'desc' };
  }

  async findAll(options?: TaskRepositoryFindAllOptions): Promise<{ tasks: Task[]; nextCursor: string | undefined }> {
    const { sortBy, sortOrder } = this.parseSortParam(options?.sort);
    const limit = options?.limit ?? 10;

    let query = this.db.selectFrom('task');

    if (options?.cursor) {
      const cursor = this.decodeCursor(options.cursor);

      if (sortBy === 'created_at' && 'created_at' in cursor) {
        const createdAt = cursor.created_at;
        query = query
          .where('created_at', sortOrder === 'desc' ? '<=' : '>=', createdAt)
          .where((eb) =>
            eb.or([
              eb('created_at', sortOrder === 'desc' ? '<' : '>', createdAt),
              eb.and([eb('created_at', '=', createdAt), eb('id', sortOrder === 'desc' ? '<' : '>', cursor.id)]),
            ]),
          );
      } else if (sortBy === 'due_at' && 'due_at' in cursor) {
        const dueAt = cursor.due_at;
        query = query
          .where('due_at', sortOrder === 'desc' ? '<=' : '>=', dueAt)
          .where((eb) =>
            eb.or([
              eb('due_at', sortOrder === 'desc' ? '<' : '>', dueAt),
              eb.and([eb('due_at', '=', dueAt), eb('id', sortOrder === 'desc' ? '<' : '>', cursor.id)]),
            ]),
          );
      } else {
        throw new TaskRepository.DatabaseError('Unable to build query with the provided cursor');
      }
    }

    const tasks = await query.orderBy(sortBy, sortOrder).orderBy('id', sortOrder).limit(limit).selectAll().execute();

    return {
      tasks: tasks.map((task) => {
        return new Task({
          id: task.id,
          name: task.name,
          description: task.description,
          dueAt: task.due_at,
          createdAt: task.created_at,
          version: task.version,
        });
      }),
      nextCursor:
        tasks.length > 0
          ? this.encodeCursor({
              [sortBy]: tasks[tasks.length - 1][sortBy],
              id: tasks[tasks.length - 1].id,
            })
          : undefined,
    };
  }

  async create({ task }: { task: Task }): Promise<Task> {
    try {
      const [createdTask] = await this.db
        .insertInto('task')
        .values({
          id: task.id,
          name: task.name,
          description: task.description,
          due_at: task.dueAt,
          created_at: task.createdAt,
          version: task.version,
        })
        .returningAll()
        .execute();

      return new Task({
        id: createdTask.id,
        name: createdTask.name,
        description: createdTask.description,
        dueAt: createdTask.due_at,
        createdAt: createdTask.created_at,
        version: createdTask.version,
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('duplicate key value violates unique constraint')) {
        throw new TaskRepository.UniqueKeyConstraintError();
      }
      throw error;
    }
  }

  async updateById({ id, task }: { id: string; task: Task }): Promise<Task> {
    const [updatedTask] = await this.db
      .updateTable('task')
      .set({
        name: task.name,
        description: task.description,
        due_at: task.dueAt,
        version: task.version + 1,
      })
      .where('id', '=', id)
      .returningAll()
      .execute();

    return new Task({
      id: updatedTask.id,
      name: updatedTask.name,
      description: updatedTask.description,
      dueAt: updatedTask.due_at,
      createdAt: updatedTask.created_at,
      version: updatedTask.version,
    });
  }
}
