import { Transaction } from '../transaction-parser';

// Detection logic: Check for keywords specific to Axis Bank statements.
export const detect = (text: string): boolean => {
  return text.toLowerCase().includes('axis bank');
};

// Parsing logic for Axis Bank statements
// Assumes a format like: DD-Mon-YYYY Description Debit Credit Balance
const axisTransactionRegex = /^(?<date>\d{2}-[A-Za-z]{3}-\d{4})\s+(?<desc>.+?)\s+(?<debit>[\d,]+\.\d{2})?\s+(?<credit>[\d,]+\.\d{2})?\s+(?<balance>[\d,]+\.\d{2})\s*$/;

const parseAmount = (amount: string): number | null => {
  if (!amount) return null;
  return parseFloat(amount.replace(/,/g, ''));
};

export const parse = (text: string): Transaction[] => {
  const transactions: Transaction[] = [];
  const lines = text.split('\n');

  for (const line of lines) {
    const match = axisTransactionRegex.exec(line);
    if (match) {
      const groups = match.groups;
      if (groups) {
        transactions.push({
          date: groups.date,
          description: groups.desc.trim(),
          debit: parseAmount(groups.debit),
          credit: parseAmount(groups.credit),
          balance: parseAmount(groups.balance) || 0,
        });
      }
    }
  }

  return transactions;
};
