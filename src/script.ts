import browser from 'webextension-polyfill';
import { QWikiCite } from './lib/static';
import { getTitle } from './lib/parsers';

const snippetSlot = document.getElementById('snippet-slot');


function main() {
    browser.tabs.query({active: true, lastFocusedWindow: true}).then((tabs) => {
        let url = tabs[0].url;
    
        const citationTemplate = {
            url,
            title: getTitle(),
        };
    
        snippetSlot.textContent = QWikiCite.generateCitationString(citationTemplate, false);
        
    });
};
main();