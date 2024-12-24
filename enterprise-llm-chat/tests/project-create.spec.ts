import { test, expect } from '@playwright/test';
import { Page } from '@playwright/test';
import { login } from './shared';

test.describe('Project Create Component', () => {
  // Perform login before each test
  test.beforeEach(async ({ page }: { page: Page }) => {
    await login(page);
    await page.goto('http://localhost:4200/projects/create');
  });

  test('should not allow project creation with empty fields', async ({ page }: { page: Page }) => {
    // Attempt to create a project with empty fields
    await page.click('[data-qa="create-button"]');
    // Verify that the create button is disabled
    await expect(page.locator('[data-qa="create-button"]')).toBeDisabled();
  });

  test('should create a project successfully', async ({ page }: { page: Page }) => {
    // Fill in the project name and description
    await page.fill('[data-qa="project-name-input"]', 'New Test Project');
    await page.fill('[data-qa="project-description-textarea"]', 'This is a new test project');
    // Click the create button
    await page.click('[data-qa="create-button"]');
    // Verify navigation to the projects list page
    await expect(page).toHaveURL(/.*\/projects/);
    // Verify the new project appears in the list
    await expect(page.locator('[data-qa="project-card"]')).toContainText('New Test Project');
  });

  test('should navigate back to projects list when cancel is clicked', async ({ page }: { page: Page }) => {
    // Click the cancel button
    await page.click('[data-qa="cancel-button"]');
    // Verify navigation to the projects list page
    await expect(page).toHaveURL(/.*\/projects/);
  });
}); 