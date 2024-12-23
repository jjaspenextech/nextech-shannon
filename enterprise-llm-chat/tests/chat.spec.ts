import { test, expect } from '@playwright/test';
import { Page } from '@playwright/test';
import { login, openDashboard, closeDashboard } from './shared';

// Reusable function to send a message
async function sendMessage(page: Page, message: string) {
  await page.fill('[data-qa="message-input"]', message);
  await page.click('[data-qa="send-button"]');
  // wait for idle network
  await page.waitForLoadState('networkidle');
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
    await expect(page.locator('[data-qa="side-dashboard"]')).toHaveClass(/active/);
    await closeDashboard(page);
    await expect(page.locator('[data-qa="side-dashboard"]')).not.toHaveClass(/active/);
  });

  test('should send a message and receive a response', async ({ page }: { page: Page }) => {
    await sendMessage(page, 'Hello, how are you?');
    await expect(page.locator('[data-qa="assistant-message"]')).toBeVisible({ timeout: 10000 });
  });

  test('should carry out a conversation over multiple messages', async ({ page }: { page: Page }) => {
    await sendMessage(page, 'Hello, how are you?');
    await expect(page.locator('[data-qa="assistant-message"]').first()).toBeVisible({ timeout: 20000 });
    // wait for it to have some content
    const regexPatternForAnyText = /.*?/;
    await expect(page.locator('[data-qa="assistant-message"]').first().locator('p'))
        .toHaveText(regexPatternForAnyText, { timeout: 20000 });
    // wait for idle network
    await page.waitForLoadState('networkidle');
    await sendMessage(page, 'What is your name?');
    await expect(page.locator('[data-qa="assistant-message"]').nth(1)).toBeVisible({ timeout: 20000 });
    // wait for it to have some content
    await expect(page.locator('[data-qa="assistant-message"]').nth(1).locator('p'))
        .toHaveText(regexPatternForAnyText, { timeout: 20000 });
    // wait for idle network
    await page.waitForLoadState('networkidle');
    await sendMessage(page, 'What is your favorite color?');
    await expect(page.locator('[data-qa="assistant-message"]').nth(2)).toBeVisible({ timeout: 20000 });
    // wait for it to have some content
    await expect(page.locator('[data-qa="assistant-message"]').nth(2).locator('p'))
        .toHaveText(regexPatternForAnyText, { timeout: 20000 });
    // wait for idle network
    await page.waitForLoadState('networkidle');
  });

  test('should attach a file and display context', async ({ page }: { page: Page }) => {
    const filePath = 'tests/sample.txt'; // Update with a valid file path
    await page.setInputFiles('[data-qa="file-input"]', filePath);
    await sendMessage(page, 'Show me the context');
    await expect(page.locator('[data-qa="context-pill"]')).toBeVisible({ timeout: 10000 });
  });

  test('should open and close context popup', async ({ page }: { page: Page }) => { 
    const filePath = 'tests/sample.txt'; // Update with a valid file path
    await page.setInputFiles('[data-qa="file-input"]', filePath);
    await sendMessage(page, 'Show me the context');
    // open pill
    await page.click('[data-qa="context-pill"]');
    await expect(page.locator('[data-qa="context-popup"]')).toBeVisible({ timeout: 10000 });
    // close popup
    await page.click('[data-qa="close-popup-button"]');
    await expect(page.locator('[data-qa="context-popup"]')).not.toBeVisible();
  });
}); 