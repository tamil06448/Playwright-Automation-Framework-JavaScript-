import { test } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import ExcelJS from 'exceljs';

// ============================================================
// CONFIGURATION
// ============================================================

const INPUT_CSV = path.resolve(
    process.cwd(),
    'linkedin_hiring_last24h.csv'
);

const OUTPUT_XLSX = path.resolve(
    process.cwd(),
    'QA_Outreach.xlsx'
);


// ============================================================
// NORMALIZE HEADER
// ============================================================

function normalizeHeader(value) {

    if (!value) {
        return '';
    }

    return String(value)
        .replace(/^\uFEFF/, '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, ' ');
}


// ============================================================
// GET FIELD FROM CSV ROW
// Handles:
// Company
// company
// Company Name
// Public Email
// PublicEmail
// etc.
// ============================================================

function getField(row, possibleNames) {

    const rowKeys =
        Object.keys(row);

    for (
        const possibleName of possibleNames
    ) {

        const wanted =
            normalizeHeader(
                possibleName
            );

        const matchingKey =
            rowKeys.find(
                key =>
                    normalizeHeader(key) === wanted
            );

        if (
            matchingKey !== undefined
        ) {

            return row[matchingKey] || '';
        }
    }

    return '';
}


// ============================================================
// CSV PARSER
// Supports quoted fields and multiline fields
// ============================================================

function parseCSV(content) {

    const rows = [];

    let row = [];
    let field = '';
    let insideQuotes = false;

    for (
        let i = 0;
        i < content.length;
        i++
    ) {

        const char =
            content[i];

        const nextChar =
            content[i + 1];

        // ----------------------------------------------------
        // QUOTES
        // ----------------------------------------------------

        if (char === '"') {

            // Escaped quote ""
            if (
                insideQuotes &&
                nextChar === '"'
            ) {

                field += '"';

                i++;

                continue;
            }

            insideQuotes =
                !insideQuotes;

            continue;
        }


        // ----------------------------------------------------
        // COMMA
        // ----------------------------------------------------

        if (
            char === ',' &&
            !insideQuotes
        ) {

            row.push(field);

            field = '';

            continue;
        }


        // ----------------------------------------------------
        // NEW LINE
        // ----------------------------------------------------

        if (
            (
                char === '\n' ||
                char === '\r'
            ) &&
            !insideQuotes
        ) {

            // Handle CRLF
            if (
                char === '\r' &&
                nextChar === '\n'
            ) {

                i++;
            }

            row.push(field);

            field = '';

            if (
                row.some(
                    value =>
                        value.trim() !== ''
                )
            ) {

                rows.push(row);
            }

            row = [];

            continue;
        }


        // ----------------------------------------------------
        // NORMAL CHARACTER
        // ----------------------------------------------------

        field += char;
    }


    // --------------------------------------------------------
    // FINAL FIELD
    // --------------------------------------------------------

    if (
        field.length > 0 ||
        row.length > 0
    ) {

        row.push(field);

        if (
            row.some(
                value =>
                    value.trim() !== ''
            )
        ) {

            rows.push(row);
        }
    }


    return rows;
}


// ============================================================
// READ CSV
// ============================================================

function readCSV(filePath) {

    if (
        !fs.existsSync(filePath)
    ) {

        throw new Error(
            `CSV file not found:\n${filePath}`
        );
    }


    const content =
        fs.readFileSync(
            filePath,
            'utf8'
        )
        .replace(/^\uFEFF/, '');


    if (
        !content.trim()
    ) {

        return [];
    }


    const csvRows =
        parseCSV(content);


    if (
        !csvRows.length
    ) {

        return [];
    }


    // --------------------------------------------------------
    // HEADER ROW
    // --------------------------------------------------------

    const headers =
        csvRows[0].map(
            header =>
                header
                    .replace(/^\uFEFF/, '')
                    .trim()
        );


    console.log(
        '\nSOURCE CSV HEADERS:'
    );

    headers.forEach(
        (header, index) => {

            console.log(
                `${index + 1}. "${header}"`
            );
        }
    );


    // --------------------------------------------------------
    // CREATE OBJECTS
    // --------------------------------------------------------

    const rows = [];


    for (
        let i = 1;
        i < csvRows.length;
        i++
    ) {

        const values =
            csvRows[i];

        const row = {};


        headers.forEach(
            (
                header,
                index
            ) => {

                row[header] =
                    values[index] ||
                    '';
            }
        );


        rows.push(row);
    }


    return rows;
}


// ============================================================
// ENCODING CLEANUP
// ============================================================

function repairEncoding(text) {

    if (!text) {
        return '';
    }

    return String(text)

        .replace(
            /â€¢/g,
            '•'
        )

        .replace(
            /â€“/g,
            '–'
        )

        .replace(
            /â€”/g,
            '—'
        )

        .replace(
            /â€™/g,
            '’'
        )

        .replace(
            /â€œ/g,
            '“'
        )

        .replace(
            /â€/g,
            '”'
        )

        .replace(
            /Â/g,
            ''
        );
}


// ============================================================
// CLEAN NAME
// ============================================================

function cleanName(name) {

    if (!name) {
        return '';
    }

    let value =
        repairEncoding(name);


    // Remove LinkedIn degree
    // Example:
    // Cindy Choo • 3rd+
    // Nitesh C. • 2nd
    value =
        value.replace(
            /[•·]\s*[1-3](?:st|nd|rd|th)?\+?/gi,
            ''
        );


    value =
        value.replace(
            /\s+[1-3](?:st|nd|rd|th)\+?\s*$/gi,
            ''
        );


    value =
        value.replace(
            /\s*\+\s*$/g,
            ''
        );


    value =
        value.replace(
            /[•·]/g,
            ' '
        );


    return value
        .replace(/\s+/g, ' ')
        .trim();
}


// ============================================================
// CLEAN COMPANY
// ============================================================

function cleanCompany(company) {

    if (!company) {
        return '';
    }

    return repairEncoding(company)
        .replace(/\s+/g, ' ')
        .trim();
}


// ============================================================
// CLEAN JOB TITLE
// ============================================================

function cleanJobTitle(jobTitle) {

    if (!jobTitle) {

        return 'QA Engineer';
    }

    return repairEncoding(jobTitle)
        .replace(/\s+/g, ' ')
        .trim();
}


// ============================================================
// CLEAN EMAIL
// ============================================================

function cleanEmail(email) {

    if (!email) {
        return '';
    }

    return repairEncoding(email)
        .trim()
        .toLowerCase();
}


// ============================================================
// CLEAN POSTED
// ============================================================

function cleanPosted(posted) {

    if (!posted) {
        return '';
    }

    return repairEncoding(posted)
        .replace(/\s+/g, ' ')
        .trim();
}


// ============================================================
// CLEAN POST URL
// ============================================================

function cleanPostURL(url) {

    if (!url) {
        return '';
    }

    return String(url)
        .trim();
}


// ============================================================
// GENERATE SUBJECT
// ============================================================

function generateSubject(
    jobTitle
) {

    const title =
        cleanJobTitle(
            jobTitle
        );

    return (
        `Application for ${title} - ` +
        `4.5 Years QA Experience | Immediate Joiner`
    );
}


// ============================================================
// GENERATE EMAIL BODY
// ============================================================

function generateEmailBody(
    name,
    company,
    jobTitle
) {

    const person =
        cleanName(name);

    const companyName =
        cleanCompany(company);

    const title =
        cleanJobTitle(jobTitle);


    // --------------------------------------------------------
    // Greeting
    // --------------------------------------------------------

    const greeting =
        person
            ? `Hi ${person},`
            : 'Hi Hiring Team,';


    // --------------------------------------------------------
    // Opening
    // --------------------------------------------------------

    let opening;


    if (companyName) {

        opening =
            `I came across your recent hiring opportunity at ${companyName} for the ${title} position and would like to apply for the role.`;

    } else {

        opening =
            `I came across your recent hiring post for the ${title} position and would like to apply for the role.`;
    }


    // --------------------------------------------------------
    // BODY
    // --------------------------------------------------------

    return `${greeting}

${opening}

I have 4.5 years of experience in QA and Software Testing, with hands-on experience in:
- Manual Testing
- Functional, Regression, Integration and End-to-End Testing
- API Testing using Postman
- Database Testing - SQL, PostgreSQL and MongoDB
- Web and Mobile Application Testing
- Jira and Agile/Scrum
- Playwright with JavaScript
- Git and GitHub

I am currently available as an Immediate Joiner and am open to Bangalore, Hybrid and Remote opportunities.
I have attached my updated resume for your consideration.
Please let me know if my profile matches the requirement.

Thanks & Regards,
Tamilarasan R
QA Engineer
8122286890
Bangalore`;
}


// ============================================================
// CREATE EXCEL
// ============================================================

async function createExcelFile() {

    console.log(
        '\n========================================'
    );

    console.log(
        'CREATING QA OUTREACH EXCEL'
    );

    console.log(
        '========================================'
    );


    // --------------------------------------------------------
    // READ SOURCE
    // --------------------------------------------------------

    const sourceRows =
        readCSV(
            INPUT_CSV
        );


    console.log(
        '\nSource records:',
        sourceRows.length
    );


    if (
        sourceRows.length === 0
    ) {

        throw new Error(
            'No records found in LinkedIn CSV.'
        );
    }


    // --------------------------------------------------------
    // CREATE WORKBOOK
    // --------------------------------------------------------

    const workbook =
        new ExcelJS.Workbook();


    workbook.creator =
        'QA Job Application Automation';


    workbook.created =
        new Date();


    workbook.modified =
        new Date();


    // --------------------------------------------------------
    // WORKSHEET
    // --------------------------------------------------------

    const worksheet =
        workbook.addWorksheet(
            'QA Outreach'
        );


    // ========================================================
    // EXACT A-H COLUMNS
    // ========================================================

    worksheet.columns = [

        {
            header: 'Name',
            key: 'name',
            width: 25
        },

        {
            header: 'Company',
            key: 'company',
            width: 30
        },

        {
            header: 'Job Title',
            key: 'jobTitle',
            width: 28
        },

        {
            header: 'Posted',
            key: 'posted',
            width: 10
        },

        {
            header: 'Public Email',
            key: 'email',
            width: 32
        },

        {
            header: 'Subject',
            key: 'subject',
            width: 60
        },

        {
            header: 'Email Body',
            key: 'emailBody',
            width: 75
        },

        {
            header: 'Post URL',
            key: 'postURL',
            width: 50
        }
    ];


    // ========================================================
    // EMAIL DEDUPLICATION
    // ========================================================

    const seenEmails =
        new Set();


    // ========================================================
    // PROCESS RECORDS
    // ========================================================

    for (
        const source of sourceRows
    ) {


        // ----------------------------------------------------
        // GET ORIGINAL VALUES
        // ----------------------------------------------------

        const name =
            getField(
                source,
                [
                    'Name'
                ]
            );


        const company =
            getField(
                source,
                [
                    'Company',
                    'Company Name'
                ]
            );


        const jobTitle =
            getField(
                source,
                [
                    'Job Title',
                    'JobTitle',
                    'Title'
                ]
            );


        const posted =
            getField(
                source,
                [
                    'Posted',
                    'Posted Time',
                    'PostedTime'
                ]
            );


        const email =
            getField(
                source,
                [
                    'Public Email',
                    'Email',
                    'Email Address'
                ]
            );


        const postURL =
            getField(
                source,
                [
                    'Post URL',
                    'PostURL',
                    'URL',
                    'LinkedIn URL'
                ]
            );


        // ----------------------------------------------------
        // CLEAN VALUES
        // ----------------------------------------------------

        const cleanPerson =
            cleanName(name);


        const cleanCompanyName =
            cleanCompany(company);


        const cleanTitle =
            cleanJobTitle(jobTitle);


        const cleanPostedValue =
            cleanPosted(posted);


        const cleanEmailValue =
            cleanEmail(email);


        const cleanURL =
            cleanPostURL(postURL);


        // ----------------------------------------------------
        // EMAIL REQUIRED
        // ----------------------------------------------------

        if (
            !cleanEmailValue
        ) {

            console.log(
                `Skipping row - no email: ${cleanPerson}`
            );

            continue;
        }


        // ----------------------------------------------------
        // REMOVE DUPLICATE EMAIL
        // ----------------------------------------------------

        if (
            seenEmails.has(
                cleanEmailValue
            )
        ) {

            console.log(
                `Duplicate email skipped: ${cleanEmailValue}`
            );

            continue;
        }


        seenEmails.add(
            cleanEmailValue
        );


        // ----------------------------------------------------
        // SUBJECT
        // ----------------------------------------------------

        const subject =
            generateSubject(
                cleanTitle
            );


        // ----------------------------------------------------
        // EMAIL BODY
        // ----------------------------------------------------

        const emailBody =
            generateEmailBody(
                cleanPerson,
                cleanCompanyName,
                cleanTitle
            );


        // ====================================================
        // IMPORTANT
        // ADD ROW BY POSITION
        //
        // A Name
        // B Company
        // C Job Title
        // D Posted
        // E Public Email
        // F Subject
        // G Email Body
        // H Post URL
        // ====================================================

        worksheet.addRow([

            cleanPerson,          // A

            cleanCompanyName,     // B

            cleanTitle,           // C

            cleanPostedValue,     // D

            cleanEmailValue,      // E

            subject,              // F

            emailBody,            // G

            cleanURL               // H

        ]);
    }


    // ========================================================
    // HEADER
    // ========================================================

    const headerRow =
        worksheet.getRow(1);


    headerRow.height =
        30;


    headerRow.eachCell(
        cell => {

            cell.font = {

                bold: true,

                size: 11
            };


            cell.alignment = {

                vertical:
                    'middle',

                horizontal:
                    'center',

                wrapText:
                    true
            };
        }
    );


    // ========================================================
    // DATA ROW FORMATTING
    // ========================================================

    worksheet.eachRow(
        (
            row,
            rowNumber
        ) => {

            // Skip header
            if (
                rowNumber === 1
            ) {

                return;
            }


            // ------------------------------------------------
            // All cells
            // ------------------------------------------------

            row.eachCell(
                cell => {

                    cell.alignment = {

                        vertical:
                            'top',

                        horizontal:
                            'left',

                        wrapText:
                            true
                    };
                }
            );


            // ------------------------------------------------
            // Email Body
            // ------------------------------------------------

            row.getCell(7)
                .alignment = {

                    vertical:
                        'top',

                    horizontal:
                        'left',

                    wrapText:
                        true
                };


            // ------------------------------------------------
            // Subject
            // ------------------------------------------------

            row.getCell(6)
                .alignment = {

                    vertical:
                        'top',

                    horizontal:
                        'left',

                    wrapText:
                        true
                };


            // ------------------------------------------------
            // Post URL
            // ------------------------------------------------

            row.getCell(8)
                .alignment = {

                    vertical:
                        'top',

                    horizontal:
                        'left',

                    wrapText:
                        true
                };


            // ------------------------------------------------
            // Row height
            // ------------------------------------------------

            row.height =
                180;
        }
    );


    // ========================================================
    // AUTO FILTER
    // ========================================================

    worksheet.autoFilter = {

        from:
            'A1',

        to:
            `H${worksheet.rowCount}`
    };


    // ========================================================
    // FREEZE HEADER
    // ========================================================

    worksheet.views = [

        {

            state:
                'frozen',

            ySplit:
                1
        }

    ];


    // ========================================================
    // SAVE
    // ========================================================

    await workbook.xlsx.writeFile(
        OUTPUT_XLSX
    );


    // ========================================================
    // SUMMARY
    // ========================================================

    console.log(
        '\n========================================'
    );

    console.log(
        'EXCEL CREATED SUCCESSFULLY'
    );

    console.log(
        '========================================'
    );


    console.log(
        'Output:',
        OUTPUT_XLSX
    );


    console.log(
        'Records:',
        worksheet.rowCount - 1
    );


    console.log(
        '\nColumns:'
    );

    console.log(
        'A = Name'
    );

    console.log(
        'B = Company'
    );

    console.log(
        'C = Job Title'
    );

    console.log(
        'D = Posted'
    );

    console.log(
        'E = Public Email'
    );

    console.log(
        'F = Subject'
    );

    console.log(
        'G = Email Body'
    );

    console.log(
        'H = Post URL'
    );


    console.log(
        '========================================'
    );
}


// ============================================================
// PLAYWRIGHT TEST
// ============================================================

test(
    'Create QA Outreach Excel',
    async () => {

        console.log(
            '\n========================================'
        );

        console.log(
            'QA JOB APPLICATION OUTREACH'
        );

        console.log(
            '========================================'
        );

        console.log(
            'Mode: MANUAL EMAIL'
        );

        console.log(
            'Gmail automation: DISABLED'
        );

        console.log(
            'Automatic sending: DISABLED'
        );

        console.log(
            '========================================'
        );


        // ----------------------------------------------------
        // Check input CSV
        // ----------------------------------------------------

        if (
            !fs.existsSync(
                INPUT_CSV
            )
        ) {

            throw new Error(
                `Input CSV not found:\n${INPUT_CSV}`
            );
        }


        // ----------------------------------------------------
        // Create Excel
        // ----------------------------------------------------

        await createExcelFile();


        console.log(
            '\nDone.'
        );
    }
);