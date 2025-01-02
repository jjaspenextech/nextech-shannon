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
    await expect(page.getByTestId('side-dashboard')).toHaveClass(/active/);
    await closeDashboard(page);
    await expect(page.getByTestId('side-dashboard')).not.toHaveClass(/active/);
  });

  test('should navigate to projects when projects button is clicked', async ({ page }: { page: Page }) => {
    await openDashboard(page);
    await page.getByTestId('projects-button').click();
    await expect(page).toHaveURL(/.*\/projects/);
  });

  test('should open user settings when user settings button is clicked', async ({ page }: { page: Page }) => {
    await openDashboard(page);
    // for some reason, stuff in the user settings component resolves to 2 different elements, even thought there is only 1
    // so we cant use strict mode with getByTestId
    // Error: locator.click: Error: strict mode violation: getByTestId('user-settings-button') resolved to 2 elements:
    await page.getByTestId('user-settings-button').click();
    // Add assertion to verify user settings modal or page
    // verify api-key-modal-title is visible
    await expect(page.getByTestId('user-settings-container')).toBeVisible({ timeout: 60000 });
  });

  test('should log out when logout button is clicked', async ({ page }: { page: Page }) => {
    await openDashboard(page);
    await page.getByTestId('logout-button').click();
    await expect(page).toHaveURL(/.*\/login/);
  });
}); 