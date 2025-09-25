import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose?: () => void;
  duration?: number;
}

const bgColors = {
  success: 'bg-green-600',
  error: 'bg-red-600',
  info: 'bg-blue-600',
};

export default function Toast({ message, type = 'info', onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded shadow-lg text-white ${bgColors[type]}`}
      role="alert">
      <span>{message}</span>
      {onClose && (
        <button className="ml-4 text-white font-bold" onClick={onClose}>&times;</button>
      )}
    </div>
  );
}
