import { defineConfig } from 'vitest/config';

// Unit tests only: pure modules under src/. The built site has its own suite
// (vitest.dist.config.ts) because it needs `npm run build` to have run first.
export default defineConfig({
  test: {
    include: ['src/**/*.test.{ts,tsx}'],
    environment: 'node',
  },
});
