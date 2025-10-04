'use client'

import React, { useState } from 'react';

interface DateRangePickerProps {
  onCompare: (periodA: { start: string; end: string }, periodB: { start: string; end: string }) => void;
  onFilter: (period: { start: string; end: string }) => void;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({ onCompare, onFilter }) => {
  const [periodA, setPeriodA] = useState({ start: '', end: '' });
  const [periodB, setPeriodB] = useState({ start: '', end: '' });
  const [isComparing, setIsComparing] = useState(false);

  const handleCompare = () => {
    if (periodA.start && periodA.end && periodB.start && periodB.end) {
      onCompare(periodA, periodB);
    }
  };

  const handleFilter = () => {
    if (periodA.start && periodA.end) {
      onFilter(periodA);
    }
  };

  return (
    <div className="p-4 bg-gray-800/50 rounded-lg flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
      <div className="flex-1">
        <label className="text-sm font-medium text-gray-400">Period A</label>
        <div className="flex space-x-2">
          <input type="date" value={periodA.start} onChange={e => setPeriodA({ ...periodA, start: e.target.value })} className="bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white w-full" />
          <input type="date" value={periodA.end} onChange={e => setPeriodA({ ...periodA, end: e.target.value })} className="bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white w-full" />
        </div>
      </div>

      {isComparing && (
        <div className="flex-1">
          <label className="text-sm font-medium text-gray-400">Period B</label>
          <div className="flex space-x-2">
            <input type="date" value={periodB.start} onChange={e => setPeriodB({ ...periodB, start: e.target.value })} className="bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white w-full" />
            <input type="date" value={periodB.end} onChange={e => setPeriodB({ ...periodB, end: e.target.value })} className="bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white w-full" />
          </div>
        </div>
      )}

      <div className="flex items-center space-x-2">
        <button onClick={() => setIsComparing(!isComparing)} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md font-medium">
          {isComparing ? 'Cancel Compare' : 'Compare'}
        </button>
        <button onClick={isComparing ? handleCompare : handleFilter} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium">
          {isComparing ? 'Run Comparison' : 'Apply Filter'}
        </button>
      </div>
    </div>
  );
};

export default DateRangePicker;
