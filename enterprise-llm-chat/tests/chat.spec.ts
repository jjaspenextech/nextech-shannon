import { test, expect } from '@playwright/test';
import { Page } from '@playwright/test';
import { login, openDashboard, closeDashboard } from './shared';

// Reusable function to send a message
async function sendMessage(page: Page, message: string, waitForResponse: boolean = true) {
  await page.getByTestId('chat-input').fill(message);
  await page.getByTestId('send-button').click();
  if (waitForResponse) {
    // wait for idle network
    await page.waitForLoadState('networkidle');
  }
}

// Test suite for the chat component
test.describe('Chat Component', () => {
  // Perform login before each test
  test.beforeEach(async ({ page }: { page: Page }) => {
    await login(page);
    await page.goto('http://localhost:4200/chat');
  });

  test('should open and close the dashboard', async ({ page }: { page: Page }) => {
    await openDashboard(page);
    await expect(page.getByTestId('side-dashboard')).toHaveClass(/active/);
    await closeDashboard(page);
    await expect(page.getByTestId('side-dashboard')).not.toHaveClass(/active/);
  });

  test('should send a message and receive a response', async ({ page }: { page: Page }) => {
    await sendMessage(page, 'Hello, how are you?');
    await expect(page.getByTestId('user-message-0')).toBeVisible({ timeout: 10000 }); 
    await expect(page.getByTestId('assistant-message-1')).toBeVisible({ timeout: 20000 });
    // wait for it to have some content
    const regexPatternForAnyText = /.*?/;
    await expect(page.getByTestId('assistant-message-1').locator('p'))
        .toHaveText(regexPatternForAnyText, { timeout: 10000 });
    // wait for idle network
    await page.waitForLoadState('networkidle');
  });

  test('should carry out a conversation over multiple messages', async ({ page }: { page: Page }) => {
    await sendMessage(page, 'Hello, how are you?');
    await expect(page.getByTestId('user-message-0')).toBeVisible({ timeout: 20000 });
    await expect(page.getByTestId('assistant-message-1')).toBeVisible({ timeout: 20000 });
    // wait for it to have some content
    const regexPatternForAnyText = /.*?/;
    await expect(page.getByTestId('assistant-message-1').locator('p'))
        .toHaveText(regexPatternForAnyText, { timeout: 20000 });
    // wait for idle network
    await page.waitForLoadState('networkidle');
    await sendMessage(page, 'What is your name?');
    await expect(page.getByTestId('user-message-2')).toBeVisible({ timeout: 20000 });
    await expect(page.getByTestId('assistant-message-3')).toBeVisible({ timeout: 20000 });
    // wait for it to have some content
    await expect(page.getByTestId('assistant-message-3').locator('p'))
        .toHaveText(regexPatternForAnyText, { timeout: 20000 });
    // wait for idle network
    await page.waitForLoadState('networkidle');
    await sendMessage(page, 'What is your favorite color?');
    await expect(page.getByTestId('user-message-4')).toBeVisible({ timeout: 20000 });
    await expect(page.getByTestId('assistant-message-5')).toBeVisible({ timeout: 20000 });
    // wait for it to have some content
    await expect(page.getByTestId('assistant-message-5').locator('p'))
        .toHaveText(regexPatternForAnyText, { timeout: 20000 });
    // wait for idle network
    await page.waitForLoadState('networkidle');
  });

  test('should attach a file and display context', async ({ page }: { page: Page }) => {
    const filePath = 'tests/sample.txt'; // Update with a valid file path
    await page.getByTestId('file-input').setInputFiles(filePath);

    // check that pill shows up in the input sections
    await expect(page.getByTestId('chat-context-pill-0')).toBeVisible({ timeout: 10000 });

    // send message
    await sendMessage(page, 'Show me the context');

    //check that pill shows up in the messages section
    await expect(page.getByTestId('context-pill')).toBeVisible({ timeout: 10000 });
  });

  test('should open and close context popup', async ({ page }: { page: Page }) => { 
    await page.getByTestId('file-input').setInputFiles({name: 'sample.txt', mimeType: 'text/plain', buffer: Buffer.from('Some sample text for testing.')});
    await sendMessage(page, 'Show me the context', false);
    // open pill
    await page.getByTestId('context-pill').click();
    await expect(page.getByTestId('context-viewer-container')).toBeVisible({ timeout: 10000 });

    //verify contents
    await expect(page.getByTestId('context-viewer-text-content')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('context-viewer-text-content')).toHaveText('Some sample text for testing.');

    // close popup
    await page.getByTestId('context-viewer-close-button').click();
    await expect(page.getByTestId('context-viewer-container')).not.toBeVisible();
  });
}); 