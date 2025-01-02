import { test, expect } from '@playwright/test';
import { login } from './shared';

test.describe('User Settings Page', () => {
  test.beforeEach(async ({ page }) => {
    // Use the shared login function
    await login(page);
    await page.goto('http://localhost:4200/settings');
  });

  test('should navigate to user settings page', async ({ page }) => {
    await expect(page).toHaveURL('http://localhost:4200/settings');
    await expect(page.getByText('User Settings')).toBeVisible();
  });

  test('should update theme', async ({ page }) => {
    const themeItem = page.locator('li', { hasText: 'dark-theme' });
    await themeItem.click();
    await expect(themeItem).toHaveClass(/active/);
  });

  test('should update API key visibility', async ({ page }) => {
    const apiKeyInput = page.getByTestId('JIRA-input');
    const toggleButton = page.getByTestId('JIRA-toggle-button');

    await toggleButton.click();
    await expect(apiKeyInput).toHaveAttribute('type', 'text');

    await toggleButton.click();
    await expect(apiKeyInput).toHaveAttribute('type', 'password');
  });

  test('should update API key', async ({ page }) => {
    const apiKeyInput = page.getByTestId('JIRA-input');
    await apiKeyInput.fill('new-api-key');
    // blur the input
    await apiKeyInput.blur();
    // reload the page
    await page.reload();
    // click the visibility button
    const toggleButton = page.getByTestId('JIRA-toggle-button');
    await toggleButton.click();
    await expect(apiKeyInput).toHaveValue('new-api-key');
  });
});
