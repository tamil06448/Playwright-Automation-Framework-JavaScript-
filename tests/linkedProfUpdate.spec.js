import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
    await page.goto('https://www.linkedin.com/login/');
    await page.getByRole('textbox', { name: 'Email or phone' }).click();
    await page.getByRole('textbox', { name: 'Email or phone' }).fill('ta06448@gmail.com');
    await page.getByRole('textbox', { name: 'Password' }).click();
    await page.getByRole('textbox', { name: 'Password' }).fill('passsword');
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();
    await page.waitForTimeout(15000);

    await page.getByRole('link', { name: 'Tamilarasan R, Senior QA' }).click();
    await page.getByTestId('lazy-column').getByRole('link', { name: 'Edit profile' }).click();
    await page.waitForTimeout(2000);
    await page.getByRole('button', { name: 'Save' }).click();
    await page.waitForTimeout(3000);
    await page.getByRole('link', { name: 'Edit about' }).click();
    //   await page.waitForTimeout(3000);
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