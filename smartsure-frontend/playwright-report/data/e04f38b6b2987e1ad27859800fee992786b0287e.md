# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: my-test.spec.ts >> Full System Flow: Admin & Customer Purchase
- Location: e2e\my-test.spec.ts:3:1

# Error details

```
Error: toBeVisible can be only used with Locator object
```

# Page snapshot

```yaml
- generic [ref=e2]:
  - generic [ref=e3]:
    - navigation [ref=e4]:
      - generic [ref=e6]:
        - link "SmartSure" [ref=e7] [cursor=pointer]:
          - /url: /dashboard
          - img [ref=e9]
          - generic [ref=e11]: SmartSure
        - generic [ref=e12]:
          - link "Dashboard" [ref=e13] [cursor=pointer]:
            - /url: /dashboard
            - img [ref=e14]
            - generic [ref=e16]: Dashboard
          - link "Browse" [ref=e17] [cursor=pointer]:
            - /url: /policies
            - img [ref=e18]
            - generic [ref=e20]: Browse
          - link "My Policies" [ref=e21] [cursor=pointer]:
            - /url: /my-policies
            - img [ref=e22]
            - generic [ref=e24]: My Policies
          - link "Claims Hub" [ref=e25] [cursor=pointer]:
            - /url: /my-claims
            - img [ref=e26]
            - generic [ref=e28]: Claims Hub
        - generic [ref=e29]:
          - button "Toggle theme" [ref=e30] [cursor=pointer]:
            - img [ref=e32]
          - button "Divyansh" [ref=e35] [cursor=pointer]:
            - img [ref=e38]
            - generic [ref=e41]: Divyansh
    - main [ref=e42]:
      - generic [ref=e44]:
        - generic [ref=e46]:
          - heading "Available Coverages" [level=1] [ref=e47]
          - paragraph [ref=e48]: Browse and secure the right insurance plans tailored for your peace of mind.
        - generic [ref=e50]:
          - generic [ref=e52]:
            - img [ref=e54]
            - textbox "Search plans (e.g. Life, Vehicle, Health)..." [ref=e56]
          - generic [ref=e57]:
            - button "ALL" [ref=e58] [cursor=pointer]
            - button "LIFE" [ref=e59] [cursor=pointer]
            - button "HEALTH" [ref=e60] [cursor=pointer]
        - generic [ref=e61]:
          - generic [ref=e62]:
            - generic [ref=e63]:
              - img [ref=e65]
              - generic [ref=e68]: LIFE
              - heading "Life Insurance Policy" [level=3] [ref=e69]
              - paragraph [ref=e70]: A long-term life insurance plan that provides financial security to your family in case of unforeseen events. Includes maturity benefits and death cover.
              - generic [ref=e71]:
                - generic [ref=e72]:
                  - paragraph [ref=e73]: Premium
                  - paragraph [ref=e74]: ₹2,500/mo
                - generic [ref=e75]:
                  - paragraph [ref=e76]: Coverage
                  - paragraph [ref=e77]: ₹25.0L
            - generic [ref=e78]:
              - link "View Terms" [ref=e79] [cursor=pointer]:
                - /url: /policies/1
                - button "View Terms" [ref=e80]
              - button "Purchase" [ref=e81] [cursor=pointer]:
                - img [ref=e83]
                - text: Purchase
          - generic [ref=e85]:
            - generic [ref=e86]:
              - img [ref=e88]
              - generic [ref=e91]: HEALTH
              - heading "Health Plus Care" [level=3] [ref=e92]
              - paragraph [ref=e93]: Covers hospitalization, surgeries, and medical expenses. Includes cashless treatment at network hospitals.
              - generic [ref=e94]:
                - generic [ref=e95]:
                  - paragraph [ref=e96]: Premium
                  - paragraph [ref=e97]: ₹8,000/mo
                - generic [ref=e98]:
                  - paragraph [ref=e99]: Coverage
                  - paragraph [ref=e100]: ₹5.0L
            - generic [ref=e101]:
              - link "View Terms" [ref=e102] [cursor=pointer]:
                - /url: /policies/2
                - button "View Terms" [ref=e103]
              - button "Purchase" [active] [ref=e104] [cursor=pointer]:
                - img [ref=e106]
                - text: Purchase
        - generic [ref=e108]:
          - button "Previous" [disabled] [ref=e110]:
            - img [ref=e111]
            - generic [ref=e113]: Previous
          - generic [ref=e115]:
            - generic [ref=e116]: Page
            - generic [ref=e117]:
              - generic [ref=e118]: "1"
              - generic [ref=e119]: of
              - generic [ref=e120]: "1"
          - generic [ref=e121]:
            - generic [ref=e122]:
              - paragraph [ref=e123]: "Show:"
              - generic [ref=e124]:
                - combobox [ref=e125] [cursor=pointer]:
                  - option "10" [selected]
                  - option "20"
                  - option "50"
                  - option "100"
                - img
            - button "Next" [disabled] [ref=e126]:
              - generic [ref=e127]: Next
              - img [ref=e128]
    - contentinfo [ref=e130]:
      - generic [ref=e132]:
        - generic [ref=e133]:
          - generic [ref=e134]:
            - link "SmartSure" [ref=e135] [cursor=pointer]:
              - /url: /
              - img [ref=e137]
              - generic [ref=e139]: SmartSure
            - paragraph [ref=e140]: Premium insurance management for individuals and enterprises. Protecting your future with smart, digital solutions.
            - generic [ref=e141]:
              - button [ref=e142] [cursor=pointer]:
                - img [ref=e143]
              - button [ref=e145] [cursor=pointer]:
                - img [ref=e146]
              - button [ref=e148] [cursor=pointer]:
                - img [ref=e149]
              - button [ref=e151] [cursor=pointer]:
                - img [ref=e152]
          - generic [ref=e154]:
            - heading "Platform" [level=3] [ref=e155]
            - list [ref=e156]:
              - listitem [ref=e157]:
                - link "Home" [ref=e158] [cursor=pointer]:
                  - /url: /
              - listitem [ref=e159]:
                - link "All Policies" [ref=e160] [cursor=pointer]:
                  - /url: /policies
              - listitem [ref=e161]:
                - link "Dashboard" [ref=e162] [cursor=pointer]:
                  - /url: /login
          - generic [ref=e163]:
            - heading "Company" [level=3] [ref=e164]
            - list [ref=e165]:
              - listitem [ref=e166]:
                - link "About Us" [ref=e167] [cursor=pointer]:
                  - /url: /about
              - listitem [ref=e168]:
                - link "Contact Us" [ref=e169] [cursor=pointer]:
                  - /url: /contact
              - listitem [ref=e170]:
                - link "Terms & Conditions" [ref=e171] [cursor=pointer]:
                  - /url: /terms
          - generic [ref=e172]:
            - heading "Support" [level=3] [ref=e173]
            - list [ref=e174]:
              - listitem [ref=e175] [cursor=pointer]: Support Center
              - listitem [ref=e176] [cursor=pointer]: Privacy Policy
              - listitem [ref=e177] [cursor=pointer]: Help FAQ
        - generic [ref=e178]:
          - generic [ref=e179]:
            - img [ref=e180]
            - generic [ref=e182]: Secure • Fast • Simple
          - paragraph [ref=e183]: © 2026 SmartSure. All rights reserved.
  - region "Notifications Alt+T":
    - generic [ref=e184]:
      - alert [ref=e185] [cursor=pointer]:
        - img [ref=e187]
        - text: You already have an active subscription for Health Plus Care
        - button "close" [ref=e189]:
          - img [ref=e190]
        - progressbar [ref=e194]
      - alert [ref=e195] [cursor=pointer]:
        - img [ref=e197]
        - text: Login successful!
        - button "close" [ref=e199]:
          - img [ref=e200]
        - progressbar [ref=e204]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test('Full System Flow: Admin & Customer Purchase', async ({ page }) => {
  4  |     // 1. Go to site
  5  |     await page.goto('http://smartsure.eastasia.cloudapp.azure.com/');
  6  |     
  7  |     // 2. Login as Admin
  8  |     await page.getByRole('link', { name: 'Log In' }).click();
  9  |     await page.getByRole('textbox', { name: 'Email Address' }).fill('admin@capgemini.com');
  10 |     await page.getByRole('textbox', { name: 'Password' }).fill('admin123');
  11 |     await page.getByRole('button', { name: 'Sign In' }).click();
  12 | 
  13 |     // 3. Verify Admin Dashboard
  14 |     await expect(page.getByRole('link', { name: 'Policies', exact: true })).toBeVisible();
  15 |     await page.getByRole('link', { name: 'Policies', exact: true }).click();
  16 |     await page.getByRole('link', { name: 'Claims' }).click();
  17 |     await page.getByRole('link', { name: 'Subscriptions' }).click();
  18 |     await page.getByRole('link', { name: 'Reports' }).click();
  19 |     
  20 |     // 4. Logout Admin
  21 |     await page.getByRole('button', { name: 'Admin' }).click();
  22 |     await page.getByRole('button', { name: 'Log Out' }).click();
  23 | 
  24 |     // 5. Login as Customer
  25 |     await page.getByRole('textbox', { name: 'Email Address' }).fill('limitx62@gmail.com');
  26 |     await page.getByRole('textbox', { name: 'Password' }).fill('Divyansh@123');
  27 |     await page.getByRole('button', { name: 'Sign In' }).click();
  28 | 
  29 |     // 6. Customer browse and Purchase
  30 |     await page.getByRole('link', { name: 'Browse' }).click();
  31 |     await page.getByRole('button', { name: 'Purchase' }).nth(1).click();
  32 |     
  33 |     // Verify Razorpay frame appears
  34 |     const frame = page.frameLocator('iframe');
> 35 |     await expect(frame.first()).toBeVisible({ timeout: 10000 });
     |                                 ^ Error: toBeVisible can be only used with Locator object
  36 |     
  37 |     // 7. Check My Policies
  38 |     await page.goto('http://smartsure.eastasia.cloudapp.azure.com/my-policies');
  39 |     await expect(page.getByText('My Policies')).toBeVisible();
  40 |     
  41 |     await page.getByRole('link', { name: 'Claims Hub' }).click();
  42 |     await page.getByRole('link', { name: 'My Policies' }).click();
  43 | });
```