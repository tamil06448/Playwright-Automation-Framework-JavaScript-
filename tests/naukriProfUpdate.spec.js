import { test, expect } from '@playwright/test';

test('Naukri Profile Update', async ({ page }) => {
  await page.goto('https://www.naukri.com/nlogin/login?URL=//www.naukri.com/mnjuser/profile?id=&altresid');
  await page.getByRole('textbox', { name: 'Enter Email ID / Username' }).click();
  await page.getByRole('textbox', { name: 'Enter Email ID / Username' }).fill('ta06448@gmail.com');
  await page.getByRole('textbox', { name: 'Enter Password' }).click();
  await page.getByRole('textbox', { name: 'Enter Password' }).fill('Tamil');
  await page.getByText('Show', { exact: true }).click();
  await page.getByRole('button', { name: 'Login', exact: true }).click();
  await page.waitForTimeout(3000);
  // 4. Go directly to profile if we are not already there
  if (!page.url().includes('/mnjuser/profile')) {
    await page.goto('https://www.naukri.com/mnjuser/profile');
    await page.waitForLoadState('domcontentloaded');
  }
  await page.waitForTimeout(3000);
  await page.getByRole('emphasis').filter({ hasText: 'editOneTheme' }).click();
  await page.waitForTimeout(3000);
  await expect(page.getByText('Availability to join', { exact: true })).toBeVisible();
  await page.locator('span').filter({ hasText: '1 Month' }).click();
  await page.getByText('15 Days or less', { exact: true }).click();
  await page.getByRole('button', { name: 'Save' }).click();
  await page.waitForTimeout(3000);
  await page.locator('.lightbox.profileEditDrawer.profileUpdatedProLayer > .crossLayer > .icon').click();
  await page.waitForTimeout(3000);
  await expect(page.locator('#lazyKeySkills').getByText('Key skills')).toBeVisible();
  await page.locator('#lazyKeySkills').getByText('editOneTheme').click();
  await page.waitForTimeout(2000);
  await page.locator('div:nth-child(16) > .material-icons').click();
  await page.waitForTimeout(1000);
  await page.getByRole('textbox', { name: 'Add skills' }).click();
  await page.waitForTimeout(1000);

 const addSkills = page.getByRole('textbox', { name: 'Add skills' });

await addSkills.click();
await addSkills.pressSequentially('Jira', { delay: 150 });

await page.waitForTimeout(2000);

const jiraSuggestion = page
  .locator('#sugDrp_keySkillSugg')
  .locator('li')
  .filter({ hasText: /jira/i })
  .first();

if (await jiraSuggestion.isVisible().catch(() => false)) {
  await jiraSuggestion.click();
  console.log('JIRA selected from dropdown');
} else {
  console.log('JIRA dropdown suggestion not available');
  await addSkills.press('ArrowDown');
  await addSkills.press('Enter');
}

await page.getByRole('button', { name: 'Save' }).click();
});
