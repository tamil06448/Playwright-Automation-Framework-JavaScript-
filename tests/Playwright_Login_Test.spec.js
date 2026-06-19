import path from 'path';
import { test, expect } from '@playwright/test';

test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== testInfo.expectedStatus) {
    const screenshotPath = path.join(
      'D:/Daacoworks-Files/script/Playwright_Automation/tests/screenshot',
      `${testInfo.title.replace(/[^a-zA-Z0-9]/g, '_')}.png`
    );

    await page.screenshot({
      path: screenshotPath,
      fullPage: true,
    });
  }
});

test.describe.serial('Fitzdo Partner Web App - Login Flow', () => {
  // test.describe('Fitzdo Partner Web App - Login Flow', () => {

  // POSITIVE TEST (RUNS FIRST)

  test('Login with valid credentials and validate dashboard', async ({ page }) => {

    const startTime = Date.now();

    //  Launch browser and open application
    await page.goto('https://uat-partner.fitzdo.com/', {
      waitUntil: 'domcontentloaded'     // Open application & wait for load
    });

    // SSL & title validation
    await expect(page.url()).toContain('https://');
    await expect(page).toHaveTitle(/Fitzdo/i);

    //  Enter valid email
    await page.getByPlaceholder('Enter your email').fill('ta06448@gmail.com');
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.getByRole('button', { name: 'Continue' }).click();
    // await page.waitForTimeout(30000);

    // Wait for password screen to load
    await page.waitForSelector('input[type="password"]', { state: 'visible' });
    await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('TamilarasanR@123');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.waitForTimeout(3000);

    // await expect(page.locator('Continue to Profile Setup')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Continue to Profile Setup ' })).toBeVisible();
    await page.getByRole('button', { name: 'Continue to Profile Setup' }).click();

    // Validate dashboard URL
    await expect(page).toHaveURL('https://uat-partner.fitzdo.com/auth/business-category');
    await page.waitForTimeout(3000);

    // Performance check
    const responseTime = Date.now() - startTime;
    expect(responseTime).toBeLessThan(30000);  // 30 seconds

    //  Validate dashboard widgets
    await expect(page.getByRole('button', { name: 'Go to Sign Up' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Country IN' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Change language' })).toBeVisible();
    await expect(page.getByText('Fitzdo is Secure')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Tell us about your business' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Fitness & Gym Gym, Fitness' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Yoga & Mindfulness Yoga' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sports & Coaching Football,' })).toBeVisible();

  });

  // NEGATIVE TESTS (RUN ONLY AFTER POSITIVE)

  // test.describe('Negative Login Scenarios', () => {
    test.skip('Negative Login Scenarios', () => {
      // test('Negative Login Scenarios', () => {

    const invalidUsers = [
      { title: 'Invalid email format', email: 'wrongemail', password: '123456' },
      { title: 'Wrong password', email: 'test@gmail.com', password: 'wrongPass' },
      { title: 'Empty email', email: '', password: 'somePass' },
      { title: 'Empty password', email: 'test@gmail.com', password: '' }
    ];

    for (const user of invalidUsers) {
      test(`Login should fail - ${user.title}`, async ({ page }) => {

        await page.goto('https://uat-partner.fitzdo.com/', {
          waitUntil: 'domcontentloaded'
        });

        // await page.getByPlaceholder('Enter your email').fill(user.email);
        if (user.email) {
          await page.getByPlaceholder('Enter your email').fill(user.email);
        }
        await page.getByRole('button', { name: 'Continue' }).click();

        const passwordInput = page.locator('input[type="password"]');
        if (await passwordInput.isVisible()) {
          await passwordInput.fill(user.password);
          await page.getByRole('button', { name: 'Sign in' }).click();
        }

        // Validate error
        await expect(
          // page.locator('text=/invalid|incorrect|error|required/i')
          page.getByText(/invalid|incorrect|error|required/i)
        ).toBeVisible();

        // Ensure user is NOT logged in
        await expect(page).not.toHaveURL(/auth\/business-category/);
      });
    }
  });

});