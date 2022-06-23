import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['**/*.lib.ts'],
  format: ['esm', 'cjs'],
  external: ['@nrwl/devkit'],
  bundle: false,
  clean: true,
  dts: true,
  sourcemap: true,
});
