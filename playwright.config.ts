import { defineConfig, devices } from '@playwright/test'

const PORT = 4173

// Set PLAYWRIGHT_CHANNEL=msedge (or chrome) to use an installed browser
// instead of downloading Playwright's Chromium.
const channel = process.env.PLAYWRIGHT_CHANNEL

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: `http://localhost:${String(PORT)}`,
    trace: 'on-first-retry',
    channel,
  },
  projects: [
    {
      name: 'phone-375',
      use: { ...devices['Pixel 7'], viewport: { width: 375, height: 812 }, channel },
    },
    {
      name: 'tablet-768',
      use: { ...devices['Desktop Chrome'], viewport: { width: 768, height: 1024 }, channel },
    },
    {
      name: 'desktop-1280',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 }, channel },
    },
    {
      name: 'wide-1536',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1536, height: 900 }, channel },
    },
  ],
  // Test against the production build, not the dev server.
  webServer: {
    command: `npm run build && npm run preview -- --port ${String(PORT)} --strictPort`,
    url: `http://localhost:${String(PORT)}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
