import React, { Component } from 'react';
import { AlertCircle } from 'lucide-react';
import Button from '../shared/Button';

export class PdfErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('PDF view bounds crash captured:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-96 w-full flex-col items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center">
          <AlertCircle className="mb-4 h-12 w-12 text-red-500" />
          <h4 className="mb-2 font-bold text-white text-base">An error occurred inside the PDF renderer</h4>
          <p className="mb-6 text-sm text-slate-400 max-w-md">
            {this.state.error?.message || 'The PDF viewer crashed unexpectedly. You can download the file directly to view it.'}
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Try Again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default PdfErrorBoundary;
