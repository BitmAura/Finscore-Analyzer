import type { TransactionRow } from './gst'

const SALARY_RX = /(salary|payroll|salary credit|salary cr)/i
const EMI_RX = /(emi|loan\s*emi|si-emi|ecs-emi)/i
const ATM_RX = /(atm\s*withdrawal|atm\s*wdl|cash\s*withdrawal)/i
const CHEQUE_RETURN_RX = /(chq\s*ret|cheque\s*return|return\s*chq|rd chq)/i

export function computeBankMetrics(transactions: TransactionRow[]) {
  const totals = transactions.reduce(
    (acc, t) => {
      acc.total_credits += t.creditAmount || 0
      acc.total_debits += t.debitAmount || 0
      acc.count += 1
      if (typeof t.balance === 'number') {
        acc.min_balance = acc.min_balance == null ? t.balance : Math.min(acc.min_balance, t.balance)
        acc.max_balance = acc.max_balance == null ? t.balance : Math.max(acc.max_balance, t.balance)
      }
      if (SALARY_RX.test(t.description)) acc.salary_credits += t.creditAmount || 0
      if (EMI_RX.test(t.description)) acc.emi_debits += t.debitAmount || 0
      if (ATM_RX.test(t.description)) acc.atm_withdrawals += t.debitAmount || 0
      if (CHEQUE_RETURN_RX.test(t.description)) {
        acc.cheque_returns += 1
        acc.cheque_return_amount += t.debitAmount || t.creditAmount || 0
      }
      return acc
    },
    {
      total_credits: 0,
      total_debits: 0,
      count: 0,
      min_balance: undefined as number | undefined,
      max_balance: undefined as number | undefined,
      salary_credits: 0,
      emi_debits: 0,
      atm_withdrawals: 0,
      cheque_returns: 0,
      cheque_return_amount: 0,
    }
  )

  // Recurring patterns (naive): group by normalized description tokens
  const norm = (s: string) => (s || '').toLowerCase().replace(/\s+/g, ' ').slice(0, 48)
  const groups: Record<string, { c: number; credits: number; debits: number }> = {}
  for (const t of transactions) {
    const key = norm(t.description)
    groups[key] = groups[key] || { c: 0, credits: 0, debits: 0 }
    groups[key].c += 1
    groups[key].credits += t.creditAmount || 0
    groups[key].debits += t.debitAmount || 0
  }
  const recurring = Object.entries(groups)
    .filter(([, v]) => v.c >= 3)
    .sort((a, b) => b[1].credits + b[1].debits - (a[1].credits + a[1].debits))
    .slice(0, 10)
    .map(([k, v]) => ({ description: k, count: v.c, credits: v.credits, debits: v.debits }))

  // Simple risk/compliance proxies
  const emi_to_income_ratio = totals.salary_credits > 0 ? totals.emi_debits / totals.salary_credits : null
  const risk_score = Math.min(100, Math.max(0,
    (emi_to_income_ratio != null ? emi_to_income_ratio * 60 : 0) +
    (totals.cheque_returns * 5)
  ))
  const compliance_score = Math.max(0, 100 - (totals.cheque_returns * 5))

  return {
    totals,
    recurring,
    emi_to_income_ratio,
    risk_score: Math.round(risk_score),
    compliance_score: Math.round(compliance_score),
  }
}
