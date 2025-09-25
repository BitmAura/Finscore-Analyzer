import { Transaction } from '../parsing/transaction-parser';

export interface RedAlert {
  type: 'LowBalance' | 'LargeCashWithdrawal' | 'ChequeBounce';
  message: string;
  transactionId?: string; // Optional: link to a specific transaction
}

const LOW_BALANCE_THRESHOLD = 1000;
const LARGE_CASH_WITHDRAWAL_THRESHOLD = 50000;
const CHEQUE_BOUNCE_KEYWORDS = ['CHEQUE RETURN', 'CHQ BOUNCE', 'INSUFFICIENT FUNDS', 'RETCHQ'];

export const detectRedAlerts = (transactions: Transaction[]): RedAlert[] => {
  const alerts: RedAlert[] = [];

  transactions.forEach((t, index) => {
    // 1. Low Balance Alert
    if (t.balance < LOW_BALANCE_THRESHOLD) {
      alerts.push({
        type: 'LowBalance',
        message: `Balance dropped to ${t.balance.toFixed(2)}, which is below the threshold of ${LOW_BALANCE_THRESHOLD}.`,
        transactionId: `txn_${index}`, // A simple temporary ID
      });
    }

    // 2. Large Cash Withdrawal Alert
    const description = t.description.toUpperCase();
    if (t.debit && t.debit > LARGE_CASH_WITHDRAWAL_THRESHOLD && (description.includes('ATM') || description.includes('CASH WDL'))) {
      alerts.push({
        type: 'LargeCashWithdrawal',
        message: `A large cash withdrawal of ${t.debit.toFixed(2)} was made.`,
        transactionId: `txn_${index}`,
      });
    }

    // 3. Cheque Bounce Alert
    for (const keyword of CHEQUE_BOUNCE_KEYWORDS) {
      if (description.includes(keyword)) {
        alerts.push({
          type: 'ChequeBounce',
          message: `A potential cheque bounce was detected with description: "${t.description}"`,
          transactionId: `txn_${index}`,
        });
        break; // Avoid adding multiple bounce alerts for the same transaction
      }
    }
  });

  return alerts;
};
