import { test, expect } from '@playwright/test';
import { Page } from '@playwright/test';
import { login } from './shared';

test.describe('Login Flow', () => {
  test('should log in an existing user successfully', async ({ page }: { page: Page }) => {
    await login(page);

    // Verify successful login
    await expect(page).toHaveURL(/.*\/landing/);
  });

  test('should not log in if the username is incorrect', async ({ page }: { page: Page }) => {
    await page.goto('http://localhost:4200/login');
    await page.fill('input[name="username"]', 'wrongusername');
    await page.fill('input[name="password"]', process.env['USER_PASSWORD'] || '');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Invalid username or password. Please try again.')).toBeVisible();
  });

  test('should take me to the signup page if I click the signup link', async ({ page }: { page: Page }) => {
    await page.goto('http://localhost:4200/login');
    await page.click('text=Sign up');
    await expect(page).toHaveURL(/.*\/signup/);
  });
}); 