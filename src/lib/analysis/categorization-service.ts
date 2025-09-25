import { Transaction } from '../parsing/transaction-parser';

// Define the possible categories
export type TransactionCategory = 
  | 'Food & Drink'
  | 'Shopping'
  | 'Transport'
  | 'Bills & Utilities'
  | 'Entertainment'
  | 'Groceries'
  | 'Health & Wellness'
  | 'Salary'
  | 'Transfers'
  | 'Other';

// A dictionary of keywords to identify categories. This is the core of the rule-based engine.
const categoryKeywords: { [key in TransactionCategory]: string[] } = {
  'Food & Drink': ['ZOMATO', 'SWIGGY', 'RESTAURANT', 'CAFE', 'FOODPANDA', 'DOMINOS', 'PIZZA HUT', 'MCDONALDS'],
  'Shopping': ['AMAZON', 'FLIPKART', 'MYNTRA', 'SHOPPERS STOP', 'LIFESTYLE', 'DECATHLON', 'AJIO', 'NYKAA'],
  'Transport': ['UBER', 'OLA', 'RAPIDO', 'METRO', 'INDIAN RAIL', 'IRCTC', 'INDIGO', 'SPICEJET', 'VISTARA'],
  'Bills & Utilities': ['VODAFONE', 'AIRTEL', 'JIOPAY', 'BSES', 'ELECTRICITY', 'MOBILE RECHARGE', 'PAYTM', 'BILLDESK'],
  'Entertainment': ['BOOKMYSHOW', 'PVR', 'INOX', 'NETFLIX', 'SPOTIFY', 'PRIME VIDEO', 'HOTSTAR'],
  'Groceries': ['BIGBASKET', 'GROFERS', 'BLINKIT', 'ZEPTO', 'DMART', 'RELIANCE FRESH'],
  'Health & Wellness': ['APOLLO PHARMACY', 'PHARMEASY', '1MG', 'CULT FIT', 'GYM'],
  'Salary': ['SALARY', 'SAL', 'PAYROLL'],
  'Transfers': ['IMPS', 'NEFT', 'RTGS', 'UPI', 'PAYMENT'],
  'Other': [], // Fallback category
};

/**
 * Categorizes a single transaction based on its description.
 * @param transaction The transaction to categorize.
 * @returns The determined category.
 */
export const categorizeTransaction = (transaction: Transaction): TransactionCategory => {
  const description = transaction.description.toUpperCase();
  
  // Handle transfers first as they can contain other keywords
  if (categoryKeywords.Transfers.some(keyword => description.includes(keyword))) {
    return 'Transfers';
  }

  for (const category in categoryKeywords) {
    if (category === 'Transfers') continue; // Already handled

    for (const keyword of categoryKeywords[category as TransactionCategory]) {
      if (description.includes(keyword)) {
        return category as TransactionCategory;
      }
    }
  }
  return 'Other';
};

/**
 * Processes a list of transactions and adds a category to each one.
 * @param transactions The array of transactions.
 * @returns A new array of transactions, each with a 'category' field.
 */
export const categorizeAllTransactions = (transactions: Transaction[]): (Transaction & { category: TransactionCategory })[] => {
    return transactions.map(t => ({
        ...t,
        category: categorizeTransaction(t),
    }));
};
