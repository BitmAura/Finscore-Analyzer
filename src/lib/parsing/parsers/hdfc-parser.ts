import { Transaction } from '../transaction-parser';

// Detection logic: Check for keywords specific to HDFC statements.
export const detect = (text: string): boolean => {
  return text.toLowerCase().includes('hdfc bank');
};

// Parsing logic for HDFC statements
const hdfcTransactionRegex = /^(?<date>\d{2}\/\d{2}\/\d{2})\s+(?<desc>.+?)(?:\s+\d+)?\s+(?<debit>[\d,]+\.\d{2})?\s+(?<credit>[\d,]+\.\d{2})?\s+(?<balance>[\d,]+\.\d{2})\s*$/;

const accountNumberRegex = /Account\s*Number\s*[:\-]?\s*(\d+)/i;
const accountHolderRegex = /Account\s*Holder\s*[:\-]?\s*([A-Za-z ]+)/i;
const accountTypeRegex = /Account\s*Type\s*[:\-]?\s*([A-Za-z ]+)/i;

const parseAmount = (amount: string): number | null => {
  if (!amount) return null;
  return parseFloat(amount.replace(/,/g, ''));
};

export const parse = (text: string, job_id: string) => {
  const transactions: Transaction[] = [];
  const lines = text.split('\n');

  let accountNumber = '';
  let accountHolder = '';
  let accountType = '';

  for (const line of lines) {
    if (!accountNumber) {
      const match = accountNumberRegex.exec(line);
      if (match) accountNumber = match[1];
    }
    if (!accountHolder) {
      const match = accountHolderRegex.exec(line);
      if (match) accountHolder = match[1].trim();
    }
    if (!accountType) {
      const match = accountTypeRegex.exec(line);
      if (match) accountType = match[1].trim();
    }
    const txnMatch = hdfcTransactionRegex.exec(line);
    if (txnMatch) {
      const groups = txnMatch.groups;
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

  return {
    transactions,
    accountDetails: {
      bankName: 'HDFC Bank',
      accountNumber,
      accountHolder,
      accountType,
    }
  };
};
