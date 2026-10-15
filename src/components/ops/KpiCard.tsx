import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export interface KpiCardProps {
  title: string;
  count: number;
  totalCount: number;
  percentage?: number;
  colorScheme: 'neutral' | 'red' | 'amber' | 'green' | 'grey';
  isSelected: boolean;
  onClick: () => void;
  comparison?: {
    prevCount: number;
    deltaPct: number;
    isImprovement: boolean;
    periodLabel: string;
  };
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  count,
  totalCount,
  colorScheme,
  isSelected,
  onClick,
  comparison
}) => {
  const getThemeStyles = () => {
    switch (colorScheme) {
      case 'red':
        return {
          numColor: 'text-rose-600 dark:text-rose-400',
          selectedBorder: 'ring-2 ring-rose-500 border-rose-300 dark:border-rose-700 bg-rose-50/40 dark:bg-rose-950/20',
          hoverBorder: 'hover:border-rose-300 dark:hover:border-rose-700',
          barColor: 'bg-rose-500'
        };
      case 'amber':
        return {
          numColor: 'text-amber-600 dark:text-amber-400',
          selectedBorder: 'ring-2 ring-amber-500 border-amber-300 dark:border-amber-700 bg-amber-50/40 dark:bg-amber-950/20',
          hoverBorder: 'hover:border-amber-300 dark:hover:border-amber-700',
          barColor: 'bg-amber-500'
        };
      case 'green':
        return {
          numColor: 'text-emerald-600 dark:text-emerald-400',
          selectedBorder: 'ring-2 ring-emerald-500 border-emerald-300 dark:border-emerald-700 bg-emerald-50/40 dark:bg-emerald-950/20',
          hoverBorder: 'hover:border-emerald-300 dark:hover:border-emerald-700',
          barColor: 'bg-emerald-500'
        };
      case 'grey':
        return {
          numColor: 'text-slate-600 dark:text-slate-400',
          selectedBorder: 'ring-2 ring-slate-500 border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40',
          hoverBorder: 'hover:border-slate-300 dark:hover:border-slate-700',
          barColor: 'bg-slate-500'
        };
      default:
        return {
          numColor: 'text-blue-600 dark:text-blue-400',
          selectedBorder: 'ring-2 ring-blue-500 border-blue-300 dark:border-blue-700 bg-blue-50/40 dark:bg-blue-950/20',
          hoverBorder: 'hover:border-blue-300 dark:hover:border-blue-700',
          barColor: 'bg-blue-600'
        };
    }
  };

  const styles = getThemeStyles();
  const pct = totalCount > 0 ? ((count / totalCount) * 100).toFixed(0) : '0';

  return (
    <button
      onClick={onClick}
      className={`group relative flex flex-col justify-between rounded-2xl border p-5 text-left transition-all cursor-pointer bg-white dark:bg-slate-900 shadow-xs ${
        isSelected
          ? styles.selectedBorder
          : `border-slate-200 dark:border-slate-800 ${styles.hoverBorder} hover:shadow-md`
      }`}
    >
      <div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {title}
          </span>
          {colorScheme !== 'neutral' && totalCount > 0 && (
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 font-mono">
              {pct}%
            </span>
          )}
        </div>

        <div className={`mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight font-mono tabular-nums ${styles.numColor}`}>
          {count}
        </div>
      </div>

      {/* Comparison subtext */}
      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px]">
        {comparison ? (
          <div className="flex items-center gap-1.5 font-medium">
            {Math.abs(comparison.deltaPct) < 0.1 ? (
              <span className="flex items-center gap-1 text-slate-500">
                <Minus className="h-3 w-3" /> No change
              </span>
            ) : comparison.isImprovement ? (
              <span className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                <ArrowDownRight className="h-3.5 w-3.5" />
                {Math.abs(comparison.deltaPct).toFixed(1)}% vs prev yr
              </span>
            ) : (
              <span className="flex items-center gap-0.5 text-rose-600 dark:text-rose-400 font-semibold">
                <ArrowUpRight className="h-3.5 w-3.5" />
                +{Math.abs(comparison.deltaPct).toFixed(1)}% vs prev yr
              </span>
            )}
            <span className="text-slate-400 dark:text-slate-500 truncate">
              ({comparison.prevCount})
            </span>
          </div>
        ) : (
          <span className="text-slate-400 dark:text-slate-500">
            {colorScheme === 'neutral' ? 'All reporting categories' : `Share of ${totalCount} issues`}
          </span>
        )}
      </div>
    </button>
  );
};
