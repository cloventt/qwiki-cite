import Browser from 'webextension-polyfill';
import { scrapePage } from './parsers';

Browser.runtime.onMessage.addListener(scrapePage);

Browser.runtime.connect();