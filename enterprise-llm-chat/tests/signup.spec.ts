import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';
import { Page } from '@playwright/test';
// Load environment variables from .env file
dotenv.config();

test.describe.skip('Signup Flow', () => {
  test('should sign up a new user successfully', async ({ page }: { page: Page }) => {
    // Navigate to the signup page
    await page.goto('http://localhost:4200/signup', { timeout: 30000 });

    // Fill out the signup form
    await page.fill('input[name="firstName"]', 'John');
    await page.fill('input[name="lastName"]', 'Doe');
    await page.fill('input[name="email"]', 'john.doe@example.com');
    await page.fill('input[name="username"]', 'johndoe');
    await page.fill('input[name="password"]', process.env['USER_PASSWORD'] || '');
    await page.fill('input[name="confirmPassword"]', process.env['USER_PASSWORD'] || '');

    // Use the signup code from environment variables
    const signupCode = process.env['SIGNUP_CODE'] || '';
    await page.fill('input[name="signupCode"]', signupCode);

    // Submit the form
    await page.click('button[type="submit"]');

    // Verify successful signup
    await expect(page).toHaveURL(/.*\/landing/);
    await expect(page.locator('text=Welcome, John')).toBeVisible();

    // Wait for the signup API response
    await page.waitForResponse(
      response => response.url().includes('/api/signup') && response.status() === 200,
      { timeout: 30000 } // Wait for up to 30 seconds
    );
  });
}); 