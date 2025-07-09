import { CitationTemplate } from './ICitationTemplate';
import { parseFullName } from 'parse-full-name';
import moment from 'moment';
import { MetaData } from './iMetadata';


export class QWikiCite {

  private static parseRegex = /\s?([\w-]*)\s?=\s?([^\n|}]*)\s?/g;

  /**
   * Generates a string that can be pasted to Wikipedia to add a citation
   * 
   * @param pageDetails an object containing the values to put in the template 
   * @param compact if true, remove oneline the template and remove unneeded whitespace
   * @returns the Wikipedia-compatible tempalte string
   */
  public static generateCitationString(pageDetails: CitationTemplate, compact: boolean = true): string {
    const result: string[] = [];
    result.push('citation');

    (Object.keys(pageDetails) as Array<keyof CitationTemplate>).forEach((key) => {
      if (pageDetails[key] != null) {
        result.push(`${this.kebabize(key)}=${this.esc(pageDetails[key]!!)}`);
      }
    });

    const blob = compact ? result.join('|') : result.join('\n  |');

    return '{{' + blob + (compact ? '' : '\n') + '}}';
  }

  /**
   * Given a Wikipedia citation template string, parse all the fields from it
   * 
   * @param citationString a Wikipedia {{cite web}} template blob
   * @returns an object containing all the template parameters
   */
  public static parseCitationString(citationString: string): CitationTemplate {
    const parsed = [...citationString.matchAll(this.parseRegex)];
    const result = {};
    parsed.forEach((match) => {
      const [matchedValue, key, value] = match;
      result[this.camelize(key.trim())] = this.esc(value.trim());
    })
    return result;
  }

  private static getDateInString(s: string) {
    const possibleDateMatch = s.match(/((\w{3,9}|[0-3]?\d)[ \/-](\w{3,9}|[0-3]?\d)[ \/,-]{1,2}\d{1,4})/);
    if (possibleDateMatch) {
      const parsedDate = moment(possibleDateMatch[0].replace(/[,|th|st]/g, '')).format('YYYY-MM-DD');
      if (parsedDate != 'Invalid date') {
        return parsedDate;
      }
    }
  }

  /**
   * Convert page metadata to citation template data
   * @param metadata metadata from page scraper
   * @returns citation template data object
   */
  public static scrapedMetadataToCitation(metadata: MetaData): CitationTemplate {
    const citationTemplate: CitationTemplate = {};

    if (metadata.title != null) {
      citationTemplate.title = metadata.title.trim();

      // parse the date from title if possible
      const parsedDate = this.getDateInString(citationTemplate.title);
      if (parsedDate != null) {
        citationTemplate.date = parsedDate;
      }
    }
    if (metadata.pageNumber != null) citationTemplate.page = metadata.pageNumber as string;
    if (metadata.language != null) citationTemplate.language = metadata.language

    if (metadata.provider != null) {
      if (metadata.type === 'book') {
        citationTemplate.publisher = metadata.provider?.trim()
      } else if (metadata.journal != null) {
        citationTemplate.work = metadata.journal.trim();
        citationTemplate.publisher = metadata.provider?.trim();
      } else {
        citationTemplate.work = metadata.provider?.trim()
      }
    }

    if (metadata.publisher != null) citationTemplate.publisher = (metadata.publisher as string).trim()
    if (metadata.isbn != null) citationTemplate.isbn = (metadata.isbn as string).trim()
    if (metadata.issn != null) citationTemplate.issn = (metadata.issn as string).trim()
    if (metadata.doi != null) citationTemplate.doi = (metadata.doi as string).trim()
    if (metadata.volume != null) citationTemplate.volume = (metadata.volume as string).trim()
    if (metadata.location != null) citationTemplate.publicationPlace = (metadata.location as string).trim()
    if (metadata.urlAccess != null) citationTemplate.urlAccess = metadata.urlAccess
    if (metadata.issue != null) citationTemplate.issue = metadata.issue;
    if (metadata.pmid != null) citationTemplate.pmid = metadata.pmid;
    if (metadata.via != null) citationTemplate.via = metadata.via;
    // if (['book', 'journal'].includes(metadata.type)) citationTemplate.type = (metadata.type as string).trim()

    const parseAuthor = (input: string): [string?, string?] => {
      // try and break the name into components
      const parsedName = parseFullName(input);
      if (parsedName.error.length > 0) {
        console.warn('Errors encountered parsing author name', input, parsedName.error)
        return [];
      }

      return [(parsedName.first + ' ' + parsedName.middle).trim(), parsedName.last]
    }

    const isMaybeAName = (possibleName: string, websiteName?: string): boolean => {
      // spot suspicious words that might indicate this is not a name
      const suspiciousStrings = [
        'writer',
        'staff',
        'journalist',
        'reporter',
        'http',
        'national',
        'library',
      ];

      websiteName?.split(' ').map((s) => s.toLowerCase()).forEach((s) => suspiciousStrings.push(s));

      return suspiciousStrings.every((s) => possibleName.toLowerCase().indexOf(s) < 0);
    }

    if (metadata.author != null) {
      // split into multiple authors
      const [firstAuthor, secondAuthor] = Array.isArray(metadata.author) ? metadata.author : (metadata.author as string).trim().replace(/[([].*[)\]]/g, '').split(/\sand|[&]|[,]|[;]|[|]|via\s/);

      if (firstAuthor != null && isMaybeAName(firstAuthor, citationTemplate.work)) {
        const [first1, last1] = parseAuthor(firstAuthor);
        if (first1 && last1) {
          citationTemplate.first1 = first1
          citationTemplate.last1 = last1
        }
      }

      if (secondAuthor != null && isMaybeAName(secondAuthor, citationTemplate.work)) {
        const [first2, last2] = parseAuthor(secondAuthor);
        if (first2 && last2) {
          citationTemplate.first2 = first2
          citationTemplate.last2 = last2
        }
      }

    }

    if (metadata.published != null || metadata.year != null) {
      citationTemplate.date = (metadata.year as string)?.trim() || metadata.published.slice(0, 10).toString();
    }

    citationTemplate.accessDate = new Date().toISOString().slice(0, 10);

    return citationTemplate;
  }

  /**
   * Remove reserved wiki-template characters from a string
   * 
   * @param s string to clean
   * @returns the escaped string
   */
  public static esc(s: string): string {
    return s.replace(/[|]/g, '&#124;').replace(/[{]/g, '&#123;').replace(/[}]/g, '&#125;').replace(/\s/g, ' ');
  }

  /**
   * Convert a camelCase string to kebab-case
   * 
   * Shamelessly stolen from https://stackoverflow.com/a/67243723
   * 
   * @param str string with camelCase text
   * @returns string with kebab-case text
   */
  public static kebabize = (str: string): string => str.replace(/[A-Z]+(?![a-z])|[A-Z]/g, ($, ofs) => (ofs ? '-' : '') + $.toLowerCase());

  /**
   * Convert a kebab-case string to Camelcase
   * 
   * Shamelessly stolen from https://stackoverflow.com/a/60738940
   * 
   * @param str string with kebab-case text
   * @returns string with camelCase text
   */
  public static camelize = (s: string): string => s.replace(/-./g, x => x[1].toUpperCase())
}

