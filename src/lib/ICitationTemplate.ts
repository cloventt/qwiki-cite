export interface CitationTemplate {

  url?: string;
  title?: string;
  urlAccess?: string;
  website?: string;
  author?: string;
  last?: string;
  first?: string;
  date?: string;
  accessDate?: string;
  language?: string;
  archiveUrl?: string;
  archiveDate?: string;

  authorLink?: string;
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
  urlStatus?: string;
  via?: string;
  quote?: string;
  ref?: string;
  postscript?: string;
}

export type CitationTemplateKeys = { [Property in keyof CitationTemplate]?: boolean };