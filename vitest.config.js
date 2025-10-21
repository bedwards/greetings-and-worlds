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
        statements: 85,
        branches: 84,
        functions: 93,
        lines: 85
      }
    },
    globals: true
  }
});
