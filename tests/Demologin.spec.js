
import { test, expect } from '@playwright/test';

test.describe('Fitzdo Partner Web App - Login Flow', () => {

  test('Login with valid credentials and validate dashboard', async ({ page }) => {

    const startTime = Date.now();
    //  Launch browser and open application
    await page.goto('https://uat-partner.fitzdo.com/', {
      waitUntil: 'domcontentloaded'                       // Open application & wait for load
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
    // await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('TamilarasanR@123');

    // Wait for password field
    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toBeVisible();
    await passwordInput.fill('TamilarasanR@123');
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
    expect(responseTime).toBeLessThan(5000);

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

});
