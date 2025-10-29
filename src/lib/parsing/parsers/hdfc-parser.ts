import { Transaction } from '../transaction-parser';

// Detection logic: Check for keywords specific to HDFC statements.
export const detect = (text: string): boolean => {
  return text.toLowerCase().includes('hdfc bank');
};

// Parsing logic for HDFC statements
const hdfcTransactionRegex = /^(?<date>\d{2}\/\d{2}\/\d{2,4})\s+(?<desc>.+?)\s+(?<debit>[\d,]+\.\d{2})?\s+(?<credit>[\d,]+\.\d{2})?\s+(?<balance>[\d,]+\.\d{2})$/;

const parseAmount = (amount: string | undefined): number | null => {
  if (!amount) return null;
  return parseFloat(amount.replace(/,/g, ''));
};

export const parse = (text: string, job_id: string): Transaction[] => {
  const transactions: Transaction[] = [];
  const lines = text.split('\n');

  for (const line of lines) {
    const match = hdfcTransactionRegex.exec(line);
    if (match && match.groups) {
      const groups = match.groups;
      transactions.push({
        job_id, // Include job_id with each transaction
        date: groups.date,
        description: groups.desc.trim(),
        debit: parseAmount(groups.debit),
        credit: parseAmount(groups.credit),
        balance: parseAmount(groups.balance) || 0,
      });
    }
  }

  return transactions;
};
