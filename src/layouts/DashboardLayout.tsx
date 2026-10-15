import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Header } from '../components/common/Header';
import { Sidebar } from '../components/common/Sidebar';
import { UserRole } from '../types';
import { AccessDenied } from '../components/common/AccessDenied';

interface DashboardLayoutProps {
  allowedRoles?: UserRole[];
  breadcrumbs?: { label: string; href?: string }[];
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  allowedRoles,
  breadcrumbs = []
}) => {
  const { isAuthenticated, currentUser, isLoading, hasRole } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Loading portal...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Role Authorization Check
  if (allowedRoles && !hasRole(allowedRoles)) {
    return (
      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
        <Sidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header onMobileMenuToggle={() => setMobileMenuOpen(true)} breadcrumbs={[{ label: 'Access Denied' }]} />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <AccessDenied />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      <Sidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <Header
          onMobileMenuToggle={() => setMobileMenuOpen(true)}
          breadcrumbs={breadcrumbs}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
