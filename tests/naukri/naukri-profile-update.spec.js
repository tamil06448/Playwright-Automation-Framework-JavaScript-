import { test, expect } from '@playwright/test';
import 'dotenv/config';
import path from 'path';

// ============================================================
// ENV VALIDATION For Naukri
// ============================================================

if (!process.env.NAUKRI_EMAIL || !process.env.NAUKRI_PASSWORD) {
    throw new Error(
        'NAUKRI_EMAIL or NAUKRI_PASSWORD is missing from environment variables'
    );
}

test('Naukri Profile Update', async ({ page }) => {
    // ==========================================================
    // 1. LOGIN
    // ==========================================================

    await page.goto(
        'https://www.naukri.com/nlogin/login?URL=//www.naukri.com/mnjuser/profile?id=&altresid'
    );

    await page
        .getByRole('textbox', {
            name: 'Enter Email ID / Username'
        })
        .fill(process.env.NAUKRI_EMAIL);

    await page
        .getByRole('textbox', {
            name: 'Enter Password'
        })
        .fill(process.env.NAUKRI_PASSWORD);

    await page.getByText('Show', {
        exact: true
    }).click();

    await page.getByRole('button', {
        name: 'Login',
        exact: true
    }).click();

    await page.waitForTimeout(3000);

    // 4. Go directly to profile if we are not already there
    if (!page.url().includes('/mnjuser/profile')) {
        await page.goto('https://www.naukri.com/mnjuser/profile');
        await page.waitForLoadState('domcontentloaded');
    }
    await page.waitForTimeout(3000);
    await page.getByRole('button', { name: 'Edit basic details' }).click();
    await page.waitForTimeout(3000);
    await expect(page.getByText('Availability to join', { exact: true })).toBeVisible();
    await page.locator('span').filter({ hasText: '1 Month' }).click();
    await page.getByText('15 Days or less', { exact: true }).click();
    await page.getByRole('button', { name: 'Save' }).click();
    await page.waitForTimeout(3000);
    await page.locator('.lightbox.profileEditDrawer.profileUpdatedProLayer > .crossLayer > .icon').click();
    await page.waitForTimeout(3000);

    // ============================================================
    // 4. UPDATE RESUME
    // ============================================================

    console.log('\n[4] Updating resume...');

    const updateResumeButton = page.getByRole('button', {
        name: 'Update resume'
    });
    await expect(updateResumeButton).toBeVisible({
        timeout: 15000
    });

    // ============================================================
    // RESUME FILE PATH
    // ============================================================

    const resumePath = path.resolve(
        'resume',
        'Tamilarasan_QA_Engineer.pdf'
    );
    console.log('Resume path:', resumePath);

    // ============================================================
    // HANDLE WINDOWS FILE PICKER
    // ============================================================

    const fileChooserPromise =
        page.waitForEvent('filechooser');
    await updateResumeButton.click();

    console.log('Update resume clicked.');

    // Wait for Windows file picker to be triggered
    const fileChooser = await fileChooserPromise;

    // ============================================================
    // SELECT RESUME FILE
    // ============================================================

    await fileChooser.setFiles(resumePath);
    console.log('Resume selected successfully.');
    await page.waitForTimeout(5000);

    await expect(page.locator('#lazyKeySkills').getByText('Key skills')).toBeVisible();
    await page.locator('#lazyKeySkills').getByText('editOneTheme').click();
    await page.waitForTimeout(2000);
    await page.locator('div:nth-child(17) > .material-icons').click();
    await page.waitForTimeout(1000);
    // await page.getByRole('textbox', { name: 'Add skills' }).click();
    await page.getByRole('combobox', { name: 'Add skills' }).click();
    await page.waitForTimeout(1000);

    const addSkills = page.getByRole('combobox', { name: 'Add skills' });
    await addSkills.click();
    await addSkills.pressSequentially('Jira', { delay: 150 });
    await page.waitForTimeout(3500);

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