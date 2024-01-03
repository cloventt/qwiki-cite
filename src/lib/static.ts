import { MetaData } from 'metadata-scraper/lib/types';
import { CitationTemplate } from './ICitationTemplate';
import { parseFullName } from 'parse-full-name';
import moment from 'moment';


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
    result.push(pageDetails.type === 'book' ? 'cite book' : 'cite web');

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

      // parse the newspaper page number from the title if possible
      const pageNumber = [...citationTemplate.title.matchAll(/.*Page (\d+)[^\d]*/gi)];
      if (pageNumber.length && pageNumber[0].length) {
        citationTemplate.page = pageNumber[0][pageNumber[0].length-1];
      }
    }
    if (metadata.language != null) citationTemplate.language = metadata.language
    if (metadata.provider != null) citationTemplate.website = metadata.provider

    if (metadata.publisher != null) citationTemplate.publisher = (metadata.publisher as string).trim()
    if (metadata.isbn != null) citationTemplate.isbn = (metadata.isbn as string).trim()
    if (metadata.location != null) citationTemplate.location = (metadata.location as string).trim()
    if (metadata.type != null) citationTemplate.type = (metadata.type as string).trim()

    const parseAuthor = (input: string): [string?, string?] => {
      // try and break the name into components
      const parsedName = parseFullName(input);
      if (parsedName.error.length > 0) {
        console.warn('Errors encountered parsing author name', input, parsedName.error)
        return [];
      }

      return [parsedName.first, parsedName.last]
    }

    const isMaybeAName = (possibleName: string, websiteName?: string): boolean => {
      // spot suspicious words that might indicate this is not a name
      const suspiciousStrings = [
        'writer',
        'staff',
        'journalist',
        'reporter',
        'http',
      ];

      websiteName?.split(' ').map((s) => s.toLowerCase()).forEach((s) => suspiciousStrings.push(s));

      return suspiciousStrings.every((s) => possibleName.toLowerCase().indexOf(s) < 0);
    }

    if (metadata.author != null) {
      // remove anything in brackets (might be a job title)
      const stripped = (metadata.author as string).trim().replace(/[([].*[)\]]/g, '')

      // split into multiple authors
      const [firstAuthor, secondAuthor] = stripped.split(/\sand|[&]|[,]|[;]|[|]|via\s/)

      if (firstAuthor != null && isMaybeAName(firstAuthor, citationTemplate.website)) {
        const [first1, last1] = parseAuthor(firstAuthor);
        if (first1 && last1) {
          citationTemplate.first1 = first1
          citationTemplate.last1 = last1
        }
      }

      if (secondAuthor != null && isMaybeAName(secondAuthor, citationTemplate.website)) {
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

