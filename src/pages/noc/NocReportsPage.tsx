import React from 'react';
import { useData } from '../../contexts/DataContext';
import { BarChart3, Clock, CheckCircle2, AlertTriangle, Download, Shield } from 'lucide-react';
import { exportToCsv } from '../../utils/exportUtils';

export const NocReportsPage: React.FC = () => {
  const { tickets } = useData();

  // Metrics calculation
  const total = tickets.length;
  const evaluated15m = tickets.filter(t => t.w15 === 'Yes' || t.w15 === 'No');
  const complied15m = tickets.filter(t => t.w15 === 'Yes').length;
  const complianceRate = evaluated15m.length > 0 ? (complied15m / evaluated15m.length) * 100 : 100;

  const escalatedToNubitel = tickets.filter(t => t.esc === 'Yes').length;
  const waitingRca = tickets.filter(t => t.rca === 'Requested' || t.flag === 'RCA DUE').length;
  const p1Count = tickets.filter(t => t.pri === 'P1').length;
  const p2Count = tickets.filter(t => t.pri === 'P2').length;

  const typesCount = {
    Nubitel: tickets.filter(t => t.type === 'Nubitel').length,
    Asset: tickets.filter(t => t.type === 'Asset').length,
    Access: tickets.filter(t => t.type === 'Access').length,
    Network: tickets.filter(t => t.type === 'Network').length,
    Other: tickets.filter(t => t.type === 'Other').length
  };

  const handleExportNocSummary = () => {
    const meta = {
      title: 'NOC Operational Performance & SLA Audit',
      reportingPeriod: 'Full Lifetime Dataset',
      exportDateTime: new Date().toLocaleString(),
      activeFilters: { status: 'All', site: 'All', category: 'All' }
    };
    exportToCsv(tickets, meta, `NOC-Operational-Metrics-${new Date().toISOString().slice(0, 10)}.csv`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            NOC Operational Performance Reports
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            15-minute response audit, platform escalation turnarounds, and ticket categories
          </p>
        </div>

        <button
          onClick={handleExportNocSummary}
          className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700 shadow-xs transition-colors self-start sm:self-auto"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Export NOC Audit CSV</span>
        </button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>15-Min Response SLA</span>
            <Clock className="h-4 w-4 text-blue-600" />
          </div>
          <div className="mt-2 text-3xl font-extrabold font-mono text-blue-600 dark:text-blue-400">
            {complianceRate.toFixed(1)}%
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {complied15m} of {evaluated15m.length} tracked tickets
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Escalated to Nubitel</span>
            <Shield className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="mt-2 text-3xl font-extrabold font-mono text-indigo-600 dark:text-indigo-400">
            {escalatedToNubitel}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Vendor portal cases
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Waiting for RCA</span>
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </div>
          <div className="mt-2 text-3xl font-extrabold font-mono text-amber-600 dark:text-amber-400">
            {waitingRca}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Pending root-cause submission
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>P1 Critical Incidents</span>
            <AlertTriangle className="h-4 w-4 text-rose-600" />
          </div>
          <div className="mt-2 text-3xl font-extrabold font-mono text-rose-600 dark:text-rose-400">
            {p1Count}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            P2 Incidents: {p2Count}
          </span>
        </div>
      </div>

      {/* Ticket Category Distribution */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
          Ticket Distribution by Operational Category
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {Object.entries(typesCount).map(([type, count]) => (
            <div key={type} className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">{type}</span>
              <span className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white block mt-1">
                {count}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                {((count / total) * 100).toFixed(0)}% of total
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
