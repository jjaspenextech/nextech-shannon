import dotenv from 'dotenv';
import { Page } from '@playwright/test';

// Load environment variables from .env file
dotenv.config();

export async function login(page: Page) {
  await page.goto('http://localhost:4200/login');
  await page.fill('input[name="username"]', 'johndoe');
  await page.fill('input[name="password"]', process.env['USER_PASSWORD'] || '');
  await page.click('button[type="submit"]');
  await page.waitForLoadState('networkidle');
}
