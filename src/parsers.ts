import { metaDataRules } from 'metadata-scraper/lib/rules';
import { Options, Context, RuleSet, MetaData } from 'metadata-scraper/lib/types';
import { parseUrl } from 'metadata-scraper/lib/utils';
import moment from 'moment';

/**
 * Lightly modified from https://github.com/BetaHuhn/metadata-scraper/blob/master/src/index.ts
 */
export const getGenericMetadata = function (url: string, inputOptions: Partial<Options> = {}) {

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
                ]
            },
            provider: {
                rules: [
                    ['meta[property="publisher"][content]', (element: HTMLElement) => element.getAttribute('content')],
                    ['div.site-name-en', (element: HTMLElement) => element.innerHTML],
                ],
                defaultValue: (context) => parseUrl(context.url),
            },
            pageNumber: {
                rules: [
                    ['p.citation', (element: HTMLElement) => {
                        const citationElements = element.textContent.split(',')
                        return citationElements[citationElements.length-1].match(/\d+/)[0];
                    }
                    ]
                ]
            },
            published: {
                rules: [
                    // rule for Papers Past
                    ['p.citation', (element: HTMLElement) => {
                        const citationElements = element.textContent.split(',')
                        return citationElements[citationElements.length-2];
                    }
                    ]
                ],
                processor: (value: any) => moment.utc(value.toString()).toISOString() || undefined
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

    return metadata
}

export const parseWorldCat = function () {
    const dataFeed = JSON.parse((document.querySelectorAll('script[type="application/ld+json"]')[0] as HTMLElement).textContent);
    const bookElement = dataFeed['dataFeedElement'][0];

    const metadata: MetaData = {};
    metadata.title = bookElement.name.trim();
    metadata.url = bookElement.url.trim();
    metadata.type = bookElement['@type']?.toLowerCase().trim();
    metadata.author = bookElement.author?.name.trim();

    const bookElementExample = bookElement.workExample[0];
    if (bookElementExample != null) {
        metadata.published = bookElementExample.datePublished;
        metadata.isbn = bookElementExample.isbn;
        metadata.language = Intl.getCanonicalLocales(bookElementExample.inLanguage)[0];
        metadata.edition = bookElementExample.bookEdition;
    };

    const rawPubString = document.querySelectorAll('span[data-testid*="publisher"]')[0].textContent.split(',');
    metadata.publisher = rawPubString[0].trim();
    metadata.location = rawPubString[rawPubString.length - 2].trim();
    metadata.year = rawPubString[rawPubString.length - 1].trim();
    return metadata;
}

declare global {
    interface Window { scrapePage: Function; }
}

export const scrapePage = (message: any): Promise<MetaData> => {
    console.debug('QWiki-Cite asked for the details of this page, beginning a scrape');
    if (window.location.href.startsWith('https://search.worldcat.org/')) {
        return Promise.resolve(parseWorldCat());
    } else {
        return Promise.resolve(getGenericMetadata(message.url || window.location.href));
    }
};

// exposed for testing
window.scrapePage = scrapePage;
