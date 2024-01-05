
/**
 * Represents ALL the values that can be set in a
 * {{cite web}} template. In reality most of these
 * are probably not going to be used.
 */
export interface CitationTemplate {

  url?: string;
  title?: string;
  urlAccess?: string;
  work?: string;
  author?: string;
  last?: string;
  first?: string;
  date?: string;
  accessDate?: string;
  language?: string;
  archiveUrl?: string;
  archiveDate?: string;
  
  website?: string;
  authorLink?: string;
  last1?: string;
  first1?: string;
  last2?: string;
  first2?: string;
  authorLink2?: string;
  year?: string; // deprecated
  origDate?: string;
  editorLast?: string;
  editorFirst?: string;
  editorLink?: string;
  editor2Last?: string;
  editor2First?: string;
  editor2Link?: string;
  department?: string;
  series?: string;
  publisher?: string;
  agency?: string;
  location?: string;
  page?: string;
  pages?: string;
  at?: string;
  scriptTitle?: string;
  transTitle?: string;
  type?: string;
  format?: string;
  arxiv?: string;
  asin?: string;
  bibcode?: string;
  doi?: string;
  doiBrokenDate?: string;
  isbn?: string;
  issn?: string;
  jfm?: string;
  jstor?: string;
  lccn?: string;
  mr?: string;
  oclc?: string;
  ol?: string;
  osti?: string;
  pmc?: string;
  pmid?: string;
  rfc?: string;
  ssrn?: string;
  zbl?: string;
  id?: string;
  urlStatus?: 'dead' | 'live' | 'deviated' | 'unfit' | 'usurped';
  via?: string;
  quote?: string;
  ref?: string;
  postscript?: string;
}

export type CitationTemplateKeys = { [Property in keyof CitationTemplate]?: boolean };