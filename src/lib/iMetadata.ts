import { MetaData as exMetaData } from "metadata-scraper/lib/types";

export interface MetaData extends exMetaData {

    urlAccess?: 'subscription' | 'registration' | 'limited' | 'free';
    journal?: string;
    volume?: string;

}