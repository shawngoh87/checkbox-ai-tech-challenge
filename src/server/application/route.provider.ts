import { Router } from 'express';
import { Container } from 'inversify';
import { Controller } from './controller/controller.interface.js';

type Route = {
  method: 'get' | 'post' | 'put';
  route: string;
  controller: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    new (...args: any[]): Controller;
  };
};

export const registerRoutes = (container: Container, routes: Route[]) => {
  const router = Router();

  routes.forEach((route) => {
    const controller = container.get(route.controller);
    router[route.method](route.route, controller.execute.bind(controller));
  });

  return router;
};
