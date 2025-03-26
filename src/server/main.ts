import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import ViteExpress from 'vite-express';
import { createTaskRoutes } from './controller/task.routes.js';
import { TaskController } from './controller/task.controller.js';
import { ListTasksUseCase } from './use-case/task/list-tasks.js';
import logger from './utils/logger.js';
import { PostgresDialect } from 'kysely';
import * as pg from 'pg';
const { Pool } = pg.default;
import { Database } from './infra/database/types.js';
import { Kysely } from 'kysely';
import { TaskRepository } from './infra/repository/task/task.repository.js';

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
export const db = new Kysely<Database>({
  dialect,
});

const taskRepository = new TaskRepository(db);

// Use cases
const listTasksUseCase = new ListTasksUseCase(taskRepository);

// Controllers
const taskController = new TaskController(listTasksUseCase);

// TODO: Move all routes to a file and add a fallback route
app.use('/api/v1/tasks', createTaskRoutes(taskController));

ViteExpress.config({
  inlineViteConfig: {
    build: {
      outDir: './dist/client',
    },
  },
});

ViteExpress.listen(app, 3000, () => {
  logger.info('Server is listening on port 3000...');
});
