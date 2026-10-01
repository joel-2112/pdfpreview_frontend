import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Home, Compass } from 'lucide-react';
import Button from '../components/shared/Button';

export const NotFoundPage = () => {
  return (
    <div className="relative flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center text-center p-6 space-y-5 animate-fade-in">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 shadow-xl mb-2 animate-float">
        <Compass className="h-10 w-10" />
      </div>

      <div className="space-y-2 max-w-md">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 bg-brand-500/10 px-3 py-1 rounded-full border border-brand-500/20">
          Error 404
        </span>
        <h2 className="text-3xl sm:text-4xl font-display font-black text-slate-900 dark:text-white tracking-tight">
          Page Not Found
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          The view or endpoint you requested cannot be located. It may have been moved, deleted, or you might have entered an invalid URL.
        </p>
      </div>

      <div className="pt-4 flex items-center space-x-3">
        <Link to="/" className="no-underline">
          <Button variant="primary" icon={Home}>
            Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;

