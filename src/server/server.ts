import { Kysely } from 'kysely';
import { PostgresDialect } from 'kysely';
import * as pg from 'pg';
const { Pool } = pg.default;
import express, { Router } from 'express';
import cors from 'cors';

import logger from './utils/logger.js';
import { Database } from './infra/database/types.js';
import { TaskRepository } from './infra/repository/task/task.repository.js';
import { ListTasksUseCase } from './application/use-case/task/list-tasks.js';
import { CreateTaskUseCase } from './application/use-case/task/create-task.js';
import { UpdateTaskUseCase } from './application/use-case/task/update-task.js';
import { CreateTaskController } from './application/controller/task/create-task.controller.js';
import { ListTasksController } from './application/controller/task/list-tasks.controller.js';
import { UpdateTaskController } from './application/controller/task/update-task.controller.js';

export const bootstrap = () => {
  const app = express();

  app.use(express.json());
  app.use(cors());

  logger.info('Initializing server...');

  // Infrastructure
  const dialect = new PostgresDialect({
    pool: new Pool({
      database: process.env.DB_POSTGRES_DB,
      host: process.env.DB_POSTGRES_HOST,
      user: process.env.DB_POSTGRES_USER,
      password: process.env.DB_POSTGRES_PASSWORD,
      port: parseInt(process.env.DB_POSTGRES_PORT || '5432'),
      max: parseInt(process.env.DB_POSTGRES_MAX_CONNECTIONS || '10'),
    }),
  });
  const db = new Kysely<Database>({
    dialect,
  });

  const taskRepository = new TaskRepository(db);

  // Use cases
  const listTasksUseCase = new ListTasksUseCase(taskRepository);
  const createTaskUseCase = new CreateTaskUseCase(taskRepository);
  const updateTaskUseCase = new UpdateTaskUseCase(taskRepository);

  // Controllers
  const listTasksController = new ListTasksController(listTasksUseCase);
  const createTaskController = new CreateTaskController(createTaskUseCase);
  const updateTaskController = new UpdateTaskController(updateTaskUseCase);

  // TODO: Move all routes to a file and add a fallback route
  const router = Router();

  router.get('/', listTasksController.execute.bind(listTasksController));
  router.post('/', createTaskController.execute.bind(createTaskController));
  router.put('/:id', updateTaskController.execute.bind(updateTaskController));

  app.use('/api/v1/tasks', router);

  return app;
};
