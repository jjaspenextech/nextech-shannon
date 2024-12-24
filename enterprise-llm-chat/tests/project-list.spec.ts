import { test, expect } from '@playwright/test';
import { Page } from '@playwright/test';
import { login } from './shared';

async function createProject(page: Page) {
  await page.goto('http://localhost:4200/projects');
  await page.waitForLoadState('networkidle');
  await page.click('[data-qa="create-project-button"]');
  await page.waitForLoadState('networkidle');
  await page.fill('[data-qa="project-name-input"]', 'Test Project');
  await page.fill('[data-qa="project-description-textarea"]', 'This is a test project');
  await page.click('[data-qa="create-button"]');
  await page.waitForLoadState('networkidle');
}

test.describe('Project List Component', () => {
  // Perform login before each test
  test.beforeEach(async ({ page }: { page: Page }) => {
    await login(page);
    await page.goto('http://localhost:4200/projects');
  });

  test('should navigate to create project page when "Create Project" button is clicked', async ({ page }: { page: Page }) => {
    // Click the "Create Project" button
    await page.click('[data-qa="create-project-button"]');
    // Verify navigation to the create project page
    await expect(page).toHaveURL(/.*\/projects\/create/);
  });

  test.describe('after creating a project', () => {
    test.beforeEach(async ({ page }: { page: Page }) => {
      await createProject(page);
    });

    test('should display the list of projects', async ({ page }: { page: Page }) => {
      // Check if the project list container is visible
      await expect(page.locator('[data-qa="project-list-container"]')).toBeVisible();
      // Check that there is at least one project card
      await expect(page.locator('[data-qa="project-card"]')).toBeVisible();
      const count = await page.locator('[data-qa="project-card"]').count();
      expect(count).toBeGreaterThan(0);
    });

    test('should open project details when a project card is clicked', async ({ page }: { page: Page }) => {
      // Click on the first project card
      await page.click('[data-qa="project-card"]:first-child');
      // Verify navigation to the project details page
      await expect(page).toHaveURL(/.*\/projects\/\d+/); // Assuming project ID is numeric
    });
  });
}); 