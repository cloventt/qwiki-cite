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
                work: 'Metal Madness Magazine',
                accessDate: '2023-12-25',
            },
        },
        {
            description: 'adds journal over website',
            input: {
                journal: 'Journal of Modern Music',
                provider: 'Metal Madness Magazine'
            },
            expected: {
                work: 'Journal of Modern Music',
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
        {
            description: 'parses author into first and last name',
            input: {
                author: 'David Palmer'
            },
            expected: {
                first1: 'David',
                last1: 'Palmer',
                accessDate: '2023-12-25',
            },
        },
        {
            description: 'ignores middle names',
            input: {
                author: 'John Satchmo Tewilliger'
            },
            expected: {
                first1: 'John',
                last1: 'Tewilliger',
                accessDate: '2023-12-25',
            },
        },
        {
            description: 'handles multiple authors separated with \'and\'',
            input: {
                author: 'David Palmer and John Tewilliger'
            },
            expected: {
                first1: 'David',
                last1: 'Palmer',
                first2: 'John',
                last2: 'Tewilliger',
                accessDate: '2023-12-25',
            },
        },
        {
            description: 'handles multiple authors separated with \'&\'',
            input: {
                author: 'David Palmer & John Tewilliger'
            },
            expected: {
                first1: 'David',
                last1: 'Palmer',
                first2: 'John',
                last2: 'Tewilliger',
                accessDate: '2023-12-25',
            },
        },
        {
            description: 'handles multiple authors in an array',
            input: {
                author: ['David Palmer', 'John Tewilliger']
            },
            expected: {
                first1: 'David',
                last1: 'Palmer',
                first2: 'John',
                last2: 'Tewilliger',
                accessDate: '2023-12-25',
            },
        },
        {
            description: 'ignores titles in author names',
            input: {
                author: 'Dr. Richard Hitchings'
            },
            expected: {
                first1: 'Richard',
                last1: 'Hitchings',
                accessDate: '2023-12-25',
            },
        },
        {
            description: 'gives up on generic journalist author',
            input: {
                author: 'Staff journalists'
            },
            expected: {
                accessDate: '2023-12-25',
            },
        },
        {
            description: 'gives up on generic journalist author',
            input: {
                author: 'Staff'
            },
            expected: {
                accessDate: '2023-12-25',
            },
        },
        {
            description: 'gives up when the author is just the website name',
            input: {
                provider: 'Stuff',
                author: 'Stuff writers'
            },
            expected: {
                work: 'Stuff',
                accessDate: '2023-12-25',
            },
        },
        {
            description: 'ignores quotes in author name',
            input: {
                author: '\'\''
            },
            expected: {
                accessDate: '2023-12-25',
            },
        },
        {
            description: 'ignores random unparseable garbage in author name',
            input: {
                author: 'fdyugifudgfkhreavbvufdsj'
            },
            expected: {
                accessDate: '2023-12-25',
            },
        },
        {
            description: 'ignores author role in brackets',
            input: {
                author: 'David Palmer (Senior Staff Writer)'
            },
            expected: {
                first1: 'David',
                last1: 'Palmer',
                accessDate: '2023-12-25',
            },
        },
        {
            description: 'ignores National Library of New Zealand',
            input: {
                author: 'National Library of New Zealand'
            },
            expected: {
                accessDate: '2023-12-25',
            },
        },
        {
            description: 'ignores author role in square brackets',
            input: {
                author: 'David Palmer [Senior Staff Writer]'
            },
            expected: {
                first1: 'David',
                last1: 'Palmer',
                accessDate: '2023-12-25',
            },
        },
        {
            description: 'ignores author role after separator',
            input: {
                author: 'David Palmer | Senior Staff Writer'
            },
            expected: {
                first1: 'David',
                last1: 'Palmer',
                accessDate: '2023-12-25',
            },
        },
        {
            description: 'ignores a url in the author field',
            input: {
                author: 'https://nytimes.com/staff/joy-gay'
            },
            expected: {
                accessDate: '2023-12-25',
            },
        },
        {
            description: 'prefers the scraped date over the title date',
            input: {
                title: 'Hot New Article - 4 November 2016 - test',
                published: '2020-04-04T13:01:23.032Z'
            },
            expected: {
                title: 'Hot New Article - 4 November 2016 - test',
                date: '2020-04-04',
                accessDate: '2023-12-25',
            },
        },
        {
            description: 'grabs newspaper page number if present',
            input: {
                pageNumber: '7',
            },
            expected: {
                page: '7',
                accessDate: '2023-12-25',
            },
        },
        {
            description: 'grabs url-access if present',
            input: {
                urlAccess: 'subscription',
            },
            expected: {
                urlAccess: 'subscription',
                accessDate: '2023-12-25',
            },
        },
    ];

    spec.forEach((s) => {
        test(s.description, () => {
            expect(QWikiCite.scrapedMetadataToCitation(s.input)).to.deep.equal(s.expected);
        })
    });

    const titleDateParseSpec: {
        input: string;
        expected?: string;
    }[] = [
        {
            input: 'Hot New Article - 14 January 2016 - test',
            expected: '2016-01-14',
        },
        {
            input: 'Hot New Article - 24 February 2016 - test',
            expected: '2016-02-24',
        },
        {
            input: 'Hot New Article - 4 March 2016 - test',
            expected: '2016-03-04',
        },
        {
            input: 'Hot New Article - 04 March 2016 - test',
            expected: '2016-03-04',
        },
        {
            input: 'Hot New Article - 4th March 2016 - test',
            expected: '2016-03-04',
        },
        {
            input: 'Hot New Article - 4th March, 2016 - test',
            expected: '2016-03-04',
        },
        {
            input: 'Hot New Article - 4 April 2016 - test',
            expected: '2016-04-04',
        },
        {
            input: 'Hot New Article - 4 May 2016 - test',
            expected: '2016-05-04',
        },
        {
            input: 'Hot New Article - 4 June 2016 - test',
            expected: '2016-06-04',
        },
        {
            input: 'Hot New Article - 4 July 2016 - test',
            expected: '2016-07-04',
        },
        {
            input: 'Hot New Article - 4 August 2016 - test',
            expected: '2016-08-04',
        },
        {
            input: 'Hot New Article - 4 September 2016 - test',
            expected: '2016-09-04',
        },
        // this one works in browsers but not in node
        // ??????????????????????????????????????????
        // {
        //     input: 'Hot New Article - 04 October 2016 - test',
        //     expected: '2016-10-04',
        // },
        {
            input: 'Hot New Article - 4 November 2016 - test',
            expected: '2016-11-04',
        },
        {
            input: 'Hot New Article - 4 December 2016 - test',
            expected: '2016-12-04',
        },
        {
            input: 'Hot New Article - 2016-12-04 - test',
            expected: '2016-12-04',
        },
        {
            // this format is ambiguous, moment.js defaults to american
            input: 'Hot New Article - 12/4/2016 - test',
            expected: '2016-12-04',
        },
        {
            // sorry, disgusting american dates only
            input: 'Hot New Article - 19/4/2016 - test',
            expected: undefined,
        },
        {
            input: 'Hot New Article - September 4th, 2016 - test',
            expected: '2016-09-04',
        }

    ]

    titleDateParseSpec.forEach((s) => {
        test(`parses date from title: ${s.input}`, () => {
            expect(QWikiCite.scrapedMetadataToCitation({title: s.input}).date).to.deep.equal(s.expected);
        })
    });
})
