import React, { useEffect } from 'react';
import { Ticket } from '../../types';
import { X, Calendar, MapPin, Tag, User as UserIcon, Shield, CheckCircle2 } from 'lucide-react';
import { formatDateDisplay } from '../../utils/dateUtils';

interface OpsIssueDrawerProps {
  issue: Ticket | null;
  onClose: () => void;
}

export const OpsIssueDrawer: React.FC<OpsIssueDrawerProps> = ({ issue, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!issue) return null;

  const getStatusColor = (status: string) => {
    switch (issue.normalizedStatus) {
      case 'Open':
        return 'text-rose-700 bg-rose-50 border-rose-200 dark:bg-rose-950/60 dark:text-rose-400 dark:border-rose-900';
      case 'In Progress':
        return 'text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-900';
      case 'Resolved':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-900';
      case 'Closed':
        return 'text-slate-700 bg-slate-50 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <aside className="w-screen max-w-xl bg-white shadow-2xl flex flex-col dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="border-b border-slate-200 p-6 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/80">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400">
                Ticket #{issue.id}
              </span>
              <button
                onClick={onClose}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <h2 className="mt-2 text-lg font-bold text-slate-900 dark:text-white leading-snug">
              {issue.subject}
            </h2>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold border ${getStatusColor(issue.normalizedStatus)}`}>
                {issue.status}
              </span>

              {issue.pri && (
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  Priority: {issue.pri}
                </span>
              )}

              {issue.flag && (
                <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-bold text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                  {issue.flag}
                </span>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Resolution or Summary */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                Executive Status Overview
              </span>
              <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                {issue.resolution || issue.aiSum || issue.root || 'Issue is active and under investigation by the NOC Operations team.'}
              </p>
            </div>

            {/* Key Metadata */}
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <MapPin className="h-4 w-4" /> Operational Site
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {issue.site || 'Unknown Site'}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <Tag className="h-4 w-4" /> Category
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {issue.type || 'Uncategorized'}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <UserIcon className="h-4 w-4" /> Contact / Owner
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {issue.owner || 'Unassigned'}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <Calendar className="h-4 w-4" /> Created Date
                </span>
                <span className="font-mono text-slate-800 dark:text-slate-200">
                  {formatDateDisplay(issue.opened)}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <Calendar className="h-4 w-4" /> Last Updated
                </span>
                <span className="font-mono text-slate-800 dark:text-slate-200">
                  {formatDateDisplay(issue.last)}
                </span>
              </div>

              {issue.resolvedAt && (
                <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" /> Resolved At
                  </span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">
                    {formatDateDisplay(issue.resolvedAt)}
                  </span>
                </div>
              )}
            </div>

            {/* Next Steps if active */}
            {issue.aiNext && (
              <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-900/50 dark:bg-blue-950/20">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 block mb-1">
                  Next Planned Action
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-300">
                  {issue.aiNext}
                </p>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};
