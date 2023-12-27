import browser from 'webextension-polyfill';
import { QWikiCite } from './lib/static';
import { MetaData } from 'metadata-scraper/lib/types'
import { CitationTemplate } from './lib/ICitationTemplate';

function isEmpty(obj) {
    for (var x in obj) { return false; }
    return true;
}


/**
 * Update the cite web template in the text box, preserving anything that is 
 * already there.
 * @param citationTemplate the new values to add
 */
function updatePage(citationTemplate: CitationTemplate) {
    console.debug('Updating the textarea with new values', citationTemplate)
    const snippetSlot = document.getElementById('snippet-slot') as HTMLInputElement;

    const currentValue = snippetSlot.value;
    const parsedCurrentValue = QWikiCite.parseCitationString(currentValue);

    const merged = {...parsedCurrentValue, ...citationTemplate}
    console.debug('Settled on final merged value', merged);

    snippetSlot.setAttribute('rows', `${Object.keys(merged).length + 2}`);
    snippetSlot.textContent = QWikiCite.generateCitationString(merged, false);
    // TODO: persist the value to localstorage
}

/**
 * Grab the current citation template and dump it to the clipboard.
 */
function copyToClipboard() {
    const snippetSlot = document.getElementById('snippet-slot') as HTMLInputElement;

    const currentValue = snippetSlot.value;
    const parsedCurrentValue = QWikiCite.parseCitationString(currentValue);

    navigator.clipboard.writeText(QWikiCite.generateCitationString(parsedCurrentValue));
}

function main() {
    document.getElementById('copy-to-clipboard')?.addEventListener('click', () => {
        console.debug('Copying current value to clipboard');
        copyToClipboard();
    });

    // TODO: check if we already have a value in localstorage so we can skip scraping

    browser.tabs.query({ active: true, lastFocusedWindow: true }).then((tabs) => {
        if (tabs.length < 1) {
            console.error('Did not find an active tab to work on, aborting')
            return;
        }
        const url = tabs[0].url;
        browser.tabs.sendMessage(tabs[0].id!!, {}).then((pageScrapeResult: MetaData) => {
            if (pageScrapeResult == null) {
                return;
            }
            console.debug('Got a page scrape result', pageScrapeResult);

            const citationTemplate = QWikiCite.scrapedMetadataToCitation(pageScrapeResult);
            citationTemplate.url = url;

            console.debug('Generated citation template data', citationTemplate);

            updatePage(citationTemplate);

            console.debug('Looking for an archive on wayback')
            fetch(`https://archive.org/wayback/available?url=${url}`).then((response) => {
                const waybackJson = response.json();
                waybackJson.then((waybackAnswer) => {
                    console.log('Found an archive on wayback', waybackAnswer);
                    if (!isEmpty(waybackAnswer["archived_snapshots"])) {
                        const ts = waybackAnswer["archived_snapshots"]["closest"]["timestamp"]
                        updatePage({
                            archiveUrl: waybackAnswer["archived_snapshots"]["closest"]["url"],
                            archiveDate: `${ts.slice(0, 4)}-${ts.slice(4, 6)}-${ts.slice(6, 8)}`,
                        })
                    }
                })
            }).catch((err) => {
                console.error('Error asking for archived version of page', err);
            })
        })


    });
};
main();

