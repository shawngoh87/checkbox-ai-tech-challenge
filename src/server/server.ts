import express from 'express';
import cors from 'cors';
import { Container } from 'inversify';

import logger from './utils/logger.js';
import { TaskRepository } from './infra/repository/task/task.repository.js';
import { ListTasksUseCase } from './application/use-case/task/list-tasks.js';
import { CreateTaskUseCase } from './application/use-case/task/create-task.js';
import { UpdateTaskUseCase } from './application/use-case/task/update-task.js';
import { CreateTaskController } from './application/controller/task/create-task.controller.js';
import { ListTasksController } from './application/controller/task/list-tasks.controller.js';
import { UpdateTaskController } from './application/controller/task/update-task.controller.js';
import { registerDatabase } from './infra/database/database.provider.js';
import { registerRoutes } from './application/route.provider.js';
import { routes } from './routes.js';

export const bootstrap = () => {
  logger.info('Initializing server...');

  const container: Container = new Container();

  registerDatabase(container);

  // Bind all services
  [
    TaskRepository,
    ListTasksUseCase,
    CreateTaskUseCase,
    UpdateTaskUseCase,
    ListTasksController,
    CreateTaskController,
    UpdateTaskController,
  ].forEach((service) => container.bind(service).toSelf().inSingletonScope());

  const app = express();

  app.use(express.json());
  app.use(cors());

  const taskRouter = registerRoutes(container, routes);

  app.use('/api/v1/tasks', taskRouter);

  return app;
};
