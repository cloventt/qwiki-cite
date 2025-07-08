import { CitationTemplate } from "./ICitationTemplate";

/**
 * The key us a URI path, not including the protocal
 * 
 * The value is CitationTemplate values to override other values
 * that were determined from previous steps.
 */
export const staticFieldsMap: {[uri: string]: CitationTemplate} = {
    'paperspast.natlib.govt.nz': {
        via: 'PapersPast',
    },
    'www.pressreader.com': {
        via: 'PressReader'
    },
    'stuff.pressreader.com': {
        via: 'PressReader',
    },
    'www.heritage.org.nz': {
        work: 'Heritage New Zealand',
    },
    'www.beehive.govt.nz': {
        publisher: 'New Zealand Government',
    },
    'www.health.govt.nz': {
        work: 'Ministry of Health',
        publisher: 'New Zealand Government',
    }
}