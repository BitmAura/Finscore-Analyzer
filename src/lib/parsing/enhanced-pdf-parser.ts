import * as pdfParse from 'pdf-parse';
const pdfParseFunction = (pdfParse as any).default || pdfParse;

// Remove test file reference that doesn't exist

export interface PDFParseResult {
  text: string;
  pages: number;
  metadata: any;
  transactions: any[];
}

export interface PDFPasswordOptions {
  password?: string;
  tryCommonPasswords?: boolean;
  enableOCRFallback?: boolean; // if true, attempt OCR when text extraction fails
}

/**
 * Common password patterns for Indian bank statements
 */
const COMMON_PASSWORDS = [
  // Date formats
  '01012024', '01012025', '31032024', '31032025',
  '01/01/2024', '31/03/2024', '01/01/2025', '31/03/2025',
  '2024', '2025',
  // Account related
  '1234', '12345', '123456',
  // PAN card format placeholders (real PANs vary) — keep generic samples
  'AAAA1111A', 'BBBB2222B',
  // Default passwords
  'password', 'Password', '123456789',
  'bank', 'Bank', 'statement', 'Statement'
];

/**
 * Try to decrypt PDF with password
 */
async function tryDecryptPDF(buffer: Buffer, password: string): Promise<PDFParseResult | null> {
  try {
    const options: any = {
      password: password,
    };

    const data: any = await pdfParseFunction(buffer, options);

    return {
      text: data.text || '',
      pages: data.numpages || (data.numpages === 0 ? 0 : (data.numPages || 0)),
      metadata: data.info || {},
      transactions: [] // Will be parsed separately
    };
  } catch (error) {
    // don't spam logs in production; keep for debugging
    console.log(`Failed to decrypt with password: ${password}. Error: ${(error as any)?.message || String(error)}`);
    return null;
  }
}

/**
 * Attempt OCR fallback using tesseract.js dynamically (only if enabled)
 */
async function performOCRFallback(buffer: Buffer): Promise<string> {
  try {
    // dynamic import to avoid forcing heavy dependency on every environment
    const mod: any = await import('tesseract.js');
    const createWorker = mod.createWorker || mod.default?.createWorker || mod.createWorker;
    // worker typed as any to avoid strict typing issues with dynamic import
    const worker: any = createWorker({ logger: (_m: any) => { /* optional progress */ } });
    await worker.load();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    const { data } = await worker.recognize(buffer);
    await worker.terminate();
    return data?.text || '';
  } catch (err) {
    console.warn('OCR fallback failed or tesseract.js not available:', (err as any)?.message || String(err));
    return '';
  }
}

/**
 * Extract text from PDF buffer with password support and optional OCR fallback
 */
export async function parsePDFWithPassword(
  input: Buffer | Uint8Array | string,
  options: PDFPasswordOptions = {}
): Promise<PDFParseResult> {
  const { password, tryCommonPasswords = true, enableOCRFallback = false } = options;

  // normalize buffer
  const buffer = Buffer.isBuffer(input) ? input : Buffer.from(input as any);

  // Try provided password first
  if (password) {
    const result = await tryDecryptPDF(buffer, password);
    if (result) {
      return result;
    }
  }

  // Try common passwords if enabled
  if (tryCommonPasswords) {
    for (const commonPassword of COMMON_PASSWORDS) {
      const result = await tryDecryptPDF(buffer, commonPassword);
      if (result) {
        console.log(`Successfully decrypted PDF with common password: ${commonPassword}`);
        return result;
      }
    }
  }

  // Try without password (for non-protected PDFs)
  try {
    const data: any = await pdfParseFunction(buffer);
    const text = data.text || '';
    if (!text || text.trim().length === 0) {
      throw new Error('No text after parse');
    }

    return {
      text,
      pages: data.numpages || (data.numPages || 0),
      metadata: data.info || {},
      transactions: []
    };
  } catch (error) {
    // If OCR fallback enabled, try OCR
    if (enableOCRFallback) {
      const ocrText = await performOCRFallback(buffer);
      if (ocrText && ocrText.trim().length > 0) {
        return {
          text: ocrText,
          pages: 0,
          metadata: {},
          transactions: []
        };
      }
    }

    throw new Error(`Failed to parse PDF. This could be a password-protected file. Please provide the correct password. Error: ${(error as any)?.message || String(error)}`);
  }
}

/**
 * Parse bank statement text to extract transactions
 */
export function parseBankStatementText(text: string): any[] {
  const transactions: any[] = [];
  const lines = text.split('\n');

  console.log(`Parsing ${lines.length} lines of PDF text`);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Skip empty lines
    if (!line) continue;

    // Look for date patterns (DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD)
    const datePattern = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}|\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/;
    const dateMatch = line.match(datePattern);

    if (dateMatch) {
      const dateStr = dateMatch[1];
      const date = parseDate(dateStr);

      if (date) {
        // Look for amount patterns in the same line or nearby lines
        const amountPattern = /(\d+(?:,\d{3})*(?:\.\d{2})?|\d+(?:\.\d{2})?)/g;
        const amounts = line.match(amountPattern);

        if (amounts && amounts.length >= 1) {
          // Try to identify debit vs credit
          let debit = null;
          let credit = null;
          let balance = null;

          // Look for amounts in the line
          const numericAmounts = amounts
            .map(a => parseFloat(a.replace(/,/g, '')))
            .filter(a => !isNaN(a) && a > 0);

          if (numericAmounts.length >= 1) {
            // Simple heuristic: first amount is debit, second is credit, third is balance
            if (numericAmounts.length >= 3) {
              debit = numericAmounts[0];
              credit = numericAmounts[1];
              balance = numericAmounts[2];
            } else if (numericAmounts.length === 2) {
              // Check if second amount is much larger (likely balance)
              if (numericAmounts[1] > numericAmounts[0] * 2) {
                debit = numericAmounts[0];
                balance = numericAmounts[1];
              } else {
                debit = numericAmounts[0];
                credit = numericAmounts[1];
              }
            } else {
              // Single amount - need to determine if debit or credit
              // Look for keywords in the description
              const lowerLine = line.toLowerCase();
              if (lowerLine.includes('dr') || lowerLine.includes('debit') || lowerLine.includes('withdrawal')) {
                debit = numericAmounts[0];
              } else if (lowerLine.includes('cr') || lowerLine.includes('credit') || lowerLine.includes('deposit')) {
                credit = numericAmounts[0];
              } else {
                // Default to debit for expenses
                debit = numericAmounts[0];
              }
            }
          }

          // Extract description (everything between date and amounts)
          const afterDate = line.substring(line.indexOf(dateStr) + dateStr.length).trim();
          const description = afterDate.replace(amountPattern, '').trim();

          if (description || debit || credit) {
            transactions.push({
              date: date.toISOString(),
              description: description || 'Transaction',
              debit: debit,
              credit: credit,
              balance: balance,
              source: 'pdf'
            });
          }
        }
      }
    }
  }

  console.log(`Extracted ${transactions.length} transactions from PDF`);
  return transactions;
}

/**
 * Parse date string in various formats
 */
function parseDate(dateStr: string): Date | null {
  try {
    // Handle DD/MM/YYYY
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
      }
    }

    // Handle DD-MM-YYYY
    if (dateStr.includes('-')) {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
      }
    }

    // Handle YYYY-MM-DD
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return new Date(dateStr);
    }

    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Main PDF parsing function
 */
export async function parsePDFStatement(
  buffer: Buffer | Uint8Array | string,
  options: PDFPasswordOptions = {}
): Promise<any[]> {
  console.log('Starting PDF parsing with password support');

  // First extract text from PDF
  const pdfResult = await parsePDFWithPassword(buffer, options);

  if (!pdfResult.text) {
    throw new Error('No text content found in PDF');
  }

  // Then parse transactions from text
  const transactions = parseBankStatementText(pdfResult.text);

  console.log(`PDF parsing complete: ${transactions.length} transactions extracted`);
  return transactions;
}

// Export alias for backward compatibility: provide a function named EnhancedPDFParser (used in some services)
export async function EnhancedPDFParser(input: Buffer | Uint8Array | string): Promise<any[]> {
  // default options: try common passwords and enable OCR fallback only when explicitly set in other code paths
  return parsePDFStatement(input, { tryCommonPasswords: true, enableOCRFallback: false });
}

// Default export as a callable function to match older call sites
export default EnhancedPDFParser;

// Also keep named export for backward compatibility
export { parsePDFStatement as enhancedPDFParser };