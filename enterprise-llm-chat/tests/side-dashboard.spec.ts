import { test, expect } from '@playwright/test';
import { Page } from '@playwright/test';
import { login, openDashboard, closeDashboard } from './shared';

test.describe('Side Dashboard', () => {
  // Perform login before each test
  test.beforeEach(async ({ page }: { page: Page }) => {
    await login(page);
  });

  // Perform setup before each test
  test.beforeEach(async ({ page }: { page: Page }) => {
    // Navigate to the landing page
    await page.goto('http://localhost:4200/landing');
    // Ensure the dashboard is closed
    await closeDashboard(page);
  });

  test('should open and close the dashboard', async ({ page }: { page: Page }) => {
    await openDashboard(page);
    await expect(page.locator('[data-qa="side-dashboard"]')).toHaveClass(/active/);
    await closeDashboard(page);
    await expect(page.locator('[data-qa="side-dashboard"]')).not.toHaveClass(/active/);
  });

  test('should navigate to projects when projects button is clicked', async ({ page }: { page: Page }) => {
    await openDashboard(page);
    await page.click('[data-qa="projects-button"]');
    await expect(page).toHaveURL(/.*\/projects/);
  });

  test('should open user settings when user settings button is clicked', async ({ page }: { page: Page }) => {
    await openDashboard(page);
    await page.click('[data-qa="user-settings-button"]');
    // Add assertion to verify user settings modal or page
  });

  test('should log out when logout button is clicked', async ({ page }: { page: Page }) => {
    await openDashboard(page);
    await page.click('[data-qa="logout-button"]');
    await expect(page).toHaveURL(/.*\/login/);
  });
}); 