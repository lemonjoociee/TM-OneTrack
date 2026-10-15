import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import {
  Users,
  ShieldCheck,
  TrendingUp,
  LayoutDashboard,
  MailPlus,
  Settings,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  UserX
} from 'lucide-react';

export const AdminOverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { users, invitations } = useAuth();
  const { syncStatus, refreshData } = useData();

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'Active').length;
  const adminCount = users.filter(u => u.role === 'Admin' && u.status === 'Active').length;
  const nocCount = users.filter(u => u.role === 'NOC' && u.status === 'Active').length;
  const opsCount = users.filter(u => u.role === 'OPS' && u.status === 'Active').length;
  const pendingInvs = invitations.filter(i => i.status === 'Pending').length;
  const deactivatedCount = users.filter(u => u.status === 'Deactivated').length;

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-5 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Administrator Console
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            System governance, user access control, role assignments, and SharePoint integration health
          </p>
        </div>

        <button
          onClick={() => refreshData()}
          disabled={syncStatus.isSyncing}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 disabled:opacity-50 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${syncStatus.isSyncing ? 'animate-spin' : ''}`} />
          <span>Synchronize System State</span>
        </button>
      </div>

      {/* Administrative KPIs */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
            Active Users
          </span>
          <span className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white block mt-1">
            {activeUsers}
          </span>
          <span className="text-[10px] text-slate-400">Total: {totalUsers}</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 block">
            Admins
          </span>
          <span className="text-2xl font-extrabold font-mono text-purple-600 dark:text-purple-400 block mt-1">
            {adminCount}
          </span>
          <span className="text-[10px] text-slate-400">Full clearance</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block">
            NOC Team
          </span>
          <span className="text-2xl font-extrabold font-mono text-blue-600 dark:text-blue-400 block mt-1">
            {nocCount}
          </span>
          <span className="text-[10px] text-slate-400">Operational users</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
            OPS Team
          </span>
          <span className="text-2xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 block mt-1">
            {opsCount}
          </span>
          <span className="text-[10px] text-slate-400">Executive viewers</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
            Pending Invs
          </span>
          <span className="text-2xl font-extrabold font-mono text-amber-600 dark:text-amber-400 block mt-1">
            {pendingInvs}
          </span>
          <span className="text-[10px] text-slate-400">Awaiting acceptance</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 block">
            Deactivated
          </span>
          <span className="text-2xl font-extrabold font-mono text-rose-600 dark:text-rose-400 block mt-1">
            {deactivatedCount}
          </span>
          <span className="text-[10px] text-slate-400">Suspended access</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 col-span-2 sm:col-span-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
            Sync Source
          </span>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block mt-2 truncate">
            {syncStatus.dataSource}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            {syncStatus.itemCount} items
          </span>
        </div>
      </div>

      {/* Synchronization Status Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400 shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Local AI Ingestion Engine (Ollama)
            </h3>
            <p className="text-sm font-medium text-slate-900 dark:text-white mt-0.5">
              Powered by local Ollama AI scanning Outlook mailbox &amp; WhatsApp workgroups for incident extraction.
            </p>
          </div>
        </div>

        <div className="text-left sm:text-right text-xs text-slate-500">
          <div>Last Successful Scan:</div>
          <div className="font-mono font-bold text-slate-800 dark:text-slate-200">
            {syncStatus.lastSyncTime ? new Date(syncStatus.lastSyncTime).toLocaleString() : 'Pending'}
          </div>
        </div>
      </div>

      {/* Quick Access Portal Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => navigate('/admin/users')}
          className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 text-left hover:border-blue-400 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 transition-all cursor-pointer"
        >
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400 mb-3">
              <Users className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              User Management
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Manage accounts, assign roles, activate/deactivate users, and initiate password resets.
            </p>
          </div>
          <span className="mt-4 text-xs font-semibold text-blue-600 dark:text-blue-400">Manage Users &rarr;</span>
        </button>

        <button
          onClick={() => navigate('/admin/invitations')}
          className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 text-left hover:border-blue-400 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 transition-all cursor-pointer"
        >
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 mb-3">
              <MailPlus className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Invitations & Tokens
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Generate secure invitation links, re-issue expiring tokens, and monitor onboarding.
            </p>
          </div>
          <span className="mt-4 text-xs font-semibold text-blue-600 dark:text-blue-400">View Invitations &rarr;</span>
        </button>

        <button
          onClick={() => navigate('/noc')}
          className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 text-left hover:border-blue-400 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 transition-all cursor-pointer"
        >
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 mb-3">
              <LayoutDashboard className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              NOC Operations Dashboard
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Switch to the detailed operational workspace (Tickets, Assets, WhatsApp, 15-min queue).
            </p>
          </div>
          <span className="mt-4 text-xs font-semibold text-blue-600 dark:text-blue-400">Open NOC &rarr;</span>
        </button>

        <button
          onClick={() => navigate('/ops')}
          className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 text-left hover:border-blue-400 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 transition-all cursor-pointer"
        >
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 mb-3">
              <TrendingUp className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              OPS Executive Dashboard
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Switch to executive high-level summaries, dynamic period filters, health, and 3 charts.
            </p>
          </div>
          <span className="mt-4 text-xs font-semibold text-blue-600 dark:text-blue-400">Open OPS &rarr;</span>
        </button>
      </div>
    </div>
  );
};
