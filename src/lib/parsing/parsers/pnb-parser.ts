import { Transaction } from '../transaction-parser';

// Detection logic: Check for keywords specific to PNB statements.
export const detect = (text: string): boolean => {
  return text.toLowerCase().includes('punjab national bank');
};

export const parse = (text: string): Transaction[] => {
    // Placeholder implementation
    console.log('Parsing PNB statement...');
    return [];
}