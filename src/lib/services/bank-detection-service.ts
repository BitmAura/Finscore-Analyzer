/**
 * Bank Detection Service
 * Identifies bank names, account types, and business/personal classification
 */

export interface BankDetectionResult {
  bankName: string;
  confidence: number;
  accountType: 'personal' | 'business' | 'joint' | 'unknown';
  accountNumber?: string;
  branch?: string;
  ifsc?: string;
  isBusinessAccount: boolean;
  businessIndicators: string[];
  personalIndicators: string[];
}

/**
 * Bank patterns for detection
 */
const BANK_PATTERNS = {
  'HDFC Bank': {
    patterns: ['HDFC', 'HDFC BANK', 'H D F C', 'Housing Development Finance Corporation'],
    accountTypes: ['personal', 'business', 'joint'],
    ifscPrefix: 'HDFC'
  },
  'ICICI Bank': {
    patterns: ['ICICI', 'ICICI BANK', 'I C I C I', 'Industrial Credit and Investment Corporation of India'],
    accountTypes: ['personal', 'business', 'joint'],
    ifscPrefix: 'ICIC'
  },
  'State Bank of India': {
    patterns: ['SBI', 'STATE BANK OF INDIA', 'S B I', 'State Bank'],
    accountTypes: ['personal', 'business', 'joint'],
    ifscPrefix: 'SBIN'
  },
  'Axis Bank': {
    patterns: ['AXIS', 'AXIS BANK', 'A X I S'],
    accountTypes: ['personal', 'business', 'joint'],
    ifscPrefix: 'UTIB'
  },
  'Kotak Mahindra Bank': {
    patterns: ['KOTAK', 'KOTAK MAHINDRA', 'KMB', 'Kotak Bank'],
    accountTypes: ['personal', 'business', 'joint'],
    ifscPrefix: 'KKBK'
  },
  'Punjab National Bank': {
    patterns: ['PNB', 'PUNJAB NATIONAL BANK', 'P N B'],
    accountTypes: ['personal', 'business', 'joint'],
    ifscPrefix: 'PUNB'
  },
  'Bank of Baroda': {
    patterns: ['BOB', 'BANK OF BARODA', 'B O B', 'BoB'],
    accountTypes: ['personal', 'business', 'joint'],
    ifscPrefix: 'BARB'
  },
  'Canara Bank': {
    patterns: ['CANARA', 'CANARA BANK'],
    accountTypes: ['personal', 'business', 'joint'],
    ifscPrefix: 'CNRB'
  },
  'Union Bank of India': {
    patterns: ['UNION', 'UNION BANK', 'UBI', 'Union Bank of India'],
    accountTypes: ['personal', 'business', 'joint'],
    ifscPrefix: 'UBIN'
  },
  'Indian Bank': {
    patterns: ['INDIAN', 'INDIAN BANK', 'Indian Bank'],
    accountTypes: ['personal', 'business', 'joint'],
    ifscPrefix: 'IDIB'
  }
};

/**
 * Business indicators for account classification
 */
const BUSINESS_INDICATORS = [
  'PVT LTD', 'PRIVATE LIMITED', 'LTD', 'LIMITED',
  'CORPORATION', 'CORP', 'INC', 'INCORPORATED',
  'ENTERPRISES', 'ENTERPRISE', 'TRADING', 'TRADE',
  'INDUSTRIES', 'INDUSTRY', 'MANUFACTURING', 'MFG',
  'SERVICES', 'SERVICE', 'SOLUTIONS', 'SOLUTION',
  'TECHNOLOGIES', 'TECHNOLOGY', 'TECH', 'SOFTWARE',
  'CONSULTANCY', 'CONSULTANT', 'CONSULTING',
  'RETAIL', 'WHOLESALE', 'DISTRIBUTOR', 'DISTRIBUTION',
  'AGENCY', 'AGENT', 'DEALER', 'DEALERSHIP',
  'HOSPITAL', 'CLINIC', 'MEDICAL', 'HEALTHCARE',
  'EDUCATION', 'EDUCATIONAL', 'SCHOOL', 'COLLEGE',
  'HOTEL', 'RESTAURANT', 'FOOD', 'BEVERAGE',
  'CONSTRUCTION', 'BUILDER', 'DEVELOPER',
  'TRANSPORT', 'LOGISTICS', 'SHIPPING',
  'FINANCE', 'FINANCIAL', 'INVESTMENT',
  'INSURANCE', 'BROKER', 'BROKERAGE',
  'REAL ESTATE', 'PROPERTY', 'PROPERTIES',
  'AGRICULTURE', 'FARM', 'FARMING',
  'TEXTILE', 'GARMENT', 'CLOTHING',
  'PHARMACEUTICAL', 'PHARMA', 'DRUG',
  'AUTOMOBILE', 'AUTO', 'VEHICLE',
  'JEWELLERY', 'JEWELRY', 'GOLD',
  'ELECTRONICS', 'ELECTRICAL', 'APPLIANCE'
];

/**
 * Personal indicators for account classification
 */
const PERSONAL_INDICATORS = [
  'SALARY', 'INCOME', 'PERSONAL', 'INDIVIDUAL',
  'HOUSEHOLD', 'FAMILY', 'HOME', 'RESIDENTIAL',
  'SAVINGS', 'CURRENT', 'SALARY ACCOUNT',
  'JOINT ACCOUNT', 'SINGLE ACCOUNT'
];

/**
 * Detect bank from text content
 */
export function detectBank(text: string): { bankName: string; confidence: number } {
  const upperText = text.toUpperCase();
  let bestMatch = { bankName: 'Unknown Bank', confidence: 0 };

  for (const [bankName, config] of Object.entries(BANK_PATTERNS)) {
    for (const pattern of config.patterns) {
      const patternUpper = pattern.toUpperCase();
      const occurrences = (upperText.match(new RegExp(patternUpper, 'g')) || []).length;

      if (occurrences > 0) {
        // Calculate confidence based on pattern matches and length
        const confidence = Math.min(95, (occurrences * 20) + (pattern.length * 2));

        if (confidence > bestMatch.confidence) {
          bestMatch = { bankName, confidence };
        }
      }
    }
  }

  // If confidence is too low, return unknown
  if (bestMatch.confidence < 30) {
    bestMatch.bankName = 'Unknown Bank';
    bestMatch.confidence = 0;
  }

  return bestMatch;
}

/**
 * Detect account type from text content
 */
export function detectAccountType(text: string): 'personal' | 'business' | 'joint' | 'unknown' {
  const upperText = text.toUpperCase();

  // Check for business indicators
  const businessScore = BUSINESS_INDICATORS.reduce((score, indicator) => {
    if (upperText.includes(indicator)) {
      return score + 1;
    }
    return score;
  }, 0);

  // Check for personal indicators
  const personalScore = PERSONAL_INDICATORS.reduce((score, indicator) => {
    if (upperText.includes(indicator)) {
      return score + 1;
    }
    return score;
  }, 0);

  // Check for joint account indicators
  const jointIndicators = ['JOINT', 'AND', '&', 'MR AND MRS', 'HUSBAND AND WIFE'];
  const jointScore = jointIndicators.reduce((score, indicator) => {
    if (upperText.includes(indicator)) {
      return score + 1;
    }
    return score;
  }, 0);

  // Determine account type based on scores
  if (jointScore > 0) {
    return 'joint';
  }

  if (businessScore > personalScore) {
    return 'business';
  }

  if (personalScore > 0) {
    return 'personal';
  }

  return 'unknown';
}

/**
 * Extract account number from text
 */
export function extractAccountNumber(text: string): string | undefined {
  // Common account number patterns
  const patterns = [
    /A\/C\s*NO[\s:]*([\d-]+)/i,
    /ACCOUNT\s*NO[\s:]*([\d-]+)/i,
    /A\/C\s*([\d-]+)/i,
    /ACCOUNT\s*([\d-]+)/i,
    /ACC\s*NO[\s:]*([\d-]+)/i,
    /AC\s*([\d-]+)/i,
    // Direct number patterns (12-18 digits)
    /\b(\d{12,18})\b/g
  ];

  for (const pattern of patterns) {
    const matches = text.match(pattern);
    if (matches && matches[1]) {
      return matches[1].replace(/[-\s]/g, '');
    }
  }

  return undefined;
}

/**
 * Extract IFSC code from text
 */
export function extractIFSC(text: string): string | undefined {
  // IFSC pattern: 4 letters + 7 digits (e.g., HDFC0001234)
  const ifscPattern = /\b([A-Z]{4}[0-9]{7})\b/g;
  const matches = text.match(ifscPattern);

  if (matches) {
    return matches[0];
  }

  return undefined;
}

/**
 * Extract branch information
 */
export function extractBranch(text: string): string | undefined {
  const branchPatterns = [
    /BRANCH[\s:]*([^\n\r]+)/i,
    /BRANCH\s*-\s*([^\n\r]+)/i,
    /BRANCH\s*NAME[\s:]*([^\n\r]+)/i,
  ];

  for (const pattern of branchPatterns) {
    const matches = text.match(pattern);
    if (matches && matches[1]) {
      return matches[1].trim();
    }
  }

  return undefined;
}

/**
 * Main bank detection function
 */
export function detectBankDetails(text: string): BankDetectionResult {
  const bankInfo = detectBank(text);
  const accountType = detectAccountType(text);
  const accountNumber = extractAccountNumber(text);
  const ifsc = extractIFSC(text);
  const branch = extractBranch(text);

  // Calculate business indicators
  const upperText = text.toUpperCase();
  const businessIndicators = BUSINESS_INDICATORS.filter(indicator =>
    upperText.includes(indicator)
  );

  const personalIndicators = PERSONAL_INDICATORS.filter(indicator =>
    upperText.includes(indicator)
  );

  return {
    bankName: bankInfo.bankName,
    confidence: bankInfo.confidence,
    accountType,
    accountNumber,
    branch,
    ifsc,
    isBusinessAccount: accountType === 'business',
    businessIndicators,
    personalIndicators
  };
}

/**
 * Detect bank from filename
 */
export function detectBankFromFilename(filename: string): { bankName: string; confidence: number } {
  const upperFilename = filename.toUpperCase();

  // Check for bank names in filename
  for (const [bankName, config] of Object.entries(BANK_PATTERNS)) {
    for (const pattern of config.patterns) {
      if (upperFilename.includes(pattern.toUpperCase())) {
        return { bankName, confidence: 80 }; // High confidence for filename matches
      }
    }
  }

  return { bankName: 'Unknown Bank', confidence: 0 };
}

/**
 * Get bank logo URL (placeholder for future implementation)
 */
export function getBankLogoUrl(bankName: string): string {
  const logoMap: { [key: string]: string } = {
    'HDFC Bank': '/bank-logos/hdfc.png',
    'ICICI Bank': '/bank-logos/icici.png',
    'State Bank of India': '/bank-logos/sbi.png',
    'Axis Bank': '/bank-logos/axis.png',
    'Kotak Mahindra Bank': '/bank-logos/kotak.png',
    'Punjab National Bank': '/bank-logos/pnb.png',
    'Bank of Baroda': '/bank-logos/bob.png',
    'Canara Bank': '/bank-logos/canara.png',
  };

  return logoMap[bankName] || '/bank-logos/default.png';
}

export default {
  detectBankDetails,
  detectBank,
  detectAccountType,
  detectBankFromFilename,
  extractAccountNumber,
  extractIFSC,
  extractBranch,
  getBankLogoUrl,
  BANK_PATTERNS,
  BUSINESS_INDICATORS,
  PERSONAL_INDICATORS,
};