import { parse } from 'path';
import { CitationTemplate } from './ICitationTemplate';

export class QWikiCite {

  private static parseRegex = /\s?([\w-]*)\s?=\s?([^\n|}]*)\s?/g;

  public static generateCitationString(pageDetails: CitationTemplate, compact: boolean = true): string {
    const result = [];
    result.push('cite web');

    (Object.keys(pageDetails) as Array<keyof CitationTemplate>).forEach((key) => {
      if (pageDetails[key] != null) {
        result.push(`${this.kebabize(key)}=${this.esc(pageDetails[key])}`);
      }
    });

    const blob = compact ? result.join('|') : result.join('\n  |');

    return '{{' + blob + (compact ? '':'\n') + '}}';
  }

  public static parseCitationString(citationString: string): CitationTemplate {
    const parsed = [...citationString.matchAll(this.parseRegex)];
    const result = {};
    parsed.forEach((match) => {
      const [matchedValue, key, value] = match;
      result[this.camelize(key.trim())] = this.esc(value.trim());
    })
    return result;
  }

  public static esc(s: string): string {
    return s.replace(/[|]/g, '&#124;').replace(/[{]/g, '&#123;').replace(/[}]/g, '&#125;').replace(/[=]/g, '&#61;')
  }

  public static kebabize = (str: string) => str.replace(/[A-Z]+(?![a-z])|[A-Z]/g, ($, ofs) => (ofs ? '-' : '') + $.toLowerCase());

  public static camelize = s => s.replace(/-./g, x=>x[1].toUpperCase())
}

