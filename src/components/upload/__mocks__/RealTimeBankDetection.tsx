import React, { useEffect } from 'react';

interface RealTimeBankDetectionProps {
  onDetectionComplete: (results: any[]) => void;
}

const RealTimeBankDetection = ({ onDetectionComplete }: RealTimeBankDetectionProps) => {
  useEffect(() => {
    // Simulate real-world async detection with a slight delay
    const timer = setTimeout(() => {
      // Immediately call the completion callback with mock data
      onDetectionComplete([
        {
          bankCode: 'HDFC',
          bankName: 'HDFC Bank',
          accountNumber: '...1234',
          accountName: 'Test User',
          processingStatus: 'completed',
          confidence: 0.95,
          transactionCount: 150,
          dateRange: {
            from: '2024-01-01',
            to: '2024-12-31',
          },
        },
      ]);
    }, 100); // Small delay to simulate processing

    return () => clearTimeout(timer);
  }, [onDetectionComplete]);

  return (
    <div data-testid="mock-bank-detection" className="p-4 bg-gray-50 rounded">
      <p className="text-sm text-gray-600">Mock Bank Detection - Processing...</p>
    </div>
  );
};

export default RealTimeBankDetection;
