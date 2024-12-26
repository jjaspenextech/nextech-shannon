import { test, expect } from '@playwright/test';
import { Page } from '@playwright/test';
import { login } from './shared';

async function createProject(page: Page) {
  await page.goto('http://localhost:4200/projects');
  await page.waitForLoadState('networkidle');
  await page.getByTestId('create-project-button').click();
  await page.waitForLoadState('networkidle');
  await page.getByTestId('project-name-input').fill('Test Project');
  await page.getByTestId('project-description-textarea').fill('This is a test project');
  await page.getByTestId('create-button').click();
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
    await page.getByTestId('create-project-button').click();
    // Verify navigation to the create project page
    await expect(page).toHaveURL(/.*\/projects\/create/);
  });

  test.describe('after creating a project', () => {
    test.beforeEach(async ({ page }: { page: Page }) => {
      await createProject(page);
    });

    test('should display the list of projects', async ({ page }: { page: Page }) => {
      // Check if the project list container is visible
      await expect(page.getByTestId('project-list-container')).toBeVisible();
      // Check that there is at least one project card
      await expect(page.getByTestId('project-card-0')).toBeVisible();
    });

    test('should open project details when a project card is clicked', async ({ page }: { page: Page }) => {
      // Click on the first project card
      await page.getByTestId('project-card-0').click();
      // Verify navigation to the project details page
      await expect(page).toHaveURL(/.*\/projects\/\d+/); // Assuming project ID is numeric
    });
  });
}); 