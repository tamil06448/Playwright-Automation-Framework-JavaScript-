import { test } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({
    path: path.resolve(process.cwd(), '.env')
});

test('LinkedIn Hiring Post Email Extractor', async ({ page }) => {

    // ============================================================
    // CONFIGURATION
    // ============================================================

    const SEARCH_QUERY = 'Manual Testing And Hiring';

    const OUTPUT_FILE = path.resolve(
        process.cwd(),
        'linkedin_hiring_last24h.csv'
    );

    const EMAIL_REGEX =
        /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;

    // ============================================================
    // CHECK ENVIRONMENT VARIABLES
    // ============================================================

    const LINKEDIN_EMAIL = process.env.LINKEDIN_EMAIL;
    const LINKEDIN_PASSWORD = process.env.LINKEDIN_PASSWORD;

    if (!LINKEDIN_EMAIL || !LINKEDIN_PASSWORD) {
        throw new Error(
            'LinkedIn credentials missing. Check your .env file.'
        );
    }

    console.log('\n========================================');
    console.log('LINKEDIN QA JOB POST EXTRACTOR');
    console.log('========================================');
    console.log('Search:', SEARCH_QUERY);
    console.log('Output:', OUTPUT_FILE);

    // ============================================================
    // 1. OPEN LINKEDIN LOGIN
    // ============================================================

    console.log('\n[1] Opening LinkedIn...');

    await page.goto('https://www.linkedin.com/login/', {
        waitUntil: 'domcontentloaded',
        timeout: 60000
    });

    await page.waitForTimeout(2000);

    // ============================================================
    // 2. LOGIN
    // ============================================================

    console.log('[2] Logging in...');

    const emailInput = page.getByRole('textbox', {
        name: 'Email or phone'
    });

    const passwordInput = page.getByRole('textbox', {
        name: 'Password'
    });

    await emailInput.fill(LINKEDIN_EMAIL);
    await passwordInput.fill(LINKEDIN_PASSWORD);

    await page.getByRole('button', {
        name: 'Sign in',
        exact: true
    }).click();

    await page.waitForTimeout(5000);

    console.log('Current URL:', page.url());

    // ============================================================
    // 3. CHECK FOR CAPTCHA / VERIFICATION
    // ============================================================

    const currentUrl = page.url();

    if (
        currentUrl.includes('checkpoint') ||
        currentUrl.includes('challenge')
    ) {
        console.log('\n========================================');
        console.log('LINKEDIN VERIFICATION REQUIRED');
        console.log('========================================');
        console.log(
            'Complete the verification manually in the browser.'
        );

        await page.pause();
    }

    // ============================================================
    // 4. OPEN LINKEDIN SEARCH
    // ============================================================

    console.log('\n[3] Opening search...');

    await page.goto(
        `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(
            SEARCH_QUERY
        )}`,
        {
            waitUntil: 'domcontentloaded',
            timeout: 60000
        }
    );

    await page.waitForTimeout(4000);

    console.log('Search page:', page.url());

    // ============================================================
    // 5. SELECT POSTS FILTER
    // ============================================================

    console.log('\n[4] Selecting Posts filter...');

    try {

        const postsRadio = page.getByRole('radio', {
            name: 'Filter by Posts'
        });

        if (await postsRadio.count() > 0) {

            await postsRadio.first().click();

            console.log('Posts filter selected.');

            await page.waitForTimeout(3000);
        }

    } catch (error) {

        console.log(
            'Posts filter was not clicked:',
            error.message
        );
    }

    // ============================================================
    // 6. SELECT LATEST
    // ============================================================

    console.log('\n[5] Selecting Latest...');

    try {

        const sortButton = page.getByRole('button', {
            name: 'Filter by Sort by'
        });

        if (await sortButton.count() > 0) {

            await sortButton.first().click();

            await page.waitForTimeout(1000);

            const latestRadio = page.getByRole('radio', {
                name: 'Latest'
            });

            if (await latestRadio.count() > 0) {

                await latestRadio.first().click();

                console.log('Latest selected.');

                await page.waitForTimeout(3000);
            }
        }

    } catch (error) {

        console.log(
            'Latest filter issue:',
            error.message
        );
    }

    // ============================================================
    // 7. SHOW RESULTS IF AVAILABLE
    // ============================================================

    console.log('\n[6] Checking Show results...');

    try {

        const showResults = page.getByRole('link', {
            name: 'Show results'
        });

        if (await showResults.count() > 0) {

            await showResults.first().click();

            await page.waitForTimeout(4000);

            console.log('Show results clicked.');

        }

    } catch (error) {

        console.log(
            'Show results not clicked:',
            error.message
        );
    }

    // ============================================================
    // 8. SCROLL TO LOAD POSTS
    // ============================================================

    console.log('\n[7] Loading posts...');

    for (let i = 0; i < 8; i++) {

        await page.mouse.wheel(0, 1500);

        await page.waitForTimeout(1500);

        console.log(
            `Scroll ${i + 1}/8 completed`
        );
    }

    // Scroll back to top
    await page.evaluate(() => {
        window.scrollTo(0, 0);
    });

    await page.waitForTimeout(1000);

    // ============================================================
    // 9. DIAGNOSTIC
    // ============================================================

    console.log('\n========================================');
    console.log('DIAGNOSTIC');
    console.log('========================================');

    console.log(
        'Page URL:',
        page.url()
    );

    const bodyText = await page.locator('body').innerText();

    console.log(
        'Page text length:',
        bodyText.length
    );

    // ============================================================
    // 10. FIND AND CLICK "MORE" BUTTONS
    // ============================================================

    console.log('\n[8] Looking for More buttons...');

    let moreButtons = page.getByTestId(
        'expandable-text-button'
    );

    let moreCount = await moreButtons.count();

    console.log(
        'expandable-text-button count:',
        moreCount
    );

    // Fallback if testid is not available
    if (moreCount === 0) {

        console.log(
            'Test ID not found. Searching buttons containing More...'
        );

        const allButtons = page.locator('button');

        const buttonCount = await allButtons.count();

        console.log(
            'Total buttons:',
            buttonCount
        );

        for (let i = 0; i < buttonCount; i++) {

            try {

                const button = allButtons.nth(i);

                if (!(await button.isVisible())) {
                    continue;
                }

                const text =
                    await button.innerText()
                        .catch(() => '');

                const aria =
                    await button.getAttribute('aria-label')
                        .catch(() => '');

                const combined =
                    `${text} ${aria}`.trim();

                if (
                    /more/i.test(combined) &&
                    !/show more results/i.test(combined)
                ) {

                    console.log(
                        `Possible More button ${i}:`,
                        combined
                    );

                    try {

                        await button.click({
                            timeout: 3000
                        });

                        await page.waitForTimeout(500);

                    } catch {
                        // Ignore individual click failures
                    }
                }

            } catch {
                // Ignore
            }
        }

    } else {

        // ========================================================
        // CLICK ALL EXPANDABLE BUTTONS
        // ========================================================

        for (let i = 0; i < moreCount; i++) {

            try {

                const button =
                    moreButtons.nth(i);

                if (
                    await button.isVisible()
                ) {

                    await button.click({
                        timeout: 3000
                    });

                    await page.waitForTimeout(400);

                    console.log(
                        `Clicked More ${i + 1}/${moreCount}`
                    );
                }

            } catch (error) {

                console.log(
                    `Could not click More ${i + 1}:`,
                    error.message
                );
            }
        }
    }

    // ============================================================
    // 11. EXTRA SCROLL AFTER EXPANDING POSTS
    // ============================================================

    console.log('\n[9] Loading additional posts...');

    for (let i = 0; i < 5; i++) {

        await page.mouse.wheel(0, 1800);

        await page.waitForTimeout(1200);
    }

    // ============================================================
    // 12. CLICK MORE BUTTONS AGAIN
    // ============================================================

    console.log('\n[10] Expanding additional posts...');

    try {

        const buttons =
            page.getByTestId(
                'expandable-text-button'
            );

        const count =
            await buttons.count();

        console.log(
            'More buttons currently found:',
            count
        );

        for (let i = 0; i < count; i++) {

            try {

                const button =
                    buttons.nth(i);

                if (
                    await button.isVisible()
                ) {

                    await button.click({
                        timeout: 2000
                    });

                    await page.waitForTimeout(300);
                }

            } catch {
                // Ignore
            }
        }

    } catch {
        // Ignore
    }

    // ============================================================
    // 13. GET ALL PUBLIC EMAILS
    // ============================================================

    console.log('\n========================================');
    console.log('SEARCHING FOR PUBLIC EMAILS');
    console.log('========================================');

    const emailData = await page.evaluate((EMAIL_REGEX_SOURCE) => {

        const regex =
            new RegExp(
                EMAIL_REGEX_SOURCE,
                'gi'
            );

        const results = [];

        // --------------------------------------------------------
        // Helper: visibility
        // --------------------------------------------------------

        function isVisible(element) {

            if (!element) {
                return false;
            }

            const style =
                window.getComputedStyle(element);

            if (
                style.display === 'none' ||
                style.visibility === 'hidden' ||
                style.opacity === '0'
            ) {
                return false;
            }

            const rect =
                element.getBoundingClientRect();

            return (
                rect.width > 0 &&
                rect.height > 0
            );
        }

        // --------------------------------------------------------
        // Helper: clean text
        // --------------------------------------------------------

        function cleanText(text) {

            if (!text) {
                return '';
            }

            return text
                .replace(/\s+/g, ' ')
                .trim();
        }

        // --------------------------------------------------------
        // Find all possible visible elements
        // --------------------------------------------------------

        const elements =
            document.querySelectorAll(
                'a, span, div, p, li'
            );

        for (const element of elements) {

            if (!isVisible(element)) {
                continue;
            }

            const text =
                element.innerText || '';

            if (!text) {
                continue;
            }

            const matches =
                text.match(regex);

            if (!matches) {
                continue;
            }

            // We want the smallest useful element
            // containing the email.
            const parent =
                element.parentElement;

            if (
                parent &&
                isVisible(parent)
            ) {

                const parentText =
                    parent.innerText || '';

                const parentMatches =
                    parentText.match(regex);

                if (
                    parentMatches &&
                    parentText.length < text.length
                ) {
                    continue;
                }
            }

            for (const email of matches) {

                results.push({
                    email: email.toLowerCase(),
                    element
                });
            }
        }

        // --------------------------------------------------------
        // Convert DOM elements to extraction data
        // --------------------------------------------------------

        const finalResults = [];

        const uniqueEmails =
            [...new Set(
                results.map(
                    item => item.email
                )
            )];

        for (const email of uniqueEmails) {

            const item =
                results.find(
                    x => x.email === email
                );

            if (!item) {
                continue;
            }

            const emailElement =
                item.element;

            // ----------------------------------------------------
            // Find likely post container
            // ----------------------------------------------------

            let post = null;

            // First try known/possible LinkedIn containers
            post =
                emailElement.closest(
                    'article'
                );

            if (!post) {

                post =
                    emailElement.closest(
                        '.feed-shared-update-v2'
                    );
            }

            if (!post) {

                post =
                    emailElement.closest(
                        '[data-urn]'
                    );
            }

            // ----------------------------------------------------
            // If no standard container, walk ancestors
            // ----------------------------------------------------

            if (!post) {

                let current =
                    emailElement.parentElement;

                let bestCandidate = null;
                let bestScore = -999;

                for (
                    let level = 0;
                    current && level < 12;
                    level++
                ) {

                    const text =
                        cleanText(
                            current.innerText || ''
                        );

                    if (
                        text.length < 150 ||
                        text.length > 12000
                    ) {
                        current =
                            current.parentElement;

                        continue;
                    }

                    let score = 0;

                    // Email present
                    if (
                        text.toLowerCase()
                            .includes(email.toLowerCase())
                    ) {
                        score += 10;
                    }

                    // LinkedIn post action words
                    if (
                        /\bLike\b/i.test(text)
                    ) {
                        score += 3;
                    }

                    if (
                        /\bComment\b/i.test(text)
                    ) {
                        score += 3;
                    }

                    if (
                        /\bRepost\b/i.test(text)
                    ) {
                        score += 3;
                    }

                    if (
                        /\bSend\b/i.test(text)
                    ) {
                        score += 2;
                    }

                    // Hiring keywords
                    if (
                        /\bhiring\b/i.test(text)
                    ) {
                        score += 5;
                    }

                    if (
                        /\bQA\b/i.test(text)
                    ) {
                        score += 3;
                    }

                    if (
                        /\btester\b/i.test(text)
                    ) {
                        score += 2;
                    }

                    if (
                        /\btesting\b/i.test(text)
                    ) {
                        score += 2;
                    }

                    // Author/profile link
                    if (
                        current.querySelector(
                            'a[href*="/in/"]'
                        )
                    ) {
                        score += 4;
                    }

                    // Time element
                    if (
                        current.querySelector(
                            'time'
                        )
                    ) {
                        score += 4;
                    }

                    if (
                        score > bestScore
                    ) {

                        bestScore =
                            score;

                        bestCandidate =
                            current;
                    }

                    current =
                        current.parentElement;
                }

                post =
                    bestCandidate;
            }

            if (!post) {
                continue;
            }

            const postText =
                cleanText(
                    post.innerText || ''
                );

            // ----------------------------------------------------
            // Extract author name
            // ----------------------------------------------------

            let author = '';

            const profileLinks =
                post.querySelectorAll(
                    'a[href*="/in/"]'
                );

            for (
                const link of profileLinks
            ) {

                const text =
                    cleanText(
                        link.innerText || ''
                    );

                if (
                    text &&
                    text.length > 1 &&
                    text.length < 100
                ) {

                    author = text;

                    break;
                }
            }

            // Fallback: use first reasonable link
            if (!author) {

                const links =
                    post.querySelectorAll(
                        'a'
                    );

                for (
                    const link of links
                ) {

                    const text =
                        cleanText(
                            link.innerText || ''
                        );

                    if (
                        text &&
                        text.length > 2 &&
                        text.length < 100 &&
                        !/like|comment|repost|send|follow|more/i.test(text)
                    ) {

                        author = text;

                        break;
                    }
                }
            }

            // ----------------------------------------------------
            // Extract posted time
            // ----------------------------------------------------

            let posted = '';

            const timeElement =
                post.querySelector('time');

            if (timeElement) {

                posted =
                    cleanText(
                        timeElement.innerText ||
                        timeElement.getAttribute(
                            'datetime'
                        ) ||
                        ''
                    );
            }

            // Fallback regex for LinkedIn relative times
            if (!posted) {

                const timeMatch =
                    postText.match(
                        /\b(\d+\s*(?:m|min|mins|h|hr|hrs|d|day|days|w|wk|wks))\b/i
                    );

                if (timeMatch) {
                    posted =
                        timeMatch[1];
                }
            }

            // ----------------------------------------------------
            // Extract post URL
            // ----------------------------------------------------

            let postUrl = '';

            const links =
                post.querySelectorAll(
                    'a[href]'
                );

            for (
                const link of links
            ) {

                const href =
                    link.href || '';

                if (
                    href.includes(
                        '/feed/update/'
                    ) ||
                    href.includes(
                        '/posts/'
                    )
                ) {

                    postUrl = href;

                    break;
                }
            }

            // ----------------------------------------------------
            // Extract company
            // ----------------------------------------------------

            let company = '';

            const companyLinks =
                post.querySelectorAll(
                    'a[href*="/company/"]'
                );

            for (
                const link of companyLinks
            ) {

                const text =
                    cleanText(
                        link.innerText || ''
                    );

                if (
                    text &&
                    text.length < 150
                ) {

                    company = text;

                    break;
                }
            }

            // ----------------------------------------------------
            // Extract job title
            // ----------------------------------------------------

            let jobTitle = '';

            const titlePatterns = [

                /(?:we['’]re\s+hiring\s*[!|:\-]?\s*)(?:\|)?\s*([^\n|]+)/i,

                /(?:hiring\s*[!|:\-]?\s*)(?:for\s*)?(?:a\s*)?([A-Z][^\n|]+)/i,

                /\b(QA\s+(?:Engineer|Analyst|Tester|Automation Engineer|Manual Tester))\b/i,

                /\b(Software\s+Test(?:ing)?\s+Engineer)\b/i,

                /\b(Test\s+Engineer)\b/i,

                /\b(Quality\s+Analyst)\b/i,

                /\b(Quality\s+Engineer)\b/i,

                /\b(Software\s+Engineer\s*[-–]\s*Testing)\b/i
            ];

            for (
                const pattern of titlePatterns
            ) {

                const match =
                    postText.match(pattern);

                if (match && match[1]) {

                    let candidate =
                        cleanText(
                            match[1]
                        );

                    candidate =
                        candidate
                            .replace(
                                /\s+(?:-\s*)?(?:\d+\+?\s*years?).*$/i,
                                ''
                            )
                            .trim();

                    if (
                        candidate.length > 2 &&
                        candidate.length < 150
                    ) {

                        jobTitle =
                            candidate;

                        break;
                    }
                }
            }

            // Explicit labels
            if (!jobTitle) {

                const titleMatch =
                    postText.match(
                        /(?:job\s*title|position|role)\s*[:\-]\s*([^\n|]+)/i
                    );

                if (
                    titleMatch &&
                    titleMatch[1]
                ) {

                    jobTitle =
                        cleanText(
                            titleMatch[1]
                        );
                }
            }

            // ----------------------------------------------------
            // If company wasn't found, try text patterns
            // ----------------------------------------------------

            if (!company) {

                const companyMatch =
                    postText.match(
                        /(?:at|with)\s+([A-Z][A-Za-z0-9&.,'()\- ]{2,100})(?:\s+(?:is|are|for|as|hiring)\b)/i
                    );

                if (
                    companyMatch &&
                    companyMatch[1]
                ) {

                    company =
                        cleanText(
                            companyMatch[1]
                        );
                }
            }

            // ----------------------------------------------------
            // Save result
            // ----------------------------------------------------

            finalResults.push({

                email,

                author,

                company,

                jobTitle,

                posted,

                postUrl,

                postText
            });
        }

        return finalResults;

    }, EMAIL_REGEX.source);

    // ============================================================
    // 14. SHOW EMAIL COUNT
    // ============================================================

    console.log('\n========================================');
    console.log('EMAILS FOUND');
    console.log('========================================');

    console.log(
        'Total public emails:',
        emailData.length
    );

    for (
        const item of emailData
    ) {

        console.log(
            '----------------------------------------'
        );

        console.log(
            'Email:',
            item.email
        );

        console.log(
            'Name:',
            item.author || 'Not detected'
        );

        console.log(
            'Company:',
            item.company || 'Not detected'
        );

        console.log(
            'Job Title:',
            item.jobTitle || 'Not detected'
        );

        console.log(
            'Posted:',
            item.posted || 'Not detected'
        );

        console.log(
            'Post URL:',
            item.postUrl || 'Not detected'
        );
    }

    // ============================================================
    // 15. FILTER LAST 24 HOURS
    // ============================================================

    console.log('\n========================================');
    console.log('24-HOUR FILTER');
    console.log('========================================');

    function isWithinLast24Hours(posted) {

        if (!posted) {
            return false;
        }

        const value =
            posted
                .toLowerCase()
                .trim();

        // Minutes
        let match =
            value.match(
                /^(\d+)\s*(m|min|mins)$/
            );

        if (match) {

            const minutes =
                Number(match[1]);

            return minutes <= 1440;
        }

        // Hours
        match =
            value.match(
                /^(\d+)\s*(h|hr|hrs)$/
            );

        if (match) {

            const hours =
                Number(match[1]);

            return hours <= 24;
        }

        // Days
        match =
            value.match(
                /^(\d+)\s*(d|day|days)$/
            );

        if (match) {

            const days =
                Number(match[1]);

            return days < 1;
        }

        // ISO datetime
        const parsed =
            Date.parse(posted);

        if (!Number.isNaN(parsed)) {

            const age =
                Date.now() - parsed;

            return (
                age >= 0 &&
                age <= 24 * 60 * 60 * 1000
            );
        }

        return false;
    }

    const last24Hours =
        emailData.filter(
            item =>
                isWithinLast24Hours(
                    item.posted
                )
        );

    console.log(
        'Posts with detectable <=24h time:',
        last24Hours.length
    );

    // ============================================================
    // 16. REMOVE DUPLICATES
    // ============================================================

    const uniqueResults = [];

    const seen = new Set();

    for (
        const item of last24Hours
    ) {

        const key =
            `${item.email}|${item.postUrl}`;

        if (
            seen.has(key)
        ) {
            continue;
        }

        seen.add(key);

        uniqueResults.push(item);
    }

    // ============================================================
    // 17. CSV HELPER
    // ============================================================

    function csvEscape(value) {

        if (
            value === null ||
            value === undefined
        ) {
            return '';
        }

        const stringValue =
            String(value)
                .replace(/\r?\n/g, ' ')
                .trim();

        return `"${stringValue.replace(
            /"/g,
            '""'
        )}"`;
    }

    // ============================================================
    // 18. CREATE CSV
    // ============================================================

    console.log('\n========================================');
    console.log('CREATING CSV');
    console.log('========================================');

    const headers = [
        'Name',
        'Company',
        'Job Title',
        'Posted',
        'Public Email',
        'Post URL'
    ];

    let csv =
        headers.join(',') + '\n';

    for (
        const item of uniqueResults
    ) {

        csv += [

            csvEscape(
                item.author
            ),

            csvEscape(
                item.company
            ),

            csvEscape(
                item.jobTitle
            ),

            csvEscape(
                item.posted
            ),

            csvEscape(
                item.email
            ),

            csvEscape(
                item.postUrl
            )

        ].join(',') + '\n';
    }

    fs.writeFileSync(
        OUTPUT_FILE,
        csv,
        'utf8'
    );

    // ============================================================
    // 19. PRINT FINAL TABLE
    // ============================================================

    console.log('\n========================================');
    console.log('FINAL RESULTS');
    console.log('========================================');

    if (
        uniqueResults.length === 0
    ) {

        console.log(
            'No posts matched the detectable <=24h filter.'
        );

        console.log(
            'Emails found on page:',
            emailData.length
        );

        console.log(
            '\nIMPORTANT: LinkedIn often displays rounded times such as "1d".'
        );

        console.log(
            'Those posts cannot always be confirmed as exactly <=24 hours from the UI.'
        );

    } else {

        console.table(
            uniqueResults.map(
                item => ({
                    Name:
                        item.author,

                    Company:
                        item.company,

                    'Job Title':
                        item.jobTitle,

                    Posted:
                        item.posted,

                    Email:
                        item.email,

                    'Post URL':
                        item.postUrl
                })
            )
        );
    }

    // ============================================================
    // 20. SUMMARY
    // ============================================================

    console.log('\n========================================');
    console.log('SUMMARY');
    console.log('========================================');

    console.log(
        'Emails detected:',
        emailData.length
    );

    console.log(
        'Last 24h candidates:',
        last24Hours.length
    );

    console.log(
        'Unique CSV records:',
        uniqueResults.length
    );

    console.log(
        'CSV file:',
        OUTPUT_FILE
    );

    console.log(
        '========================================\n'
    );
});