import { test, expect } from '@playwright/test';
import { Page } from '@playwright/test';
import { login } from './shared';

  
test.describe('Landing Page', () => {
  // this function assumes we're on the landing page
  // and checks whether there is at least one conversation card
  // and if there isn't, it makes a new conversation
  async function createConversationIfNeeded(page: Page) {
    // wait until the loading spinner is gone
    await page.waitForSelector('[data-testid="conversation-loading-spinner"]', { state: 'hidden' });
    const count = await page.getByTestId('conversation-card').count();
    if (count === 0) {
      await startNewConversation(page);
    }
  }

  async function startNewConversation(page: Page) {
    // Type in the chat input
    await page.fill('.landing-input', 'Hello, how are you?');
    // Click the send button
    await page.click('.submit-button');
    // wait for chat page to load
    await page.waitForURL('http://localhost:4200/chat');
    await page.waitForLoadState('networkidle');
    // Wait until you see a response from the bot
    await expect(page.locator('.assistant-message')).toBeVisible({
        timeout: 30000
    });
    // Go back to the landing page
    await page.goto('http://localhost:4200/landing');
    // Wait for the landing page to load
    await page.waitForLoadState('networkidle');
  }
  
  // Perform login before each test
  test.beforeEach(async ({ page }: { page: Page }) => {
    await login(page);
  });

  test('should display the correct greeting message based on the time of day', async ({
    page,
  }: {
    page: Page;
  }) => {
    // Verify the greeting message
    const currentTime = new Date().getHours();
    if (currentTime < 12) {
      await expect(page.locator('text=Good morning')).toBeVisible();
    } else if (currentTime < 18) {
      await expect(page.locator('text=Good afternoon')).toBeVisible();
    } else {
      await expect(page.locator('text=Good evening')).toBeVisible();
    }
  });

  test('should start a new conversation when we start a chat', async ({
    page,
  }: {
    page: Page;
  }) => {
    await createConversationIfNeeded(page);
    // Check that there is at least one conversation card
    await expect(page.getByTestId('conversation-card').first()).toBeVisible();
    const count = await page.getByTestId('conversation-card').count();
    expect(count).toBeGreaterThan(0);
  });


  test.describe('Recent Conversations', () => {
    test('should display recent conversations section', async ({
      page,
    }: {
      page: Page;
    }) => {
      // Check if recent conversations are visible
      await expect(page.locator('.recent-conversations')).toBeVisible();
      // Check that there is at least one conversation card
      await expect(page.getByTestId('conversation-card').first()).toBeVisible({ timeout: 30000 });
      const count = await page.getByTestId('conversation-card').count();
      console.log('count', count);
      expect(count).toBeGreaterThan(0);
    });

    test('should navigate to chat page when a conversation is clicked', async ({
      page,
    }: {
      page: Page;
    }) => {
      // Click on the first conversation card
      await page.click('[data-testid="conversation-card"]:first-child');
      // Verify navigation to chat page
      await expect(page).toHaveURL(/.*\/chat/);
    });
  });

  test('should toggle the dashboard', async ({ page }: { page: Page }) => {
    // Hover over the Shannon button to open the dashboard
    await page.hover('[data-testid="shannon-button"]', { force: true });
    // Wait for the dashboard to open by checking for a specific class
    await page.waitForFunction(() => {
      const dashboard = document.querySelector('[data-testid="side-dashboard"]');
      return dashboard && dashboard.classList.contains('active');
    }, { timeout: 5000 });
    // Verify dashboard is open
    await expect(page.locator('app-side-dashboard')).toHaveClass(/active/);
    // Move mouse all the way to the right to close the dashboard
    await page.mouse.move(1000, 1000);
    // Verify dashboard is closed
    await expect(page.locator('app-side-dashboard')).not.toHaveClass(/active/);
  });
});
