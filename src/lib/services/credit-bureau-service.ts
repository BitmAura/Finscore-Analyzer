/**
 * Credit Bureau Integration Service
 * Handles real-time credit score pulls from CIBIL, Experian, and other bureaus
 */

export interface CreditScore {
  bureau: 'CIBIL' | 'Experian' | 'Equifax';
  score: number;
  range: string;
  lastUpdated: string;
  factors: CreditFactor[];
  recommendations: string[];
}

export interface CreditFactor {
  name: string;
  impact: 'positive' | 'negative' | 'neutral';
  description: string;
  weight: number;
}

export interface CreditBureauRequest {
  userId: string;
  panNumber?: string;
  aadhaarNumber?: string;
  consent: boolean;
}

export interface CreditBureauResponse {
  success: boolean;
  scores: CreditScore[];
  error?: string;
  processingTime: number;
}

export class CreditBureauService {
  private apiKeys: Record<string, string> = {
    CIBIL: process.env.CIBIL_API_KEY || 'mock_cibil_key',
    Experian: process.env.EXPERIAN_API_KEY || 'mock_experian_key',
    Equifax: process.env.EQUIFAX_API_KEY || 'mock_equifax_key'
  };

  /**
   * Fetch credit scores from multiple bureaus
   */
  async fetchCreditScores(request: CreditBureauRequest): Promise<CreditBureauResponse> {
    const startTime = Date.now();

    try {
      // In production, this would make actual API calls to credit bureaus
      // For now, simulating with mock data

      const scores: CreditScore[] = [];

      // Simulate CIBIL score
      scores.push(await this.fetchCIBILScore(request));

      // Simulate Experian score
      scores.push(await this.fetchExperianScore(request));

      // Simulate Equifax score (if available)
      scores.push(await this.fetchEquifaxScore(request));

      return {
        success: true,
        scores,
        processingTime: Date.now() - startTime
      };

    } catch (error: any) {
      return {
        success: false,
        scores: [],
        error: error.message,
        processingTime: Date.now() - startTime
      };
    }
  }

  /**
   * Fetch CIBIL score (simulated)
   */
  private async fetchCIBILScore(request: CreditBureauRequest): Promise<CreditScore> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // Generate mock score based on user profile
    const baseScore = 650 + Math.random() * 200; // 650-850 range
    const score = Math.round(baseScore);

    const factors: CreditFactor[] = [
      {
        name: 'Payment History',
        impact: score > 750 ? 'positive' : 'negative',
        description: 'Timely payment of EMIs and credit cards',
        weight: 35
      },
      {
        name: 'Credit Utilization',
        impact: score > 700 ? 'positive' : 'negative',
        description: 'Percentage of available credit used',
        weight: 30
      },
      {
        name: 'Credit Age',
        impact: 'positive',
        description: 'Length of credit history',
        weight: 15
      },
      {
        name: 'New Credit',
        impact: score > 680 ? 'neutral' : 'negative',
        description: 'Recent credit inquiries and new accounts',
        weight: 10
      },
      {
        name: 'Credit Mix',
        impact: 'positive',
        description: 'Diversity of credit types',
        weight: 10
      }
    ];

    const recommendations: string[] = [];
    if (score < 700) {
      recommendations.push('Pay all dues on time to improve score');
      recommendations.push('Reduce credit utilization below 30%');
    }
    if (score < 750) {
      recommendations.push('Avoid multiple credit inquiries');
    }

    return {
      bureau: 'CIBIL',
      score,
      range: this.getScoreRange(score),
      lastUpdated: new Date().toISOString(),
      factors,
      recommendations
    };
  }

  /**
   * Fetch Experian score (simulated)
   */
  private async fetchExperianScore(request: CreditBureauRequest): Promise<CreditScore> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1500));

    // Generate mock score (slightly different from CIBIL)
    const baseScore = 640 + Math.random() * 220; // 640-860 range
    const score = Math.round(baseScore);

    const factors: CreditFactor[] = [
      {
        name: 'Payment Behavior',
        impact: score > 740 ? 'positive' : 'negative',
        description: 'Consistency in bill payments',
        weight: 40
      },
      {
        name: 'Debt Management',
        impact: score > 690 ? 'positive' : 'negative',
        description: 'Management of existing debts',
        weight: 25
      },
      {
        name: 'Credit History Length',
        impact: 'positive',
        description: 'Duration of credit relationships',
        weight: 20
      },
      {
        name: 'Recent Activity',
        impact: score > 670 ? 'neutral' : 'negative',
        description: 'Recent credit applications',
        weight: 15
      }
    ];

    const recommendations: string[] = [];
    if (score < 690) {
      recommendations.push('Maintain good payment discipline');
      recommendations.push('Keep debt levels manageable');
    }

    return {
      bureau: 'Experian',
      score,
      range: this.getScoreRange(score),
      lastUpdated: new Date().toISOString(),
      factors,
      recommendations
    };
  }

  /**
   * Fetch Equifax score (simulated)
   */
  private async fetchEquifaxScore(request: CreditBureauRequest): Promise<CreditScore> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1200 + Math.random() * 1800));

    // Generate mock score
    const baseScore = 620 + Math.random() * 230; // 620-850 range
    const score = Math.round(baseScore);

    const factors: CreditFactor[] = [
      {
        name: 'Payment Record',
        impact: score > 730 ? 'positive' : 'negative',
        description: 'History of on-time payments',
        weight: 35
      },
      {
        name: 'Credit Usage',
        impact: score > 680 ? 'positive' : 'negative',
        description: 'Ratio of used to available credit',
        weight: 30
      },
      {
        name: 'Account History',
        impact: 'positive',
        description: 'Age of credit accounts',
        weight: 15
      },
      {
        name: 'Inquiries',
        impact: score > 660 ? 'neutral' : 'negative',
        description: 'Number of recent credit checks',
        weight: 20
      }
    ];

    const recommendations: string[] = [];
    if (score < 680) {
      recommendations.push('Improve payment history');
      recommendations.push('Lower credit card balances');
    }

    return {
      bureau: 'Equifax',
      score,
      range: this.getScoreRange(score),
      lastUpdated: new Date().toISOString(),
      factors,
      recommendations
    };
  }

  /**
   * Get score range description
   */
  private getScoreRange(score: number): string {
    if (score >= 800) return 'Excellent';
    if (score >= 750) return 'Very Good';
    if (score >= 700) return 'Good';
    if (score >= 650) return 'Fair';
    if (score >= 600) return 'Poor';
    return 'Very Poor';
  }

  /**
   * Get overall credit health summary
   */
  getCreditHealthSummary(scores: CreditScore[]): {
    averageScore: number;
    highestBureau: string;
    lowestBureau: string;
    overallRating: string;
    keyInsights: string[];
  } {
    if (scores.length === 0) {
      return {
        averageScore: 0,
        highestBureau: 'N/A',
        lowestBureau: 'N/A',
        overallRating: 'No Data',
        keyInsights: ['No credit scores available']
      };
    }

    const averageScore = Math.round(scores.reduce((sum, s) => sum + s.score, 0) / scores.length);
    const highest = scores.reduce((prev, current) => prev.score > current.score ? prev : current);
    const lowest = scores.reduce((prev, current) => prev.score < current.score ? prev : current);

    const overallRating = this.getScoreRange(averageScore);

    const keyInsights: string[] = [];
    if (highest.bureau !== lowest.bureau) {
      keyInsights.push(`Score varies by ${highest.score - lowest.score} points between bureaus`);
    }
    if (averageScore < 700) {
      keyInsights.push('Consider improving credit habits to boost score');
    }
    if (averageScore >= 750) {
      keyInsights.push('Excellent credit score - eligible for best rates');
    }

    return {
      averageScore,
      highestBureau: highest.bureau,
      lowestBureau: lowest.bureau,
      overallRating,
      keyInsights
    };
  }
}

export default CreditBureauService;