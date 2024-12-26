import dotenv from 'dotenv';
import { Page } from '@playwright/test';

// Load environment variables from .env file
dotenv.config();

export async function login(page: Page) {
  await page.goto('http://localhost:4200/login');
  await page.fill('input[name="username"]', 'johndoe');
  await page.fill('input[name="password"]', process.env['USER_PASSWORD'] || '');
  await page.click('button[type="submit"]');
  await page.waitForLoadState('networkidle');
}


// Reusable function to open the dashboard
export async function openDashboard(page: Page) {
    await page.getByTestId('shannon-button').hover({ force: true });
    await page.waitForFunction(() => {
      const dashboard = document.querySelector('[data-testid="side-dashboard"]');
      return dashboard && dashboard.classList.contains('active');
    }, { timeout: 5000 });
    // wait for network to be idle
    await page.waitForLoadState('networkidle');
  }
  
  // Reusable function to close the dashboard
  export async function closeDashboard(page: Page) {
    await page.mouse.move(1000, 1000);
    await page.waitForFunction(() => {
      const dashboard = document.querySelector('[data-testid="side-dashboard"]');
      return dashboard && !dashboard.classList.contains('active');
    }, { timeout: 5000 });
  }
