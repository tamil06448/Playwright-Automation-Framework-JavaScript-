import { test, expect } from '@playwright/test';

test('Naukri Profile Update', async ({ page }) => {
  await page.goto('https://www.naukri.com/nlogin/login?URL=//www.naukri.com/mnjuser/profile?id=&altresid');
  await page.getByRole('textbox', { name: 'Enter Email ID / Username' }).click();
  await page.getByRole('textbox', { name: 'Enter Email ID / Username' }).fill('ta06448@gmail.com');
  await page.getByRole('textbox', { name: 'Enter Password' }).click();
  await page.getByRole('textbox', { name: 'Enter Password' }).fill('Tamilsathya@0306');
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

test('LinkedIn Profile Update', async ({ page }) => {

    // Increase TOTAL test timeout
    test.setTimeout(180000); // 3 minutes

    await page.goto('https://www.linkedin.com/login/');
    await page.getByRole('textbox', { name: 'Email or phone' }).click();
    await page.getByRole('textbox', { name: 'Email or phone' }).fill('ta06448@gmail.com');
    await page.getByRole('textbox', { name: 'Password' }).click();
    await page.getByRole('textbox', { name: 'Password' }).fill('tamilsathya');
    // await page.getByRole('textbox', { name: 'Password' }).fill('passsword');
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();
    // =====================================================
    // 5. WAIT FOR MOBILE APPROVAL
    // =====================================================

    console.log('Waiting for LinkedIn mobile approval...');
    const profileLink = page
        .locator('a[href*="/in/"]')
        .filter({ hasText: /Tamilarasan R/i })
        .first();

    // Playwright waits until profile link appears
    // You have up to 2 minutes to approve on mobile
    await expect(profileLink).toBeVisible({
        timeout: 150000
    });

    console.log('Mobile approval completed.');
    console.log('LinkedIn profile page is available.');
    // =====================================================
    // 6. GO TO PROFILE
    // =====================================================
    await profileLink.click();
    await page.waitForLoadState('domcontentloaded');
    console.log('Profile opened.');
    // =====================================================
    // 7. EDIT PROFILE
    // =====================================================
    const editProfile = page
        .getByTestId('lazy-column')
        .getByRole('link', { name: 'Edit profile' });

    await expect(editProfile).toBeVisible({
        timeout: 15000
    });

    await editProfile.click();
    // =====================================================
    // 8. WAIT FOR PROFILE EDIT PAGE
    // =====================================================

    await page.waitForTimeout(2000);

    console.log('Edit profile opened.');
    await page.getByRole('button', { name: 'Save' }).click();
    await page.waitForTimeout(3000);
    await page.getByRole('link', { name: 'Edit about' }).click();
    // Wait for editor to appear
    const editor = page.getByTestId(
        'ui-core-tiptap-text-editor-wrapper'
    );

    await editor.waitFor({
        state: 'visible',
        timeout: 15000
    });

    // Find ONLY "Available to join immediately"
    const lineToRemove = editor.getByText(
        'Available to join immediately',
        { exact: true }
    );

    // Check whether the text exists
    const count = await lineToRemove.count();

    if (count > 0) {
        // Text exists → remove it
        await lineToRemove.click();
        await page.keyboard.press('Home');
        await page.keyboard.press('Shift+End');
        await page.keyboard.press('Backspace');

        console.log('Removed: Available to join immediately.');
    } else {
        // Text doesn't exist → leave content unchanged
        console.log('Text not found. Leaving content unchanged.');
    }

    await page.waitForTimeout(3000);
    await page.getByRole('button', { name: 'Save' }).click();
    await page.waitForTimeout(5000);
    await page.getByRole('button', { name: 'Dismiss' }).first().click();
    await page.waitForTimeout(3000);
    await page.getByRole('link', { name: 'Edit about' }).click();
    await page.waitForTimeout(3000);
    await page.getByRole('textbox', { name: 'About' }).fill(
        `Senior QA Engineer with 4.5+ years of experience in Manual, API and Database Testing, focused on delivering reliable and high-quality software.
My experience includes:
• Functional, Regression, Smoke, Sanity, Integration & UAT Testing
• REST API Testing using Postman
• API request/response, status code, headers, pagination, filtering & error validation
• Database validation using SQL, PostgreSQL & MongoDB
• Jira & Agile/Scrum methodologies
• Android application/APK testing
• Playwright + JavaScript for UI automation — currently upskilling and building hands-on projects
I have worked on CMMS / enterprise software, validating critical business workflows, APIs and database transactions across releases.
I enjoy investigating defects by connecting UI → API → Database and identifying the actual root cause.
Currently looking for QA Engineer / Software Test Engineer opportunities in Bengaluru or Remote.
Available to join immediately.`
    );
    await page.waitForTimeout(2000);
    await page.getByRole('button', { name: 'Save' }).click();
    await page.waitForTimeout(3000);
    await page.getByRole('button', { name: 'Dismiss' }).first().click();
    await page.waitForTimeout(3000);
    await page.getByRole('button', { name: 'Me', exact: true }).click();
    await page.waitForTimeout(3000);
    await page.getByRole('link', { name: 'Sign out' }).click();
});