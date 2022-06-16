import * as path from 'path';
import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    tsconfigPaths({
      projects: [path.join(__dirname, 'tsconfig.base.json')],
    }),
  ],
  test: {
    globals: true,
    coverage: {
      reporter: ['text', 'html'],
      reportsDirectory: path.join(__dirname, 'coverage'),
    },
  },
});
