import { test, expect } from '@playwright/test'

test('page trace', async ({ page }) => {

    await page.goto('https://prismworks.io/');
    await page.locator('iframe').contentFrame().getByRole('textbox', { name: 'username' }).fill('veeralakshmanan@daacoworks.com');
    // await page.locator('iframe').contentFrame().getByRole('textbox', { name: 'password' }).click();
    await page.locator('iframe').contentFrame().getByRole('textbox', { name: 'password' }).fill('123456');
    await page.locator('iframe').contentFrame().getByText('Login').click();
    //    await expect(page).toHaveURL('https://prismworks.io/panel/#/dashboard/view').waitForTimeout(3000)
    await page.waitForTimeout(9000);
    await page.locator('//*[@id="root"]/div/div[2]/div/div/div[1]/main/div/div/div/div/div/div[1]/div[1]/div[1]/div/label').click();
    await page.waitForTimeout(3000);
    await page.locator('//*[@id="root"]/div/div[2]/div/div/div[1]/main/div/div/div/div/div/div[1]/div[1]/div[2]/div/label').click();
    await page.waitForTimeout(2000);
    await page.locator('//*[@id="root"]/div/div[2]/div/div/div[1]/main/div/div/div/div/div/div[1]/div[1]/div[3]/div/label').click();
    await page.waitForTimeout(2000);
    await page.locator('//*[@id="root"]/div/div[2]/div/div/div[1]/main/div/div/div/div/div/div[1]/div[1]/div[4]/div/label').click();
    await page.waitForTimeout(3000);
    //    await page.locator('//*[@id="root"]/div/div[2]/div/div/div[1]/main/div/div/div/div/div/div[2]/div/div[2]/div[1]').first().screenshot({ path : 'tests\screenshot'+ Date.now()+ 'Total Estimated Effort.png'})
    await page.getByRole('listitem').filter({ hasText: 'Veera ProfileChange Password' }).getByLabel('Dropdown toggle').click();
    await expect(page.getByRole('menuitem', { name: 'Profiles' })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: 'Change Password' })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: 'Logout' })).toBeVisible();
    await page.getByRole('menuitem', { name: 'Logout' }).click();
    await expect(page).toHaveURL('https://prismworks.io/')
})