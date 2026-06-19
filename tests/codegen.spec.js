// import { test, expect } from '@playwright/test';

// test('test', async ({ page }) => {
//   await page.goto('https://cmms.tamidas.com/login');
//   await page.getByRole('textbox', { name: 'Email Address' }).click();
//   await page.getByRole('textbox', { name: 'Email Address' }).fill('veeralakshmanan@daacoworks.com');
//   await page.getByRole('textbox', { name: 'Password' }).click();
//   await page.getByRole('textbox', { name: 'Password' }).fill('123456');
//   await page.getByRole('button', { name: 'Sign In' }).click();

//   await expect(page).toHaveURL('https://prismworks.io/panel/#/dashboard/view')
// // ✅ Wait for dashboard to load
//   await page.waitForLoadState('networkidle');

//   // ✅ Click profile/avatar button (adjust selector if needed)
//   await page.locator('button[aria-haspopup="menu"]').click();

//   // ✅ Wait until Logout is visible
//   const logoutBtn = page.getByRole('button', { name: 'Logout' });
//   await expect(logoutBtn).toBeVisible();

//   // ✅ Click Logout
//   await logoutBtn.click();

// });




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
