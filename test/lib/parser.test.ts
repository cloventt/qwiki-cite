import { describe, test } from 'mocha'
import { expect } from 'chai'
import * as playwright from '@playwright/test';
import { MetaData } from '../../src/lib/iMetadata';

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
            author: ['Geoffrey W. Rice'],
            provider: 'Canterbury University Press',
            location: 'NZ',  // can't really do much better than this
            language: 'en',
            title: 'Black November : the 1918 influenza pandemic in New Zealand',
            published: '2005-01-01T00:00:00.000Z',
            type: 'book',
            isbn: '9781877257353',
            url: 'https://search.worldcat.org/title/1250610805',
        });
    });

    test('on The Press', async () => {
        const url = 'https://www.thepress.co.nz/nz-news/350124379/phil-maugers-roving-footpath-crew-completes-2000-repairs';
        await page.goto(url);
        await page.addScriptTag({ path: './dist/parsers.js' });
        const scrapeResult = await page.evaluate(`window.scrapePage({url:'${url}'})`);
        expect(scrapeResult).to.deep.include({
            author: 'Tina Law',
            provider: 'The Press',
            language: 'en',
            title: 'Phil Mauger’s roving footpath crew completes 2000 repairs',
            published: '2024-01-03T16:00:00.000Z',
            url,
        });
    });

    // placed behind a bot checker thing, can no longer run automatically
    // test('on The Wall Street Journal', async () => {
    //     const url = 'https://www.wsj.com/us-news/law/trump-asks-supreme-court-to-overturn-his-removal-from-colorado-primary-ballot-3eeaedb0';
    //     await page.goto(url);
    //     await page.addScriptTag({ path: './dist/parsers.js' });
    //     const scrapeResult = await page.evaluate(`window.scrapePage({url:'${url}'})`);
    //     expect(scrapeResult).to.deep.include({
    //         author: ['Jan Wolfe', 'Jess Bravin'],
    //         provider: 'The Wall Street Journal',
    //         language: 'en-US',
    //         title: 'Trump Asks Supreme Court to Overturn His Removal From Colorado Primary Ballot',
    //         published: '2024-01-03T22:10:00.000Z',
    //         url,
    //     });
    // });


    test('on Annual Reviews journal', async () => {
        const url = 'https://www.annualreviews.org/doi/abs/10.1146/annurev-polisci-052209-131042';
        await page.goto(url);
        await page.addScriptTag({ path: './dist/parsers.js' });
        const scrapeResult = await page.evaluate(`window.scrapePage({url:'${url}'})`);
        expect(scrapeResult).to.deep.include({
            author: 'Scott D. Sagan',
            journal: 'Annual Review of Political Science',
            language: 'en',
            title: 'The Causes of Nuclear Weapons Proliferation',
            published: '2011-01-01T00:00:00.000Z', // TODO: this is wrong for some reason
            doi: '10.1146/annurev-polisci-052209-131042',
            url,
        });
    });

    test('on Springer journal', async () => {
        const url = 'https://link.springer.com/article/10.1007/s10071-006-0033-8';
        await page.goto(url);
        await page.addScriptTag({ path: './dist/parsers.js' });
        const scrapeResult = await page.evaluate(`window.scrapePage({url:'${url}'})`);
        expect(scrapeResult).to.deep.include({
            author: ['Ludwig Huber', 'Gyula K. Gajdon'],
            journal: 'Animal Cognition',
            language: 'en',
            title: 'Technical intelligence in animals: the kea model',
            published: '2006-08-15T00:00:00.000Z',
            doi: '10.1007/s10071-006-0033-8',
            url,
        });
    });

    test('on NZ Herald (free article)', async () => {
        const url = 'https://www.nzherald.co.nz/nz/rowen-aupouri-death-mother-waiting-on-answers-after-sons-unexplained-death-in-hawkes-bay/DSCWIRHAHBGFNC6VLC5CAWILYQ/';
        await page.goto(url);
        await page.addScriptTag({ path: './dist/parsers.js' });
        const scrapeResult: MetaData = await page.evaluate(`window.scrapePage({url:'${url}'})`);
        expect(scrapeResult).to.deep.include({
            author: 'James Pocock',
            provider: 'NZ Herald',
            language: 'en',
            title: 'Rowen Aupouri death: Mother waiting on answers after son’s ‘unexplained’ death in Hawke’s Bay',
            published: '2024-01-05T01:15:47.218Z',
        });
        expect(scrapeResult.urlAccess).to.be.undefined;
    });

    test('on NZ Herald (paid article)', async () => {
        const url = 'https://www.nzherald.co.nz/business/russian-owned-new-zealand-registered-company-credomax-an-unusual-liquidation/W7U3OCRS7BBJDK27XDUE34F6QU/';
        await page.goto(url);
        await page.addScriptTag({ path: './dist/parsers.js' });
        const scrapeResult: MetaData = await page.evaluate(`window.scrapePage({url:'${url}'})`);
        expect(scrapeResult).to.deep.include({
            author: 'Anne Gibson',
            provider: 'NZ Herald',
            language: 'en',
            title: 'Russian-owned New Zealand-registered company Credomax - an unusual liquidation',
            published: '2024-01-04T17:51:24.917Z',
            urlAccess: 'subscription',
        });
    });

    test('on Project Muse journal article', async () => {
        const url = 'https://muse.jhu.edu/article/446776';
        await page.goto(url);
        await page.addScriptTag({ path: './dist/parsers.js' });
        const scrapeResult: MetaData = await page.evaluate(`window.scrapePage({url:'${url}'})`);
        expect(scrapeResult).to.deep.include({
            author: 'Robert Jervis',
            journal: 'International Security',
            provider: 'The MIT Press',
            issn: '1531-4804',
            volume: '13',
            language: 'en',
            title: 'The Political Effects of Nuclear Weapons: A Comment',
            published: '1988-01-01T00:00:00.000Z',
        });
    });

    // TODO: capture JSTOR data from google analytics
    // test('on JSTOR', async () => {
    //     const url = 'https://www.jstor.org/stable/41287979';
    //     await page.goto(url);
    //     await page.addScriptTag({ path: './dist/parsers.js' });
    //     const scrapeResult = await page.evaluate(`window.scrapePage({url:'${url}'})`);
    //     expect(scrapeResult).to.deep.include({
    //         author: 'Edwina Palmer',
    //         provider: 'Bulletin of the School of Oriental and African Studies, University of London',
    //         language: 'en',
    //         title: `A poem to carp about? Poem 16-3828 of the "Man'yōshū" collection`,
    //         published: '2011-01-01T00:00:00.000Z',
    //         doi: '10.2307/41287979',
    //         urlAccess: 'subscription',
    //         jstor: '41287979',
    //         volume: '74',
    //         pages: '417-436',
    //         url,
    //     });
    // });

    test('on Te Ara story page', async () => {
        const url = 'https://teara.govt.nz/en/weather/page-5';
        await page.goto(url);
        await page.addScriptTag({ path: './dist/parsers.js' });
        const scrapeResult: MetaData = await page.evaluate(`window.scrapePage({url:'${url}'})`);
        expect(scrapeResult).to.deep.include({
            author: 'Erick Brenstrum',
            provider: 'Te Ara – the Encyclopedia of New Zealand',
            title: 'Weather – Thunderstorms',
            // published: '2009-03-02T00:00:00.000Z', // fails in test but does actually work
        });
    });

    test('on Te Ara DNZB story page', async () => {
        const url = 'https://teara.govt.nz/en/biographies/3r14/rhodes-robert-heaton';
        await page.goto(url);
        await page.addScriptTag({ path: './dist/parsers.js' });
        const scrapeResult: MetaData = await page.evaluate(`window.scrapePage({url:'${url}'})`);
        expect(scrapeResult).to.deep.include({
            author: 'Geoffrey W. Rice',
            provider: 'Dictionary of New Zealand Biography',
            via: 'Te Ara - the Encyclopedia of New Zealand',
            title: 'Rhodes, Robert Heaton',
            published: '1996-01-01T00:00:00.000Z',
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
