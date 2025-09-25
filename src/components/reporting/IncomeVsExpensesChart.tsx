"use client";

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface IncomeVsExpensesChartProps {
  data: any[];
}

export default function IncomeVsExpensesChart({ data }: IncomeVsExpensesChartProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Income vs. Expenses</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="totalIncome" fill="#82ca9d" />
          <Bar dataKey="totalExpenses" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
