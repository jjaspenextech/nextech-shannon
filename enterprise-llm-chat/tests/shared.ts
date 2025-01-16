import dotenv from 'dotenv';
import { Page } from '@playwright/test';

// Load environment variables from .env file
dotenv.config();

export const projectName = 'Test Project';
export const projectDescription = 'This is a new test project';

export async function login(page: Page) {
  await page.goto('http://localhost:4200/login');
  await page.fill('input[name="username"]', 'johndoe');
  await page.fill('input[name="password"]', process.env['USER_PASSWORD'] || '');
  await page.click('button[type="submit"]');
  await page.waitForLoadState('networkidle');
  // wait for the shannon button to be visible
  await page.getByTestId('shannon-button').waitFor({ state: 'visible', timeout: 60000 });
}


// Reusable function to open the dashboard
export async function openDashboard(page: Page) {
  // wait for the shannon button to be visible
  await page.getByTestId('shannon-button').waitFor({ state: 'visible', timeout: 60000 });
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
    // if the close button is visible, click it
    if (await page.getByTestId('close-button').isVisible()) {
      await page.getByTestId('close-button').click();
    }
    await page.waitForFunction(() => {
      const dashboard = document.querySelector('[data-testid="side-dashboard"]');
      return dashboard && !dashboard.classList.contains('active');
    }, { timeout: 5000 });
  }

export async function createProject(page: Page) {
  // Fill in the project name and description
  await page.getByTestId('project-name-input').fill(projectName);
  await page.getByTestId('project-description-textarea').fill(projectDescription);
  // Click the create button
  await page.getByTestId('create-button').click();
  // wait for network to be idle
  await page.waitForLoadState('networkidle');
}
