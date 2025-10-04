'use server'

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Bank detection patterns for Indian banks
const BANK_DETECTION_PATTERNS = {
  SBI: {
    name: "State Bank of India",
    patterns: [
      /state bank of india/i,
      /SBI/,
      /www\.onlinesbi\.com/i
    ],
    accountPattern: /A\/c\s*no\s*:?\s*([0-9]+)/i
  },
  HDFC: {
    name: "HDFC Bank",
    patterns: [
      /hdfc bank/i,
      /www\.hdfcbank\.com/i,
      /HDFC BANK LIMITED/i
    ],
    accountPattern: /account\s*no\s*\.?\s*:?\s*([A-Z0-9]+)/i
  },
  ICICI: {
    name: "ICICI Bank",
    patterns: [
      /icici bank/i,
      /www\.icicibank\.com/i
    ],
    accountPattern: /account\s*number\s*:?\s*([0-9]+)/i
  },
  AXIS: {
    name: "Axis Bank",
    patterns: [
      /axis bank/i,
      /www\.axisbank\.com/i
    ],
    accountPattern: /account\s*no\s*:?\s*([0-9]+)/i
  },
  KOTAK: {
    name: "Kotak Mahindra Bank",
    patterns: [
      /kotak mahindra bank/i,
      /www\.kotak\.com/i
    ],
    accountPattern: /account\s*number\s*:?\s*([0-9]+)/i
  },
  YES: {
    name: "Yes Bank",
    patterns: [
      /yes bank/i,
      /www\.yesbank\.in/i
    ],
    accountPattern: /account\s*no\s*:?\s*([0-9]+)/i
  },
  IDFC: {
    name: "IDFC First Bank",
    patterns: [
      /idfc first bank/i,
      /www\.idfcfirstbank\.com/i
    ],
    accountPattern: /account\s*number\s*:?\s*([0-9]+)/i
  },
  PNB: {
    name: "Punjab National Bank",
    patterns: [
      /punjab national bank/i,
      /www\.pnbindia\.in/i
    ],
    accountPattern: /account\s*no\s*:?\s*([0-9]+)/i
  },
  INDUSIND: {
    name: "IndusInd Bank",
    patterns: [
      /indusind bank/i,
      /www\.indusind\.com/i
    ],
    accountPattern: /account\s*no\s*:?\s*([0-9]+)/i
  }
};

// Function to detect bank from text content
function detectBankFromContent(text: string) {
  for (const [bankCode, bankInfo] of Object.entries(BANK_DETECTION_PATTERNS)) {
    for (const pattern of bankInfo.patterns) {
      if (pattern.test(text)) {
        let accountNumber = "Unknown";
        let accountName = "Unknown";

        // Try to extract account number
        const accountMatch = text.match(bankInfo.accountPattern);
        if (accountMatch && accountMatch[1]) {
          accountNumber = accountMatch[1];
        }

        // Try to extract account holder name (generic pattern)
        const nameMatch = text.match(/name\s*:?\s*([A-Za-z\s\.]+)/i);
        if (nameMatch && nameMatch[1]) {
          accountName = nameMatch[1].trim();
        }

        return {
          bank_code: bankCode,
          bank_name: bankInfo.name,
          account_number: accountNumber,
          account_name: accountName
        };
      }
    }
  }

  return {
    bank_code: "UNKNOWN",
    bank_name: "Unknown Bank",
    account_number: "Unknown",
    account_name: "Unknown"
  };
}

export async function POST(request: NextRequest) {
  // Initialize Supabase server client
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  try {
    // Verify authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse form data
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    const results: any[] = [];

    for (const file of files) {
      // For PDF files, we'd normally use a PDF parser library
      // For this example, we'll simulate bank detection based on filename
      let detectedBank;

      if (file.type === 'application/pdf') {
        // In a real implementation, this would extract text from the PDF
        // For now, we'll simulate detection based on the filename
        const fileName = file.name.toLowerCase();

        if (fileName.includes('sbi')) {
          detectedBank = {
            bank_code: "SBI",
            bank_name: "State Bank of India",
            account_number: "XXXX1234",
            account_name: "Sample Account"
          };
        } else if (fileName.includes('hdfc')) {
          detectedBank = {
            bank_code: "HDFC",
            bank_name: "HDFC Bank",
            account_number: "XXXX5678",
            account_name: "Sample Account"
          };
        } else if (fileName.includes('icici')) {
          detectedBank = {
            bank_code: "ICICI",
            bank_name: "ICICI Bank",
            account_number: "XXXX9012",
            account_name: "Sample Account"
          };
        } else {
          detectedBank = {
            bank_code: "UNKNOWN",
            bank_name: "Unknown Bank",
            account_number: "Unknown",
            account_name: "Unknown"
          };
        }
      } else if (file.type === 'text/csv' || file.type === 'application/vnd.ms-excel' ||
                file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        // For CSV/Excel files - in real implementation we would parse the file content
        // Here we're simulating detection based on filename
        const fileName = file.name.toLowerCase();
        detectedBank = detectBankFromContent(fileName);
      } else {
        detectedBank = {
          bank_code: "UNKNOWN",
          bank_name: "Unknown Bank",
          account_number: "Unknown",
          account_name: "Unknown"
        };
      }

      // Store file in Supabase Storage
      const fileName = `${user.id}/${Date.now()}-${file.name}`;
      const { data: fileData, error: fileError } = await supabase.storage
        .from('documents')
        .upload(fileName, file);

      if (fileError) {
        console.error('Error uploading file:', fileError);
        results.push({
          fileName: file.name,
          error: 'Failed to upload file',
          ...detectedBank
        });
        continue;
      }

      // Store document record in the database
      const { data: documentData, error: documentError } = await supabase
        .from('documents')
        .insert({
          user_id: user.id,
          name: file.name,
          file_path: fileName,
          file_type: file.type,
          file_size: file.size,
          detected_bank: detectedBank.bank_name,
          status: 'uploaded'
        })
        .select()
        .single();

      if (documentError) {
        console.error('Error storing document record:', documentError);
      }

      // Add document to results
      results.push({
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        documentId: documentData?.id || null,
        ...detectedBank,
        currency: 'INR', // Default for Indian banks
        status: 'detected'
      });
    }

    return NextResponse.json({
      success: true,
      accounts: results
    });

  } catch (error: any) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
