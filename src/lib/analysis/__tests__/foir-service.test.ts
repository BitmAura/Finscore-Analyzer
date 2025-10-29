import { describe, it, expect } from 'vitest';
import { calculateFOIR } from '../foir-service';
import { Transaction } from '../../parsing/transaction-parser';

describe('FOIR Service', () => {
  it('should run without errors with empty transactions', () => {
    const emptyTransactions: Transaction[] = [];
    const analysis = calculateFOIR(emptyTransactions);
    expect(analysis).toBeDefined();
    expect(analysis.foir).toBe(0);
  });
});