import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['**/*.lib.ts'],
  format: ['cjs', 'esm'],
  external: ['@nrwl/devkit'],
  bundle: false,
  clean: true,
  dts: true,
  sourcemap: true,
});
