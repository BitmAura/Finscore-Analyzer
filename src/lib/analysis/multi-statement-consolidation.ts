/**
 * Multi-Statement Consolidation Engine
 * Combines multiple bank statements for comprehensive analysis
 * Handles cross-account verification and consolidated reporting
 */

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export interface StatementGroup {
  id: string;
  userId: string;
  groupName: string;
  groupType: 'single_account' | 'multi_account' | 'loan_application';
  referenceId: string;
  status: 'active' | 'completed' | 'archived';
  totalStatements: number;
  totalAccounts: number;
  consolidatedBalance: number;
  createdAt: string;
  updatedAt: string;
}

export interface ConsolidatedAnalysis {
  financialSummary: {
    totalIncome: number;
    totalExpenses: number;
    netCashFlow: number;
    totalBalance: number;
    accountCount: number;
    averageMonthlyIncome: number;
    savingsRate: number;
  };
  crossVerification: {
    balanceContinuityIssues: BalanceIssue[];
    duplicateIncomeSources: DuplicateIncome[];
    incomeConsistencyScore: number;
    accountCoverage: AccountCoverage;
  };
  riskAssessment: {
    overallRisk: 'low' | 'medium' | 'high' | 'critical';
    riskFactors: string[];
    recommendations: string[];
  };
  bankingBehavior: {
    accountDiversity: number;
    relationshipStrength: 'weak' | 'moderate' | 'strong';
    digitalAdoption: number;
    stabilityScore: number;
  };
}

export interface BalanceIssue {
  account: string;
  date: string;
  expectedBalance: number;
  actualBalance: number;
  discrepancy: number;
  severity: 'low' | 'medium' | 'high';
}

export interface DuplicateIncome {
  source: string;
  amount: number;
  accounts: string[];
  risk: 'low' | 'medium' | 'high';
}

export interface AccountCoverage {
  periodStart: string;
  periodEnd: string;
  gaps: DateRange[];
  coveragePercentage: number;
}

export interface DateRange {
  start: string;
  end: string;
  days: number;
}

export class MultiStatementConsolidationService {
  private supabase: any;

  constructor() {
    // Initialize Supabase client
    this.initializeSupabase();
  }

  private async initializeSupabase() {
    // Pass the `cookies` helper directly to the route handler client to match expected types
    const cookieStore = await cookies();
    this.supabase = createRouteHandlerClient({ cookies: async () => cookieStore });
  }

  /**
   * Create a new statement group
   */
  async createStatementGroup(
    userId: string,
    groupName: string,
    groupType: 'single_account' | 'multi_account' | 'loan_application',
    referenceId?: string
  ): Promise<StatementGroup> {
    const groupData = {
      user_id: userId,
      group_name: groupName,
      group_type: groupType,
      reference_id: referenceId || `GRP-${Date.now()}`,
      status: 'active',
      total_statements: 0,
      total_accounts: 0,
      consolidated_balance: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await this.supabase
      .from('statement_groups')
      .insert(groupData)
      .select()
      .single();

    if (error) throw error;

    return this.mapStatementGroup(data);
  }

  /**
   * Add analysis job to statement group
   */
  async addStatementToGroup(
    groupId: string,
    analysisJobId: string,
    accountIdentifier: string,
    bankName?: string,
    accountType?: string,
    periodStart?: Date,
    periodEnd?: Date,
    openingBalance?: number,
    closingBalance?: number
  ): Promise<void> {
    const memberData = {
      group_id: groupId,
      analysis_job_id: analysisJobId,
      account_identifier: accountIdentifier,
      bank_name: bankName,
      account_type: accountType,
      statement_period_start: periodStart?.toISOString(),
      statement_period_end: periodEnd?.toISOString(),
      opening_balance: openingBalance,
      closing_balance: closingBalance,
      added_at: new Date().toISOString()
    };

    const { error } = await this.supabase
      .from('statement_group_members')
      .insert(memberData);

    if (error) throw error;
  }

  /**
   * Get consolidated analysis for a statement group
   */
  async getConsolidatedAnalysis(groupId: string): Promise<ConsolidatedAnalysis> {
    // Get all statements in the group
    const { data: members, error: membersError } = await this.supabase
      .from('statement_group_members')
      .select(`
        *,
        analysis_jobs!inner (
          id,
          status,
          metadata,
          created_at
        )
      `)
      .eq('group_id', groupId)
      .eq('analysis_jobs.status', 'completed');

    if (membersError) throw membersError;

    if (!members || members.length === 0) {
      throw new Error('No completed statements found in group');
    }

    // Calculate consolidated financial summary
    const financialSummary = await this.calculateFinancialSummary(members);

    // Perform cross-verification
    const crossVerification = await this.performCrossVerification(members);

    // Generate risk assessment
    const riskAssessment = await this.generateRiskAssessment(members, financialSummary, crossVerification);

    // Calculate banking behavior metrics
    const bankingBehavior = await this.calculateBankingBehavior(members);

    return {
      financialSummary,
      crossVerification,
      riskAssessment,
      bankingBehavior
    };
  }

  /**
   * Calculate consolidated financial summary
   */
  private async calculateFinancialSummary(members: any[]): Promise<ConsolidatedAnalysis['financialSummary']> {
    let totalIncome = 0;
    let totalExpenses = 0;
    let totalBalance = 0;
    const accountCount = new Set(members.map(m => m.account_identifier)).size;

    for (const member of members) {
      const metadata = member.analysis_jobs?.metadata || {};
      totalIncome += parseFloat(metadata.totalIncome || 0);
      totalExpenses += parseFloat(metadata.totalExpenses || 0);
      totalBalance += parseFloat(member.closing_balance || 0);
    }

    const netCashFlow = totalIncome - totalExpenses;
    const averageMonthlyIncome = accountCount > 0 ? totalIncome / accountCount : 0;
    const savingsRate = totalIncome > 0 ? (netCashFlow / totalIncome) * 100 : 0;

    return {
      totalIncome,
      totalExpenses,
      netCashFlow,
      totalBalance,
      accountCount,
      averageMonthlyIncome,
      savingsRate
    };
  }

  /**
   * Perform cross-verification between statements
   */
  private async performCrossVerification(members: any[]): Promise<ConsolidatedAnalysis['crossVerification']> {
    const balanceIssues: BalanceIssue[] = [];
    const duplicateIncomeSources: DuplicateIncome[] = [];
    let totalIncomeConsistencyScore = 0;

    // Group members by account for continuity checks
    const accountGroups = this.groupByAccount(members);

    // Check balance continuity within each account
    for (const [account, accountMembers] of Object.entries(accountGroups)) {
      const continuityIssues = await this.checkAccountBalanceContinuity(accountMembers);
      balanceIssues.push(...continuityIssues);
    }

    // Check for duplicate income sources across accounts
    const incomeDuplicates = await this.detectDuplicateIncomeSources(members);
    duplicateIncomeSources.push(...incomeDuplicates);

    // Calculate income consistency score
    const incomeConsistencyScore = this.calculateIncomeConsistencyScore(members);

    // Calculate account coverage
    const accountCoverage = this.calculateAccountCoverage(members);

    return {
      balanceContinuityIssues: balanceIssues,
      duplicateIncomeSources: duplicateIncomeSources,
      incomeConsistencyScore,
      accountCoverage
    };
  }

  /**
   * Check balance continuity for a single account
   */
  private async checkAccountBalanceContinuity(accountMembers: any[]): Promise<BalanceIssue[]> {
    const issues: BalanceIssue[] = [];

    // Sort by period end date
    const sortedMembers = accountMembers.sort((a, b) =>
      new Date(a.statement_period_end).getTime() - new Date(b.statement_period_end).getTime()
    );

    for (let i = 1; i < sortedMembers.length; i++) {
      const prev = sortedMembers[i - 1];
      const curr = sortedMembers[i];

      if (prev.closing_balance && curr.opening_balance) {
        const discrepancy = Math.abs(prev.closing_balance - curr.opening_balance);

        if (discrepancy > 100) { // Allow small rounding differences
          issues.push({
            account: curr.account_identifier,
            date: curr.statement_period_start,
            expectedBalance: prev.closing_balance,
            actualBalance: curr.opening_balance,
            discrepancy,
            severity: discrepancy > 1000 ? 'high' : 'medium'
          });
        }
      }
    }

    return issues;
  }

  /**
   * Detect duplicate income sources across accounts
   */
  private async detectDuplicateIncomeSources(members: any[]): Promise<DuplicateIncome[]> {
    const incomeSources = new Map<string, { amount: number; accounts: string[] }>();

    for (const member of members) {
      const metadata = member.analysis_jobs?.metadata || {};
      const bankName = metadata.bankName || member.bank_name || 'Unknown';

      if (metadata.totalIncome && metadata.totalIncome > 0) {
        const key = bankName.toLowerCase();
        if (!incomeSources.has(key)) {
          incomeSources.set(key, { amount: 0, accounts: [] });
        }

        const source = incomeSources.get(key)!;
        source.amount += parseFloat(metadata.totalIncome);
        source.accounts.push(member.account_identifier);
      }
    }

    const duplicates: DuplicateIncome[] = [];
    for (const [source, data] of incomeSources) {
      if (data.accounts.length > 1 && data.amount > 50000) { // High income threshold
        duplicates.push({
          source: source.charAt(0).toUpperCase() + source.slice(1),
          amount: data.amount,
          accounts: data.accounts,
          risk: data.accounts.length > 2 ? 'high' : 'medium'
        });
      }
    }

    return duplicates;
  }

  /**
   * Calculate income consistency score
   */
  private calculateIncomeConsistencyScore(members: any[]): number {
    const incomes: number[] = [];

    for (const member of members) {
      const metadata = member.analysis_jobs?.metadata || {};
      if (metadata.totalIncome) {
        incomes.push(parseFloat(metadata.totalIncome));
      }
    }

    if (incomes.length < 2) return 100; // Perfect consistency with single statement

    const avgIncome = incomes.reduce((sum, income) => sum + income, 0) / incomes.length;
    const variance = incomes.reduce((sum, income) => sum + Math.pow(income - avgIncome, 2), 0) / incomes.length;
    const stdDev = Math.sqrt(variance);

    // Calculate coefficient of variation (lower is better)
    const cv = avgIncome > 0 ? (stdDev / avgIncome) * 100 : 0;

    // Convert to consistency score (0-100, higher is better)
    return Math.max(0, Math.min(100, 100 - cv));
  }

  /**
   * Calculate account coverage period
   */
  private calculateAccountCoverage(members: any[]): AccountCoverage {
    if (!members || members.length === 0) {
      return {
        periodStart: '',
        periodEnd: '',
        gaps: [],
        coveragePercentage: 0
      };
    }

    // Find overall period
    const periods = members
      .filter(m => m.statement_period_start && m.statement_period_end)
      .map(m => ({
        start: new Date(m.statement_period_start),
        end: new Date(m.statement_period_end)
      }))
      .sort((a, b) => a.start.getTime() - b.start.getTime());

    if (periods.length === 0) {
      return {
        periodStart: '',
        periodEnd: '',
        gaps: [],
        coveragePercentage: 0
      };
    }

    const overallStart = periods[0].start;
    const overallEnd = periods[periods.length - 1].end;
    const totalDays = Math.ceil((overallEnd.getTime() - overallStart.getTime()) / (1000 * 60 * 60 * 24));

    // Calculate covered days
    let coveredDays = 0;
    const gaps: DateRange[] = [];

    for (let i = 0; i < periods.length; i++) {
      const period = periods[i];
      const periodDays = Math.ceil((period.end.getTime() - period.start.getTime()) / (1000 * 60 * 60 * 24));
      coveredDays += periodDays;

      // Check for gaps between periods
      if (i < periods.length - 1) {
        const nextPeriod = periods[i + 1];
        const gapDays = Math.ceil((nextPeriod.start.getTime() - period.end.getTime()) / (1000 * 60 * 60 * 24));

        if (gapDays > 1) { // More than 1 day gap
          gaps.push({
            start: period.end.toISOString().split('T')[0],
            end: nextPeriod.start.toISOString().split('T')[0],
            days: gapDays
          });
        }
      }
    }

    const coveragePercentage = totalDays > 0 ? Math.min(100, (coveredDays / totalDays) * 100) : 0;

    return {
      periodStart: overallStart.toISOString().split('T')[0],
      periodEnd: overallEnd.toISOString().split('T')[0],
      gaps,
      coveragePercentage
    };
  }

  /**
   * Generate consolidated risk assessment
   */
  private async generateRiskAssessment(
    members: any[],
    financialSummary: ConsolidatedAnalysis['financialSummary'],
    crossVerification: ConsolidatedAnalysis['crossVerification']
  ): Promise<ConsolidatedAnalysis['riskAssessment']> {
    const riskFactors: string[] = [];
    const recommendations: string[] = [];

    // Financial health risks
    if (financialSummary.savingsRate < 10) {
      riskFactors.push('Low savings rate indicates poor financial discipline');
      recommendations.push('Aim for at least 20% savings rate for better financial health');
    }

    // Cross-verification risks
    if (crossVerification.balanceContinuityIssues.length > 0) {
      riskFactors.push(`${crossVerification.balanceContinuityIssues.length} balance continuity issues detected`);
      recommendations.push('Verify statement authenticity and account accuracy');
    }

    if (crossVerification.duplicateIncomeSources.length > 0) {
      riskFactors.push('Potential duplicate income sources across accounts');
      recommendations.push('Consolidate income sources and verify legitimacy');
    }

    if (crossVerification.incomeConsistencyScore < 70) {
      riskFactors.push('Inconsistent income patterns detected');
      recommendations.push('Verify income stability and source reliability');
    }

    // Account coverage risks
    if (crossVerification.accountCoverage.coveragePercentage < 80) {
      riskFactors.push('Incomplete account coverage period');
      recommendations.push('Upload statements covering at least 6-12 months');
    }

    // Determine overall risk level
    let overallRisk: 'low' | 'medium' | 'high' | 'critical' = 'low';

    if (riskFactors.length >= 3) overallRisk = 'critical';
    else if (riskFactors.length >= 2) overallRisk = 'high';
    else if (riskFactors.length >= 1) overallRisk = 'medium';

    return {
      overallRisk,
      riskFactors,
      recommendations
    };
  }

  /**
   * Calculate banking behavior metrics
   */
  private async calculateBankingBehavior(members: any[]): Promise<ConsolidatedAnalysis['bankingBehavior']> {
    const accountCount = new Set(members.map(m => m.account_identifier)).size;
    const bankCount = new Set(members.map(m => m.bank_name).filter(Boolean)).size;

    // Account diversity (0-100, higher is better)
    const accountDiversity = Math.min(100, accountCount * 25);

    // Relationship strength based on account age and transaction volume
    let relationshipStrength: 'weak' | 'moderate' | 'strong' = 'weak';
    const avgAccountAge = this.calculateAverageAccountAge(members);

    if (avgAccountAge > 365) relationshipStrength = 'strong';
    else if (avgAccountAge > 180) relationshipStrength = 'moderate';

    // Digital adoption based on transaction patterns
    const digitalAdoption = this.calculateDigitalAdoption(members);

    // Overall stability score
    const stabilityScore = (accountDiversity + (avgAccountAge / 365) * 100 + digitalAdoption) / 3;

    return {
      accountDiversity,
      relationshipStrength,
      digitalAdoption,
      stabilityScore
    };
  }

  /**
   * Helper: Group members by account
   */
  private groupByAccount(members: any[]): Record<string, any[]> {
    return members.reduce((groups, member) => {
      const account = member.account_identifier;
      if (!groups[account]) {
        groups[account] = [];
      }
      groups[account].push(member);
      return groups;
    }, {});
  }

  /**
   * Helper: Calculate average account age in days
   */
  private calculateAverageAccountAge(members: any[]): number {
    const ages = members
      .map(m => {
        if (m.analysis_jobs?.metadata?.accountVintage?.accountAgeMonths) {
          return m.analysis_jobs.metadata.accountVintage.accountAgeMonths * 30; // Convert to days
        }
        return 0;
      })
      .filter(age => age > 0);

    return ages.length > 0 ? ages.reduce((sum, age) => sum + age, 0) / ages.length : 0;
  }

  /**
   * Helper: Calculate digital adoption score
   */
  private calculateDigitalAdoption(members: any[]): number {
    let totalTransactions = 0;
    let digitalTransactions = 0;

    for (const member of members) {
      const metadata = member.analysis_jobs?.metadata || {};
      totalTransactions += metadata.transactionCount || 0;

      // Estimate digital transactions (UPI, NEFT, RTGS, etc.)
      if (metadata.bankingBehavior?.transactionPatterns?.digitalTransactionRatio) {
        const ratio = metadata.bankingBehavior.transactionPatterns.digitalTransactionRatio;
        digitalTransactions += (metadata.transactionCount || 0) * (ratio / 100);
      }
    }

    return totalTransactions > 0 ? (digitalTransactions / totalTransactions) * 100 : 0;
  }

  /**
   * Helper: Map database row to StatementGroup interface
   */
  private mapStatementGroup(data: any): StatementGroup {
    return {
      id: data.id,
      userId: data.user_id,
      groupName: data.group_name,
      groupType: data.group_type,
      referenceId: data.reference_id,
      status: data.status,
      totalStatements: data.total_statements,
      totalAccounts: data.total_accounts,
      consolidatedBalance: data.consolidated_balance,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }
}

export default MultiStatementConsolidationService;