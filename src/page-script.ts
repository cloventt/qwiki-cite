import Browser from 'webextension-polyfill';
import { scrapePage, parseWorldCat, getGenericMetadata } from './parsers';

declare global {
    interface Window {
        parseWorldCat: Function;
        getGenericMetadata: Function;
    }
}

window.parseWorldCat = parseWorldCat;
window.getGenericMetadata = getGenericMetadata;

Browser.runtime.onMessage.addListener(scrapePage);

Browser.runtime.connect();