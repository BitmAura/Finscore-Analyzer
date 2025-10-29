export interface Transaction {
  date: string;
  description: string;
  debit: number | null;
  credit: number | null;
  balance: number;
  category?: string;
  job_id: string; // Added missing job_id property
  user_id?: string; // Added missing user_id property
}