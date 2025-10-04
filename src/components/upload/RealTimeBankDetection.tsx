import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PDFDocument } from 'pdf-lib';

// Bank detection patterns for major Indian banks
const BANK_PATTERNS = {
  SBI: {
    name: "State Bank of India",
    patterns: ["state bank of india", "sbi", "onlinesbi"],
    color: "#2e6fb2"
  },
  HDFC: {
    name: "HDFC Bank",
    patterns: ["hdfc bank", "hdfc"],
    color: "#004c8f"
  },
  ICICI: {
    name: "ICICI Bank",
    patterns: ["icici bank", "icici"],
    color: "#f58220"
  },
  AXIS: {
    name: "Axis Bank",
    patterns: ["axis bank", "axis"],
    color: "#97144d"
  },
  PNB: {
    name: "Punjab National Bank",
    patterns: ["punjab national bank", "pnb"],
    color: "#342378"
  },
  BOI: {
    name: "Bank of India",
    patterns: ["bank of india", "boi"],
    color: "#ff0000"
  },
  CANARA: {
    name: "Canara Bank",
    patterns: ["canara bank", "canara"],
    color: "#1a75bc"
  },
  YES: {
    name: "Yes Bank",
    patterns: ["yes bank"],
    color: "#0060aa"
  },
  IDFC: {
    name: "IDFC First Bank",
    patterns: ["idfc first bank", "idfc"],
    color: "#fa6e37"
  },
  KOTAK: {
    name: "Kotak Mahindra Bank",
    patterns: ["kotak mahindra", "kotak"],
    color: "#e41f26"
  },
  INDUSIND: {
    name: "IndusInd Bank",
    patterns: ["indusind"],
    color: "#632b8f"
  }
};

// Extract account details patterns
const ACCOUNT_PATTERNS = {
  accountNumber: [
    /a\/c\s*(?:no|num|number)?[:. ]*([A-Z0-9]{4,})/i,
    /account\s*(?:no|num|number)?[:. ]*([A-Z0-9]{4,})/i,
    /(?:no|num|number)?[:. ]*([0-9]{9,})/i
  ],
  accountName: [
    /name\s*(?:of\s*(?:the\s*)?account\s*holder)?[:. ]*([A-Za-z\s.]+?)(?:\r|\n|,)/i,
    /customer\s*name[:. ]*([A-Za-z\s.]+?)(?:\r|\n|,)/i,
    /account\s*holder[:. ]*([A-Za-z\s.]+?)(?:\r|\n|,)/i
  ],
  ifsc: [
    /IFSC\s*(?:code)?[:. ]*([A-Z0-9]{11})/i,
    /IFS\s*(?:code)?[:. ]*([A-Z0-9]{11})/i
  ],
  period: [
    /period[:. ]*([\d]{1,2}[\/\-\.][\d]{1,2}[\/\-\.][\d]{2,4})\s*(?:to|till|-)\s*([\d]{1,2}[\/\-\.][\d]{1,2}[\/\-\.][\d]{2,4})/i,
    /statement\s*(?:for|from)\s*([\d]{1,2}[\/\-\.][\d]{1,2}[\/\-\.][\d]{2,4})\s*(?:to|till|-)\s*([\d]{1,2}[\/\-\.][\d]{1,2}[\/\-\.][\d]{2,4})/i
  ]
};

interface DetectedBankInfo {
  bankCode: string;
  bankName: string;
  bankColor: string;
  accountNumber: string;
  accountName: string;
  ifsc?: string;
  startDate?: string;
  endDate?: string;
  confidence: number;
  processingStatus: 'processing' | 'completed' | 'error';
  extractedText?: string;
}

interface RealTimeBankDetectionProps {
  files: File[];
  passwords: Record<string, string>;
  onDetectionComplete: (detectedInfo: DetectedBankInfo[]) => void;
  className?: string;
}

const RealTimeBankDetection: React.FC<RealTimeBankDetectionProps> = ({
  files,
  passwords,
  onDetectionComplete,
  className = ''
}) => {
  const [detectedBanks, setDetectedBanks] = useState<Record<string, DetectedBankInfo>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const processedCount = useRef(0);

  const detectBankFromText = useCallback((text: string, fileName: string): DetectedBankInfo => {
    const lowerText = text.toLowerCase();
    let detectedBank: DetectedBankInfo = {
      bankCode: "UNKNOWN",
      bankName: "Unknown Bank",
      bankColor: "#888888",
      accountNumber: "Not detected",
      accountName: "Not detected",
      confidence: 0,
      processingStatus: 'completed',
      extractedText: text.substring(0, 500) // Store first 500 chars for debugging
    };

    // Try to detect bank
    for (const [code, bank] of Object.entries(BANK_PATTERNS)) {
      const matchCount = bank.patterns.reduce((count, pattern) =>
        lowerText.includes(pattern) ? count + 1 : count, 0);

      if (matchCount > 0) {
        const confidence = (matchCount / bank.patterns.length) * 100;
        if (confidence > detectedBank.confidence) {
          detectedBank = {
            ...detectedBank,
            bankCode: code,
            bankName: bank.name,
            bankColor: bank.color,
            confidence: confidence
          };
        }
      }
    }

    // If filename has bank name, use it as backup
    if (detectedBank.bankCode === "UNKNOWN") {
      const fileNameLower = fileName.toLowerCase();
      for (const [code, bank] of Object.entries(BANK_PATTERNS)) {
        for (const pattern of bank.patterns) {
          if (fileNameLower.includes(pattern)) {
            detectedBank = {
              ...detectedBank,
              bankCode: code,
              bankName: bank.name,
              bankColor: bank.color,
              confidence: 50 // Lower confidence when based only on filename
            };
            break;
          }
        }
      }
    }

    // Extract account details
    for (const pattern of ACCOUNT_PATTERNS.accountNumber) {
      const match = text.match(pattern);
      if (match && match[1]) {
        detectedBank.accountNumber = match[1].trim();
        break;
      }
    }

    for (const pattern of ACCOUNT_PATTERNS.accountName) {
      const match = text.match(pattern);
      if (match && match[1]) {
        detectedBank.accountName = match[1].trim();
        break;
      }
    }

    for (const pattern of ACCOUNT_PATTERNS.ifsc) {
      const match = text.match(pattern);
      if (match && match[1]) {
        detectedBank.ifsc = match[1].trim();
        break;
      }
    }

    for (const pattern of ACCOUNT_PATTERNS.period) {
      const match = text.match(pattern);
      if (match && match[1] && match[2]) {
        detectedBank.startDate = match[1].trim();
        detectedBank.endDate = match[2].trim();
        break;
      }
    }

    return detectedBank;
  }, []);

  const extractTextFromPDF = useCallback(async (file: File, password?: string): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer, {
        ignoreEncryption: !password,
        ...(password ? { password } : {})
      });

      const pageCount = pdfDoc.getPageCount();
      let text = '';

      // For simplicity, we'll just extract text from the first page
      // In a real implementation, you'd use a full PDF text extraction library
      if (pageCount > 0) {
        // Extract text (simplified - in production use pdf.js or other full-featured parser)
        text = `PDF with ${pageCount} pages. Text extraction needs a specialized PDF parser.`;

        // For demo, use filename to simulate detection
        text += file.name;
      }

      return text;
    } catch (err) {
      const error = err as any;
      console.error('PDF extraction error:', error);
      const message = (error && (error.message || String(error))) || 'Unknown error';
      if (typeof message === 'string' && message.toLowerCase().includes('password')) {
        return 'PASSWORD_REQUIRED';
      }
      return `Error extracting text: ${message}`;
    }
  }, []);

  const processCSV = useCallback(async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target?.result as string || '');
      };
      reader.onerror = () => {
        resolve(`Error reading CSV file: ${file.name}`);
      };
      reader.readAsText(file);
    });
  }, []);

  const processFiles = useCallback(async () => {
    if (files.length === 0 || isProcessing) return;

    setIsProcessing(true);
    processedCount.current = 0;

    const results: Record<string, DetectedBankInfo> = {};

    await Promise.all(files.map(async (file, index) => {
      const fileId = `${index}-${file.name}`;

      // Set initial processing state
      results[fileId] = {
        bankCode: "PROCESSING",
        bankName: "Processing...",
        bankColor: "#888888",
        accountNumber: "Processing...",
        accountName: "Processing...",
        confidence: 0,
        processingStatus: 'processing'
      };
      setDetectedBanks(prev => ({ ...prev, [fileId]: results[fileId] }));

      try {
        let extractedText = '';

        if (file.type === 'application/pdf') {
          extractedText = await extractTextFromPDF(file, passwords[fileId]);

          if (extractedText === 'PASSWORD_REQUIRED') {
            results[fileId] = {
              ...results[fileId],
              bankName: "Password Required",
              processingStatus: 'error'
            };
            setDetectedBanks(prev => ({ ...prev, [fileId]: results[fileId] }));
            return;
          }
        }
        else if (file.type === 'text/csv' || file.name.toLowerCase().endsWith('.csv')) {
          extractedText = await processCSV(file);
        }
        else if (file.type.includes('excel') ||
                 file.name.toLowerCase().endsWith('.xls') ||
                 file.name.toLowerCase().endsWith('.xlsx')) {
          extractedText = `Excel file: ${file.name}`;
          // For full implementation, use an Excel parser library
        }
        else {
          extractedText = `Unsupported file type: ${file.name}`;
        }

        // Detect bank information
        const bankInfo = detectBankFromText(extractedText, file.name);
        results[fileId] = bankInfo;

      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
        results[fileId] = {
          bankCode: "ERROR",
          bankName: "Error Processing",
          bankColor: "#ff0000",
          accountNumber: "Error",
          accountName: "Error",
          confidence: 0,
          processingStatus: 'error'
        };
      }

      processedCount.current++;
      setDetectedBanks(prev => ({ ...prev, [fileId]: results[fileId] }));

      // If all files processed, notify parent
      if (processedCount.current === files.length) {
        setIsProcessing(false);
        onDetectionComplete(Object.values(results));
      }
    }));
  }, [files, passwords, isProcessing, detectBankFromText, extractTextFromPDF, processCSV, onDetectionComplete]);

  // Start processing when files change
  React.useEffect(() => {
    processFiles();
  }, [files, processFiles]);

  if (files.length === 0) {
    return null;
  }

  return (
    <div className={`${className} my-6`}>
      <h3 className="text-lg font-semibold mb-4">Detected Bank Statements</h3>

      <div className="space-y-4">
        {Object.entries(detectedBanks).map(([fileId, info]) => {
          const fileIndex = parseInt(fileId.split('-')[0]);
          const file = files[fileIndex];

          return (
            <motion.div
              key={fileId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border rounded-lg overflow-hidden"
              style={{
                borderColor: info.processingStatus === 'error' ? '#f56565' :
                             info.confidence > 70 ? info.bankColor : '#d1d5db',
                borderWidth: '1px'
              }}
            >
              <div className="p-4">
                <div className="flex justify-between">
                  <div className="flex items-center">
                    <div
                      className="w-10 h-10 flex items-center justify-center rounded-full mr-3"
                      style={{ backgroundColor: info.confidence > 50 ? `${info.bankColor}20` : '#f3f4f6' }}
                    >
                      {info.processingStatus === 'processing' ? (
                        <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin"
                             style={{ borderColor: `${info.bankColor}90`, borderTopColor: 'transparent' }}></div>
                      ) : info.processingStatus === 'error' ? (
                        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                      ) : (
                        <span className="font-bold text-lg" style={{ color: info.bankColor }}>
                          {info.bankCode !== "UNKNOWN" ? info.bankCode.substring(0, 1) : "?"}
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{file.name}</h4>
                      <p className="text-sm text-gray-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                  </div>

                  {info.confidence > 0 && (
                    <div className="text-sm font-medium" style={{ color: info.bankColor }}>
                      {Math.round(info.confidence)}% match
                    </div>
                  )}
                </div>

                {info.processingStatus === 'processing' ? (
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="h-2 rounded-full animate-pulse"
                           style={{ width: '60%', backgroundColor: info.bankColor }}></div>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Analyzing document...</p>
                  </div>
                ) : info.processingStatus === 'error' ? (
                  <div className="mt-3 text-sm text-red-600">
                    {info.bankName === "Password Required" ? (
                      <p>This PDF is password protected. Please provide the password to continue.</p>
                    ) : (
                      <p>There was an error processing this file. Please check the format and try again.</p>
                    )}
                  </div>
                ) : (
                  <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div>
                      <span className="text-gray-500">Bank:</span>
                      <p className="font-medium">{info.bankName}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Account Number:</span>
                      <p className="font-medium">{info.accountNumber}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Account Name:</span>
                      <p className="font-medium">{info.accountName}</p>
                    </div>
                    {info.ifsc && (
                      <div>
                        <span className="text-gray-500">IFSC Code:</span>
                        <p className="font-medium">{info.ifsc}</p>
                      </div>
                    )}
                    {info.startDate && info.endDate && (
                      <div className="col-span-2">
                        <span className="text-gray-500">Period:</span>
                        <p className="font-medium">{info.startDate} to {info.endDate}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default RealTimeBankDetection;
