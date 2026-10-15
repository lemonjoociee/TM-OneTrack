import React from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon } from 'lucide-react';

interface HealthCardProps {
  status: 'HEALTHY' | 'ATTENTION NEEDED' | 'CRITICAL';
  reason: string;
}

export const HealthCard: React.FC<HealthCardProps> = ({ status, reason }) => {
  const getStyles = () => {
    switch (status) {
      case 'CRITICAL':
        return {
          icon: AlertOctagon,
          badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border-rose-300 dark:border-rose-800',
          titleColor: 'text-rose-700 dark:text-rose-400',
          dotColor: 'bg-rose-600',
          containerBg: 'border-rose-200 bg-rose-50/50 dark:border-rose-900/50 dark:bg-rose-950/20'
        };
      case 'ATTENTION NEEDED':
        return {
          icon: AlertTriangle,
          badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border-amber-300 dark:border-amber-800',
          titleColor: 'text-amber-700 dark:text-amber-400',
          dotColor: 'bg-amber-600',
          containerBg: 'border-amber-200 bg-amber-50/50 dark:border-amber-900/50 dark:bg-amber-950/20'
        };
      default:
        return {
          icon: ShieldCheck,
          badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
          titleColor: 'text-emerald-700 dark:text-emerald-400',
          dotColor: 'bg-emerald-600',
          containerBg: 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/50 dark:bg-emerald-950/20'
        };
    }
  };

  const styles = getStyles();
  const Icon = styles.icon;

  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border p-4 sm:p-5 shadow-xs ${styles.containerBg}`}>
      <div className="flex items-start sm:items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl p-2 shrink-0 ${styles.badgeColor}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Operations Health
            </span>
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold border ${styles.badgeColor}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${styles.dotColor}`} />
              {status}
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
            {reason}
          </p>
        </div>
      </div>
    </div>
  );
};
