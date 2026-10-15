import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { PeriodFilter } from '../../components/ops/PeriodFilter';
import { KpiCard } from '../../components/ops/KpiCard';
import { HealthCard } from '../../components/ops/HealthCard';
import { QuickSummaryPanel } from '../../components/ops/QuickSummaryPanel';
import { OpsCharts } from '../../components/ops/OpsCharts';
import { OpsIssueTable } from '../../components/ops/OpsIssueTable';
import { ErrorBanner } from '../../components/common/ErrorBanner';
import { StandardStatus } from '../../types';

export const OpsDashboardPage: React.FC = () => {
  const {
    opsPeriodHeading,
    opsMetrics,
    syncStatus,
    refreshData
  } = useData();

  const [selectedStatusFilter, setSelectedStatusFilter] = useState<StandardStatus | 'All'>('All');

  const {
    total,
    open,
    inProgress,
    resolved,
    closed,
    health,
    healthReason,
    previousYearComparison
  } = opsMetrics;

  const handleKpiCardClick = (status: StandardStatus | 'All') => {
    setSelectedStatusFilter(prev => (prev === status ? 'All' : status));
  };

  return (
    <div className="space-y-6">
      {/* Synchronization Warning Banner if offline or sync failed */}
      {syncStatus.status === 'error' && syncStatus.errorMessage && (
        <ErrorBanner
          message={syncStatus.errorMessage}
          onRetry={refreshData}
        />
      )}

      {/* Prominent Reporting Period Filter Bar */}
      <PeriodFilter />

      {/* Main Dynamic Page Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200 pb-4 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {opsPeriodHeading}
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            High-level executive operations summary and incident health metrics
          </p>
        </div>

        {selectedStatusFilter !== 'All' && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Filtered by status:</span>
            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800 dark:bg-blue-950 dark:text-blue-300">
              {selectedStatusFilter}
            </span>
            <button
              onClick={() => setSelectedStatusFilter('All')}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 underline"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* 5 Large KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <KpiCard
          title="Total Issues"
          count={total}
          totalCount={total}
          colorScheme="neutral"
          isSelected={selectedStatusFilter === 'All'}
          onClick={() => handleKpiCardClick('All')}
          comparison={
            previousYearComparison
              ? {
                  prevCount: previousYearComparison.total,
                  deltaPct: previousYearComparison.totalDeltaPct,
                  isImprovement: previousYearComparison.totalDeltaPct <= 0,
                  periodLabel: previousYearComparison.periodLabel
                }
              : undefined
          }
        />

        <KpiCard
          title="Open"
          count={open}
          totalCount={total}
          colorScheme="red"
          isSelected={selectedStatusFilter === 'Open'}
          onClick={() => handleKpiCardClick('Open')}
          comparison={
            previousYearComparison
              ? {
                  prevCount: previousYearComparison.open,
                  deltaPct: previousYearComparison.openDeltaPct,
                  isImprovement: previousYearComparison.openDeltaPct <= 0, // Fewer open issues = improvement
                  periodLabel: previousYearComparison.periodLabel
                }
              : undefined
          }
        />

        <KpiCard
          title="In Progress"
          count={inProgress}
          totalCount={total}
          colorScheme="amber"
          isSelected={selectedStatusFilter === 'In Progress'}
          onClick={() => handleKpiCardClick('In Progress')}
        />

        <KpiCard
          title="Resolved"
          count={resolved}
          totalCount={total}
          colorScheme="green"
          isSelected={selectedStatusFilter === 'Resolved'}
          onClick={() => handleKpiCardClick('Resolved')}
          comparison={
            previousYearComparison
              ? {
                  prevCount: previousYearComparison.resolved,
                  deltaPct: previousYearComparison.resolvedDeltaPct,
                  isImprovement: previousYearComparison.resolvedDeltaPct >= 0, // More resolved issues = improvement
                  periodLabel: previousYearComparison.periodLabel
                }
              : undefined
          }
        />

        <KpiCard
          title="Closed"
          count={closed}
          totalCount={total}
          colorScheme="grey"
          isSelected={selectedStatusFilter === 'Closed'}
          onClick={() => handleKpiCardClick('Closed')}
        />
      </div>

      {/* Operations Health Card */}
      <HealthCard status={health} reason={healthReason} />

      {/* Quick Summary Panel & SLA Metrics */}
      <QuickSummaryPanel />

      {/* 3 Executive Charts */}
      <OpsCharts
        onStatusSelect={(status) => setSelectedStatusFilter(status)}
        selectedStatus={selectedStatusFilter !== 'All' ? selectedStatusFilter : undefined}
      />

      {/* Issue Records Table with Search, Filter & Export */}
      <OpsIssueTable
        statusFilterOverride={selectedStatusFilter !== 'All' ? selectedStatusFilter : undefined}
        onClearStatusOverride={() => setSelectedStatusFilter('All')}
      />
    </div>
  );
};
