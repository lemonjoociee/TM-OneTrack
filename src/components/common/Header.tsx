import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useData } from '../../contexts/DataContext';
import {
  Sun,
  Moon,
  Monitor,
  RefreshCw,
  LogOut,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Menu,
  Shield,
  Layers,
  BarChart3
} from 'lucide-react';

interface HeaderProps {
  onMobileMenuToggle?: () => void;
  breadcrumbs?: { label: string; href?: string }[];
}

export const Header: React.FC<HeaderProps> = ({ onMobileMenuToggle, breadcrumbs = [] }) => {
  const { currentUser, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { syncStatus, refreshData } = useData();
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const getRoleBadgeStyle = (role?: string) => {
    switch (role) {
      case 'Admin':
        return 'text-purple-700 bg-purple-50 dark:text-purple-300 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800';
      case 'NOC':
        return 'text-blue-700 bg-blue-50 dark:text-blue-300 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800';
      case 'OPS':
        return 'text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800';
      default:
        return 'text-slate-700 bg-slate-50 dark:text-slate-300 dark:bg-slate-800 border border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between gap-8 border-b border-slate-200 bg-white/95 px-4 backdrop-blur-sm sm:px-6 dark:border-slate-800 dark:bg-slate-900/95">
      {/* Zone 1: Mobile toggle & Breadcrumb navigation */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMobileMenuToggle}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden dark:text-slate-400 dark:hover:bg-slate-800"
          aria-label="Toggle navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 truncate">
          <span className="font-bold text-slate-900 dark:text-white shrink-0 hidden sm:inline-block">
            NOC & OPS Portal
          </span>
          {breadcrumbs.length > 0 && <span className="hidden sm:inline-block text-slate-300 dark:text-slate-600">/</span>}
          {breadcrumbs.map((b, idx) => (
            <React.Fragment key={idx}>
              <span
                className={`truncate ${
                  idx === breadcrumbs.length - 1
                    ? 'font-semibold text-slate-800 dark:text-slate-200'
                    : 'hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                {b.label}
              </span>
              {idx < breadcrumbs.length - 1 && <span className="text-slate-300 dark:text-slate-600">/</span>}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Zone 2: SharePoint sync status indicator & manual refresh */}
      <div className="hidden md:flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          {syncStatus.status === 'error' ? (
            <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>Offline Cache</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>{syncStatus.dataSource}</span>
            </span>
          )}
          <span className="text-slate-300 dark:text-slate-700">·</span>
          <span className="font-mono tabular-nums">
            {syncStatus.lastSyncTime ? new Date(syncStatus.lastSyncTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Pending'}
          </span>
        </div>

        <button
          onClick={() => refreshData()}
          disabled={syncStatus.isSyncing}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors"
          title="Scan Outlook & WhatsApp via Ollama AI"
        >
          <RefreshCw className={`h-3 w-3 ${syncStatus.isSyncing ? 'animate-spin text-purple-600' : ''}`} />
          <span>{syncStatus.isSyncing ? 'Scanning...' : 'Scan AI'}</span>
        </button>
      </div>

      {/* Zone 3: Controls (Theme, Notifications, User profile, Logout) */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Theme toggle menu */}
        <div className="relative">
          <button
            onClick={() => setShowThemeMenu(!showThemeMenu)}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
            aria-label="Change theme"
            title="Theme settings"
          >
            {theme === 'light' ? (
              <Sun className="h-4 w-4" />
            ) : theme === 'dark' ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Monitor className="h-4 w-4" />
            )}
          </button>

          {showThemeMenu && (
            <div className="absolute right-0 mt-2 w-36 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg dark:border-slate-800 dark:bg-slate-900 z-50">
              <button
                onClick={() => { setTheme('light'); setShowThemeMenu(false); }}
                className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium ${
                  theme === 'light' ? 'bg-slate-100 text-blue-600 dark:bg-slate-800 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <Sun className="h-3.5 w-3.5" /> Light
              </button>
              <button
                onClick={() => { setTheme('dark'); setShowThemeMenu(false); }}
                className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium ${
                  theme === 'dark' ? 'bg-slate-100 text-blue-600 dark:bg-slate-800 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <Moon className="h-3.5 w-3.5" /> Dark
              </button>
              <button
                onClick={() => { setTheme('system'); setShowThemeMenu(false); }}
                className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium ${
                  theme === 'system' ? 'bg-slate-100 text-blue-600 dark:bg-slate-800 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <Monitor className="h-3.5 w-3.5" /> System
              </button>
            </div>
          )}
        </div>

        {/* User identification badge */}
        {currentUser && (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-xs font-bold text-white dark:bg-slate-100 dark:text-slate-900 shrink-0">
              {currentUser.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-semibold text-slate-900 dark:text-white leading-tight truncate max-w-[130px]">
                {currentUser.name}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`inline-block rounded px-1.5 py-0.2 text-[10px] font-semibold uppercase tracking-wider ${getRoleBadgeStyle(currentUser.role)}`}>
                  {currentUser.role}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Logout button */}
        <button
          onClick={logout}
          className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:text-slate-400 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition-colors"
          title="Sign Out"
          aria-label="Sign Out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
};
