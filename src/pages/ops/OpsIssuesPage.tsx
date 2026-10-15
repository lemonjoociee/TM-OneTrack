import React from 'react';
import { PeriodFilter } from '../../components/ops/PeriodFilter';
import { OpsIssueTable } from '../../components/ops/OpsIssueTable';
import { useData } from '../../contexts/DataContext';

export const OpsIssuesPage: React.FC = () => {
  const { opsPeriodHeading } = useData();

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4 dark:border-slate-800">
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Operations Issue Tracker
        </h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Comprehensive search, site breakdown, status audit, and record export
        </p>
      </div>

      <PeriodFilter />

      <OpsIssueTable />
    </div>
  );
};
