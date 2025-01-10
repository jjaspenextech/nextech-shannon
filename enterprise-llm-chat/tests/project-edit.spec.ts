import { test, expect } from '@playwright/test';
import { Page } from '@playwright/test';
import { login, openDashboard, createProject, projectName, projectDescription } from './shared';

test.describe('Project Edit Component', () => {
  async function typeMessage(page: Page, message: string) {
    await page.evaluate(() => {
        const textarea = document.querySelector('[data-testid="chat-input"]') as HTMLTextAreaElement;
        textarea.value = message;
        
        // Create and dispatch multiple events to ensure Angular picks up the change
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        textarea.dispatchEvent(new Event('change', { bubbles: true }));
    });
    
    // Wait a bit for Angular to process the changes
    await page.waitForTimeout(1000);    
  }
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

  /* need a test that starts a new conversation with the message "tell me a joke"
  waits for the response to be received, then goes back to the project (by clicking the back button)
  and verifies that the top conversation description doesn't say error
  */
  test('should create a new conversation with a valid description', async ({ page }: { page: Page }) => {
    await typeMessage(page, 'tell me a joke');
    
    // Make sure the send button is enabled
    await page.waitForSelector('[data-testid="send-button"]:not([disabled])');
    
    await page.getByTestId('send-button').click();
    await page.waitForLoadState('networkidle');
    // verify that we are in the chat page
    await expect(page).toHaveURL(/.*\/chat/);
    // go back to the project page
    await page.goBack();
    await page.waitForLoadState('networkidle');
    
    await expect(page.getByTestId('conversation-item-0')).not.toContainText('error');
  });
});


