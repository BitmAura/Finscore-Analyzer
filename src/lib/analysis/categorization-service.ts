import { Transaction } from '../parsing/transaction-parser';

export type TransactionCategory = string;

export interface CategorizedTransaction extends Transaction {
  category: string;
  subcategory?: string;
  confidence: number;
  user_id?: string; // Explicitly included for clarity
}

// Comprehensive category keywords
const CATEGORY_PATTERNS = {
  'Salary & Income': {
    keywords: ['salary', 'wages', 'payroll', 'income', 'bonus', 'commission', 'reimbursement'],
    subcategories: ['salary', 'bonus', 'freelance', 'investment_income']
  },
  'Food & Dining': {
    keywords: ['restaurant', 'food', 'zomato', 'swiggy', 'cafe', 'coffee', 'dining', 'pizza', 'burger', 'dominos', 'mcdonalds', 'kfc'],
    subcategories: ['restaurants', 'groceries', 'food_delivery']
  },
  'Shopping': {
    keywords: ['amazon', 'flipkart', 'myntra', 'shop', 'retail', 'store', 'mall', 'purchase', 'reliance', 'bigbazaar'],
    subcategories: ['online_shopping', 'retail', 'clothing', 'electronics']
  },
  'Transportation': {
    keywords: ['uber', 'ola', 'taxi', 'transport', 'petrol', 'diesel', 'fuel', 'parking', 'toll', 'metro', 'railway', 'bus', 'flight'],
    subcategories: ['ride_sharing', 'fuel', 'public_transport', 'parking']
  },
  'Utilities': {
    keywords: ['electricity', 'water', 'gas', 'internet', 'broadband', 'wifi', 'mobile', 'phone', 'recharge', 'bill', 'utility'],
    subcategories: ['electricity', 'water', 'internet', 'mobile']
  },
  'Entertainment': {
    keywords: ['movie', 'netflix', 'prime', 'hotstar', 'spotify', 'gaming', 'entertainment', 'theater', 'cinema'],
    subcategories: ['streaming', 'movies', 'gaming', 'events']
  },
  'Healthcare': {
    keywords: ['hospital', 'clinic', 'doctor', 'medical', 'pharmacy', 'medicine', 'health', 'insurance', 'apollo', 'fortis'],
    subcategories: ['medical', 'pharmacy', 'insurance', 'fitness']
  },
  'Education': {
    keywords: ['school', 'college', 'university', 'education', 'course', 'tuition', 'fees', 'book', 'learning'],
    subcategories: ['tuition', 'books', 'courses', 'supplies']
  },
  'Banking & Finance': {
    keywords: ['atm', 'withdrawal', 'transfer', 'bank', 'interest', 'charge', 'fee', 'emi', 'loan', 'credit card', 'debit card'],
    subcategories: ['atm', 'transfers', 'fees', 'interest', 'emi']
  },
  'Insurance': {
    keywords: ['insurance', 'policy', 'premium', 'lic', 'hdfc life', 'icici pru'],
    subcategories: ['life_insurance', 'health_insurance', 'vehicle_insurance']
  },
  'Investment': {
    keywords: ['mutual fund', 'sip', 'stock', 'equity', 'dividend', 'zerodha', 'groww', 'upstox', 'investment'],
    subcategories: ['mutual_funds', 'stocks', 'fixed_deposits', 'gold']
  },
  'Rent & Housing': {
    keywords: ['rent', 'lease', 'housing', 'maintenance', 'society', 'apartment'],
    subcategories: ['rent', 'maintenance', 'repairs']
  },
  'Travel': {
    keywords: ['hotel', 'travel', 'booking', 'makemytrip', 'goibibo', 'airbnb', 'vacation', 'tour'],
    subcategories: ['hotels', 'flights', 'vacation']
  },
  'Personal Care': {
    keywords: ['salon', 'parlour', 'spa', 'grooming', 'cosmetic', 'beauty'],
    subcategories: ['salon', 'cosmetics', 'grooming']
  },
  'Charity & Donations': {
    keywords: ['donation', 'charity', 'ngo', 'temple', 'church', 'mosque', 'contribution'],
    subcategories: ['religious', 'ngo', 'social']
  },
  'Uncategorized': {
    keywords: [],
    subcategories: []
  }
};

// Score keywords match
function scoreMatch(description: string, keywords: string[]): number {
  const lowerDesc = description.toLowerCase();
  let score = 0;

  for (const keyword of keywords) {
    if (lowerDesc.includes(keyword)) {
      // Exact word match gets higher score
      const regex = new RegExp(`\\b${keyword}\\b`, 'i');
      score += regex.test(description) ? 2 : 1;
    }
  }

  return score;
}

// Categorize a single transaction
export function categorizeTransaction(transaction: Transaction): CategorizedTransaction {
  const { description } = transaction;

  let bestCategory = 'Uncategorized';
  let bestScore = 0;
  let confidence = 0;

  // Check each category
  for (const [category, config] of Object.entries(CATEGORY_PATTERNS)) {
    const score = scoreMatch(description, config.keywords);
    if (score > bestScore) {
      bestScore = score;
      bestCategory = category;
    }
  }

  // Calculate confidence (0-1 scale)
  confidence = Math.min(bestScore / 5, 1); // Normalize to 0-1

  // If confidence is too low, mark as uncategorized
  if (confidence < 0.3) {
    bestCategory = 'Uncategorized';
  }

  return {
    ...transaction,
    category: bestCategory,
    confidence
  };
}

// Categorize all transactions
export function categorizeTransactions(transactions: Transaction[]): CategorizedTransaction[] {
  return transactions.map(categorizeTransaction);
}

export { categorizeTransactions as categorizeAllTransactions };

// Get category statistics
export interface CategoryStats {
  category: string;
  count: number;
  totalDebit: number;
  totalCredit: number;
  netAmount: number;
  percentage: number;
}

export function getCategoryStats(transactions: CategorizedTransaction[]): CategoryStats[] {
  const categoryMap = new Map<string, CategoryStats>();
  let totalAmount = 0;

  // Calculate totals
  transactions.forEach(tx => {
    const category = tx.category || 'Uncategorized';
    const debit = tx.debit || 0;
    const credit = tx.credit || 0;

    totalAmount += Math.abs(debit - credit);

    if (!categoryMap.has(category)) {
      categoryMap.set(category, {
        category,
        count: 0,
        totalDebit: 0,
        totalCredit: 0,
        netAmount: 0,
        percentage: 0
      });
    }

    const stats = categoryMap.get(category)!;
    stats.count++;
    stats.totalDebit += debit;
    stats.totalCredit += credit;
    stats.netAmount += (credit - debit);
  });

  // Calculate percentages
  const result = Array.from(categoryMap.values());
  result.forEach(stat => {
    stat.percentage = totalAmount > 0 ? (Math.abs(stat.netAmount) / totalAmount) * 100 : 0;
  });

  // Sort by net amount (descending)
  return result.sort((a, b) => Math.abs(b.netAmount) - Math.abs(a.netAmount));
}

// Export category list for UI
export function getAllCategories(): string[] {
  return Object.keys(CATEGORY_PATTERNS);
}
