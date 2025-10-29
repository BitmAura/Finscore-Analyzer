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

export const parse = (text: string, job_id: string): Transaction[] => {
  const transactions: Transaction[] = [];
  const lines = text.split('\n');

  for (const line of lines) {
    // Skip lines that are too long (safeguard against pathological inputs)
    if (line.length > 1000) continue;

    const match = genericTransactionRegex.exec(line);
    if (match && match.groups) {
      const { date, desc, debit, credit, balance } = match.groups;
      transactions.push({
        job_id,
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

// Generic date pattern that can match dates in various common formats
const datePattern = /\b(\d{1,2}[-./]\d{1,2}[-./]\d{2,4}|\d{2,4}[-./]\d{1,2}[-./]\d{1,2})\b/;

// Generic numeric value (with optional comma as thousand separator and dot as decimal)
const numberPattern = /([-+]?\d{1,3}(,\d{3})*(\.\d{2})?)/;

export function parseGenericBankStatement(text: string, jobId: string): Transaction[] {
  const lines = text.split('\n');
  const transactions: Transaction[] = [];

  // Helper function to clean and parse amounts
  const parseAmount = (amountStr: string | null | undefined): number | null => {
    if (!amountStr) return null;
    // Remove commas, ensure period as decimal point
    const cleaned = amountStr.replace(/,/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? null : parsed;
  };

  for (const line of lines) {
    const dateMatch = line.match(datePattern);
    if (!dateMatch) continue; // Skip lines without dates

    const date = dateMatch[1];

    // Look for number patterns that could be amounts
    const numberMatches = line.match(new RegExp(numberPattern.source, 'g'));
    if (!numberMatches || numberMatches.length < 2) continue;

    // Description is typically between date and first amount
    const startIndex = line.indexOf(dateMatch[0]) + dateMatch[0].length;
    const description = line.substring(startIndex, line.indexOf(numberMatches[0], startIndex)).trim();

    // Assuming last number is balance, next-to-last could be debit or credit
    const balance = parseAmount(numberMatches[numberMatches.length - 1]);
    let debit = null;
    let credit = null;

    // Determine if second-to-last amount is debit or credit (simplified logic)
    // In real implementation, you'd need more context from the document
    if (numberMatches.length >= 2) {
      const amount = parseAmount(numberMatches[numberMatches.length - 2]);
      // Very simplified - in reality you'd need to check column headers or context
      if (line.toLowerCase().includes('debit') || line.toLowerCase().includes('withdrawal')) {
        debit = amount;
      } else {
        credit = amount;
      }
    }

    transactions.push({
      date: date,
      description: description,
      debit: debit,
      credit: credit,
      balance: balance ?? 0,
      job_id: jobId
    });
  }

  return transactions;
}
