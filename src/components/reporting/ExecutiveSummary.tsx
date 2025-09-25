"use client";

import React from 'react';

interface ExecutiveSummaryProps {
  summary: string;
}

export default function ExecutiveSummary({ summary }: ExecutiveSummaryProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Executive Summary</h2>
      <p className="text-gray-600">{summary}</p>
    </div>
  );
}
