import browser from 'webextension-polyfill';
import { QWikiCite } from './lib/static';
import { MetaData } from 'metadata-scraper/lib/types'
import { CitationTemplate } from './lib/ICitationTemplate';

function isEmpty(obj) {
    for (var x in obj) { return false; }
    return true;
}

async function getStoredValue(url: string): Promise<CitationTemplate> {
    const storedData: Record<string, CitationTemplate> = await browser.storage.session.get(url);
    return storedData[url] || {};
}

/**
 * Update the cite web template in the text box, preserving anything that is 
 * already there.
 * @param citationTemplate the new values to add
 * @param append if false, explicitly set deleted values to null so they remain deleted
 */
async function updatePage(citationTemplate: CitationTemplate, append: boolean = false) {

    const currentValue = await getStoredValue(citationTemplate.url);

    if (!append) {
        Object.keys(currentValue).forEach((key) => {
            if (!(key in citationTemplate)) {
                // the key did previously exist, but has been removed by the user
                // explictly set it to null so that we remember that it was deleted
                citationTemplate[key] = null;
            }
        })
    }

    const merged = { ...currentValue, ...citationTemplate };

    if (merged !== currentValue) {
        console.debug('Persisting updated value to storage', merged);
        browser.storage.session.set({
            [merged.url]: merged,
        });
    }
}

function displayData(citationData: CitationTemplate) {
    console.debug('Printing to textarea', citationData)
    const snippetSlot = document.getElementById('snippet-slot') as HTMLInputElement;
    snippetSlot.setAttribute('rows', `${Object.keys(citationData).length + 2}`);
    snippetSlot.textContent = QWikiCite.generateCitationString(citationData, false);
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

async function main() {
    document.getElementById('copy-to-clipboard')?.addEventListener('click', () => {
        console.debug('Copying current value to clipboard');
        copyToClipboard();
    });

    document.getElementById('snippet-slot')?.addEventListener('change', async (event) => {
        console.debug('Storing a user-change to the template');

        const parsedValue = QWikiCite.parseCitationString((event.target as HTMLInputElement).value);
        await updatePage(parsedValue);
    });

    const tabs = await browser.tabs.query({ active: true, lastFocusedWindow: true });
    if (tabs.length < 1) {
        console.error('Did not find an active tab to work on, aborting')
        return;
    }

    const rawPageUrl = tabs[0].url;

    let url: string;
    let archiveUrl: string;
    let archiveDate: string;

    if (rawPageUrl.startsWith('https://web.archive.org/web')) {
        const archiveUrlRegex = /^https:\/\/web.archive.org\/web\/(\d*)\/(.*)/
        const match = archiveUrlRegex.exec(rawPageUrl);
        url = match[2];
        archiveUrl = rawPageUrl;
        archiveDate = match[1];
    } else {
        url = rawPageUrl;
    }

    browser.storage.session.onChanged.addListener((storageChanges) => {
        if (storageChanges[url] != null) {
            displayData(storageChanges[url].newValue);
        }
    });

    const previousData = await getStoredValue(url);

    if (!isEmpty(previousData)) {
        console.debug('Found a previously stored version of the data', previousData);
        await updatePage(previousData);
    } 

    const currentValue = await getStoredValue(url);
    if (currentValue.accessDate == null && !url.endsWith('.pdf') && !url.endsWith('.PDF')) {
        console.debug('No previous data found in session storage, scraping page instead');
        try {
            const pageScrapeResult: MetaData = await browser.tabs.sendMessage(tabs[0].id!!, { url });
            if (pageScrapeResult == null) {
                return;
            }
            console.debug('Got a page scrape result', pageScrapeResult);

            const citationTemplate = QWikiCite.scrapedMetadataToCitation(pageScrapeResult);
            citationTemplate.url = url;

            if (archiveUrl != null) {
                citationTemplate.archiveUrl = archiveUrl;
                citationTemplate.archiveDate = `${archiveDate.slice(0, 4)}-${archiveDate.slice(4, 6)}-${archiveDate.slice(6, 8)}`;
            }

            console.debug('Generated citation template data', citationTemplate);

            await updatePage(citationTemplate);
        } catch (e: unknown) {
            console.error('Encountered an error attempting to scrape the page', e);
        }
    }

    if (currentValue.archiveUrl == null) {
        console.debug('Looking for an archive on wayback')
        fetch(`https://archive.org/wayback/available?url=${url}`).then(async (response) => {
            const waybackAnswer = await response.json();
            console.log('Found an archive on wayback', waybackAnswer);
            if (!isEmpty(waybackAnswer["archived_snapshots"])) {
                const ts = waybackAnswer["archived_snapshots"]["closest"]["timestamp"]
                await updatePage({
                    url,
                    archiveUrl: waybackAnswer["archived_snapshots"]["closest"]["url"],
                    archiveDate: `${ts.slice(0, 4)}-${ts.slice(4, 6)}-${ts.slice(6, 8)}`,
                }, true);
            }
        })
    }

};
main();

