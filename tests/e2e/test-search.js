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

    // Test fuzzy search (typo)
    await page.waitForSelector('#searchInput');
    await page.type('#searchInput', 'raspbery pi'); // intentional typo
    await page.click('#searchBtn');

    // Either buy modal (single) or results modal should appear
    try {
        await page.waitForSelector('.buy-options-modal, .search-results-modal', { timeout: 4000 });
        console.log('Search test: results or buy modal appeared — OK');
        await browser.close();
        process.exit(0);
    } catch (err) {
        console.error('Search test: Failed to find results modal');
        await browser.close();
        process.exit(2);
    }
})();
