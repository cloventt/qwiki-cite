import browser from 'webextension-polyfill';
import { QWikiCite } from './lib/static';
import { MetaData } from 'metadata-scraper/lib/types'
import { CitationTemplate } from './lib/ICitationTemplate';

function main() {
    browser.tabs.query({active: true, lastFocusedWindow: true}).then((tabs) => {
        const snippetSlot = document.getElementById('snippet-slot');
        const url = tabs[0].url;
        browser.tabs.sendMessage(tabs[0].id, {}).then((pageScrapeResult: MetaData) => {
            console.log(pageScrapeResult);
            if (pageScrapeResult == null) {
                return;
            }

            const citationTemplate: CitationTemplate = {
                url,
                title: pageScrapeResult.title,
                language: pageScrapeResult.language,
                website: pageScrapeResult.provider,
            };

            if (pageScrapeResult.author != null) {
                const splitAuthor = pageScrapeResult.author.toString().split(' ')
                if (splitAuthor.length > 1) {
                    citationTemplate.first = splitAuthor[0];
                    citationTemplate.last = splitAuthor[splitAuthor.length-1];
                } else if (splitAuthor.length == 1) {
                    citationTemplate.author = splitAuthor[0];
                }
            }

            if (pageScrapeResult.published != null) {
                citationTemplate.date = pageScrapeResult.published.slice(0, 10).toString();
            }


            citationTemplate.accessDate = new Date().toISOString().slice(0, 10);
        
            snippetSlot.setAttribute('rows', `${Object.keys(citationTemplate).length + 2}`);
            snippetSlot.textContent = QWikiCite.generateCitationString(citationTemplate, false);
        })
        
    });
};
main();

