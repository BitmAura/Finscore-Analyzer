import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.tsx', '@testing-library/jest-dom'],
    globals: true,
    // Exclude E2E and example Playwright tests from Vitest (they run with Playwright separately)
    exclude: ['**/tests/e2e/**', '**/e2e/**', '**/tests-examples/**', '**/node_modules/**'],
    env: {
      DATABASE_MODE: 'mock',
      DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
      NODE_ENV: 'test',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        'e2e/',
        '.next/',
        'coverage/',
        'playwright-report/',
        'dist/',
        'build/',
        '**/*.d.ts',
        '**/*config.*',
        '**/*setup.*',
        'src/types/',
        'src/test/',
      ],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70,
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})