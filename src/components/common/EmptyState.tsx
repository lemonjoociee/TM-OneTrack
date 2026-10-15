import React from 'react';
import { Inbox, RotateCcw, AlertCircle, RefreshCw } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Records Found',
  description = 'No issue data is available for the selected reporting period or active filter criteria.',
  actionLabel,
  onAction
}) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white/50 p-10 text-center dark:border-slate-800 dark:bg-slate-900/40 my-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 mb-3">
        <Inbox className="h-6 w-6" />
      </div>
      <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
        {title}
      </h3>
      <p className="mt-1 max-w-sm text-xs text-slate-500 dark:text-slate-400">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-4 flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
};

export const LoadingState: React.FC<{ message?: string }> = ({ message = 'Synchronizing with operations dataset...' }) => {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center p-8 text-center">
      <RefreshCw className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400 mb-3" />
      <div className="text-xs font-medium text-slate-600 dark:text-slate-400">
        {message}
      </div>
    </div>
  );
};

export const ErrorBanner: React.FC<{
  message: string;
  onRetry?: () => void;
}> = ({ message, onRetry }) => {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-rose-200 bg-rose-50/80 px-4 py-3 text-xs text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300 mb-4 shadow-xs">
      <div className="flex items-center gap-2">
        <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
        <span>{message}</span>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-1.5 rounded-md bg-rose-100 px-2.5 py-1 font-medium hover:bg-rose-200 dark:bg-rose-900/60 dark:hover:bg-rose-900 transition-colors shrink-0"
        >
          <RefreshCw className="h-3 w-3" />
          <span>Retry Sync</span>
        </button>
      )}
    </div>
  );
};
