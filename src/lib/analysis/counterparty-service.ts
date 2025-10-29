/**
 * Counterparty Analysis Service - Analyzes transaction parties and relationships
 * Identifies key business relationships, suppliers, customers, etc.
 */

import { CategorizedTransaction } from './categorization-service';

export interface Counterparty {
  name: string;
  transactionCount: number;
  totalIncoming: number; // Credits from this party
  totalOutgoing: number; // Debits to this party
  netAmount: number; // Net flow (positive = you receive more, negative = you pay more)
  averageTransaction: number;
  frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Irregular';
  firstTransaction: string; // Date
  lastTransaction: string; // Date
  relationshipType: 'Salary' | 'Vendor' | 'Customer' | 'Loan' | 'Investment' | 'Utility' | 'Personal' | 'Unknown';
  riskLevel: 'Low' | 'Medium' | 'High';
}

// Extract counterparty name from transaction description
function extractCounterpartyName(description: string): string {
  // Remove common prefixes
  let cleaned = description
    .replace(/^(UPI|NEFT|IMPS|RTGS|NACH|ACH|ATM|POS|E-COM|DEBIT CARD|CREDIT CARD)\s*[-:]\s*/i, '')
    .replace(/\s*(DR|CR|REF|TXN|TRANSACTION)\s*[:#]\s*\d+/gi, '')
    .trim();

  // Extract meaningful name (first 2-3 words usually)
  const words = cleaned.split(/\s+/).filter(w => w.length > 2);
  const name = words.slice(0, 3).join(' ');

  return name || 'Unknown';
}

// Determine relationship type based on transaction patterns
function determineRelationshipType(
  name: string,
  transactions: CategorizedTransaction[]
): Counterparty['relationshipType'] {
  const nameLower = name.toLowerCase();
  const firstTx = transactions[0];

  // Check for salary
  if (nameLower.includes('salary') || nameLower.includes('payroll') ||
      nameLower.includes('wages') || firstTx.category === 'Salary & Income') {
    return 'Salary';
  }

  // Check for loans
  if (nameLower.includes('loan') || nameLower.includes('emi') ||
      nameLower.includes('bank') && transactions.every(tx => tx.debit)) {
    return 'Loan';
  }

  // Check for investments
  if (nameLower.includes('mutual fund') || nameLower.includes('sip') ||
      nameLower.includes('stock') || nameLower.includes('equity')) {
    return 'Investment';
  }

  // Check for utilities
  if (nameLower.includes('electric') || nameLower.includes('water') ||
      nameLower.includes('gas') || nameLower.includes('telecom') ||
      nameLower.includes('internet') || nameLower.includes('mobile')) {
    return 'Utility';
  }

  // Check if vendor (mostly outgoing)
  const outgoingRatio = transactions.filter(tx => tx.debit).length / transactions.length;
  if (outgoingRatio > 0.8) {
    return 'Vendor';
  }

  // Check if customer (mostly incoming)
  const incomingRatio = transactions.filter(tx => tx.credit).length / transactions.length;
  if (incomingRatio > 0.8) {
    return 'Customer';
  }

  return 'Unknown';
}

// Calculate transaction frequency
function calculateFrequency(
  transactions: CategorizedTransaction[]
): Counterparty['frequency'] {
  if (transactions.length < 2) return 'Irregular';

  const dates = transactions.map(tx => new Date(tx.date).getTime()).sort((a, b) => a - b);
  const intervals: number[] = [];

  for (let i = 1; i < dates.length; i++) {
    intervals.push(dates[i] - dates[i - 1]);
  }

  const avgInterval = intervals.reduce((sum, int) => sum + int, 0) / intervals.length;
  const avgDays = avgInterval / (1000 * 60 * 60 * 24);

  if (avgDays <= 7) return 'Daily';
  if (avgDays <= 14) return 'Weekly';
  if (avgDays <= 40) return 'Monthly';
  if (avgDays <= 120) return 'Quarterly';
  return 'Irregular';
}

// Assess counterparty risk
function assessCounterpartyRisk(
  counterparty: Counterparty,
  transactions: CategorizedTransaction[]
): Counterparty['riskLevel'] {
  let riskScore = 0;

  // High value transactions
  if (counterparty.averageTransaction > 50000) {
    riskScore += 2;
  }

  // Cash-based (ATM mentions)
  const cashBased = transactions.some(tx =>
    tx.description.toLowerCase().includes('atm') ||
    tx.description.toLowerCase().includes('cash')
  );
  if (cashBased && counterparty.totalOutgoing > 100000) {
    riskScore += 3;
  }

  // Irregular but high value
  if (counterparty.frequency === 'Irregular' && counterparty.totalOutgoing > 100000) {
    riskScore += 2;
  }

  // Gambling related
  const gamblingKeywords = ['bet', 'casino', 'lottery', 'gambling'];
  if (gamblingKeywords.some(kw => counterparty.name.toLowerCase().includes(kw))) {
    riskScore += 5;
  }

  if (riskScore >= 5) return 'High';
  if (riskScore >= 3) return 'Medium';
  return 'Low';
}

export function analyzeCounterparties(
  transactions: CategorizedTransaction[]
): Counterparty[] {
  // Group transactions by counterparty
  const counterpartyMap = new Map<string, CategorizedTransaction[]>();

  transactions.forEach(tx => {
    const name = extractCounterpartyName(tx.description);
    if (!counterpartyMap.has(name)) {
      counterpartyMap.set(name, []);
    }
    counterpartyMap.get(name)!.push(tx);
  });

  const counterparties: Counterparty[] = [];

  counterpartyMap.forEach((txList, name) => {
    // Skip if too few transactions or generic name
    if (txList.length < 2 || name === 'Unknown' || name.length < 3) {
      return;
    }

    const totalIncoming = txList.reduce((sum, tx) => sum + (tx.credit || 0), 0);
    const totalOutgoing = txList.reduce((sum, tx) => sum + (tx.debit || 0), 0);
    const netAmount = totalIncoming - totalOutgoing;
    const averageTransaction = (totalIncoming + totalOutgoing) / txList.length;

    // Sort by date
    const sortedTxList = [...txList].sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const firstTransaction = sortedTxList[0].date;
    const lastTransaction = sortedTxList[sortedTxList.length - 1].date;
    const frequency = calculateFrequency(sortedTxList);
    const relationshipType = determineRelationshipType(name, sortedTxList);

    const counterparty: Counterparty = {
      name,
      transactionCount: txList.length,
      totalIncoming,
      totalOutgoing,
      netAmount,
      averageTransaction,
      frequency,
      firstTransaction,
      lastTransaction,
      relationshipType,
      riskLevel: 'Low'
    };

    // Assess risk
    counterparty.riskLevel = assessCounterpartyRisk(counterparty, sortedTxList);

    counterparties.push(counterparty);
  });

  // Sort by total transaction value (incoming + outgoing)
  return counterparties.sort((a, b) =>
    (b.totalIncoming + b.totalOutgoing) - (a.totalIncoming + a.totalOutgoing)
  );
}

// Get top counterparties by different criteria
export interface TopCounterparties {
  topByVolume: Counterparty[];
  topByFrequency: Counterparty[];
  topIncoming: Counterparty[];
  topOutgoing: Counterparty[];
  highRisk: Counterparty[];
}

export function getTopCounterparties(
  counterparties: Counterparty[],
  limit: number = 5
): TopCounterparties {
  return {
    topByVolume: [...counterparties]
      .sort((a, b) => (b.totalIncoming + b.totalOutgoing) - (a.totalIncoming + a.totalOutgoing))
      .slice(0, limit),

    topByFrequency: [...counterparties]
      .sort((a, b) => b.transactionCount - a.transactionCount)
      .slice(0, limit),

    topIncoming: [...counterparties]
      .sort((a, b) => b.totalIncoming - a.totalIncoming)
      .slice(0, limit),

    topOutgoing: [...counterparties]
      .sort((a, b) => b.totalOutgoing - a.totalOutgoing)
      .slice(0, limit),

    highRisk: counterparties.filter(cp => cp.riskLevel === 'High')
  };
}

// Get counterparty relationship summary
export interface CounterpartyInsights {
  totalCounterparties: number;
  activeRelationships: number; // Transactions in last 3 months
  dormantRelationships: number;
  relationshipsByType: Record<string, number>;
  averageRelationshipDuration: number; // Days
  concentrationRisk: {
    topCounterpartyPercentage: number;
    top5Percentage: number;
    isDiversified: boolean;
  };
}

export function getCounterpartyInsights(
  counterparties: Counterparty[]
): CounterpartyInsights {
  const now = new Date();
  const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

  const activeRelationships = counterparties.filter(cp =>
    new Date(cp.lastTransaction) >= threeMonthsAgo
  ).length;

  const relationshipsByType: Record<string, number> = {};
  let totalDuration = 0;

  counterparties.forEach(cp => {
    relationshipsByType[cp.relationshipType] =
      (relationshipsByType[cp.relationshipType] || 0) + 1;

    const duration = new Date(cp.lastTransaction).getTime() -
                    new Date(cp.firstTransaction).getTime();
    totalDuration += duration / (1000 * 60 * 60 * 24); // Convert to days
  });

  const averageRelationshipDuration = totalDuration / counterparties.length;

  // Calculate concentration risk
  const totalVolume = counterparties.reduce((sum, cp) =>
    sum + cp.totalIncoming + cp.totalOutgoing, 0
  );

  const topCounterpartyVolume = counterparties[0]
    ? counterparties[0].totalIncoming + counterparties[0].totalOutgoing
    : 0;

  const top5Volume = counterparties.slice(0, 5).reduce((sum, cp) =>
    sum + cp.totalIncoming + cp.totalOutgoing, 0
  );

  const topCounterpartyPercentage = (topCounterpartyVolume / totalVolume) * 100;
  const top5Percentage = (top5Volume / totalVolume) * 100;
  const isDiversified = top5Percentage < 50; // Less than 50% with top 5 is good

  return {
    totalCounterparties: counterparties.length,
    activeRelationships,
    dormantRelationships: counterparties.length - activeRelationships,
    relationshipsByType,
    averageRelationshipDuration,
    concentrationRisk: {
      topCounterpartyPercentage,
      top5Percentage,
      isDiversified
    }
  };
}

