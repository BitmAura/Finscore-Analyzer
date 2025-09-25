import { Transaction } from '../transaction-parser';

// This parser is a fallback, so its detect function will always return true.
export const detect = (text: string): boolean => {
  return true; 
};

// Safer regex: no global flag, limit description to 1-200 chars to reduce risk of catastrophic backtracking
const genericTransactionRegex = /^(?<date>\d{2}[-\/]\d{2}[-\/]\d{2,4})\s+(?<desc>.{1,200}?)\s+(?<debit>[\d,]+\.\d{2})?\s+(?<credit>[\d,]+\.\d{2})?\s+(?<balance>[\d,]+\.\d{2}(?:\s(?:Cr|Dr)\.? )?)$/;

const parseAmount = (amount?: string | null): number | null => {
  if (!amount) return null;
  const cleaned = amount.replace(/,/g, '').trim();
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
};

export const parse = (text: string): Transaction[] => {
  const transactions: Transaction[] = [];
  const lines = text.split('\n');

  for (const line of lines) {
    // Skip lines that are too long (safeguard against pathological inputs)
    if (line.length > 1000) continue;

    const match = genericTransactionRegex.exec(line);
    if (match && match.groups) {
      const { date, desc, debit, credit, balance } = match.groups;
      transactions.push({
        date: date,
        description: (desc || '').trim(),
        debit: parseAmount(debit ?? null),
        credit: parseAmount(credit ?? null),
        balance: parseAmount(balance ?? null) ?? 0,
      });
    }
  }

  return transactions;
};
