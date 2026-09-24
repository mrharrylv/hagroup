import { defineConfig } from 'vitest/config';

// Checks the built site in dist/: run `npm run build` first (npm run verify does).
export default defineConfig({
  test: {
    include: ['tests/built-site/**/*.test.ts'],
    environment: 'node',
  },
});
