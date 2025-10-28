const puppeteer = require('puppeteer');
const path = require('path');
const { pathToFileURL } = require('url');

(async () => {
    const indexPath = path.resolve(__dirname, '..', '..', 'frontend', 'index.html');
    const indexUrl = pathToFileURL(indexPath).href;

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    console.log('Opening', indexUrl);
    await page.goto(indexUrl, { waitUntil: 'networkidle2' });

    // Click AI branch (should open branch modal)
    await page.waitForSelector('.branch-card[data-branch="AI"]');
    await page.click('.branch-card[data-branch="AI"]');

    // Wait for branch modal and buy button
    await page.waitForSelector('.branch-products-modal .buy-now-btn');
    // Click first buy button
    await page.click('.branch-products-modal .buy-now-btn');

    // Wait for buy-options modal and click Amazon link
    await page.waitForSelector('.buy-options-modal .buy-link.amazon');

    const [newPagePromise] = await Promise.all([
        new Promise(resolve => browser.once('targetcreated', target => resolve(target.page()))),
        page.click('.buy-options-modal .buy-link.amazon')
    ]);

    const newPage = await newPagePromise;
    await newPage.waitForNavigation({ waitUntil: 'domcontentloaded' });
    const url = newPage.url();
    console.log('Opened URL:', url);

    if (url.includes('amazon') || url.includes('flipkart')) {
        console.log('E2E: Success — marketplace opened.');
        await browser.close();
        process.exit(0);
    } else {
        console.error('E2E: Failed — unexpected URL:', url);
        await browser.close();
        process.exit(2);
    }
})();
