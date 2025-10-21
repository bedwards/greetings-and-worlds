import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['app.js'],
      exclude: ['tests/**', 'worker.js', 'node_modules/**'],
      thresholds: {
        lines: 96,
        functions: 96,
        branches: 96,
        statements: 96
      }
    },
    globals: true
  }
});
