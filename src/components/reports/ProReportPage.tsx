import React from 'react';
import { GlassMorphismCard } from '../ui/AdvancedComponents';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ChartData {
  name: string;
  value: number;
}

interface ProReportPageProps {
  reportId: string;
  reportType: 'bank' | 'gst';
  chartData: ChartData[];
  summary: string;
}

export default function ProReportPage({ reportId, reportType, chartData, summary }: ProReportPageProps) {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <GlassMorphismCard className="p-8 mb-8">
        <h1 className="text-3xl font-bold mb-2">Report #{reportId}</h1>
        <p className="text-lg text-gray-600 mb-4">Type: {reportType === 'bank' ? 'Bank Statement' : 'GST Statement'}</p>
        <p className="mb-6">{summary}</p>
        <div className="w-full h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </GlassMorphismCard>
    </div>
  );
}