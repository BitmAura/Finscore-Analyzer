import { Transaction } from '../parsing/transaction-parser';

export interface Counterparty {
  name: string;
  totalSent: number;
  totalReceived: number;
  transactionCount: number;
}

/**
 * A more intelligent function to extract a potential counterparty name from a description.
 */
const extractCounterpartyName = (description: string): string => {
    const upperDesc = description.toUpperCase();

    // Rule 1: Look for specific transfer prefixes
    const upiMatch = upperDesc.match(/UPI\/CR\/\d+\/([A-Z0-9\s]+)/);
    if (upiMatch && upiMatch[1]) return upiMatch[1].trim();

    const neftMatch = upperDesc.match(/NEFT-([A-Z0-9\s]+)/);
    if (neftMatch && neftMatch[1]) return neftMatch[1].trim();

    const impsMatch = upperDesc.match(/IMPS\/\d+\/([A-Z0-9\s]+)/);
    if (impsMatch && impsMatch[1]) return impsMatch[1].trim();

    // Rule 2: Look for capitalized words (potential names)
    const capitalizedMatch = description.match(/([A-Z][a-z]+(?:\s[A-Z][a-z]+)+)/);
    if (capitalizedMatch && capitalizedMatch[1]) {
        const potentialName = capitalizedMatch[1].trim();
        if (potentialName.length > 4) { // Avoid short, generic words
            return potentialName;
        }
    }

    // Fallback to the first few words
    return description.split(' ').slice(0, 3).join(' ');
};

export const analyzeCounterparties = (transactions: Transaction[]): Counterparty[] => {
  const counterparties: { [key: string]: { totalSent: number; totalReceived: number; count: number } } = {};

  transactions.forEach(t => {
    // We don't analyze internal transfers or cash withdrawals for this summary
    if (t.category === 'Transfers' || t.description.includes('CASH WDL') || t.description.includes('ATM')) {
        return;
    }

    const name = extractCounterpartyName(t.description);

    if (!counterparties[name]) {
      counterparties[name] = { totalSent: 0, totalReceived: 0, count: 0 };
    }
    if (t.debit) {
      counterparties[name].totalSent += t.debit;
    }
    if (t.credit) {
      counterparties[name].totalReceived += t.credit;
    }
    counterparties[name].count++;
  });

  const summary: Counterparty[] = Object.keys(counterparties).map(name => ({
    name,
    totalSent: counterparties[name].totalSent,
    totalReceived: counterparties[name].totalReceived,
    transactionCount: counterparties[name].count,
  }));

  // Sort by the total amount of money moved (sent + received) to show the most significant counterparties first
  return summary.sort((a, b) => (b.totalSent + b.totalReceived) - (a.totalSent + a.totalReceived));
};
