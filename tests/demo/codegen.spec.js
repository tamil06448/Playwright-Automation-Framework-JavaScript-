import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://prismworks.io/');
  await page.getByRole('heading', { name: 'Sign In' }).click();
  await page.locator('iframe').contentFrame().getByRole('textbox', { name: 'username' }).click();
  await page.locator('iframe').contentFrame().getByRole('textbox', { name: 'username' }).fill('veeralakshmanan@daacoworks.com');
  await page.locator('iframe').contentFrame().getByRole('textbox', { name: 'password' }).click();
  await page.locator('iframe').contentFrame().getByRole('textbox', { name: 'password' }).fill('123456');
  await page.locator('iframe').contentFrame().getByText('Login').click();
  await expect(page).toHaveURL('https://prismworks.io/panel/#/dashboard/view')
  await page.getByRole('listitem').filter({ hasText: 'Veera ProfileChange Password' }).getByLabel('Dropdown toggle').click();
  await page.getByRole('menuitem', { name: 'Logout' }).click();
  await expect(page).toHaveURL('https://prismworks.io/')
});
