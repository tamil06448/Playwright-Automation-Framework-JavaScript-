import { test } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({
    path: path.resolve(process.cwd(), '.env')
});

test('LinkedIn Hiring Post Extractor', async ({ page }) => {

    // ============================================================
    // CONFIG
    // ============================================================

    const SEARCH_QUERY = 'Manual Testing And Hiring';

    const OUTPUT_FILE = path.resolve(
        process.cwd(),
        'linkedin_hiring_last24h.csv'
    );

    const EMAIL_REGEX =
        /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;

    // ============================================================
    // ENV
    // ============================================================

    const LINKEDIN_EMAIL =
        process.env.LINKEDIN_EMAIL;

    const LINKEDIN_PASSWORD =
        process.env.LINKEDIN_PASSWORD;

    if (!LINKEDIN_EMAIL || !LINKEDIN_PASSWORD) {
        throw new Error(
            'LINKEDIN_EMAIL or LINKEDIN_PASSWORD is missing in .env'
        );
    }

    console.log('\n========================================');
    console.log('LINKEDIN QA JOB POST EXTRACTOR');
    console.log('========================================');

    console.log('Search:', SEARCH_QUERY);
    console.log('Output:', OUTPUT_FILE);

    // ============================================================
    // 1. LOGIN
    // ============================================================

    console.log('\n[1] Opening LinkedIn...');

    await page.goto(
        'https://www.linkedin.com/login/',
        {
            waitUntil: 'domcontentloaded',
            timeout: 60000
        }
    );

    await page.waitForTimeout(3000);

    console.log('[2] Logging in...');

    await page.getByRole('textbox', {
        name: 'Email or phone'
    }).fill(LINKEDIN_EMAIL);

    await page.getByRole('textbox', {
        name: 'Password'
    }).fill(LINKEDIN_PASSWORD);

    await page.getByRole('button', {
        name: 'Sign in',
        exact: true
    }).click();

    await page.waitForTimeout(5000);

    console.log(
        'Current URL:',
        page.url()
    );

    // ============================================================
    // 2. HANDLE LINKEDIN VERIFICATION
    // ============================================================

    if (
        page.url().includes('checkpoint') ||
        page.url().includes('challenge')
    ) {

        console.log('\n========================================');
        console.log('LINKEDIN VERIFICATION REQUIRED');
        console.log('========================================');

        console.log(
            'Complete the verification manually in the browser.'
        );

        await page.pause();

        // Wait after manual verification
        await page.waitForTimeout(3000);

        console.log(
            'After verification URL:',
            page.url()
        );
    }

    // ============================================================
    // 3. SEARCH POSTS
    // ============================================================

    console.log('\n[3] Opening LinkedIn search...');

    const searchUrl =
        `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(
            SEARCH_QUERY
        )}`;

    await page.goto(
        searchUrl,
        {
            waitUntil: 'domcontentloaded',
            timeout: 60000
        }
    );

    await page.waitForTimeout(4000);

    console.log(
        'Search page:',
        page.url()
    );

    // ============================================================
    // 4. POSTS FILTER
    // ============================================================

    console.log('\n[4] Selecting Posts filter...');

    try {

        const postsRadio =
            page.getByRole('radio', {
                name: 'Filter by Posts'
            });

        if (await postsRadio.count() > 0) {

            await postsRadio.first().click();

            await page.waitForTimeout(3500);

            console.log(
                'Posts filter selected.'
            );
        }

    } catch (error) {

        console.log(
            'Posts filter issue:',
            error.message
        );
    }

    // ============================================================
    // 5. LATEST FILTER
    // ============================================================

    console.log('\n[5] Selecting Latest...');

    try {

        const sortButton =
            page.getByRole('button', {
                name: 'Filter by Sort by'
            });

        if (await sortButton.count() > 0) {

            await sortButton.first().click();

            await page.waitForTimeout(3000);

            const latestRadio =
                page.getByRole('radio', {
                    name: 'Latest'
                });

            if (await latestRadio.count() > 0) {

                await latestRadio.first().click();

                await page.waitForTimeout(3500);

                console.log(
                    'Latest selected.'
                );
            }
        }

    } catch (error) {

        console.log(
            'Latest filter issue:',
            error.message
        );
    }

    // ============================================================
    // 6. SHOW RESULTS
    // ============================================================

    console.log('\n[6] Checking Show results...');

    try {

        const showResults =
            page.getByRole('link', {
                name: 'Show results'
            });

        if (await showResults.count() > 0) {

            await showResults.first().click();

            await page.waitForTimeout(3500);

            console.log(
                'Show results clicked.'
            );
        }

    } catch (error) {

        console.log(
            'Show results issue:',
            error.message
        );
    }

    // ============================================================
    // 7. LOAD POSTS
    // ============================================================

    console.log('\n[7] Loading posts...');

    for (let i = 0; i < 5; i++) {

        await page.mouse.wheel(
            0,
            1500
        );

        await page.waitForTimeout(3000);

        console.log(
            `Scroll ${i + 1}/5 completed`
        );
    }

    await page.evaluate(() => {
        window.scrollTo(0, 0);
    });

    await page.waitForTimeout(3000);

    // ============================================================
    // 8. CLICK MORE BUTTONS
    // ============================================================

    console.log('\n[8] Expanding More buttons...');

    let expandableButtons =
        page.getByTestId(
            'expandable-text-button'
        );

    let expandableCount =
        await expandableButtons.count();

    console.log(
        'Expandable buttons:',
        expandableCount
    );

    for (
        let i = 0;
        i < expandableCount;
        i++
    ) {

        try {

            const button =
                expandableButtons.nth(i);

            if (
                await button.isVisible()
            ) {

                await button.click({
                    timeout: 2500
                });

                await page.waitForTimeout(3500);

                console.log(
                    `Clicked More ${i + 1}/${expandableCount}`
                );
            }

        } catch {
            // Some buttons can disappear after previous clicks
        }
    }

    // ============================================================
    // 9. LOAD MORE POSTS
    // ============================================================

    console.log(
        '\n[9] Loading additional posts...'
    );

    for (let i = 0; i < 3; i++) {

        await page.mouse.wheel(
            0,
            1800
        );

        await page.waitForTimeout(3000);

        console.log(
            `Additional scroll ${i + 1}/3`
        );
    }

    // ============================================================
    // 10. CLICK NEW MORE BUTTONS
    // ============================================================

    console.log(
        '\n[10] Expanding newly loaded posts...'
    );

    try {

        expandableButtons =
            page.getByTestId(
                'expandable-text-button'
            );

        expandableCount =
            await expandableButtons.count();

        console.log(
            'More buttons currently:',
            expandableCount
        );

        for (
            let i = 0;
            i < expandableCount;
            i++
        ) {

            try {

                const button =
                    expandableButtons.nth(i);

                if (
                    await button.isVisible()
                ) {

                    await button.click({
                        timeout: 2000
                    });

                    await page.waitForTimeout(3500);
                }

            } catch {
                // Ignore
            }
        }

    } catch (error) {

        console.log(
            'More button second pass issue:',
            error.message
        );
    }

    // ============================================================
    // 11. PUBLIC EMAIL EXTRACTION
    // ============================================================

    console.log('\n========================================');
    console.log('SEARCHING FOR PUBLIC EMAILS');
    console.log('========================================');

    // ------------------------------------------------------------
    // FIRST METHOD:
    // Find public mailto links
    // ------------------------------------------------------------

    const mailtoLinks =
        page.locator(
            'a[href^="mailto:"]'
        );

    const mailtoCount =
        await mailtoLinks.count();

    console.log(
        'Public mailto links found:',
        mailtoCount
    );

    // ------------------------------------------------------------
    // Extract unique emails from mailto links
    // ------------------------------------------------------------

    const mailtoEmails = [];

    for (
        let i = 0;
        i < mailtoCount;
        i++
    ) {

        try {

            const href =
                await mailtoLinks
                    .nth(i)
                    .getAttribute('href');

            if (!href) {
                continue;
            }

            const email =
                href
                    .replace(
                        /^mailto:/i,
                        ''
                    )
                    .split('?')[0]
                    .trim()
                    .toLowerCase();

            if (
                EMAIL_REGEX.test(email)
            ) {

                EMAIL_REGEX.lastIndex = 0;

                if (
                    !mailtoEmails.includes(email)
                ) {

                    mailtoEmails.push(email);
                }
            }

            EMAIL_REGEX.lastIndex = 0;

        } catch {
            // Ignore
        }
    }

    console.log(
        'Emails from mailto links:',
        mailtoEmails.length
    );

    for (
        const email of mailtoEmails
    ) {

        console.log(
            'MAILTO EMAIL:',
            email
        );
    }

    // ------------------------------------------------------------
    // SECOND METHOD:
    // Search complete rendered page text
    // ------------------------------------------------------------

    const renderedPageText =
        await page.locator('body').innerText();

    console.log(
        '\nRendered page text length:',
        renderedPageText.length
    );

    const textEmails =
        [
            ...new Set(
                (
                    renderedPageText.match(
                        EMAIL_REGEX
                    ) || []
                ).map(
                    email =>
                        email
                            .trim()
                            .toLowerCase()
                )
            )
        ];

    console.log(
        'Emails from rendered text:',
        textEmails.length
    );

    // ------------------------------------------------------------
    // Combine both methods
    // ------------------------------------------------------------

    const allEmails =
        [
            ...new Set([
                ...mailtoEmails,
                ...textEmails
            ])
        ];

    console.log(
        '\n========================================'
    );

    console.log(
        'TOTAL UNIQUE PUBLIC EMAILS:',
        allEmails.length
    );

    console.log(
        '========================================'
    );

    for (
        const email of allEmails
    ) {

        console.log(
            email
        );
    }

    // ============================================================
    // 12. FIND POST FOR EACH EMAIL
    // ============================================================

    const results = [];

    for (
        const email of allEmails
    ) {

        console.log(
            '\n----------------------------------------'
        );

        console.log(
            'Processing email:',
            email
        );

        console.log(
            '----------------------------------------'
        );

        try {

            // ----------------------------------------------------
            // Locate email
            // ----------------------------------------------------

            let emailLocator =
                page.getByText(
                    email,
                    {
                        exact: true
                    }
                );

            let emailCount =
                await emailLocator.count();

            console.log(
                'Exact email elements:',
                emailCount
            );

            // Fallback
            if (emailCount === 0) {

                emailLocator =
                    page.getByText(
                        email,
                        {
                            exact: false
                        }
                    );

                emailCount =
                    await emailLocator.count();

                console.log(
                    'Partial email elements:',
                    emailCount
                );
            }

            // ----------------------------------------------------
            // Try mailto anchor first
            // ----------------------------------------------------

            let emailElement = null;

            const mailtoElement =
                page.locator(
                    `a[href^="mailto:${email}"]`
                );

            if (
                await mailtoElement.count() > 0
            ) {

                emailElement =
                    mailtoElement.first();

                console.log(
                    'Using mailto anchor.'
                );

            } else {

                // ------------------------------------------------
                // Find visible text element
                // ------------------------------------------------

                for (
                    let i = 0;
                    i < Math.min(
                        emailCount,
                        10
                    );
                    i++
                ) {

                    try {

                        const candidate =
                            emailLocator.nth(i);

                        if (
                            await candidate.isVisible()
                        ) {

                            emailElement =
                                candidate;

                            console.log(
                                'Using visible email element:',
                                i
                            );

                            break;
                        }

                    } catch {
                        // Continue
                    }
                }
            }

            if (!emailElement) {

                console.log(
                    'Could not find visible element for:',
                    email
                );

                continue;
            }

            // ----------------------------------------------------
            // Analyze ancestors
            // ----------------------------------------------------

            const postInfo =
                await emailElement.evaluate(
                    (element, targetEmail) => {

                        function cleanText(text) {

                            return (
                                text || ''
                            )
                                .replace(
                                    /\s+/g,
                                    ' '
                                )
                                .trim();
                        }

                        function scoreCandidate(
                            element
                        ) {

                            if (!element) {
                                return -999;
                            }

                            const text =
                                cleanText(
                                    element.innerText
                                );

                            if (!text) {
                                return -999;
                            }

                            let score = 0;

                            // Email
                            if (
                                text
                                    .toLowerCase()
                                    .includes(
                                        targetEmail
                                            .toLowerCase()
                                    )
                            ) {
                                score += 20;
                            }

                            // LinkedIn actions
                            if (
                                /\bLike\b/i.test(
                                    text
                                )
                            ) {
                                score += 5;
                            }

                            if (
                                /\bComment\b/i.test(
                                    text
                                )
                            ) {
                                score += 5;
                            }

                            if (
                                /\bRepost\b/i.test(
                                    text
                                )
                            ) {
                                score += 5;
                            }

                            if (
                                /\bSend\b/i.test(
                                    text
                                )
                            ) {
                                score += 3;
                            }

                            // Hiring content
                            if (
                                /\bhiring\b/i.test(
                                    text
                                )
                            ) {
                                score += 6;
                            }

                            if (
                                /\bQA\b/i.test(
                                    text
                                )
                            ) {
                                score += 3;
                            }

                            if (
                                /\btesting\b/i.test(
                                    text
                                )
                            ) {
                                score += 3;
                            }

                            if (
                                /\btester\b/i.test(
                                    text
                                )
                            ) {
                                score += 3;
                            }

                            // Author
                            if (
                                element.querySelector(
                                    'a[href*="/in/"]'
                                )
                            ) {
                                score += 5;
                            }

                            // Company
                            if (
                                element.querySelector(
                                    'a[href*="/company/"]'
                                )
                            ) {
                                score += 4;
                            }

                            // Time
                            if (
                                element.querySelector(
                                    'time'
                                )
                            ) {
                                score += 5;
                            }

                            // Post URL
                            if (
                                element.querySelector(
                                    'a[href*="/feed/update/"]'
                                )
                            ) {
                                score += 5;
                            }

                            // Don't choose body-level containers
                            if (
                                text.length > 30000
                            ) {
                                score -= 30;
                            }

                            return score;
                        }

                        // ------------------------------------------------
                        // Find best ancestor
                        // ------------------------------------------------

                        let current =
                            element;

                        let best =
                            null;

                        let bestScore =
                            -999;

                        for (
                            let level = 0;
                            current &&
                            level < 15;
                            level++
                        ) {

                            const text =
                                cleanText(
                                    current.innerText
                                );

                            if (
                                text
                                    .toLowerCase()
                                    .includes(
                                        targetEmail
                                            .toLowerCase()
                                    )
                            ) {

                                const score =
                                    scoreCandidate(
                                        current
                                    );

                                if (
                                    score >
                                    bestScore
                                ) {

                                    bestScore =
                                        score;

                                    best =
                                        current;
                                }
                            }

                            current =
                                current.parentElement;
                        }

                        if (!best) {
                            return null;
                        }

                        const postText =
                            cleanText(
                                best.innerText
                            );

                        // ------------------------------------------------
                        // AUTHOR
                        // ------------------------------------------------

                        let author = '';

                        const profileLinks =
                            best.querySelectorAll(
                                'a[href*="/in/"]'
                            );

                        for (
                            const link of profileLinks
                        ) {

                            const text =
                                cleanText(
                                    link.innerText
                                );

                            if (
                                text &&
                                text.length >= 2 &&
                                text.length <= 100 &&
                                !/followers|connections/i.test(
                                    text
                                )
                            ) {

                                author =
                                    text;

                                break;
                            }
                        }

                        // ------------------------------------------------
                        // COMPANY
                        // ------------------------------------------------

                        let company = '';

                        const companyLinks =
                            best.querySelectorAll(
                                'a[href*="/company/"]'
                            );

                        for (
                            const link of companyLinks
                        ) {

                            const text =
                                cleanText(
                                    link.innerText
                                );

                            if (
                                text &&
                                text.length < 200
                            ) {

                                company =
                                    text;

                                break;
                            }
                        }

                        // ------------------------------------------------
                        // POSTED TIME
                        // ------------------------------------------------

                        let posted = '';

                        const timeElement =
                            best.querySelector(
                                'time'
                            );

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

                        if (!posted) {

                            const match =
                                postText.match(
                                    /\b\d+\s*(?:m|min|mins|h|hr|hrs|d|day|days|w|wk|wks)\b/i
                                );

                            if (match) {
                                posted =
                                    match[0];
                            }
                        }

                        // ------------------------------------------------
                        // POST URL
                        // ------------------------------------------------

                        let postUrl = '';

                        const links =
                            best.querySelectorAll(
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

                                postUrl =
                                    href;

                                break;
                            }
                        }

                        // ------------------------------------------------
                        // JOB TITLE
                        // ------------------------------------------------

                        let jobTitle = '';

                        const titlePatterns = [

                            /\b(QA\s+Engineer)\b/i,

                            /\b(QA\s+Analyst)\b/i,

                            /\b(QA\s+Tester)\b/i,

                            /\b(Quality\s+Analyst)\b/i,

                            /\b(Quality\s+Engineer)\b/i,

                            /\b(Software\s+Testing\s+Engineer)\b/i,

                            /\b(Software\s+Test\s+Engineer)\b/i,

                            /\b(Test\s+Engineer)\b/i,

                            /\b(Manual\s+Tester)\b/i,

                            /\b(Software\s+Tester)\b/i,

                            /\b(Test\s+Analyst)\b/i,

                            /\b(Product\s+QA\s+Engineer)\b/i,

                            /\b(SDET)\b/i
                        ];

                        for (
                            const pattern of titlePatterns
                        ) {

                            const match =
                                postText.match(
                                    pattern
                                );

                            if (
                                match &&
                                match[1]
                            ) {

                                jobTitle =
                                    cleanText(
                                        match[1]
                                    );

                                break;
                            }
                        }

                        // ------------------------------------------------
                        // COMPANY FALLBACK
                        // ------------------------------------------------

                        if (!company) {

                            const patterns = [

                                /([A-Z][A-Za-z0-9&.,'()\- ]{2,100})\s+is\s+hiring/i,

                                /([A-Z][A-Za-z0-9&.,'()\- ]{2,100})\s+is\s+looking\s+for/i,

                                /(?:at|with)\s+([A-Z][A-Za-z0-9&.,'()\- ]{2,100})\s+(?:is|are)/i
                            ];

                            for (
                                const pattern of patterns
                            ) {

                                const match =
                                    postText.match(
                                        pattern
                                    );

                                if (
                                    match &&
                                    match[1]
                                ) {

                                    company =
                                        cleanText(
                                            match[1]
                                        );

                                    break;
                                }
                            }
                        }

                        return {

                            email:
                                targetEmail,

                            author,

                            company,

                            jobTitle,

                            posted,

                            postUrl,

                            postText,

                            score:
                                bestScore
                        };

                    },
                    email
                );

            if (!postInfo) {

                console.log(
                    'Post could not be identified.'
                );

                continue;
            }

            // ----------------------------------------------------
            // Print extracted information
            // ----------------------------------------------------

            console.log(
                'Name:',
                postInfo.author ||
                'Not detected'
            );

            console.log(
                'Company:',
                postInfo.company ||
                'Not detected'
            );

            console.log(
                'Job Title:',
                postInfo.jobTitle ||
                'Not detected'
            );

            console.log(
                'Posted:',
                postInfo.posted ||
                'Not detected'
            );

            console.log(
                'Email:',
                postInfo.email
            );

            console.log(
                'Post URL:',
                postInfo.postUrl ||
                'Not detected'
            );

            console.log(
                'Post score:',
                postInfo.score
            );

            results.push(
                postInfo
            );

        } catch (error) {

            console.log(
                `Error processing ${email}:`,
                error.message
            );
        }
    }

    // ============================================================
    // 13. REMOVE DUPLICATES
    // ============================================================

    const uniqueResults = [];

    const seen = new Set();

    for (
        const item of results
    ) {

        const key =
            `${item.email}|${item.postUrl}`;

        if (
            seen.has(key)
        ) {
            continue;
        }

        seen.add(key);

        uniqueResults.push(
            item
        );
    }

    // ============================================================
    // 14. 24-HOUR FILTER
    // ============================================================

    console.log(
        '\n========================================'
    );

    console.log(
        '24-HOUR FILTER'
    );

    console.log(
        '========================================'
    );

    function isWithinLast24Hours(
        posted
    ) {

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

            return (
                Number(match[1]) <= 1440
            );
        }

        // Hours
        match =
            value.match(
                /^(\d+)\s*(h|hr|hrs)$/
            );

        if (match) {

            return (
                Number(match[1]) <= 24
            );
        }

        // Days
        match =
            value.match(
                /^(\d+)\s*(d|day|days)$/
            );

        if (match) {

            return (
                Number(match[1]) < 1
            );
        }

        // ISO datetime
        const timestamp =
            Date.parse(posted);

        if (
            !Number.isNaN(timestamp)
        ) {

            const age =
                Date.now() - timestamp;

            return (
                age >= 0 &&
                age <=
                    24 *
                    60 *
                    60 *
                    1000
            );
        }

        return false;
    }

    const last24Hours =
        uniqueResults.filter(
            item =>
                isWithinLast24Hours(
                    item.posted
                )
        );

    console.log(
        'Total extracted:',
        uniqueResults.length
    );

    console.log(
        'Last 24 hours:',
        last24Hours.length
    );

    // ============================================================
    // 15. CSV
    // ============================================================

    console.log(
        '\n========================================'
    );

    console.log(
        'CREATING CSV'
    );

    console.log(
        '========================================'
    );

    function csvEscape(value) {

        if (
            value === undefined ||
            value === null
        ) {
            return '';
        }

        return `"${String(value)
            .replace(/\r?\n/g, ' ')
            .replace(/"/g, '""')
            .trim()}"`;
    }

    const headers = [
        'Name',
        'Company',
        'Job Title',
        'Posted',
        'Public Email',
        'Post URL'
    ];

    let csv =
        headers.join(',') +
        '\n';

    for (
        const item of last24Hours
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

        ].join(',') +
        '\n';
    }

    fs.writeFileSync(
        OUTPUT_FILE,
        csv,
        'utf8'
    );

    // ============================================================
    // 16. FINAL TABLE
    // ============================================================

    console.log(
        '\n========================================'
    );

    console.log(
        'FINAL RESULTS'
    );

    console.log(
        '========================================'
    );

    if (
        last24Hours.length > 0
    ) {

        console.table(
            last24Hours.map(
                item => ({

                    Name:
                        item.author ||
                        'Not detected',

                    Company:
                        item.company ||
                        'Not detected',

                    'Job Title':
                        item.jobTitle ||
                        'Not detected',

                    Posted:
                        item.posted ||
                        'Not detected',

                    'Public Email':
                        item.email,

                    'Post URL':
                        item.postUrl ||
                        'Not detected'
                })
            )
        );

    } else {

        console.log(
            'No posts with a detectable <=24h timestamp.'
        );

        console.log(
            'Total emails detected:',
            allEmails.length
        );

        console.log(
            'Total posts associated with emails:',
            uniqueResults.length
        );
    }

    // ============================================================
    // 17. SUMMARY
    // ============================================================

    console.log(
        '\n========================================'
    );

    console.log(
        'SUMMARY'
    );

    console.log(
        '========================================'
    );

    console.log(
        'Mailto emails:',
        mailtoEmails.length
    );

    console.log(
        'Rendered-text emails:',
        textEmails.length
    );

    console.log(
        'Unique emails:',
        allEmails.length
    );

    console.log(
        'Posts associated:',
        uniqueResults.length
    );

    console.log(
        'Last 24h records:',
        last24Hours.length
    );

    console.log(
        'CSV:',
        OUTPUT_FILE
    );

    console.log(
        '========================================\n'
    );
});