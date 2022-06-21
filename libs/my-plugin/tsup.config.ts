import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/**/*.lib.ts'],
  format: ['esm'],
  legacyOutput: true,
  bundle: false,
  clean: true,
  dts: true,
});
