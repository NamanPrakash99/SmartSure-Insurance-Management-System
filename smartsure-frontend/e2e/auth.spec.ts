import { test, expect } from '@playwright/test';

test.describe('Auth Flow', () => {
  test('should show login page and allow typing', async ({ page }) => {
    await page.goto('/login');
    
    // Check if the title is correct (adjust based on your actual UI)
    await expect(page).toHaveTitle(/Login/);
    
    // Check for login form elements
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const loginButton = page.locator('button[type="submit"]');

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(loginButton).toBeVisible();

    // Test interaction
    await emailInput.fill('test@smartsure.com');
    await passwordInput.fill('password123');
    
    // Note: We don't click submit here unless we want to test actual login failure/success
  });
});
