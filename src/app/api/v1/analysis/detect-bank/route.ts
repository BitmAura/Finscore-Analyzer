import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import pdf from 'pdf-parse';

// Indian bank patterns for detection
const BANK_PATTERNS = {
  SBI: {
    patterns: [/state bank of india/i, /sbi/i],
    accountPattern: /account\s*(?:no|number)[:\s]*(\d{11,17})/i,
  },
  HDFC: {
    patterns: [/hdfc\s*bank/i],
    accountPattern: /account\s*(?:no|number)[:\s]*(\d{14})/i,
  },
  ICICI: {
    patterns: [/icici\s*bank/i],
    accountPattern: /account\s*(?:no|number)[:\s]*(\d{12})/i,
  },
  AXIS: {
    patterns: [/axis\s*bank/i],
    accountPattern: /account\s*(?:no|number)[:\s]*(\d{16})/i,
  },
  KOTAK: {
    patterns: [/kotak\s*mahindra/i],
    accountPattern: /account\s*(?:no|number)[:\s]*(\d{16})/i,
  },
  PNB: {
    patterns: [/punjab\s*national\s*bank/i, /pnb/i],
    accountPattern: /account\s*(?:no|number)[:\s]*(\d{11,16})/i,
  },
  BOB: {
    patterns: [/bank\s*of\s*baroda/i],
    accountPattern: /account\s*(?:no|number)[:\s]*(\d{14})/i,
  },
  CANARA: {
    patterns: [/canara\s*bank/i],
    accountPattern: /account\s*(?:no|number)[:\s]*(\d{15})/i,
  },
  UNION: {
    patterns: [/union\s*bank/i],
    accountPattern: /account\s*(?:no|number)[:\s]*(\d{14})/i,
  },
  IDBI: {
    patterns: [/idbi\s*bank/i],
    accountPattern: /account\s*(?:no|number)[:\s]*(\d{14})/i,
  },
};

// Detect bank from PDF text
function detectBank(text: string): string | null {
  for (const [bankName, config] of Object.entries(BANK_PATTERNS)) {
    for (const pattern of config.patterns) {
      if (pattern.test(text)) {
        return bankName;
      }
    }
  }
  return null;
}

// Extract account number
function extractAccountNumber(text: string, bankName: string | null): string | null {
  if (!bankName || !BANK_PATTERNS[bankName as keyof typeof BANK_PATTERNS]) {
    // Try generic pattern
    const match = text.match(/account\s*(?:no|number)[:\s]*(\d{10,17})/i);
    return match ? match[1] : null;
  }

  const pattern = BANK_PATTERNS[bankName as keyof typeof BANK_PATTERNS].accountPattern;
  const match = text.match(pattern);
  return match ? match[1] : null;
}

// Extract account holder name
function extractAccountHolder(text: string): string | null {
  const patterns = [
    /name[:\s]+([A-Z\s]{3,50})/i,
    /account\s*holder[:\s]+([A-Z\s]{3,50})/i,
    /customer\s*name[:\s]+([A-Z\s]{3,50})/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }
  return null;
}

// Extract statement period
function extractStatementPeriod(text: string): { start: string | null; end: string | null } {
  const periodPattern = /statement\s*period[:\s]*(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})\s*to\s*(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/i;
  const match = text.match(periodPattern);

  if (match) {
    return {
      start: match[1],
      end: match[2],
    };
  }

  return { start: null, end: null };
}

// Detect account type
function detectAccountType(text: string): string {
  if (/savings\s*account/i.test(text)) return 'savings';
  if (/current\s*account/i.test(text)) return 'current';
  if (/credit\s*card/i.test(text)) return 'credit-card';
  if (/loan\s*account/i.test(text)) return 'loan';
  return 'other';
}

// Main API handler
export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();

    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse PDF
    let pdfData;
    try {
      pdfData = await pdf(buffer);
    } catch (error) {
      return NextResponse.json({
        error: 'Failed to parse PDF. It might be password protected or corrupted.',
        needsPassword: true
      }, { status: 400 });
    }

    const text = pdfData.text;

    // Extract metadata
    const bankName = detectBank(text);
    const accountNumber = extractAccountNumber(text, bankName);
    const accountHolder = extractAccountHolder(text);
    const accountType = detectAccountType(text);
    const period = extractStatementPeriod(text);

    // Detect if multiple accounts in same file
    const accountMatches = text.match(/account\s*(?:no|number)[:\s]*(\d{10,17})/gi);
    const hasMultipleAccounts = accountMatches && accountMatches.length > 1;

    // Return extracted metadata
    return NextResponse.json({
      success: true,
      metadata: {
        fileName: file.name,
        fileSize: file.size,
        bankName: bankName || 'Unknown Bank',
        accountNumber: accountNumber || 'Not detected',
        accountHolder: accountHolder || 'Not detected',
        accountType,
        statementPeriod: {
          start: period.start || 'Not detected',
          end: period.end || 'Not detected',
        },
        hasMultipleAccounts,
        totalPages: pdfData.numpages,
        confidence: bankName ? 'high' : 'low',
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error in bank detection:', error);
    return NextResponse.json({
      error: error.message || 'Failed to analyze document'
    }, { status: 500 });
  }
}
