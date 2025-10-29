/**
 * GST & ITR Analysis Service
 * Comprehensive analysis for business statements, GST returns, and ITR documents
 */

import type { Transaction } from '@/lib/parsing/transaction-parser';

// Helper functions to work with Transaction type
const getTransactionAmount = (t: Transaction): number => {
  if (t.credit && t.credit > 0) return t.credit;
  if (t.debit && t.debit > 0) return -t.debit;
  return 0;
};

const getAbsoluteAmount = (t: Transaction): number => {
  return Math.abs(getTransactionAmount(t));
};

const isCredit = (t: Transaction): boolean => {
  return (t.credit && t.credit > 0) || false;
};

const isDebit = (t: Transaction): boolean => {
  return (t.debit && t.debit > 0) || false;
};

export interface GSTAnalysis {
  // Basic GST Information
  gstin?: string;
  businessName?: string;
  businessType?: string; // Proprietorship, Partnership, Private Ltd, LLP
  registrationDate?: Date;
  
  // GST Payment Analysis
  gstPayments: {
    totalGSTPaid: number;
    monthlyAverage: number;
    consistency: 'regular' | 'irregular' | 'none';
    months: {
      month: string;
      cgst: number;
      sgst: number;
      igst: number;
      total: number;
    }[];
  };
  
  // Business Turnover Estimation
  turnoverEstimate: {
    estimatedMonthlyTurnover: number;
    estimatedAnnualTurnover: number;
    gstRatio: number; // GST paid / Estimated turnover
    confidence: number; // 0-100
  };
  
  // Compliance Analysis
  compliance: {
    regularFiling: boolean;
    missedMonths: string[];
    latePayments: number;
    penaltyPayments: number;
    complianceScore: number; // 0-100
  };
  
  // Input vs Output Analysis
  inputOutputAnalysis?: {
    inputGST: number;
    outputGST: number;
    netGST: number;
    refundsReceived: number;
  };
}

export interface ITRAnalysis {
  // ITR Filing Information
  filingStatus: 'filed' | 'not_filed' | 'unknown';
  assessmentYear?: string;
  itrType?: 'ITR-1' | 'ITR-2' | 'ITR-3' | 'ITR-4' | 'Unknown';
  
  // Income Declaration
  declaredIncome: {
    salaryIncome?: number;
    businessIncome?: number;
    capitalGains?: number;
    otherIncome?: number;
    totalIncome: number;
  };
  
  // Tax Payments from Statements
  taxPayments: {
    totalTDSDeducted: number;
    advanceTaxPaid: number;
    selfAssessmentTax: number;
    totalTaxPaid: number;
    refundsReceived: number;
  };
  
  // Income Verification
  verification: {
    bankStatementIncome: number;
    declaredIncome: number;
    variance: number; // Difference in %
    varianceFlag: 'match' | 'minor_difference' | 'major_difference';
    explanation?: string;
  };
  
  // Investment Analysis
  investments: {
    section80C: number; // PF, PPF, LIC, ELSS
    section80D: number; // Health insurance
    section80E: number; // Education loan interest
    section80G: number; // Donations
    totalDeductions: number;
  };
}

export interface BusinessStatementAnalysis {
  // Business Account Identification
  accountType: 'current' | 'cc_od' | 'savings_business' | 'unknown';
  
  // Vendor Analysis
  vendors: {
    name: string;
    totalPaid: number;
    frequency: number;
    averageTicket: number;
    category: string;
  }[];
  
  // Customer Analysis (Credit Receipts)
  customers: {
    name: string;
    totalReceived: number;
    frequency: number;
    averageTicket: number;
  }[];
  
  // Cash Flow Analysis
  cashFlow: {
    operatingCashFlow: number;
    investingCashFlow: number;
    financingCashFlow: number;
    freeCashFlow: number;
    burnRate: number; // For startups
  };
  
  // Working Capital
  workingCapital: {
    receivables: number;
    payables: number;
    inventory: number; // If detectable
    currentRatio: number;
  };
  
  // Business Health Score
  healthScore: {
    score: number; // 0-100
    profitability: 'profitable' | 'breakeven' | 'loss_making';
    growthRate: number; // YoY growth %
    stability: 'stable' | 'volatile' | 'declining';
  };
}

export class GSTITRAnalysisService {
  /**
   * Analyze GST payments and compliance from bank statements
   */
  static analyzeGST(transactions: Transaction[]): GSTAnalysis {
    // Identify GST-related transactions
    const gstTransactions = transactions.filter(t => 
      this.isGSTTransaction(t.description)
    );
    
    // Extract GSTIN if available
    const gstin = this.extractGSTIN(gstTransactions);
    
    // Analyze monthly GST payments
    const monthlyPayments = this.analyzeMonthlyGSTPayments(gstTransactions);
    
    // Estimate business turnover
    const turnoverEstimate = this.estimateTurnover(monthlyPayments);
    
    // Check compliance
    const compliance = this.checkGSTCompliance(monthlyPayments);
    
    return {
      gstin,
      gstPayments: {
        totalGSTPaid: gstTransactions.reduce((sum, t) => sum + getAbsoluteAmount(t), 0),
        monthlyAverage: monthlyPayments.reduce((sum, m) => sum + m.total, 0) / Math.max(monthlyPayments.length, 1),
        consistency: this.determineConsistency(monthlyPayments),
        months: monthlyPayments
      },
      turnoverEstimate,
      compliance
    };
  }
  
  /**
   * Analyze ITR and tax payments from bank statements
   */
  static analyzeITR(transactions: Transaction[], declaredIncome?: number): ITRAnalysis {
    // Identify tax-related transactions
    const taxTransactions = transactions.filter(t => 
      this.isTaxTransaction(t.description)
    );
    
    // Calculate tax payments
    const taxPayments = this.calculateTaxPayments(taxTransactions);
    
    // Estimate income from bank statements
    const bankStatementIncome = this.estimateIncomeFromStatements(transactions);
    
    // Verify against declared income
    const verification = this.verifyIncome(bankStatementIncome, declaredIncome);
    
    // Analyze investments (80C, 80D, etc.)
    const investments = this.analyzeInvestments(transactions);
    
    return {
      filingStatus: taxPayments.totalTaxPaid > 0 ? 'filed' : 'unknown',
      taxPayments,
      verification,
      investments,
      declaredIncome: {
        totalIncome: declaredIncome || bankStatementIncome
      }
    };
  }
  
  /**
   * Analyze business account statements
   */
  static analyzeBusinessStatement(transactions: Transaction[]): BusinessStatementAnalysis {
    // Identify account type
    const accountType = this.identifyBusinessAccountType(transactions);
    
    // Analyze vendors (frequent debits to businesses)
    const vendors = this.analyzeVendors(transactions);
    
    // Analyze customers (frequent credits from businesses)
    const customers = this.analyzeCustomers(transactions);
    
    // Calculate cash flows
    const cashFlow = this.calculateCashFlow(transactions);
    
    // Calculate working capital metrics
    const workingCapital = this.calculateWorkingCapital(transactions);
    
    // Calculate business health score
    const healthScore = this.calculateBusinessHealth(transactions, cashFlow);
    
    return {
      accountType,
      vendors,
      customers,
      cashFlow,
      workingCapital,
      healthScore
    };
  }
  
  // ========== Private Helper Methods ==========
  
  private static isGSTTransaction(description: string): boolean {
    const gstKeywords = [
      'gst', 'cgst', 'sgst', 'igst', 'utgst',
      'goods and service tax', 'goods & service tax',
      'tax payment', 'challan', 'gstin'
    ];
    
    const lowerDesc = description.toLowerCase();
    return gstKeywords.some(keyword => lowerDesc.includes(keyword));
  }
  
  private static isTaxTransaction(description: string): boolean {
    const taxKeywords = [
      'income tax', 'advance tax', 'self assessment tax',
      'tds', 'tcs', 'itr', 'pan', 'challan 280',
      'tax payment', 'tax deducted at source'
    ];
    
    const lowerDesc = description.toLowerCase();
    return taxKeywords.some(keyword => lowerDesc.includes(keyword));
  }
  
  private static extractGSTIN(transactions: Transaction[]): string | undefined {
    // GSTIN format: 22AAAAA0000A1Z5 (15 characters)
    const gstinPattern = /\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}/;
    
    for (const transaction of transactions) {
      const match = transaction.description.match(gstinPattern);
      if (match) return match[0];
    }
    
    return undefined;
  }
  
  private static analyzeMonthlyGSTPayments(transactions: Transaction[]) {
    const monthlyMap = new Map<string, { cgst: number; sgst: number; igst: number }>();
    
    transactions.forEach(t => {
      const month = new Date(t.date).toISOString().substring(0, 7); // YYYY-MM
      const existing = monthlyMap.get(month) || { cgst: 0, sgst: 0, igst: 0 };
      
      const desc = t.description.toLowerCase();
      const amount = getAbsoluteAmount(t);
      
      if (desc.includes('cgst')) existing.cgst += amount;
      else if (desc.includes('sgst')) existing.sgst += amount;
      else if (desc.includes('igst')) existing.igst += amount;
      else existing.cgst += amount / 2; // Assume split if not specified
      
      monthlyMap.set(month, existing);
    });
    
    return Array.from(monthlyMap.entries()).map(([month, taxes]) => ({
      month,
      cgst: taxes.cgst,
      sgst: taxes.sgst,
      igst: taxes.igst,
      total: taxes.cgst + taxes.sgst + taxes.igst
    })).sort((a, b) => a.month.localeCompare(b.month));
  }
  
  private static estimateTurnover(monthlyPayments: any[]) {
    const avgGST = monthlyPayments.reduce((sum, m) => sum + m.total, 0) / Math.max(monthlyPayments.length, 1);
    
    // Assuming 18% GST rate (can be adjusted)
    const estimatedMonthlyTurnover = (avgGST / 0.18) * 1.18; // Reverse calculate
    
    return {
      estimatedMonthlyTurnover,
      estimatedAnnualTurnover: estimatedMonthlyTurnover * 12,
      gstRatio: 0.18,
      confidence: monthlyPayments.length >= 6 ? 85 : 60
    };
  }
  
  private static checkGSTCompliance(monthlyPayments: any[]) {
    const totalMonths = 12;
    const filedMonths = monthlyPayments.length;
    const missedMonths = totalMonths - filedMonths;
    
    return {
      regularFiling: filedMonths >= 10,
      missedMonths: [], // Would need date range to calculate
      latePayments: 0, // Would need due date data
      penaltyPayments: 0,
      complianceScore: Math.min(100, (filedMonths / totalMonths) * 100)
    };
  }
  
  private static determineConsistency(monthlyPayments: any[]): 'regular' | 'irregular' | 'none' {
    if (monthlyPayments.length === 0) return 'none';
    if (monthlyPayments.length >= 10) return 'regular';
    return 'irregular';
  }
  
  private static calculateTaxPayments(transactions: Transaction[]) {
    let totalTDSDeducted = 0;
    let advanceTaxPaid = 0;
    let selfAssessmentTax = 0;
    let refundsReceived = 0;
    
    transactions.forEach(t => {
      const desc = t.description.toLowerCase();
      const amount = getAbsoluteAmount(t);
      
      if (desc.includes('tds') || desc.includes('tax deducted at source')) {
        totalTDSDeducted += amount;
      } else if (desc.includes('advance tax')) {
        advanceTaxPaid += amount;
      } else if (desc.includes('self assessment')) {
        selfAssessmentTax += amount;
      } else if (desc.includes('refund') && isCredit(t)) {
        refundsReceived += amount;
      }
    });
    
    return {
      totalTDSDeducted,
      advanceTaxPaid,
      selfAssessmentTax,
      totalTaxPaid: totalTDSDeducted + advanceTaxPaid + selfAssessmentTax,
      refundsReceived
    };
  }
  
  private static estimateIncomeFromStatements(transactions: Transaction[]): number {
    // Identify salary credits
    const salaryTransactions = transactions.filter(t => 
      isCredit(t) && (
        t.description.toLowerCase().includes('salary') ||
        t.description.toLowerCase().includes('sal cr') ||
        t.description.toLowerCase().includes('payroll')
      )
    );
    
    if (salaryTransactions.length > 0) {
      const avgSalary = salaryTransactions.reduce((sum, t) => sum + getAbsoluteAmount(t), 0) / salaryTransactions.length;
      return avgSalary * 12;
    }
    
    // For business income, sum all credits and subtract personal transfers
    const allCredits = transactions.filter(isCredit);
    const totalCredits = allCredits.reduce((sum, t) => sum + getAbsoluteAmount(t), 0);
    
    return totalCredits; // Rough estimate
  }
  
  private static verifyIncome(bankStatementIncome: number, declaredIncome?: number) {
    if (!declaredIncome) {
      return {
        bankStatementIncome,
        declaredIncome: 0,
        variance: 0,
        varianceFlag: 'match' as const
      };
    }
    
    const variance = ((bankStatementIncome - declaredIncome) / declaredIncome) * 100;
    
    let varianceFlag: 'match' | 'minor_difference' | 'major_difference' = 'match';
    if (Math.abs(variance) > 20) varianceFlag = 'major_difference';
    else if (Math.abs(variance) > 10) varianceFlag = 'minor_difference';
    
    return {
      bankStatementIncome,
      declaredIncome,
      variance,
      varianceFlag
    };
  }
  
  private static analyzeInvestments(transactions: Transaction[]) {
    let section80C = 0;
    let section80D = 0;
    let section80E = 0;
    let section80G = 0;
    
    transactions.forEach(t => {
      const desc = t.description.toLowerCase();
      const amount = getAbsoluteAmount(t);
      
      if (desc.includes('ppf') || desc.includes('epf') || desc.includes('lic') || 
          desc.includes('elss') || desc.includes('nsc') || desc.includes('tax saver')) {
        section80C += amount;
      } else if (desc.includes('health insurance') || desc.includes('mediclaim')) {
        section80D += amount;
      } else if (desc.includes('education loan')) {
        section80E += amount;
      } else if (desc.includes('donation') || desc.includes('charity')) {
        section80G += amount;
      }
    });
    
    return {
      section80C,
      section80D,
      section80E,
      section80G,
      totalDeductions: section80C + section80D + section80E + section80G
    };
  }
  
  private static identifyBusinessAccountType(transactions: Transaction[]): 'current' | 'cc_od' | 'savings_business' | 'unknown' {
    // Check for CC/OD (Credit Card / Overdraft)
    const hasOverdraft = transactions.some(t => t.balance < 0);
    const hasFrequentNegativeBalance = transactions.filter(t => t.balance < 0).length > transactions.length * 0.3;
    
    if (hasOverdraft && hasFrequentNegativeBalance) return 'cc_od';
    
    // Check for high transaction volume (business current account)
    const avgTransactionsPerDay = transactions.length / 30;
    if (avgTransactionsPerDay > 10) return 'current';
    
    return 'savings_business';
  }
  
  private static analyzeVendors(transactions: Transaction[]) {
    const vendorMap = new Map<string, { total: number; count: number; amounts: number[] }>();
    
    // Filter business-related debits
    transactions.filter(t => isDebit(t) && !this.isPersonalExpense(t.description))
      .forEach(t => {
        const vendor = this.extractCounterparty(t.description);
        const existing = vendorMap.get(vendor) || { total: 0, count: 0, amounts: [] };
        const amount = getAbsoluteAmount(t);
        
        existing.total += amount;
        existing.count += 1;
        existing.amounts.push(amount);
        
        vendorMap.set(vendor, existing);
      });
    
    return Array.from(vendorMap.entries())
      .map(([name, data]) => ({
        name,
        totalPaid: data.total,
        frequency: data.count,
        averageTicket: data.total / data.count,
        category: 'Vendor'
      }))
      .sort((a, b) => b.totalPaid - a.totalPaid)
      .slice(0, 50); // Top 50 vendors
  }
  
  private static analyzeCustomers(transactions: Transaction[]) {
    const customerMap = new Map<string, { total: number; count: number }>();
    
    transactions.filter(t => isCredit(t) && !this.isPersonalIncome(t.description))
      .forEach(t => {
        const customer = this.extractCounterparty(t.description);
        const existing = customerMap.get(customer) || { total: 0, count: 0 };
        const amount = getAbsoluteAmount(t);
        
        existing.total += amount;
        existing.count += 1;
        
        customerMap.set(customer, existing);
      });
    
    return Array.from(customerMap.entries())
      .map(([name, data]) => ({
        name,
        totalReceived: data.total,
        frequency: data.count,
        averageTicket: data.total / data.count
      }))
      .sort((a, b) => b.totalReceived - a.totalReceived)
      .slice(0, 50); // Top 50 customers
  }
  
  private static calculateCashFlow(transactions: Transaction[]) {
    const totalInflow = transactions.filter(isCredit).reduce((sum, t) => sum + getAbsoluteAmount(t), 0);
    const totalOutflow = transactions.filter(isDebit).reduce((sum, t) => sum + getAbsoluteAmount(t), 0);
    
    return {
      operatingCashFlow: totalInflow - totalOutflow,
      investingCashFlow: 0, // Would need categorization
      financingCashFlow: 0, // Would need loan/equity data
      freeCashFlow: totalInflow - totalOutflow,
      burnRate: totalOutflow / Math.max(transactions.length / 30, 1) // Monthly burn
    };
  }
  
  private static calculateWorkingCapital(transactions: Transaction[]) {
    // Simplified calculation based on patterns
    return {
      receivables: 0,
      payables: 0,
      inventory: 0,
      currentRatio: 1.0
    };
  }
  
  private static calculateBusinessHealth(transactions: Transaction[], cashFlow: any) {
    const isProfitable = cashFlow.operatingCashFlow > 0;
    const volatility = this.calculateVolatility(transactions);
    
    let score = 50;
    if (isProfitable) score += 30;
    if (volatility < 0.3) score += 20;
    
    return {
      score,
      profitability: isProfitable ? 'profitable' as const : 'loss_making' as const,
      growthRate: 0, // Would need historical data
      stability: volatility < 0.3 ? 'stable' as const : 'volatile' as const
    };
  }
  
  private static calculateVolatility(transactions: Transaction[]): number {
    const dailyBalances = transactions.map(t => t.balance);
    const avg = dailyBalances.reduce((sum, b) => sum + b, 0) / dailyBalances.length;
    const variance = dailyBalances.reduce((sum, b) => sum + Math.pow(b - avg, 2), 0) / dailyBalances.length;
    return Math.sqrt(variance) / avg;
  }
  
  private static isPersonalExpense(description: string): boolean {
    const personalKeywords = ['atm', 'grocery', 'restaurant', 'movie', 'shopping', 'amazon', 'flipkart'];
    const lowerDesc = description.toLowerCase();
    return personalKeywords.some(kw => lowerDesc.includes(kw));
  }
  
  private static isPersonalIncome(description: string): boolean {
    const personalKeywords = ['salary', 'interest', 'dividend'];
    const lowerDesc = description.toLowerCase();
    return personalKeywords.some(kw => lowerDesc.includes(kw));
  }
  
  private static extractCounterparty(description: string): string {
    // Extract meaningful name from transaction description
    // This is simplified - real implementation would be more sophisticated
    const words = description.split(/[\s\-\/]+/);
    return words.slice(0, 3).join(' ').trim() || 'Unknown';
  }
}

export default GSTITRAnalysisService;
