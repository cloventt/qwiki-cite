import { describe, test } from 'mocha'
import { expect } from 'chai'
import * as playwright from '@playwright/test';
import moment from 'moment';

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
            title: 'Council seat ‘vote against station’',
            published: '1985-02-15T00:00:00.000Z',
            pageNumber: '7',
            url: 'https://paperspast.natlib.govt.nz/newspapers/CHP19850215.2.71',
        });
    });

    test('on worldcat', async () => {
        const url = 'https://search.worldcat.org/title/1250610805';
        await page.goto(url);
        await page.addScriptTag({ path: './dist/parsers.js' });
        const scrapeResult = await page.evaluate(`window.scrapePage({url:'${url}'})`);
        expect(scrapeResult).to.deep.include({
            author: 'Geoffrey W. Rice',
            publisher: 'Canterbury University Press',
            location: 'NZ',  // can't really do much better than this
            language: 'en',
            title: 'Black November : the 1918 influenza pandemic in New Zealand',
            published: '2005',
            type: 'book',
            isbn: '9781877257353',
            url: 'https://search.worldcat.org/title/1250610805',
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
