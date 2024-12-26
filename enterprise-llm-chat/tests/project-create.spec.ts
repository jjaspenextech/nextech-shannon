import { test, expect } from '@playwright/test';
import { Page } from '@playwright/test';
import { login, createProject } from './shared';

test.describe('Project Create Component', () => {
  // Perform login before each test
  test.beforeEach(async ({ page }: { page: Page }) => {
    await login(page);
    await page.goto('http://localhost:4200/projects/create');
    await page.waitForLoadState('networkidle');
  });

  test('should not allow project creation with empty fields', async ({ page }: { page: Page }) => {
    // Verify that the create button is disabled
    await expect(page.getByTestId('create-button')).toBeDisabled();
  });

  test('should create a project successfully', async ({ page }: { page: Page }) => {
    await createProject(page);
    // Verify navigation to the projects list page
    await expect(page).toHaveURL(/.*\/projects/);
    // Verify the new project appears in the list
    await expect(page.getByTestId('project-card-0')
    .getByTestId('project-card-name')).toContainText('New Test Project');
  });

  test('should navigate back to projects list when cancel is clicked', async ({ page }: { page: Page }) => {
    // Click the cancel button
    await page.getByTestId('cancel-button').click();
    // Verify navigation to the projects list page
    await expect(page).toHaveURL(/.*\/projects/);
  });
}); 