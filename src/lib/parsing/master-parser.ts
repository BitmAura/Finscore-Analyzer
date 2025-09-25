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
interface Parser {
  detect: (text: string) => boolean;
  parse: (text: string) => Transaction[];
}

// The registry of all our parsers.
// The dedicated parsers are first. The generic parser is last to act as a fallback.
const parserRegistry: Parser[] = [
  hdfcParser,
  iciciParser,
  sbiParser,
  axisParser,
  kotakParser,
  pnbParser,
  canaraParser,
  genericParser, 
];

export const routeToParser = (text: string): Transaction[] => {
  // Find the first parser in our registry that can handle this statement.
  const parser = parserRegistry.find(p => p.detect(text));

  // The generic parser's detect() returns true, so a parser will always be found.
  if (parser) {
    console.log(`Using parser: ${parser.constructor.name || 'generic'}`)
    return parser.parse(text);
  }

  // This part should ideally not be reached, but is here as a safeguard.
  return [];
};
