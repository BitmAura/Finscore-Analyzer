"use client";

import React, { useState } from 'react';
import { PlusIcon, SearchIcon, RefreshIcon } from '@heroicons/react/solid';
// import CreateNewReportModal from '../../components/dashboard/CreateNewReportModal';

const reportsData = [
  { id: 1, name: 'BALA (BSA)', referenceId: 'kou', status: 'Report Ready', createdOn: '23 Aug 2025 10:47 AM', createdBy: 'trbrns.finance@gmail.com' },
  { id: 2, name: 'MOHAN (BSA)', referenceId: 'kou', status: 'Report Ready', createdOn: '23 Aug 2025 10:37 AM', createdBy: 'trbrns.finance@gmail.com' },
  { id: 3, name: 'F02B (BSA)', referenceId: 'F02b', status: 'Report Ready', createdOn: '23 Aug 2025 10:35 AM', createdBy: 'trbrns.finance@gmail.com' },
  { id: 4, name: 'MAYIL (BSA)', referenceId: 'mayl', status: 'Report Ready', createdOn: '23 Aug 2025 10:29 AM', createdBy: 'trbrns.finance@gmail.com' },
  { id: 5, name: 'PRATHAP (BSA)', referenceId: 'F035', status: 'Report Ready', createdOn: '23 Aug 2025 10:22 AM', createdBy: 'trbrns.finance@gmail.com' },
];

export default function MyReportsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* <CreateNewReportModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} /> */}
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">My Reports</h1>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search the Report name"
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button className="px-4 py-2 border border-gray-300 rounded-lg flex items-center space-x-2 bg-white hover:bg-gray-100">
              <RefreshIcon className="w-5 h-5 text-gray-600" />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center space-x-2 hover:bg-blue-700"
            >
              <PlusIcon className="w-5 h-5" />
              <span>New Report</span>
            </button>
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Report Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created On</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created By</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reportsData.map((report) => (
                <tr key={report.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{report.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.referenceId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {report.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.createdOn}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.createdBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination can be added here */}
      </div>
    </div>
  );
}

