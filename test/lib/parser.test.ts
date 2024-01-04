import { describe, test } from 'mocha'
import { expect } from 'chai'
import * as playwright from '@playwright/test';

const TEST_TIMEOUT = 30000;

let page: playwright.Page; 
let browser: playwright.Browser;
let context: playwright.BrowserContext;

describe("page scraping works as expected", () => {

    /**
     * These tests run on _real_ web pages to ensure the yarscraper works 
     * in the way we expect.
     */

    test('on papers past', async () => {
        const url = 'https://paperspast.natlib.govt.nz/newspapers/CHP19850215.2.71';
        await page.goto(url);
        await page.addScriptTag({ path: './dist/parsers.js' });
        const scrapeResult = await page.evaluate(`window.scrapePage({url:'${url}'})`);
        expect(scrapeResult).to.deep.include({
            author: 'National Library of New Zealand',
            provider: 'Press',
            language: 'en',
            title: '\nCouncil seat ‘vote against station’\nPress, 15 February 1985, Page 7\n',
            url: 'https://paperspast.natlib.govt.nz/newspapers/CHP19850215.2.71',
        });
    });

    beforeEach(async () => {
        browser = await playwright['firefox'].launch({ headless: true });
        context = await browser.newContext({
            bypassCSP: true,
        });
        page = await context.newPage();
    })

    afterEach(async () => {
        browser.close();
    });


});
