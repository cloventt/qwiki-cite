import { CitationTemplate } from './ICitationTemplate';

export class QWikiCite {

  public static generateCitationString(pageDetails: CitationTemplate, compact: boolean = true): string {
    const result = [];
    result.push('cite web');

    (Object.keys(pageDetails) as Array<keyof CitationTemplate>).forEach((key) => {
      result.push(`${this.kebabize(key)}=${pageDetails[key]}`);
    });

    const blob = compact ? result.join('|') : result.join('\n    |');

    return '{{' + blob + (compact ? '':'\n') + '}}';
  }

  private static kebabize = (str: string) => str.replace(/[A-Z]+(?![a-z])|[A-Z]/g, ($, ofs) => (ofs ? '-' : '') + $.toLowerCase());
}

