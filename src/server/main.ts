import express from 'express';
import ViteExpress from 'vite-express';

const app = express();

// TODO: Example route, please delete this when you implement your own routes
app.get('/hello', (_, res) => {
  res.json({ result: 'Hello there!' });
});

ViteExpress.config({
  // Copy and paste of vite.config.ts just so vite-express does not need to import
  // vite, a devDependency, in runtime
  inlineViteConfig: {
    build: {
      outDir: './dist/client',
    },
  },
});

ViteExpress.listen(app, 3000, () =>
  console.log(`Server is listening on port 3000...`)
);
