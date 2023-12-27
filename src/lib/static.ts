import { MetaData } from 'metadata-scraper/lib/types';
import { CitationTemplate } from './ICitationTemplate';

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
    result.push('cite web');

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

  /**
   * Convert page metadata to citation template data
   * @param metadata metadata from page scraper
   * @returns citation template data object
   */
  public static scrapedMetadataToCitation(metadata: MetaData): CitationTemplate {
    const citationTemplate: CitationTemplate = {};

    if (metadata.title != null) citationTemplate.title = metadata.title
    if (metadata.language != null) citationTemplate.language = metadata.language
    if (metadata.provider != null) citationTemplate.website = metadata.provider

    // TODO: author detection needs to be improved a lot
    if (metadata.author != null) {
      const splitAuthor = metadata.author.toString().split(' ')
      if (splitAuthor.length == 2) {
        citationTemplate.first = splitAuthor[0];
        citationTemplate.last = splitAuthor[splitAuthor.length - 1];
      } else if (splitAuthor.length > 0) {
        citationTemplate.author = metadata.author as string;
      }
    }

    if (metadata.published != null) {
      citationTemplate.date = metadata.published.slice(0, 10).toString();
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
    return s.replace(/[|]/g, '&#124;').replace(/[{]/g, '&#123;').replace(/[}]/g, '&#125;').replace(/[=]/g, '&#61;')
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

