import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  timeout: 30000,
  use: {
    headless: false,
    browserName: 'chromium',
    viewport: { width: 1280, height: 720 },
  },
};

export default config; 