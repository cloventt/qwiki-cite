import { describe, test } from "mocha";
import { expect } from "chai";
import { QWikiCite } from "../../src/lib/static";
import { CitationTemplate } from "../../src/lib/ICitationTemplate";
import { MetaData } from "metadata-scraper/lib/types";
import sinon from 'sinon';

describe("page scrape metadata conversion", () => {

    const staticDate: Date = new Date(Date.parse('2023-12-25T22:13:48.056Z'));

    let sandbox: sinon.SinonSandbox
    let clock: sinon.SinonFakeTimers

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        clock = sinon.useFakeTimers(staticDate.getTime());
    });
    
    afterEach(() => {
        sandbox.restore();
        clock.restore();
    });

    const spec: {
        description: string;
        input: MetaData;
        expected: CitationTemplate;
    }[] = [
        {
            description: 'empty input just adds access-date',
            input: {},
            expected: {
                accessDate: '2023-12-25',
            },
        },
        {
            description: 'adds title',
            input: {
                title: 'page title'
            },
            expected: {
                title: 'page title',
                accessDate: '2023-12-25',
            },
        },
        {
            description: 'adds language',
            input: {
                language: 'en'
            },
            expected: {
                language: 'en',
                accessDate: '2023-12-25',
            },
        },
        {
            description: 'adds website',
            input: {
                provider: 'Metal Madness Magazine'
            },
            expected: {
                website: 'Metal Madness Magazine',
                accessDate: '2023-12-25',
            },
        },
        {
            description: 'adds published date',
            input: {
                published: '2020-04-19T07:14:23.542+1300'
            },
            expected: {
                date: '2020-04-19',
                accessDate: '2023-12-25',
            },
        },
    ];

    spec.forEach((s) => {
        test(s.description, () => {
            expect(QWikiCite.scrapedMetadataToCitation(s.input)).to.deep.equal(s.expected);
        })
    });
})
