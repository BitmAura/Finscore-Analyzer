import ComprehensiveReport from '../../components/reports/ComprehensiveReport'

// Sample data that matches the ProAnalyser report structure
const sampleReportData = {
  accountInfo: {
    accountNumber: "2461500508004611, 0000003733312918",
    bankName: "Tamilnadu Mercantile Bank, State Bank of India",
    accountType: "Current, Savings",
    holderName: "BALA (Account Holder)",
    analysisStartDate: "01 Apr 2024",
    analysisEndDate: "22 Aug 2025",
    totalDays: 509 // 1 year 4 months 21 days
  },
  summary: {
    totalCredits: 25678000,
    totalDebits: 22890000,
    netBalance: 2788000,
    averageBalance: 1845000,
    minimumBalance: 125000,
    maximumBalance: 3456000,
    totalTransactions: 2847
  },
  uploadedFiles: [
    {
      fileName: "175585846772819YHPNCVKTL6KRz (1).pdf",
      bankName: "State Bank of India",
      accountNo: "0000003733312918",
      accountType: "Savings",
      processed: true,
      authenticated: true,
      fileType: "PDF",
      startDate: "02 May 2025",
      endDate: "22 Aug 2025",
      status: "Verified"
    },
    {
      fileName: "175592583267567DS0t7wMFtRMacHW.pdf",
      bankName: "State Bank of India", 
      accountNo: "0000003733312918",
      accountType: "Savings",
      processed: true,
      authenticated: true,
      fileType: "PDF",
      startDate: "01 May 2025",
      endDate: "20 Jun 2025",
      status: "Verified"
    },
    {
      fileName: "ACSTMT_2467000509020S_175592535960.pdf",
      bankName: "Tamilnadu Mercantile Bank",
      accountNo: "2461500508004611",
      accountType: "Current",
      processed: true,
      authenticated: true,
      fileType: "PDF",
      startDate: "22 Oct 2024",
      endDate: "01 Dec 2024",
      status: "Verified"
    },
    {
      fileName: "ACSTMT_2467000509020S_175592570916.pdf",
      bankName: "Tamilnadu Mercantile Bank",
      accountNo: "2461500508004611", 
      accountType: "Current",
      processed: true,
      authenticated: true,
      fileType: "PDF",
      startDate: "02 Mar 2025",
      endDate: "30 Apr 2025",
      status: "Verified"
    },
    {
      fileName: "ACSTMT_2467000509020S_175592655279.pdf",
      bankName: "Tamilnadu Mercantile Bank",
      accountNo: "2461500508004611",
      accountType: "Current", 
      processed: true,
      authenticated: true,
      fileType: "PDF",
      startDate: "01 May 2025",
      endDate: "30 Jun 2025",
      status: "Verified"
    }
  ],
  transactions: [
    {
      date: "22-08-2025",
      description: "NEFT Cr - Salary Credit from ABC Corp",
      debitAmount: 0,
      creditAmount: 145000,
      balance: 2788000,
      category: "Salary"
    },
    {
      date: "21-08-2025", 
      description: "ATM Withdrawal - SBI ATM MUMBAI",
      debitAmount: 10000,
      creditAmount: 0,
      balance: 2643000,
      category: "ATM"
    },
    {
      date: "20-08-2025",
      description: "UPI Payment - Amazon Pay",
      debitAmount: 2500,
      creditAmount: 0,
      balance: 2653000,
      category: "Shopping"
    },
    {
      date: "19-08-2025",
      description: "RTGS Cr - Investment Return",
      debitAmount: 0,
      creditAmount: 75000,
      balance: 2655500,
      category: "Investment"
    },
    {
      date: "18-08-2025",
      description: "EMI Debit - Home Loan",
      debitAmount: 45000,
      creditAmount: 0,
      balance: 2580500,
      category: "EMI"
    },
    {
      date: "17-08-2025",
      description: "Cheque Deposit - Client Payment",
      debitAmount: 0,
      creditAmount: 125000,
      balance: 2625500,
      category: "Business"
    },
    {
      date: "16-08-2025",
      description: "Online Transfer - Utility Bill",
      debitAmount: 8500,
      creditAmount: 0,
      balance: 2500500,
      category: "Bills"
    },
    {
      date: "15-08-2025",
      description: "GST Payment - Quarterly Filing",
      debitAmount: 125000,
      creditAmount: 0,
      balance: 2509000,
      category: "Tax"
    }
  ],
  chequeReturns: [
    {
      date: "15-07-2025",
      chequeNumber: "000123",
      amount: 25000,
      reason: "Insufficient Funds",
      beneficiary: "XYZ Suppliers"
    },
    {
      date: "02-06-2025", 
      chequeNumber: "000098",
      amount: 15000,
      reason: "Stop Payment",
      beneficiary: "ABC Services"
    }
  ],
  atmWithdrawals: [
    {
      date: "21-08-2025",
      location: "SBI ATM MUMBAI - BANDRA WEST",
      amount: 10000,
      balance: 2643000
    },
    {
      date: "18-08-2025",
      location: "HDFC ATM MUMBAI - ANDHERI",
      amount: 5000,
      balance: 2575500
    },
    {
      date: "15-08-2025",
      location: "ICICI ATM MUMBAI - POWAI",
      amount: 8000,
      balance: 2501000
    },
    {
      date: "12-08-2025",
      location: "SBI ATM MUMBAI - GOREGAON",
      amount: 6000,
      balance: 2468000
    }
  ],
  recurringCredits: [
    {
      description: "Salary Credit - ABC Corporation",
      amount: 145000,
      frequency: "Monthly",
      lastDate: "22-08-2025",
      count: 14
    },
    {
      description: "Rental Income - Property XYZ",
      amount: 35000,
      frequency: "Monthly", 
      lastDate: "01-08-2025",
      count: 12
    },
    {
      description: "Investment Dividend - Mutual Fund",
      amount: 12500,
      frequency: "Quarterly",
      lastDate: "19-08-2025",
      count: 4
    }
  ],
  recurringDebits: [
    {
      description: "Home Loan EMI - SBI",
      amount: 45000,
      frequency: "Monthly",
      lastDate: "18-08-2025",
      count: 14
    },
    {
      description: "Car Loan EMI - HDFC Bank",
      amount: 18500,
      frequency: "Monthly",
      lastDate: "20-08-2025", 
      count: 10
    },
    {
      description: "Insurance Premium - LIC",
      amount: 15000,
      frequency: "Quarterly",
      lastDate: "15-07-2025",
      count: 3
    },
    {
      description: "Electricity Bill - BEST Mumbai",
      amount: 3500,
      frequency: "Monthly",
      lastDate: "16-08-2025",
      count: 14
    }
  ],
  cashflowAnalysis: {
    monthlyData: [
      {
        month: "Aug 2025",
        credits: 2800000,
        debits: 2250000,
        netFlow: 550000
      },
      {
        month: "Jul 2025",
        credits: 1950000,
        debits: 1780000,
        netFlow: 170000
      },
      {
        month: "Jun 2025", 
        credits: 1890000,
        debits: 1995000,
        netFlow: -105000
      },
      {
        month: "May 2025",
        credits: 2150000,
        debits: 1890000,
        netFlow: 260000
      },
      {
        month: "Apr 2025",
        credits: 1980000,
        debits: 1850000,
        netFlow: 130000
      },
      {
        month: "Mar 2025",
        credits: 1750000,
        debits: 1650000,
        netFlow: 100000
      }
    ],
    trends: {
      creditTrend: "Increasing",
      debitTrend: "Stable", 
      balanceTrend: "Growing"
    }
  },
  riskAssessment: {
    riskScore: 25,
    riskLevel: "Low",
    factors: [
      {
        factor: "Cheque Returns",
        impact: "Medium",
        severity: "Moderate"
      },
      {
        factor: "High EMI to Income Ratio",
        impact: "Medium", 
        severity: "Moderate"
      },
      {
        factor: "Occasional Negative Cash Flow",
        impact: "Low",
        severity: "Minor"
      }
    ]
  }
}

export default function DemoReport() {
  return (
    <div className="min-h-screen">
      <ComprehensiveReport data={sampleReportData} />
    </div>
  )
}