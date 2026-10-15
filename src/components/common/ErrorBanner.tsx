import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({ message, onRetry }) => {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-rose-200 bg-rose-50/80 px-4 py-3 text-xs text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300 mb-4 shadow-xs">
      <div className="flex items-center gap-2">
        <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
        <span>{message}</span>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-1.5 rounded-md bg-rose-100 px-2.5 py-1 font-medium hover:bg-rose-200 dark:bg-rose-900/60 dark:hover:bg-rose-900 transition-colors shrink-0 cursor-pointer"
        >
          <RefreshCw className="h-3 w-3" />
          <span>Retry Sync</span>
        </button>
      )}
    </div>
  );
};
