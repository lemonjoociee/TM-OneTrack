import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { PeriodFilter } from '../../components/ops/PeriodFilter';
import { Download, FileSpreadsheet, FileText, CheckCircle2, Shield, Calendar, MapPin, Tag } from 'lucide-react';
import { exportToCsv, exportToExcel, generateReportFilename } from '../../utils/exportUtils';

export const OpsReportsPage: React.FC = () => {
  const { opsFilteredTickets, selectedYear, selectedMonth, opsPeriodHeading, opsMetrics } = useData();
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const handleExport = (format: 'csv' | 'xlsx', customFilterTitle?: string, filteredRecords?: typeof opsFilteredTickets) => {
    const records = filteredRecords || opsFilteredTickets;
    const filename = generateReportFilename(
      customFilterTitle || undefined,
      selectedYear,
      selectedMonth,
      format
    );

    const meta = {
      title: `OPS Executive Report - ${customFilterTitle || 'All Filtered Issues'}`,
      reportingPeriod: opsPeriodHeading,
      exportDateTime: new Date().toLocaleString(),
      activeFilters: {
        status: customFilterTitle || 'All Period Records',
        site: 'All',
        category: 'All'
      }
    };

    if (format === 'csv') {
      exportToCsv(records, meta, filename);
    } else {
      exportToExcel(records, meta, filename);
    }

    setDownloadSuccess(filename);
    setTimeout(() => setDownloadSuccess(null), 4000);
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4 dark:border-slate-800">
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Executive Reports & Exports
        </h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Export standardized operations reports for management presentations and SLA audits
        </p>
      </div>

      <PeriodFilter />

      {downloadSuccess && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>Report <span className="font-mono font-bold">{downloadSuccess}</span> exported successfully!</span>
        </div>
      )}

      {/* Export Presets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Full Period Report */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 mb-3">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Full Period Master Report
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Complete issue records for {opsPeriodHeading}, including timestamps, owners, resolution notes, and SLA status.
            </p>
            <div className="mt-4 text-xs font-mono text-slate-600 dark:text-slate-400">
              Total Records: <span className="font-bold">{opsFilteredTickets.length}</span>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-2">
            <button
              onClick={() => handleExport('xlsx')}
              className="w-1/2 flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 py-2 text-xs font-medium text-white hover:bg-blue-700 shadow-xs transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Excel (.xlsx)</span>
            </button>
            <button
              onClick={() => handleExport('csv')}
              className="w-1/2 flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>CSV</span>
            </button>
          </div>
        </div>

        {/* Open & In-Progress Issues Only */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 mb-3">
              <Download className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Open Backlog Action Report
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Filtered specifically to open and in-progress tickets requiring immediate operational follow-up and RCA.
            </p>
            <div className="mt-4 text-xs font-mono text-slate-600 dark:text-slate-400">
              Active Backlog: <span className="font-bold text-rose-600 dark:text-rose-400">{opsMetrics.open + opsMetrics.inProgress}</span>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-2">
            <button
              onClick={() =>
                handleExport(
                  'xlsx',
                  'Open-Backlog',
                  opsFilteredTickets.filter(t => t.normalizedStatus === 'Open' || t.normalizedStatus === 'In Progress')
                )
              }
              className="w-1/2 flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 py-2 text-xs font-medium text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 shadow-xs transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Excel (.xlsx)</span>
            </button>
            <button
              onClick={() =>
                handleExport(
                  'csv',
                  'Open-Backlog',
                  opsFilteredTickets.filter(t => t.normalizedStatus === 'Open' || t.normalizedStatus === 'In Progress')
                )
              }
              className="w-1/2 flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>CSV</span>
            </button>
          </div>
        </div>

        {/* SLA Compliance Audit Report */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 mb-3">
              <Shield className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              SLA Compliance & RCA Audit
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Comprehensive report detailing SLA breached records, near breach warnings, and root-cause status.
            </p>
            <div className="mt-4 text-xs font-mono text-slate-600 dark:text-slate-400">
              SLA Compliance: <span className="font-bold text-emerald-600 dark:text-emerald-400">{opsMetrics.slaCompliance.toFixed(1)}%</span>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-2">
            <button
              onClick={() => handleExport('xlsx', 'SLA-Audit')}
              className="w-1/2 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2 text-xs font-medium text-white hover:bg-emerald-700 shadow-xs transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Excel (.xlsx)</span>
            </button>
            <button
              onClick={() => handleExport('csv', 'SLA-Audit')}
              className="w-1/2 flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>CSV</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
