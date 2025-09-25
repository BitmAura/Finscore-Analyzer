import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'react-hot-toast';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  initialPreferences: { [key: string]: boolean };
  onSave: (preferences: { [key: string]: boolean }) => void;
}

export function SettingsModal({ isOpen, onClose, userId, initialPreferences, onSave }: SettingsModalProps) {
  const [preferences, setPreferences] = useState(initialPreferences);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setPreferences(initialPreferences);
  }, [initialPreferences]);

  const handleToggle = (key: string) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/user-preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, dashboard_layout: preferences }),
      });

      if (res.ok) {
        toast.success('Preferences saved!');
        onSave(preferences);
        onClose();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to save preferences');
      }
    } catch (error) {
      toast.error('Something went wrong while saving preferences.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md p-6 bg-white rounded-lg shadow-xl dark:bg-gray-800">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </Button>

        <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Dashboard Settings</h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="cash-flow-toggle" className="text-lg text-gray-700 dark:text-gray-300">Cash Flow Analysis</Label>
            <Switch
              id="cash-flow-toggle"
              checked={preferences.cashFlow || false}
              onCheckedChange={() => handleToggle('cashFlow')}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="profitability-toggle" className="text-lg text-gray-700 dark:text-gray-300">Profitability Ratios</Label>
            <Switch
              id="profitability-toggle"
              checked={preferences.profitabilityRatios || false}
              onCheckedChange={() => handleToggle('profitabilityRatios')}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="income-expense-toggle" className="text-lg text-gray-700 dark:text-gray-300">Income vs. Expenses Chart</Label>
            <Switch
              id="income-expense-toggle"
              checked={preferences.incomeExpense || false}
              onCheckedChange={() => handleToggle('incomeExpense')}
            />
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={isLoading}
          className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isLoading ? (
            <Save className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Save Preferences
        </Button>
      </div>
    </div>
  );
}
