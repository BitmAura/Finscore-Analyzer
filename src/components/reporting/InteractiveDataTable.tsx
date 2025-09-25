"use client";

import React, { useState } from 'react';

interface InteractiveDataTableProps {
  data: any[];
}

export default function InteractiveDataTable({ data }: InteractiveDataTableProps) {
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const handleRowClick = (index: number) => {
    if (expandedRow === index) {
      setExpandedRow(null);
    } else {
      setExpandedRow(index);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-bold text-gray-800 mb-4">All Transactions</h2>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Debit</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Credit</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((transaction, index) => (
            <React.Fragment key={index}>
              <tr onClick={() => handleRowClick(index)} className="cursor-pointer hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(transaction.date).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.description}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-500">{transaction.debit}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-500">{transaction.credit}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.balance}</td>
              </tr>
              {expandedRow === index && (
                <tr>
                  <td colSpan={5} className="p-4 bg-gray-100">
                    <div className="text-sm text-gray-700">
                      <p><span className="font-semibold">Category:</span> {transaction.category}</p>
                      <p><span className="font-semibold">Reference:</span> {transaction.reference}</p>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
