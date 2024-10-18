import { MetaData } from "metadata-scraper/lib/types";
import moment from "moment";

/**
 * These are the parsing rules for different entities
 * 
 * Entity type documentation can be found at schema.org
 */
const objectHandlers: {[k: string]: (obj: any) => MetaData} = {
    'WebPage': (obj) => {
        return removeUndefined(parseCommonFeatures(obj));
    },
    'ScholarlyArticle': (obj) => {
        const a = parseCommonFeatures(obj);
        a.type = 'journal';

        a.pages = obj.pagination || `${obj.pageStart}-${obj.pageEnd}`;

        if ('isPartOf' in obj) {
            a.journal = obj['isPartOf'].name;
            if ('issn' in obj['isPartOf']) {
                a.issn = Array.isArray(obj['isPartOf']['issn']) ? obj['isPartOf']['issn'][0]: obj['isPartOf']['issn'];
            }
            a.journal = obj['isPartOf'].name;
            a.volume = obj['isPartOf'].volumeNumber;
        }

        if ('sameAs' in obj && typeof obj['sameAs'] === 'string' && obj['sameAs'].startsWith('https://doi.org/')) {
            a.doi = obj['sameAs'].replace('https://doi.org/', '');
        }

        return removeUndefined(a);
    },
    'NewsArticle': (obj) => {
        const a = parseCommonFeatures(obj);
        a.type = 'news';

        return removeUndefined(a);
    },
    'Book': (obj) => {
        const b = parseCommonFeatures(obj);
        b.type = 'book';

        b.isbn = obj.isbn;

        return removeUndefined(b);
    },
}

export async function scrapeJsonLd(blob: string): Promise<MetaData> {
    if (!blob) return Promise.resolve({});
    try {
        const schema = JSON.parse(blob);
        const objectStream: any[] = flatten(schema).filter((obj) => Object.keys(objectHandlers).includes(obj['@type']));
        if (objectStream.length === 0) return Promise.resolve({});
        const metadataStream = objectStream.map((obj) => objectHandlers[obj['@type']](obj))
        const combined = metadataStream.length > 1 ? metadataStream.reduceRight((a: object, b: object) => { return {...b, ...a} }) : metadataStream[0]
        return Promise.resolve(combined);
    } catch {
        Promise.resolve({});
    }
}

/**
 * Given a schema object, flatten it into an array of all the nested objects
 */
function flatten(schema: any): any[] {
    if (Array.isArray(schema)) return (schema as any[]).flatMap(flatten);
    if ('@graph' in schema) return(schema['@graph'] as any[]).flatMap(flatten);
    if (schema['@type'] === 'DataFeed') return (schema['dataFeedElement'] as any[]).flatMap(flatten);

    if ('workExample' in schema) return [schema].concat(flatten(schema['workExample']));
    
    if ('mainEntity' in schema) return [schema].concat(flatten(schema['mainEntity']));
    
    if (Object.keys(objectHandlers).includes(schema['@type'])) return [schema];

    return [];
}

function parseCommonFeatures(obj: any): MetaData {
    const m: MetaData = {};

    m.title = obj.headline || obj.name;
    m.provider = obj.publisher?.name || obj.provider?.name || obj.producer?.name || obj.sourceOrganization?.name;

    if (obj.inLanguage != null) {
        m.language = Intl.getCanonicalLocales(obj.inLanguage.replace('_', '-'))[0];
    }
    m.published = moment.utc(obj.datePublished).toISOString() || obj.datePublished;

    m.url = obj.url;
    m.author = parseAuthor(obj.author || obj.creator || obj.contributor || obj.accountablePerson);
    m.type = 'news';
    m.urlAccess = (obj.isAccessibleForFree != null && !parseUrlAccess(obj.isAccessibleForFree)) ? 'subscription' : undefined;

    return m;
}

function parseAuthor(obj: {'@type': string, name: string} | {'@type': string, name: string}[]): string | string[] {
    if (obj == null) return;
    if (Array.isArray(obj) && obj.length > 1) return obj.map((a) => a.name);
    if (Array.isArray(obj)) return obj[0].name;
    return obj.name;
}

function parseUrlAccess(value: any): boolean {
    if (typeof value === 'string') return JSON.parse(value.toLowerCase());
    return value == true;
}

export function removeUndefined(obj: any): any {
    if (obj === undefined) return {}
    return Object.fromEntries(
        Object.entries(obj).filter(([k, v]) => v !== undefined)
    );
}