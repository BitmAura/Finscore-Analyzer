import { Transaction } from '../transaction-parser';

// Detection logic: Check for keywords specific to HDFC statements.
export const detect = (text: string): boolean => {
  return text.toLowerCase().includes('hdfc bank');
};

// Parsing logic for HDFC statements
const hdfcTransactionRegex = /^(?<date>\d{2}\/\d{2}\/\d{2})\s+(?<desc>.+?)(?:\s+\d+)?\s+(?<debit>[\d,]+\.\d{2})?\s+(?<credit>[\d,]+\.\d{2})?\s+(?<balance>[\d,]+\.\d{2})\s*$/;

const parseAmount = (amount: string): number | null => {
  if (!amount) return null;
  return parseFloat(amount.replace(/,/g, ''));
};

export const parse = (text: string): Transaction[] => {
  const transactions: Transaction[] = [];
  const lines = text.split('\n');

  for (const line of lines) {
    const match = hdfcTransactionRegex.exec(line);
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
