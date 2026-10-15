import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';

export const AccessDenied: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const getDefaultHome = () => {
    if (!currentUser) return '/login';
    if (currentUser.role === 'Admin') return '/admin';
    if (currentUser.role === 'NOC') return '/noc';
    return '/ops';
  };

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center p-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 mb-5">
        <ShieldAlert className="h-8 w-8" />
      </div>

      <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
        Access Denied
      </h1>

      <p className="mt-2 max-w-md text-sm text-slate-600 dark:text-slate-400">
        You do not have administrative or role-based clearance to view this module. Your active account is assigned the{' '}
        <span className="font-semibold text-slate-900 dark:text-white">{currentUser?.role || 'Guest'}</span> role.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Go Back</span>
        </button>

        <button
          onClick={() => navigate(getDefaultHome())}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white hover:bg-blue-700 shadow-xs transition-colors"
        >
          <Home className="h-3.5 w-3.5" />
          <span>Go to Authorized Dashboard</span>
        </button>
      </div>
    </div>
  );
};
