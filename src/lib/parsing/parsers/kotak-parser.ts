import { Transaction } from '../transaction-parser';

// Detection logic: Check for keywords specific to Kotak statements.
export const detect = (text: string): boolean => {
  return text.toLowerCase().includes('kotak');
};

export const parse = (text: string): Transaction[] => {
    // Placeholder implementation
    console.log('Parsing Kotak Bank statement...');
    return [];
}