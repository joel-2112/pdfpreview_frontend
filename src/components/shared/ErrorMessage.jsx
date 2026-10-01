import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info } from 'lucide-react';

export const ErrorMessage = ({ message, type = 'error', className = '' }) => {
  if (!message) return null;

  const styles = {
    error: {
      container: 'border-rose-200 dark:border-rose-500/25 bg-rose-50/90 dark:bg-rose-500/10 text-rose-800 dark:text-rose-300',
      icon: AlertCircle,
      iconColor: 'text-rose-600 dark:text-rose-400',
    },
    warning: {
      container: 'border-amber-200 dark:border-amber-500/25 bg-amber-50/90 dark:bg-amber-500/10 text-amber-800 dark:text-amber-300',
      icon: AlertTriangle,
      iconColor: 'text-amber-600 dark:text-amber-400',
    },
    info: {
      container: 'border-blue-200 dark:border-blue-500/25 bg-blue-50/90 dark:bg-blue-500/10 text-blue-800 dark:text-blue-300',
      icon: Info,
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    success: {
      container: 'border-emerald-200 dark:border-emerald-500/25 bg-emerald-50/90 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-300',
      icon: CheckCircle2,
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
  };

  const current = styles[type] || styles.error;
  const Icon = current.icon;

  return (
    <div className={`flex items-start space-x-3 rounded-2xl border p-4 text-sm shadow-xs animate-fade-in ${current.container} ${className}`}>
      <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${current.iconColor}`} />
      <span className="font-medium leading-relaxed">{message}</span>
    </div>
  );
};

export default ErrorMessage;

