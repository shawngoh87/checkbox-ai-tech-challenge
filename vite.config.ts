import typescript from '@rollup/plugin-typescript';
import { FilterPattern } from '@rollup/pluginutils';
import react from '@vitejs/plugin-react';
import { rollup, RollupOptions, OutputOptions } from 'rollup';
import { PluginOption, defineConfig } from 'vite';

type ViteExpressBuilderOptions = Omit<RollupOptions, 'external'> & {
  output?: OutputOptions;
  exclude?: FilterPattern;
  external?: (string | RegExp)[] | string | RegExp;
};

const viteExpressBuilder = ({
  input = './src/server/main.ts',
  output = {
    dir: './dist/server',
    format: 'esm',
  },
  exclude = './src/client/**',
  external = [],
  plugins = [],
  ...rest
}: ViteExpressBuilderOptions = {}): PluginOption => {
  return {
    name: 'Vite Express Builder',
    async writeBundle() {
      const config = await rollup({
        input: input,
        external: [
          'express',
          'vite-express',
          ...(Array.isArray(external) ? external : [external]),
        ],
        plugins: [
          typescript({
            module: 'NodeNext',
            exclude,
          }),
          ...(Array.isArray(plugins) ? plugins : [plugins]),
        ],
        ...rest,
      });
      await config.write(output);
    },
  };
};

export default defineConfig({
  build: {
    outDir: './dist/client',
  },
  plugins: [react(), viteExpressBuilder()],
});
