import { Readable } from 'stream'
import csv from 'csv-parser'
import * as XLSX from 'xlsx'

export interface TransactionRow {
  date: string
  description: string
  debitAmount: number
  creditAmount: number
  balance?: number
}

export function isGstDescription(desc: string): boolean {
  return /\bGST\b|goods and services tax|GSTR|PMT-?06/i.test(desc || '')
}

export function computeGstMetricsFromTransactions(transactions: TransactionRow[]) {
  const gstTxns = transactions.filter(t => isGstDescription(t.description))
  const payments = gstTxns.filter(t => (t.debitAmount || 0) > 0)
  const refunds = gstTxns.filter(t => (t.creditAmount || 0) > 0)

  const total_payments = payments.reduce((s, t) => s + (t.debitAmount || 0), 0)
  const total_refunds = refunds.reduce((s, t) => s + (t.creditAmount || 0), 0)

  const monthKey = (d: string) => {
    const m = d?.match(/(\d{2})[-/](\d{2})[-/](\d{4})/) || d?.match(/(\d{4})[-/](\d{2})[-/](\d{2})/)
    if (m) {
      const [y, mo] = m[1]?.length === 4 ? [m[1], m[2]] : [m[3], m[2]]
      return `${y}-${mo}`
    }
    return d || ''
  }

  const months: Record<string, { payments: number; refunds: number }> = {}
  for (const t of payments) {
    const k = monthKey(t.date)
    months[k] = months[k] || { payments: 0, refunds: 0 }
    months[k].payments += 1
  }
  for (const t of refunds) {
    const k = monthKey(t.date)
    months[k] = months[k] || { payments: 0, refunds: 0 }
    months[k].refunds += 1
  }

  const months_with_activity = Object.keys(months).filter(Boolean).length

  return {
    payments_count: payments.length,
    refunds_count: refunds.length,
    months_with_activity,
    total_payments,
    total_refunds,
    months,
  }
}

export async function tryParseTransactionsFromCsv(buffer: Buffer): Promise<TransactionRow[]> {
  const rows: any[] = []
  await new Promise<void>((resolve, reject) => {
    const stream = Readable.from(buffer)
    stream
      .pipe(csv())
      .on('data', (data) => rows.push(data))
      .on('end', () => resolve())
      .on('error', (err) => reject(err))
  })
  return normalizeRows(rows)
}

export function tryParseTransactionsFromXlsx(buffer: Buffer): TransactionRow[] {
  const wb = XLSX.read(buffer, { type: 'buffer' })
  const sheetName = wb.SheetNames[0]
  const ws = wb.Sheets[sheetName]
  const rows: any[] = XLSX.utils.sheet_to_json(ws, { raw: false })
  return normalizeRows(rows)
}

function normalizeRows(rows: any[]): TransactionRow[] {
  const mapKey = (obj: any, keys: string[]) => {
    const found = Object.keys(obj || {}).find(k => keys.some(t => k.toLowerCase().includes(t)))
    return found ? obj[found] : undefined
  }
  return rows.map(r => {
    const date = (mapKey(r, ['date', 'txn date', 'transaction date']) || '').toString()
    const description = (mapKey(r, ['desc', 'description', 'narration', 'particulars']) || '').toString()
    const debitRaw = mapKey(r, ['debit', 'withdrawal', 'debit amount'])
    const creditRaw = mapKey(r, ['credit', 'deposit', 'credit amount'])
    const balanceRaw = mapKey(r, ['balance', 'closing balance'])
    const toNum = (v: any) => {
      if (v == null || v === '') return 0
      const s = v.toString().replace(/[,₹]/g, '').trim()
      const n = parseFloat(s)
      return isNaN(n) ? 0 : n
    }
    return {
      date,
      description,
      debitAmount: toNum(debitRaw),
      creditAmount: toNum(creditRaw),
      balance: balanceRaw != null ? toNum(balanceRaw) : undefined,
    }
  })
}
