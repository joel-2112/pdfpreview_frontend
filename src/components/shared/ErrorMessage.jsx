import React from 'react';
import { AlertCircle } from 'lucide-react';

export const ErrorMessage = ({ message, className = '' }) => {
  if (!message) return null;

  return (
    <div className={`flex items-center space-x-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400 ${className}`}>
      <AlertCircle className="h-5 w-5 shrink-0" />
      <span className="font-medium">{message}</span>
    </div>
  );
};

export default ErrorMessage;
