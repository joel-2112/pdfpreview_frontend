import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import Button from '../components/shared/Button';

export const NotFoundPage = () => {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center text-center p-6 space-y-4 animate-fade-in">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 shadow-2xl mb-4">
        <AlertCircle className="h-8 w-8" />
      </div>
      <h3 className="text-3xl font-black text-white tracking-tight">404 - Page Not Found</h3>
      <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
        The link you followed may be broken, or the layout page has been renamed.
      </p>
      <div className="pt-6">
        <Link to="/" className="no-underline">
          <Button variant="outline" icon={ArrowLeft}>
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
