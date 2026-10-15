import React, { useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { User, UserRole, UserStatus } from '../../types';
import {
  Users,
  Search,
  UserPlus,
  Mail,
  Shield,
  Key,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  X,
  Check,
  Edit2,
  UserCheck,
  UserX
} from 'lucide-react';
import { formatDateDisplay } from '../../utils/dateUtils';

export const UserManagementPage: React.FC = () => {
  const {
    users,
    addUser,
    sendInvitation,
    changeUserRole,
    toggleUserStatus,
    resetUserPassword
  } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState<User | null>(null);
  const [showDeactivateModal, setShowDeactivateModal] = useState<User | null>(null);
  const [showResetModal, setShowResetModal] = useState<User | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('NOC');
  const [newSelectedRole, setNewSelectedRole] = useState<UserRole>('NOC');
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; isError?: boolean } | null>(null);
  const [tempPasswordResult, setTempPasswordResult] = useState<string | null>(null);

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      if (roleFilter !== 'All' && u.role !== roleFilter) return false;
      if (statusFilter !== 'All' && u.status !== statusFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.username.toLowerCase().includes(q) ||
          (u.department || '').toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [users, roleFilter, statusFilter, searchQuery]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await addUser(formName, formEmail, formRole);
    if (res.success) {
      setFeedbackMessage({ text: res.message || 'User added successfully.' });
      setShowAddModal(false);
      setFormName('');
      setFormEmail('');
    } else {
      setFeedbackMessage({ text: res.message || 'Error adding user.', isError: true });
    }
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await sendInvitation(formName, formEmail, formRole);
    if (res.success) {
      setFeedbackMessage({ text: res.message || 'Invitation created successfully.' });
      setShowInviteModal(false);
      setFormName('');
      setFormEmail('');
    } else {
      setFeedbackMessage({ text: res.message || 'Error creating invitation.', isError: true });
    }
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const handleConfirmRoleChange = async () => {
    if (!showRoleModal) return;
    const res = await changeUserRole(showRoleModal.id, newSelectedRole);
    if (res.success) {
      setFeedbackMessage({ text: res.message || 'Role updated.' });
    } else {
      setFeedbackMessage({ text: res.message || 'Error changing role.', isError: true });
    }
    setShowRoleModal(null);
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const handleConfirmToggleStatus = async () => {
    if (!showDeactivateModal) return;
    const res = await toggleUserStatus(showDeactivateModal.id);
    if (res.success) {
      setFeedbackMessage({ text: res.message || 'Status updated.' });
    } else {
      setFeedbackMessage({ text: res.message || 'Error updating status.', isError: true });
    }
    setShowDeactivateModal(null);
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const handleConfirmResetPassword = async () => {
    if (!showResetModal) return;
    const res = await resetUserPassword(showResetModal.id);
    if (res.success && res.tempPassword) {
      setTempPasswordResult(res.tempPassword);
    } else {
      setFeedbackMessage({ text: res.message || 'Error resetting password.', isError: true });
      setShowResetModal(null);
      setTimeout(() => setFeedbackMessage(null), 4000);
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'Admin':
        return 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'NOC':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'OPS':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            User Management & Access Control
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Provision user accounts, assign role permissions, and enforce administrative security
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setShowInviteModal(true);
              setFormName('');
              setFormEmail('');
            }}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors shadow-xs"
          >
            <Mail className="h-3.5 w-3.5 text-blue-600" />
            <span>Invite User</span>
          </button>

          <button
            onClick={() => {
              setShowAddModal(true);
              setFormName('');
              setFormEmail('');
            }}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors shadow-xs"
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* Global Feedback Banner */}
      {feedbackMessage && (
        <div
          className={`flex items-center gap-2 rounded-xl p-3.5 text-xs font-medium ${
            feedbackMessage.isError
              ? 'border border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300'
              : 'border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300'
          }`}
        >
          {feedbackMessage.isError ? (
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
          ) : (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          )}
          <span>{feedbackMessage.text}</span>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users by name, email, or username..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-hidden dark:border-slate-800 dark:bg-slate-900 dark:text-white"
          />
        </div>

        {/* Role Filter */}
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:border-blue-500 focus:outline-hidden dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
        >
          <option value="All">All Roles</option>
          <option value="Admin">Admin</option>
          <option value="NOC">NOC</option>
          <option value="OPS">OPS</option>
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:border-blue-500 focus:outline-hidden dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
        >
          <option value="All">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Deactivated">Deactivated</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
            <tr>
              <th className="py-3 px-4">User</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4">Account Status</th>
              <th className="py-3 px-4">Invitation</th>
              <th className="py-3 px-4">Created Date</th>
              <th className="py-3 px-4">Last Login</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300 shrink-0">
                        {user.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {user.name}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <span className={`inline-block rounded-md px-2 py-0.5 text-[11px] font-bold border ${getRoleBadge(user.role)}`}>
                      {user.role}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        user.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                          : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${user.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      {user.status}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                    <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px]">
                      {user.invitationStatus}
                    </span>
                  </td>

                  <td className="py-3 px-4 font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {formatDateDisplay(user.createdDate)}
                  </td>

                  <td className="py-3 px-4 font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {user.lastLogin ? formatDateDisplay(user.lastLogin) : 'Never'}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => {
                          setShowRoleModal(user);
                          setNewSelectedRole(user.role);
                        }}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                        title="Change user role"
                      >
                        <Shield className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => setShowResetModal(user)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-slate-800 dark:hover:text-blue-400"
                        title="Reset password"
                      >
                        <Key className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => setShowDeactivateModal(user)}
                        className={`rounded-lg p-1.5 ${
                          user.status === 'Active'
                            ? 'text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400'
                            : 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                        }`}
                        title={user.status === 'Active' ? 'Deactivate account' : 'Activate account'}
                      >
                        {user.status === 'Active' ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="py-10 text-center text-slate-400">
                  No users found matching your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal 1: Add User Directly */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-blue-600" />
                <span>Add User Account</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Nurul Huda"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="user@tm.com.my"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Assigned Role
                </label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as UserRole)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-hidden"
                >
                  <option value="NOC">NOC (Operational Monitoring & Tickets)</option>
                  <option value="OPS">OPS (Executive KPI & Reporting)</option>
                  <option value="Admin">Admin (Full System Clearance)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Send Invitation */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Mail className="h-5 w-5 text-blue-600" />
                <span>Send User Invitation</span>
              </h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSendInvite} className="space-y-4 text-xs">
              <p className="text-slate-500 dark:text-slate-400">
                Sends a secure, time-limited invitation token (valid for 7 days) allowing the user to activate their portal account.
              </p>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Recipient Name
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Farhana Halpi"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Recipient Work Email
                </label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="recipient@tm.com.my"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Role to Assign
                </label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as UserRole)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-hidden"
                >
                  <option value="NOC">NOC (Operational Monitoring & Tickets)</option>
                  <option value="OPS">OPS (Executive KPI & Reporting)</option>
                  <option value="Admin">Admin (Full System Clearance)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Change Role Modal with Confirmation */}
      {showRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900 text-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
              Confirm Role Re-assignment
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-4">
              Select the new security clearance for <span className="font-semibold text-slate-900 dark:text-white">{showRoleModal.name}</span>.
            </p>

            <div className="space-y-2 mb-5">
              {(['NOC', 'OPS', 'Admin'] as UserRole[]).map(role => (
                <label
                  key={role}
                  className={`flex items-center justify-between rounded-xl border p-3 cursor-pointer transition-colors ${
                    newSelectedRole === role
                      ? 'border-blue-500 bg-blue-50/50 dark:border-blue-700 dark:bg-blue-950/40'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <span className="font-bold">{role}</span>
                  <input
                    type="radio"
                    name="roleOption"
                    checked={newSelectedRole === role}
                    onChange={() => setNewSelectedRole(role)}
                    className="text-blue-600"
                  />
                </label>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
              <button
                type="button"
                onClick={() => setShowRoleModal(null)}
                className="rounded-xl border border-slate-200 px-3.5 py-1.5 font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRoleChange}
                className="rounded-xl bg-blue-600 px-3.5 py-1.5 font-semibold text-white hover:bg-blue-700"
              >
                Confirm Role Change
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 4: Deactivate / Activate Account Confirmation with Guard */}
      {showDeactivateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900 text-xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400 mb-3">
              <AlertTriangle className="h-5 w-5" />
            </div>

            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">
              {showDeactivateModal.status === 'Active' ? 'Deactivate Account' : 'Reactivate Account'}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
              Are you sure you want to {showDeactivateModal.status === 'Active' ? 'deactivate' : 'activate'}{' '}
              <span className="font-semibold text-slate-900 dark:text-white">{showDeactivateModal.name}</span>?{' '}
              {showDeactivateModal.status === 'Active'
                ? 'The user will immediately lose access to all portal routes.'
                : 'The user will regain login and authorized access.'}
            </p>

            <div className="flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
              <button
                type="button"
                onClick={() => setShowDeactivateModal(null)}
                className="rounded-xl border border-slate-200 px-3.5 py-1.5 font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmToggleStatus}
                className={`rounded-xl px-3.5 py-1.5 font-semibold text-white ${
                  showDeactivateModal.status === 'Active' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {showDeactivateModal.status === 'Active' ? 'Yes, Deactivate' : 'Yes, Activate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 5: Reset Password Result */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900 text-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
              Reset Password Credential
            </h3>

            {tempPasswordResult ? (
              <div className="space-y-3 py-2">
                <p className="text-slate-600 dark:text-slate-400">
                  Password has been reset for <span className="font-semibold">{showResetModal.name}</span>. Temporary credential:
                </p>
                <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 font-mono text-center font-bold text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300 text-sm">
                  {tempPasswordResult}
                </div>
                <p className="text-[11px] text-slate-400">
                  Provide this password securely to the user. They will be prompted to replace it with a 14-character complex password upon sign-in.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShowResetModal(null);
                    setTempPasswordResult(null);
                  }}
                  className="mt-3 w-full rounded-xl bg-slate-900 py-2 text-xs font-semibold text-white dark:bg-white dark:text-slate-900"
                >
                  Close
                </button>
              </div>
            ) : (
              <div>
                <p className="text-slate-500 dark:text-slate-400 mb-4">
                  Initiate password reset for <span className="font-semibold text-slate-900 dark:text-white">{showResetModal.name}</span>?
                </p>
                <div className="flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowResetModal(null)}
                    className="rounded-xl border border-slate-200 px-3.5 py-1.5 font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmResetPassword}
                    className="rounded-xl bg-blue-600 px-3.5 py-1.5 font-semibold text-white hover:bg-blue-700"
                  >
                    Generate Reset
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
