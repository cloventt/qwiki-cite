import { metaDataRules } from 'metadata-scraper/lib/rules';
import { Options, Context, RuleSet, MetaData } from 'metadata-scraper/lib/types';
import { parseUrl } from 'metadata-scraper/lib/utils';
import moment from 'moment';
import { removeUndefined, scrapeJsonLd } from './ldjson-parser';

const dnzbregex = /.*\n([\w\s.\-]*). '([\w\s.\-,]*)', ([\w\s]*), first published in (\d{4}).*(Te Ara - the Encyclopedia of New Zealand).*/

/**
 * Lightly modified from https://github.com/BetaHuhn/metadata-scraper/blob/master/src/index.ts
 */
const scrapeDOM = function (url: string, inputOptions: Partial<Options> = {}): Promise<MetaData> {

    const defaultOptions = {
        maxRedirects: 5,
        ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
        lang: '*',
        timeout: 10000,
        forceImageHttps: true,
        customRules: {
            title: {
                rules: [
                    ['h3.article-title', (element: HTMLElement) => element.textContent.trim().split('\n')[0]],
                    ['meta[name="dc.Title"][content]', (element: HTMLElement) => element.getAttribute('content')],
                    ['meta[name="citation_title"][content]', (element: HTMLElement) => element.getAttribute('content')],
                    ['h1[data-article-title="true"][-nd-tap-highlight-class-name="active"]', (element: HTMLElement) => element.innerText], // PressReader textview
                    ['h6.pt-4', (element: HTMLElement) => element.innerText], // Heritage NZ
                    ['h1.display-title span.field--name-field-display-title', (element: HTMLElement) => element.innerText], // Ministry of Health
                    ['body.node--type-teara-story-page div.citation p', (element: HTMLElement) => element.innerText.split(',')[1].trim()], // Te Ara
                    ['body.node--type-teara-story-front div.citation p', (element: HTMLElement) => element.innerText.split(',')[1].trim()], // Te Ara
                    ['body.node--type-teara-biography div.citation', (element: HTMLElement) => element.innerText.match(dnzbregex)[2].trim()], // Te Ara DNZB
                ]
            },
            author: {
                rules: [
                    ['meta[name="dc.Creator"][content]', (element: HTMLElement) => element.getAttribute('content')],
                    ['meta[name="citation_author"][content]', (element: HTMLElement) => element.getAttribute('content')],
                    ['li.art-author', (element: HTMLElement) => element.innerText],
                    ['body.node--type-teara-story-page div.citation p:last-of-type', (element: HTMLElement) => element.innerText.replace('Story by ', '').split(',')[0].trim()], // Te Ara
                    ['body.node--type-teara-story-front div.citation p:last-of-type', (element: HTMLElement) => element.innerText.replace('Story by ', '').split(',')[0].trim()], // Te Ara
                    ['body.node--type-teara-biography div.citation', (element: HTMLElement) => element.innerText.match(dnzbregex)[1].trim()], // Te Ara DNZB
                ]
            },
            language: {
                rules: [
                    ['meta[name="dc.Language"][content]', (element: HTMLElement) => element.getAttribute('content')],
                ]
            },
            volume: {
                rules: [
                    ['meta[name="citation_volume"][content]', (element: HTMLElement) => element.getAttribute('content')],
                ]
            },
            issue: {
                rules: [
                    ['meta[name="citation_issue"][content]', (element: HTMLElement) => element.getAttribute('content')],
                ]
            },
            urlAccess: {
                rules: [
                    ['meta[name="DC.AccessRights"][content]', (element: HTMLElement) => element.getAttribute('content')?.toLowerCase() === 'restricted' ? 'subscription' : undefined],
                ]
            },
            doi: {
                rules: [
                    ['meta[name="dc.Identifier"][scheme="doi"][content]', (element: HTMLElement) => element.getAttribute('content')],
                    ['meta[name="citation_doi"][content]', (element: HTMLElement) => element.getAttribute('content')],
                ]
            },
            issn: {
                rules: [
                    ['meta[name="citation_issn"][content]', (element: HTMLElement) => element.getAttribute('content')],
                ]
            },
            journal: {
                rules: [
                    ['div.journal-issue', (element: HTMLElement) => element?.textContent?.trim()],
                    ['meta[name="citation_journal_title"][content]', (element: HTMLElement) => element.getAttribute('content')],
                ]
            },
            provider: {
                rules: [
                    ['span[data-testid*="publisher"]', (element: HTMLElement) => element.textContent.split(',')[0]?.trim()],
                    ['meta[property="publisher"][content]', (element: HTMLElement) => element.getAttribute('content')],
                    ['div.site-name-en', (element: HTMLElement) => element.innerHTML],
                    ['meta[name="dc.Publisher"][content]', (element: HTMLElement) => element.getAttribute('content')],
                    ['meta[name="citation_publisher"][content]', (element: HTMLElement) => element.getAttribute('content')],
                    ['div[data-bind="text:issuename"]', (element: HTMLElement) => element.innerText], // PressReader textview
                    ['span[data-bind="html: displayHeader"].toolbar-title', (element: HTMLElement) => element.innerHTML.split(' <')[0]],
                    ['body.node--type-teara-story-page div.citation p', (element: HTMLElement) => element.innerText.split(',')[2].trim()], // Te Ara
                    ['body.node--type-teara-story-front div.citation p', (element: HTMLElement) => element.innerText.split(',')[2].trim()], // Te Ara
                    ['body.node--type-teara-biography div.citation', (element: HTMLElement) => element.innerText.match(dnzbregex)[3].trim()], // Te Ara DNZB
                ],
                defaultValue: (context) => parseUrl(context.url),
            },
            location: {
                rules: [
                    ['span[data-testid*="publisher"]', (element: HTMLElement) => {
                        const rawPubString = element.textContent.split(',');
                        return rawPubString[rawPubString.length - 2]?.trim();
                    }],
                ],
            },
            pageNumber: {
                rules: [
                    ['p.citation', (element: HTMLElement) => {
                        const citationElements = element.textContent.split(',')
                        return citationElements[citationElements.length - 1]?.match(/\d+/)[0];
                    }
                    ]
                ]
            },
            year: {
                rules : [
                    ['span[data-testid*="publisher"]', (element: HTMLElement) => {
                        const rawPubString = element.textContent.split(',');
                        return rawPubString[rawPubString.length - 1]?.trim();
                    }],
                ]
            },
            pmid: {
                rules : [
                    ['meta[name="citation_pmid"][content]', (element: HTMLElement) => element.getAttribute('content')],
                ]
            },
            published: {
                rules: [
                    // rule for Papers Past
                    ['p.citation', (element: HTMLElement) => {
                        const citationElements = element.textContent.split(',')
                        return citationElements[citationElements.length - 2];
                    }
                    ],
                    ['span[data-testid*="publisher"]', (element: HTMLElement) => {
                        const rawPubString = element.textContent.split(',');
                        return rawPubString[rawPubString.length - 1]?.trim();
                    }],
                    ['meta[name="citation_year"][content]', (element: HTMLElement) => element.getAttribute('content')],
                    ['meta[name="dc.Date"][content]', (element: HTMLElement) => element.getAttribute('content')],
                    ['meta[name="dc.date"][content]', (element: HTMLElement) => element.getAttribute('content')],
                    ['meta[name="citation_date"][content]', (element: HTMLElement) => element.getAttribute('content')],
                    ['meta[name="citation_publication_date"][content]', (element: HTMLElement) => element.getAttribute('content')],
                    ['meta[name="citation_online_date"][content]', (element: HTMLElement) => element.getAttribute('content')],
                    ['meta[name="article:published_time"][content]', (element: HTMLElement) => element.getAttribute('content')],
                    ['div[data-bind="text:issuedate"]', (element: HTMLElement) => element.innerHTML], // PressReader textview
                    ['span[data-bind="html: displayHeader"].toolbar-title em', (element: HTMLElement) => element.innerText],
                    ['time time', (element: HTMLElement) => element.getAttribute('datetime')], // The Beehive
                    ['div.field--name-field-issue-date div.field__item', (element: HTMLElement) => element.innerText], // Ministry of Health
                    ['body.node--type-teara-story-page div.citation', (element: HTMLElement) => element.innerText.split('published ').at(1).trim()], // Te Ara
                    ['body.node--type-teara-story-front div.citation', (element: HTMLElement) => element.innerText.split('published ').at(1).trim()], // Te Ara
                    ['body.node--type-teara-biography div.citation', (element: HTMLElement) => element.innerText.match(dnzbregex)[4].trim()], // Te Ara DNZB
                ],
                processor: (value: any) => moment.utc(value.toString()).toISOString() || undefined
            },
            via: {
                rules: [
                    ['body.node--type-teara-biography div.citation', (element: HTMLElement) => element.innerText.match(dnzbregex)[5].trim()], // Te Ara DNZB
                ]
            }
        }
    }

    const runRule = function (ruleSet: RuleSet, doc: Document, context: Context) {
        let maxScore = 0;
        let value;

        for (let currRule = 0; currRule < ruleSet.rules.length; currRule++) {
            const [query, handler] = ruleSet.rules[currRule]

            const elements = Array.from(doc.querySelectorAll(query))
            if (elements.length) {
                for (const element of elements) {
                    let score = ruleSet.rules.length - currRule

                    if (ruleSet.scorer) {
                        const newScore = ruleSet.scorer(element, score)

                        if (newScore) {
                            score = newScore
                        }
                    }

                    if (score > maxScore) {
                        maxScore = score
                        value = handler(element)
                    }
                }
            }
        }

        if (value) {
            if (ruleSet.processor) {
                value = ruleSet.processor(value, context)
            }

            return value
        }

        if ((!value || value.length < 1) && ruleSet.defaultValue) {
            return ruleSet.defaultValue(context)
        }

        return undefined
    }

    const options = Object.assign({}, defaultOptions, inputOptions)

    const rules: Record<string, RuleSet> = { ...metaDataRules }
    Object.keys(options.customRules).forEach((key: string) => {
        rules[key] = {
            rules: metaDataRules[key] ? [...options.customRules[key].rules, ...metaDataRules[key].rules] : options.customRules[key].rules,
            defaultValue: options.customRules[key].defaultValue || metaDataRules[key]?.defaultValue,
            processor: options.customRules[key].processor || metaDataRules[key]?.processor
        }
    })

    const metadata: MetaData = {}
    const context: Context = {
        url,
        options
    }

    Object.keys(rules).map((key: string) => {
        const ruleSet = rules[key]
        metadata[key] = runRule(ruleSet, window.document, context) || undefined
    })

    return Promise.resolve(metadata);
}

export const scrapePage = async (message: any): Promise<MetaData> => {
    console.debug('QWiki-Cite asked for the details of this page, beginning a scrape');

    const domScrape = scrapeDOM(message.url || window.location.href);

    const pageSchemaBlobs = [...document.querySelectorAll('script[type="application/ld+json"]')]?.map(async (element) => {
        return scrapeJsonLd(element.textContent);
    });

    const scrapeData = pageSchemaBlobs != null ? [domScrape, ...pageSchemaBlobs] : [domScrape];

    return Promise.all(scrapeData).then((scrapeResults) => {
        const combinedResults = scrapeResults.reduce((resA, resB) => {
            return { ...removeUndefined(resA), ...removeUndefined(resB) }
        })
        console.debug("Scraped the page successfully, returning the data we collected to the extension", scrapeResults)
        return combinedResults;
    });
};
declare global {
    interface Window { scrapePage: Function; gaData: any; }
}

// exposed for testing
window.scrapePage = scrapePage;
