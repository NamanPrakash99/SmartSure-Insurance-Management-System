# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> Auth Flow >> should show login page and allow typing
- Location: e2e\auth.spec.ts:4:3

# Error details

```
Error: expect(page).toHaveTitle(expected) failed

Expected pattern: /Login/
Received string:  "SmartSure — Intelligent Insurance Management"
Timeout: 5000ms

Call log:
  - Expect "toHaveTitle" with timeout 5000ms
    9 × unexpected value "SmartSure — Intelligent Insurance Management"

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - generic [ref=e4]:
    - generic [ref=e5]:
      - link [ref=e6] [cursor=pointer]:
        - /url: /
        - img [ref=e7]
      - heading "Welcome back" [level=2] [ref=e9]
      - paragraph [ref=e10]: Sign in to manage your policies
    - generic [ref=e11]:
      - generic [ref=e12]:
        - generic [ref=e13]: Email Address
        - generic [ref=e14]:
          - img [ref=e16]
          - textbox "Email Address" [ref=e18]:
            - /placeholder: name@company.com
      - generic [ref=e19]:
        - generic [ref=e20]: Password
        - generic [ref=e21]:
          - img [ref=e23]
          - textbox "Password" [ref=e25]:
            - /placeholder: ••••••••
          - button [ref=e26] [cursor=pointer]:
            - img [ref=e27]
      - generic [ref=e29]:
        - generic [ref=e31] [cursor=pointer]:
          - generic [ref=e32]:
            - checkbox "Remember me" [ref=e33]
            - img
          - generic [ref=e34]: Remember me
        - link "Forgot password?" [ref=e35] [cursor=pointer]:
          - /url: /forgot-password
      - button "Sign In" [ref=e36] [cursor=pointer]
    - paragraph [ref=e37]:
      - text: Don't have an account?
      - link "Register here" [ref=e38] [cursor=pointer]:
        - /url: /register
  - region "Notifications Alt+T"
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Auth Flow', () => {
  4  |   test('should show login page and allow typing', async ({ page }) => {
  5  |     await page.goto('/login');
  6  |     
  7  |     // Check if the title is correct (adjust based on your actual UI)
> 8  |     await expect(page).toHaveTitle(/Login/);
     |                        ^ Error: expect(page).toHaveTitle(expected) failed
  9  |     
  10 |     // Check for login form elements
  11 |     const emailInput = page.locator('input[type="email"]');
  12 |     const passwordInput = page.locator('input[type="password"]');
  13 |     const loginButton = page.locator('button[type="submit"]');
  14 | 
  15 |     await expect(emailInput).toBeVisible();
  16 |     await expect(passwordInput).toBeVisible();
  17 |     await expect(loginButton).toBeVisible();
  18 | 
  19 |     // Test interaction
  20 |     await emailInput.fill('test@smartsure.com');
  21 |     await passwordInput.fill('password123');
  22 |     
  23 |     // Note: We don't click submit here unless we want to test actual login failure/success
  24 |   });
  25 | });
  26 | 
```