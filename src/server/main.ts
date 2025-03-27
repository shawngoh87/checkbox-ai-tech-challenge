import dotenv from 'dotenv';
dotenv.config();

import ViteExpress from 'vite-express';
import { bootstrap } from './server.js';
import logger from './utils/logger.js';

const app = bootstrap();

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
