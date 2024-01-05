
/**
 * Represents ALL the values that can be set in a
 * {{cite web}} template. In reality most of these
 * are probably not going to be used.
 */
export interface CitationTemplate {

 author?: string;
 last?: string;
 last1?: string;
 first?: string;
 first1?: string;
 author2?: string;
 last2?: string;
 first2?: string;
 authorLink?: string;
 author2Link?: string;
 authorSeparator?: string;
 authorNameSeparator?: string;
 authorMask?: string;
 editor?: string;
 editorLast?: string;
 editorFirst?: string;
 editor2?: string;
 editor2Last?: string;
 editor2First?: string;
 editorLink?: string;
 editor2Link?: string;
 translatorLast?: string;
 translatorFirst?: string;
 translatorLink?: string; 
 translator2Last?: string;
 translator2First?: string;
 translator2Link?: string;
 others?: string;
 publicationDate?: string;
 date?: string;
 year?: string;
 origDate?: string;
 title?: string;
 chapter?: string;
 chapterUrl?: string;
 chapterFormat?: string;
 contribution?: string;
 contributionUrl?: string;
 type?: string;
 journal?: string;
 periodical?: string;
 newspaper?: string;
 magazine?: string;
 encyclopedia?: string;
 work?: string;
 edition?: string;
 series?: string;
 volume?: string;
 issue?: string;
 publisher?: string;
 publicationPlace?: string;
 place?: string;
 language?: string;
 page?: string;
 pages?: string;
 noPp?: string;
 at?: string;
 id?: string;
 isbn?: string;
 issn?: string;
 oclc?: string;
 pmid?: string;
 pmc?: string;
 bibcode?: string;
 doi?: string;
 doiInactiveDate?: string;
 zbl?: string;
 url?: string;
 accessDate?: string;
 format?: string;
 archiveUrl?: string;
 archiveDate?: string;
 urlStatus?: 'dead' | 'live' | 'deviated' | 'unfit' | 'usurped';
 quote?: string;
 separator?: string;
 postscript?: string;
 ref?: string;
 urlAccess?: 'subscription' | 'registration' | 'limited' | 'free';

}

export type CitationTemplateKeys = { [Property in keyof CitationTemplate]?: boolean };