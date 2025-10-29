import * as XLSX from 'xlsx';
import { Transaction } from './transaction-parser';

// Define the structure of a transaction that our application uses
export interface ParsedTransaction {
  transaction_date: string; // ISO 8601 format
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  category?: string; // Category will be assigned later
  balance?: number;
}

// Define the possible headers we might find in various bank Excel files
const HEADER_MAPPINGS: { [key: string]: string[] } = {
  date: ['date', 'transaction_date', 'trans_date', 'value_date', 'posting_date'],
  description: ['description', 'narrative', 'memo', 'particulars', 'details', 'transaction_details'],
  debit: ['debit', 'withdrawal', 'debit_amount', 'dr'],
  credit: ['credit', 'deposit', 'credit_amount', 'cr'],
  amount: ['amount', 'transaction_amount'],
  balance: ['balance', 'closing_balance', 'available_balance', 'running_balance'],
};

// A function to normalize header names
const normalizeHeader = (header: string): string => {
  return header.trim().toLowerCase().replace(/\s+/g, '_').replace(/[()]/g, '');
};

// Helper to parse amount strings (handles commas, parentheses for negative)
const parseAmount = (value: any): number => {
  if (!value) return 0;

  const str = String(value).trim();
  // Handle parentheses as negative (common in accounting)
  const isNegative = str.startsWith('(') && str.endsWith(')');
  // Remove currency symbols, commas, parentheses
  const cleaned = str.replace(/[₹$,()]/g, '').trim();
  const num = parseFloat(cleaned);

  return isNaN(num) ? 0 : (isNegative ? -num : num);
};

// Helper to parse dates
const parseDate = (dateStr: string): string => {
  try {
    // Try multiple date formats
    const formats = [
      /(\d{1,2})\/(\d{1,2})\/(\d{4})/, // DD/MM/YYYY or MM/DD/YYYY
      /(\d{4})-(\d{2})-(\d{2})/, // YYYY-MM-DD
      /(\d{1,2})-(\d{1,2})-(\d{4})/, // DD-MM-YYYY
    ];

    for (const format of formats) {
      const match = dateStr.match(format);
      if (match) {
        // Assume DD/MM/YYYY for Indian banks
        const [, first, second, third] = match;
        const date = new Date(`${third}-${second}-${first}`);
        if (!isNaN(date.getTime())) {
          return date.toISOString().split('T')[0];
        }
      }
    }

    // Try Excel date number
    const num = parseFloat(dateStr);
    if (!isNaN(num)) {
      // Excel dates are number of days since 1900-01-01
      const excelEpoch = new Date(1900, 0, 1);
      const date = new Date(excelEpoch.getTime() + (num - 1) * 24 * 60 * 60 * 1000);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    }

    // Fallback: try Date constructor
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
  } catch (error) {
    console.error('Date parse error:', error);
  }

  return new Date().toISOString().split('T')[0]; // Return today as fallback
};

// Find header that matches any of the possible names
const findHeader = (headers: string[], possibleNames: string[]): string | null => {
  for (const name of possibleNames) {
    const found = headers.find(h => h === name || h.includes(name));
    if (found) return found;
  }
  return null;
};

export const parseExcel = async (buffer: Buffer): Promise<Transaction[]> => {
  try {
    // Parse the Excel file
    const workbook = XLSX.read(buffer, { type: 'buffer' });

    // Get the first worksheet
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert to JSON
    const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    if (!rawData || rawData.length === 0) {
      throw new Error('Excel file is empty');
    }

    // First row is headers
    const headers = (rawData[0] as any[]).map(normalizeHeader);
    const dataRows = rawData.slice(1) as any[][];

    console.log('Detected headers:', headers);

    // Find which columns correspond to our transaction fields
    const dateHeader = findHeader(headers, HEADER_MAPPINGS.date);
    const descriptionHeader = findHeader(headers, HEADER_MAPPINGS.description);
    const debitHeader = findHeader(headers, HEADER_MAPPINGS.debit);
    const creditHeader = findHeader(headers, HEADER_MAPPINGS.credit);
    const amountHeader = findHeader(headers, HEADER_MAPPINGS.amount);
    const balanceHeader = findHeader(headers, HEADER_MAPPINGS.balance);

    if (!dateHeader || !descriptionHeader) {
      throw new Error('Excel headers are non-standard. Could not find required columns: Date and Description');
    }

    if (!debitHeader && !creditHeader && !amountHeader) {
      throw new Error('Excel must contain Amount, Debit, or Credit column');
    }

    console.log('Mapped columns:', { dateHeader, descriptionHeader, debitHeader, creditHeader, amountHeader, balanceHeader });

    const transactions: Transaction[] = [];
    let runningBalance = 0;

    for (const row of dataRows) {
      try {
        const normalizedRow: any = {};
        headers.forEach((header, index) => {
          normalizedRow[header] = row[index];
        });

        const date = parseDate(normalizedRow[dateHeader]);
        const description = String(normalizedRow[descriptionHeader] || 'Unknown Transaction').trim();

        let debit = 0;
        let credit = 0;

        // Parse debit/credit or amount
        if (debitHeader && creditHeader) {
          debit = parseAmount(normalizedRow[debitHeader]);
          credit = parseAmount(normalizedRow[creditHeader]);
        } else if (amountHeader) {
          const amount = parseAmount(normalizedRow[amountHeader]);
          if (amount > 0) {
            credit = amount;
          } else {
            debit = Math.abs(amount);
          }
        }

        // Get balance or calculate
        let balance = runningBalance;
        if (balanceHeader && normalizedRow[balanceHeader]) {
          balance = parseAmount(normalizedRow[balanceHeader]);
          runningBalance = balance;
        } else {
          runningBalance = runningBalance + credit - debit;
          balance = runningBalance;
        }

        // Skip rows with no transaction amount
        if (debit === 0 && credit === 0) {
          continue;
        }

        transactions.push({
          date,
          description,
          debit: debit > 0 ? debit : null,
          credit: credit > 0 ? credit : null,
          balance,
          category: 'Uncategorized',
          job_id: '', // Will be set by caller
        });
      } catch (error) {
        console.error('Error parsing row:', error);
        // Skip invalid rows
      }
    }

    if (transactions.length === 0) {
      throw new Error('No valid transactions found in Excel file');
    }

    console.log(`Successfully parsed ${transactions.length} transactions from Excel`);
    return transactions;
  } catch (error) {
    console.error('Excel parsing error:', error);
    throw error;
  }
};

// Export for backward compatibility
export const parseExcelToTransactions = parseExcel;