import React from 'react';
import { useData } from '../../contexts/DataContext';
import { CheckCircle2, Clock, AlertTriangle, MapPin, Tag, ShieldAlert } from 'lucide-react';

export const QuickSummaryPanel: React.FC = () => {
  const { selectedYear, selectedMonth, opsMetrics } = useData();

  const getDynamicTitle = () => {
    if (selectedYear === 'All Years' || selectedYear === 'All Data') {
      return 'All Data Summary';
    }
    if (selectedYear === 'Unknown Date') {
      return 'Unknown Date Summary';
    }
    if (selectedMonth === 'All Months') {
      return `${selectedYear} Annual Summary`;
    }
    return `${selectedMonth} ${selectedYear} Summary`;
  };

  const {
    total,
    open,
    inProgress,
    resolved,
    slaWithin,
    slaNearBreach,
    slaBreached,
    slaCompliance,
    topSite,
    mostCommonCategory
  } = opsMetrics;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 my-6">
      {/* 1. Quick Executive Summary */}
      <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {getDynamicTitle()}
            </h3>
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 font-mono">
              {total} Total Issues
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Open Backlog</span>
              <span className="text-xl font-bold font-mono tabular-nums text-rose-600 dark:text-rose-400">
                {open}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">requires action</span>
            </div>

            <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">In Progress</span>
              <span className="text-xl font-bold font-mono tabular-nums text-amber-600 dark:text-amber-400">
                {inProgress}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">under investigation</span>
            </div>

            <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Resolved</span>
              <span className="text-xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                {resolved}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">successfully fixed</span>
            </div>

            <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">SLA Compliance</span>
              <span className="text-xl font-bold font-mono tabular-nums text-blue-600 dark:text-blue-400">
                {slaCompliance.toFixed(1)}%
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">target: 90%</span>
            </div>
          </div>
        </div>

        {/* Operational Highlights strip */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-slate-400" />
            <span className="text-slate-500 dark:text-slate-400">Top Site:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{topSite}</span>
          </div>

          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-slate-400" />
            <span className="text-slate-500 dark:text-slate-400">Most Common Category:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{mostCommonCategory}</span>
          </div>
        </div>
      </div>

      {/* 2. SLA Breakdown Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              SLA Summary
            </h3>
            <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
              {slaCompliance.toFixed(0)}% Compliant
            </span>
          </div>

          <div className="mt-4 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5" /> Within SLA
              </span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                {slaWithin}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-medium">
                <Clock className="h-3.5 w-3.5" /> Near SLA Breach
              </span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                {slaNearBreach}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400 font-medium">
                <AlertTriangle className="h-3.5 w-3.5" /> SLA Breached
              </span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                {slaBreached}
              </span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800 flex">
            {total > 0 && (
              <>
                <div
                  style={{ width: `${(slaWithin / total) * 100}%` }}
                  className="bg-emerald-500 h-full"
                  title={`Within SLA: ${slaWithin}`}
                />
                <div
                  style={{ width: `${(slaNearBreach / total) * 100}%` }}
                  className="bg-amber-500 h-full"
                  title={`Near Breach: ${slaNearBreach}`}
                />
                <div
                  style={{ width: `${(slaBreached / total) * 100}%` }}
                  className="bg-rose-500 h-full"
                  title={`Breached: ${slaBreached}`}
                />
              </>
            )}
          </div>
          <div className="mt-1 flex justify-between text-[10px] text-slate-400 dark:text-slate-500">
            <span>SLA Health</span>
            <span className="font-mono">{total} evaluated tickets</span>
          </div>
        </div>
      </div>
    </div>
  );
};
