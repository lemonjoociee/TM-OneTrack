import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoginPage } from '../pages/auth/LoginPage';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { AccessDenied } from '../components/common/AccessDenied';

// Admin Pages
import { AdminOverviewPage } from '../pages/admin/AdminOverviewPage';
import { UserManagementPage } from '../pages/admin/UserManagementPage';
import { InvitationsPage } from '../pages/admin/InvitationsPage';
import { SettingsPage } from '../pages/admin/SettingsPage';

// NOC Pages
import { NocOverviewPage } from '../pages/noc/NocOverviewPage';
import { NocToReplyPage } from '../pages/noc/NocToReplyPage';
import { NocTicketsPage } from '../pages/noc/NocTicketsPage';
import { NocAssetsPage } from '../pages/noc/NocAssetsPage';
import { NocWhatsAppPage } from '../pages/noc/NocWhatsAppPage';
import { NocGuidePage } from '../pages/noc/NocGuidePage';
import { NocReportsPage } from '../pages/noc/NocReportsPage';

// OPS Pages
import { OpsDashboardPage } from '../pages/ops/OpsDashboardPage';
import { OpsIssuesPage } from '../pages/ops/OpsIssuesPage';
import { OpsReportsPage } from '../pages/ops/OpsReportsPage';

export const AppRoutes: React.FC = () => {
  const { isAuthenticated, currentUser, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  const getDefaultRedirect = () => {
    if (!isAuthenticated || !currentUser) return '/login';
    if (currentUser.role === 'Admin') return '/admin';
    if (currentUser.role === 'NOC') return '/noc';
    return '/ops';
  };

  return (
    <Routes>
      {/* Public Login Route */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to={getDefaultRedirect()} replace /> : <LoginPage />}
      />

      {/* Access Denied Route */}
      <Route
        path="/unauthorized"
        element={<AccessDenied />}
      />

      {/* Root redirect */}
      <Route
        path="/"
        element={<Navigate to={getDefaultRedirect()} replace />}
      />

      {/* 1. ADMIN ROUTES (Admin role only) */}
      <Route
        path="/admin"
        element={
          <DashboardLayout
            allowedRoles={['Admin']}
            breadcrumbs={[{ label: 'Administration', href: '/admin' }]}
          />
        }
      >
        <Route index element={<AdminOverviewPage />} />
        <Route path="users" element={<UserManagementPage />} />
        <Route path="invitations" element={<InvitationsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* 2. NOC ROUTES (NOC and Admin roles) */}
      <Route
        path="/noc"
        element={
          <DashboardLayout
            allowedRoles={['NOC', 'Admin']}
            breadcrumbs={[{ label: 'NOC Operations', href: '/noc' }]}
          />
        }
      >
        <Route index element={<NocOverviewPage />} />
        <Route path="reply" element={<NocToReplyPage />} />
        <Route path="tickets" element={<NocTicketsPage />} />
        <Route path="assets" element={<NocAssetsPage />} />
        <Route path="whatsapp" element={<NocWhatsAppPage />} />
        <Route path="guide" element={<NocGuidePage />} />
        <Route path="reports" element={<NocReportsPage />} />
      </Route>

      {/* 3. OPS ROUTES (OPS and Admin roles) */}
      <Route
        path="/ops"
        element={
          <DashboardLayout
            allowedRoles={['OPS', 'Admin']}
            breadcrumbs={[{ label: 'OPS Management', href: '/ops' }]}
          />
        }
      >
        <Route index element={<OpsDashboardPage />} />
        <Route path="issues" element={<OpsIssuesPage />} />
        <Route path="reports" element={<OpsReportsPage />} />
      </Route>

      {/* Fallback route */}
      <Route path="*" element={<Navigate to={getDefaultRedirect()} replace />} />
    </Routes>
  );
};
