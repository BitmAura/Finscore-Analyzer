import { Transaction } from '../transaction-parser';

// Detection logic: Check for keywords specific to ICICI statements.
export const detect = (text: string): boolean => {
  return text.toLowerCase().includes('icici bank');
};

// Parsing logic for ICICI statements
const iciciTransactionRegex = /^(?<date>\d{2}-[A-Za-z]{3}-\d{2})\s+(?<desc>.+?)\s+(?<debit>[\d,]+\.\d{2})?\s+(?<credit>[\d,]+\.\d{2})?\s+(?<balance>[\d,]+\.\d{2})\s*$/;

const parseAmount = (amount: string): number | null => {
  if (!amount) return null;
  return parseFloat(amount.replace(/,/g, ''));
};

export const parse = (text: string, job_id: string): Transaction[] => {
  const transactions: Transaction[] = [];
  const lines = text.split('\n');

  for (const line of lines) {
    const match = iciciTransactionRegex.exec(line);
    if (match) {
      const groups = match.groups;
      if (groups) {
        transactions.push({
          job_id,
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
