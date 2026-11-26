import { existsSync } from 'node:fs';
import { defineConfig } from '@playwright/test';

const doorwayOnly = { testMatch: /doorway\.spec\.ts/ };
const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:5173';
const chromiumPath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
const chromiumLaunchOptions = {
  ...(chromiumPath && existsSync(chromiumPath) ? { executablePath: chromiumPath } : {}),
  args: ['--no-sandbox'],
};

export default defineConfig({
  testDir: './tests',
  outputDir: './test-results',
  reporter: [
    ['list'],
    ['html', { outputFolder: './playwright-report', open: 'never' }],
  ],
  timeout: 90_000,
  expect: { timeout: 12_000 },
  workers: 1,
  retries: 0,
  webServer: process.env.PLAYWRIGHT_BASE_URL ? undefined : {
    command: 'pnpm dev',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'desktop',
      use: {
        browserName: 'chromium',
        launchOptions: chromiumLaunchOptions,
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: 'phone',
      use: {
        browserName: 'chromium',
        launchOptions: chromiumLaunchOptions,
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: 'short-phone',
      use: {
        browserName: 'chromium',
        launchOptions: chromiumLaunchOptions,
        viewport: { width: 375, height: 667 },
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: 'webkit-desktop',
      ...doorwayOnly,
      use: { browserName: 'webkit', viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'webkit-phone',
      ...doorwayOnly,
      use: {
        browserName: 'webkit',
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: 'webkit-short-phone',
      ...doorwayOnly,
      use: {
        browserName: 'webkit',
        viewport: { width: 375, height: 667 },
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: 'firefox-desktop',
      ...doorwayOnly,
      use: { browserName: 'firefox', viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'firefox-phone',
      ...doorwayOnly,
      use: { browserName: 'firefox', viewport: { width: 390, height: 844 } },
    },
    {
      name: 'firefox-short-phone',
      ...doorwayOnly,
      use: { browserName: 'firefox', viewport: { width: 375, height: 667 } },
    },
  ],
});
 
 
