import { test, expect } from '@playwright/test';
import { Page } from '@playwright/test';
import { login, openDashboard, createProject, projectName, projectDescription } from './shared';

test.describe('Project Edit Component', () => {
  // Perform login before each test
  test.beforeEach(async ({ page }: { page: Page }) => {
    await login(page);
    // open the side dashboard
    await openDashboard(page);
    // navigate to projects
    await page.click('button[data-testid="projects-button"]');
    // wait for network to be idle
    await page.waitForLoadState('networkidle');
    // check to see if there is one project card at least,
    // by checking the project-card-0 is visible
    try {
      await expect(page.getByTestId('project-card-0')).toBeVisible();
    } catch (error) {        
      // if it fails, we need to make a new project
      await page.goto('http://localhost:4200/projects/create');
      // wait for network to be idle
      await page.waitForLoadState('networkidle');
      // fill in the project name
      await createProject(page);
    }
    // click on the first project
    await page.getByTestId('project-card-0').click();
    // wait for network to be idle
    await page.waitForLoadState('networkidle');
  });

  test('should display project details', async ({ page }: { page: Page }) => {
    await expect(page.getByTestId('project-edit-container')).toBeVisible();
    await expect(page.getByTestId('project-name-input')).toHaveValue(projectName);
    await expect(page.getByTestId('project-description-textarea')).toHaveValue(projectDescription);
  });

  test('should update project name and description', async ({ page }: { page: Page }) => {
    await page.getByTestId('project-name-input').fill('Updated Project Name');
    await page.getByTestId('project-description-textarea').fill('Updated project description');
    await page.getByTestId('save-description-button').click();
    await page.waitForLoadState('networkidle');
    // Verify that the changes are saved
    await expect(page.getByTestId('project-name-input')).toHaveValue('Updated Project Name');
    await expect(page.getByTestId('project-description-textarea')).toHaveValue('Updated project description');
  });

  test('should add and remove a knowledge item', async ({ page }: { page: Page }) => {
    // Add a new knowledge item
    await page.getByTestId('add-content-button').click();
    await page.getByTestId('add-text-content').click();
    // Assuming a dialog opens to add text content
    await page.getByTestId('text-content-title-input').fill('New knowledge content');
    await page.getByTestId('text-content-textarea').fill('New knowledge content');
    await page.getByTestId('add-text-content-button').click();
    await page.waitForLoadState('networkidle');
    // Verify the new knowledge item is added
    await expect(page.getByTestId('knowledge-item')).toContainText('New knowledge content');

    // Remove the knowledge item
    await page.getByTestId('delete-button').click();
    // Verify the knowledge item is removed
    await expect(page.getByTestId('knowledge-item')).not.toBeVisible();
  });

  test('should navigate back to projects list', async ({ page }: { page: Page }) => {
    await page.getByTestId('back-button').click();
    await expect(page).toHaveURL(/.*\/projects/);
  });
});
