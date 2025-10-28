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

    // Open chat
    await page.click('#chatbotBtn');
    await page.waitForSelector('#userInput');

    // Send a buy message
    await page.type('#userInput', 'buy nvidia gpu laptop');
    await page.click('#sendBtn');

    // Wait for bot message with buy button
    await page.waitForSelector('.bot-message .chat-buy-btn', { timeout: 5000 });
    await page.click('.bot-message .chat-buy-btn');

    // Buy options modal should appear
    await page.waitForSelector('.buy-options-modal .buy-link.amazon', { timeout: 5000 });

    console.log('Chat buy flow test: Buy options modal appeared — OK');
    await browser.close();
    process.exit(0);
})();
