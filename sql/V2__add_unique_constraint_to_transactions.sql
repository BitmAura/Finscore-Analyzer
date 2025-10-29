'''-- Phase 3: The Continuous Account Model
-- Step 1.1: Add a unique constraint to the new transactions table.
-- This is critical for the 'upsert' logic, which prevents duplicate transactions
-- when users upload statements with overlapping date ranges.

ALTER TABLE public.transactions
ADD CONSTRAINT unique_transaction_per_account 
UNIQUE (account_id, transaction_date, description, amount);

SELECT 'V2__add_unique_constraint_to_transactions.sql executed successfully.' as status;
'''