"use client";

import React from 'react';
import { ExclamationIcon } from '@heroicons/react/solid';

interface RedAlertsProps {
  alerts: any[];
}

export default function RedAlerts({ alerts }: RedAlertsProps) {
  if (!alerts || alerts.length === 0) {
    return null;
  }

  return (
    <div className="bg-red-50 border-l-4 border-red-400 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <ExclamationIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">Red Alerts</h3>
          <div className="mt-2 text-sm text-red-700">
            <ul className="list-disc pl-5 space-y-1">
              {alerts.map((alert, index) => (
                <li key={index}>{alert.message}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
