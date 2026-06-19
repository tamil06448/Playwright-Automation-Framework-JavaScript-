import { test, excepct, expect } from '@playwright/test'

test('Login Page', async ({ page }) => {
   await page.goto('https://prismworks.io/');
   await page.getByRole('heading', { name: 'Sign In' }).click();
   await expect(page).toHaveTitle('Sign In - Prism')
   // await page.locator('iframe').contentFrame().getByRole('textbox', { name: 'username' }).click();
   await page.locator('iframe').contentFrame().getByRole('textbox', { name: 'username' }).fill('veeralakshmanan@daacoworks.com');
   // await page.locator('iframe').contentFrame().getByRole('textbox', { name: 'password' }).click();
   await page.locator('iframe').contentFrame().getByRole('textbox', { name: 'password' }).fill('123456');
   await page.locator('iframe').contentFrame().getByText('Login').click();
   await expect(page).toHaveURL('https://prismworks.io/panel/#/dashboard/view')
   await page.getByRole('listitem').filter({ hasText: 'Veera ProfileChange Password' }).getByLabel('Dropdown toggle').click();
   // expect(page).tobevisible('profile', 'changepassword', 'https://prismworks.io/panel/#')
   await expect(page.getByRole('menuitem', { name: 'Profile' })).toBeVisible();
   await expect(page.getByRole('menuitem', { name: 'Change Password' })).toBeVisible();
   await expect(page.getByRole('menuitem', { name: 'Logout' })).toBeVisible();
   await page.getByRole('menuitem', { name: 'Logout' }).click();
   await expect(page).toHaveURL('https://prismworks.io/')
});