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
            description: 'strips suffixes off titles with hyphen separators',
            input: {
                title: 'Sport psychology in German football making \'progress\' - DW - 12/27/2023'
            },
            expected: {
                title: 'Sport psychology in German football making \'progress\'',
                accessDate: '2023-12-25',
            },
        },
        {
            description: 'strips suffixes off titles with weird unicode hyphen separators',
            input: {
                title: 'Sport psychology in German football making \'progress\' – DW – 12/27/2023'
            },
            expected: {
                title: 'Sport psychology in German football making \'progress\'',
                accessDate: '2023-12-25',
            },
        },
        {
            description: 'strips suffixes off titles with bar separators',
            input: {
                title: 'Sport psychology in German football making \'progress\' | DW | 12/27/2023'
            },
            expected: {
                title: 'Sport psychology in German football making \'progress\'',
                accessDate: '2023-12-25',
            },
        },
        {
            description: 'strips prefixes off titles with hyphen separators',
            input: {
                title: 'DW | 12/27/2023 | Sport psychology in German football making \'progress\''
            },
            expected: {
                title: 'Sport psychology in German football making \'progress\'',
                accessDate: '2023-12-25',
            },
        },
        {
            description: 'strips prefixes off titles with weird unicode hyphen separators',
            input: {
                title: 'DW | 12/27/2023 | Sport psychology in German football making \'progress\''
            },
            expected: {
                title: 'Sport psychology in German football making \'progress\'',
                accessDate: '2023-12-25',
            },
        },
        {
            description: 'strips prefixes off titles with bar separators',
            input: {
                title: 'DW | 12/27/2023 | Sport psychology in German football making \'progress\''
            },
            expected: {
                title: 'Sport psychology in German football making \'progress\'',
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
            description: 'handles syndicated authors',
            input: {
                author: 'Joe Goldberg of Reuters'
            },
            expected: {
                first1: 'Joe',
                last1: 'Goldberg',
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
                website: 'Stuff',
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
    ];

    spec.forEach((s) => {
        test(s.description, () => {
            expect(QWikiCite.scrapedMetadataToCitation(s.input)).to.deep.equal(s.expected);
        })
    });
})
