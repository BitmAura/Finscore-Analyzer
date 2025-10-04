import { Transaction } from './transaction-parser';
import * as hdfcParser from './parsers/hdfc-parser';
import * as iciciParser from './parsers/icici-parser';
import * as sbiParser from './parsers/sbi-parser';
import * as axisParser from './parsers/axis-parser';
import * as kotakParser from './parsers/kotak-parser';
import * as pnbParser from './parsers/pnb-parser';
import * as canaraParser from './parsers/canara-parser';
import * as genericParser from './parsers/generic-parser';

// The Parser interface that all bank parsers must adhere to.
export interface ParseResult {
  transactions: Transaction[];
  accountDetails: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    accountType: string;
  };
}

interface Parser {
  detect: (text: string) => boolean;
  // Accept parsers that either return a full ParseResult or just Transaction[] (legacy)
  parse: (text: string, job_id: string, password?: string) => ParseResult | Transaction[];
}

// The registry of all our parsers.
// The dedicated parsers are first. The generic parser is last to act as a fallback.
const parserRegistry: Parser[] = [
  hdfcParser as unknown as Parser,
  iciciParser as unknown as Parser,
  sbiParser as unknown as Parser,
  axisParser as unknown as Parser,
  kotakParser as unknown as Parser,
  pnbParser as unknown as Parser,
  canaraParser as unknown as Parser,
  genericParser as unknown as Parser,
];

export const routeToParser = (text: string, job_id: string, password?: string): ParseResult => {
  // Find the first parser in our registry that can handle this statement.
  const parser = parserRegistry.find(p => p.detect(text));

  // The generic parser's detect() returns true, so a parser will always be found.
  if (parser) {
    console.log(`Using parser: ${parser.constructor?.name || 'generic'}`)
    const parsed = parser.parse(text, job_id, password as any);

    // Normalize legacy parsers that return Transaction[] into a ParseResult
    if (Array.isArray(parsed)) {
      return {
        transactions: parsed,
        accountDetails: {
          bankName: '',
          accountNumber: '',
          accountHolder: '',
          accountType: '',
        }
      };
    }

    return parsed as ParseResult;
  }

  // This part should ideally not be reached, but is here as a safeguard.
  return {
    transactions: [],
    accountDetails: {
      bankName: '',
      accountNumber: '',
      accountHolder: '',
      accountType: '',
    }
  };
};
