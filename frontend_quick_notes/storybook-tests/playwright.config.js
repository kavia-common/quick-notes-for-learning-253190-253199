/**
 * Playwright config to run visual snapshots against the static Storybook build.
 * Usage:
 *  - npm run test-visual
 */
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: { timeout: 5_000, toHaveScreenshot: { maxDiffPixelRatio: 0.02 } },
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:6007',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
