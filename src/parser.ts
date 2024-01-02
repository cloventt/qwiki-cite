import { metaDataRules } from 'metadata-scraper/lib/rules';
import { Options, Context, RuleSet, MetaData } from 'metadata-scraper/lib/types'
import { parseUrl } from 'metadata-scraper/lib/utils'
import Browser from 'webextension-polyfill';

/**
 * Lightly modified from https://github.com/BetaHuhn/metadata-scraper/blob/master/src/index.ts
 */
const getMetaData = function (url: string, inputOptions: Partial<Options> = {}) {

    const defaultOptions = {
        maxRedirects: 5,
        ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
        lang: '*',
        timeout: 10000,
        forceImageHttps: true,
        customRules: {
            title: {
                rules: [
                    [ 'h3.article-title', (element: HTMLElement) => element.innerText ], 
                ]
            },
            provider: {
                rules: [
                    [ 'meta[property="publisher"][content]', (element: HTMLElement) => element.getAttribute('content') ],
                ],
                defaultValue: (context) => parseUrl(context.url),
            },
            pageNumber: {
                rules: [
                    [ 'h3.pager__center__title', (element: HTMLElement) => element.innerHTML.match(/\d?/g)[0]], 
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
            rules: metaDataRules[key] ? [...options.customRules[key].rules, ...metaDataRules[key].rules]: options.customRules[key].rules,
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
        metadata[key] = runRule(ruleSet, document, context) || undefined
    })

    return metadata
}

Browser.runtime.onMessage.addListener((message) => {
    console.debug('QWiki-Cite asked for the details of this page, beginning a scrape');
    return Promise.resolve(getMetaData(message.url || window.location.href));
});