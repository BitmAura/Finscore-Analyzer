"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import KpiCard from "@/components/dashboard/KpiCard";
import CashFlowChart from "@/components/dashboard/CashFlowChart";
import TransactionTable from "@/components/dashboard/TransactionTable";
import ExpenseTreemap from "@/components/dashboard/ExpenseTreemap";
import DownloadPdfButton from "@/components/dashboard/DownloadPdfButton";
import TrendReport from "@/components/dashboard/TrendReport";
import AnomalyReport from "@/components/dashboard/AnomalyReport";
import ExecutiveSummary from "@/components/dashboard/ExecutiveSummary";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// --- Mock Data --- //
const mockAnalysisData = {
  ai_executive_summary:
    "This month shows a strong financial performance with a healthy savings rate of 25.5%. Income streams are consistent, primarily from a monthly salary. The largest expense category was 'Housing', followed by 'Food' and 'Transport'. A notable anomaly is a one-time high expenditure on 'Electronics', which impacted the overall savings. Cash flow remained positive throughout the month, indicating good liquidity. The spending trend in 'Subscriptions' has increased by 15% compared to the previous period, which might be an area for review.",
  summary: {
    totalIncome: 8000,
    totalExpenses: 5960,
    netSavings: 2040,
    savingsRate: 25.5,
  },
  transactions: [
    {
      date: "2025-09-01",
      description: "Monthly Salary",
      amount: 8000,
      type: "income",
      category: "Salary",
    },
    {
      date: "2025-09-01",
      description: "Apartment Rent",
      amount: -2200,
      type: "expense",
      category: "Housing",
    },
    {
      date: "2025-09-02",
      description: "Spotify Subscription",
      amount: -10,
      type: "expense",
      category: "Subscriptions",
    },
    {
      date: "2025-09-03",
      description: "Grocery Shopping at MegaMart",
      amount: -150,
      type: "expense",
      category: "Food",
    },
    {
      date: "2025-09-05",
      description: "Dinner with friends",
      amount: -85,
      type: "expense",
      category: "Social",
    },
    {
      date: "2025-09-06",
      description: "Netflix Subscription",
      amount: -15,
      type: "expense",
      category: "Subscriptions",
    },
    {
      date: "2025-09-07",
      description: "Gasoline for Car",
      amount: -60,
      type: "expense",
      category: "Transport",
    },
    {
      date: "2025-09-10",
      description: "New 4K TV from Best Electronics",
      amount: -1200,
      type: "expense",
      category: "Electronics",
    },
    {
      date: "2025-09-12",
      description: "Freelance Project Payment",
      amount: 1500,
      type: "income",
      category: "Freelance",
    },
    {
      date: "2025-09-15",
      description: "Electricity Bill",
      amount: -75,
      type: "expense",
      category: "Utilities",
    },
    {
      date: "2025-09-16",
      description: "Lunch at The Daily Grind",
      amount: -25,
      type: "expense",
      category: "Food",
    },
    {
      date: "2025-09-18",
      description: "Public Transport Pass",
      amount: -50,
      type: "expense",
      category: "Transport",
    },
    {
      date: "2025-09-20",
      description: "Gym Membership",
      amount: -40,
      type: "expense",
      category: "Health",
    },
    {
      date: "2025-09-22",
      description: "Groceries from Local Market",
      amount: -120,
      type: "expense",
      category: "Food",
    },
    {
      date: "2025-09-25",
      description: "Internet Bill",
      amount: -60,
      type: "expense",
      category: "Utilities",
    },
    {
      date: "2025-09-28",
      description: "Movie Tickets",
      amount: -30,
      type: "expense",
      category: "Entertainment",
    },
    {
      date: "2025-09-30",
      description: "Phone Bill",
      amount: -45,
      type: "expense",
      category: "Utilities",
    },
  ],
  trends: [
    {
      category: "Subscriptions",
      change: 15,
      description:
        "Spending on subscriptions has increased by 15% this month.",
    },
    {
      category: "Food",
      change: -5,
      description:
        "Spending on food has decreased by 5% compared to last month.",
    },
  ],
  anomalies: [
    {
      date: "2025-09-10",
      amount: -1200,
      description:
        "Unusually high one-time purchase in Electronics category.",
      category: "Electronics",
    },
    {
      date: "2025-09-05",
      amount: -85,
      description:
        "Spending in Social category is 50% higher than the monthly average.",
      category: "Social",
    },
  ],
};

const DemoReportPage: React.FC = () => {
  const router = useRouter();
  const reportRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading a demo report
    const loadDemoReport = async () => {
      // In a real app, this would fetch demo data
      setTimeout(() => {
        setIsLoading(false);
      }, 2000);
    };

    loadDemoReport();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
          <p className="mt-4 text-lg">Loading demo report...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Sample Financial Analysis
          </h1>
          <p className="mt-2 text-base sm:text-lg text-gray-400">
            This is a demo of what Finscore-Analyzer can do for you.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row items-center gap-4">
          <Link href="/my-reports" passHref>
            <Button>Create Your Own Report</Button>
          </Link>
          <DownloadPdfButton
            reportRef={reportRef}
            fileName="sample-financial-report"
          />
        </div>
      </header>

      <div ref={reportRef} className="space-y-8 p-8 bg-gray-900 rounded-lg">
        {mockAnalysisData.ai_executive_summary && (
          <ExecutiveSummary summary={mockAnalysisData.ai_executive_summary} />
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <KpiCard
            title="Total Income"
            valueA={`$${(mockAnalysisData.summary?.totalIncome || 0).toLocaleString()}`}
          />
          <KpiCard
            title="Total Expenses"
            valueA={`$${(mockAnalysisData.summary?.totalExpenses || 0).toLocaleString()}`}
          />
          <KpiCard
            title="Net Savings"
            valueA={`$${(mockAnalysisData.summary?.netSavings || 0).toLocaleString()}`}
          />
          <KpiCard
            title="Savings Rate"
            valueA={`${(mockAnalysisData.summary?.savingsRate || 0).toFixed(2)}%`}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {mockAnalysisData.transactions && (
            <CashFlowChart dataA={mockAnalysisData.transactions} />
          )}
          <ExpenseTreemap />
        </div>

        <TransactionTable />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Spending Trends
            </h3>
            <div className="space-y-4">
              {mockAnalysisData.trends?.map((trend, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                >
                  <span className="font-medium">{trend.category}</span>
                  <div
                    className={`flex items-center ${
                      trend.change > 0 ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    <span className="text-sm font-medium">
                      {trend.change > 0 ? "+" : ""}
                      {trend.change}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Financial Anomalies
            </h3>
            <div className="space-y-4">
              {mockAnalysisData.anomalies?.map((anomaly, index) => (
                <div
                  key={index}
                  className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-yellow-800">
                      {anomaly.category}
                    </span>
                    <span className="text-sm text-yellow-600">
                      {anomaly.date}
                    </span>
                  </div>
                  <p className="text-sm text-yellow-700">
                    ${Math.abs(anomaly.amount).toLocaleString()} -{" "}
                    {anomaly.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoReportPage;
