import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';
import { MailPlus, RefreshCw, XCircle, CheckCircle2, Copy, Check, ExternalLink, AlertCircle } from 'lucide-react';
import { formatDateDisplay } from '../../utils/dateUtils';

export const InvitationsPage: React.FC = () => {
  const { invitations, sendInvitation, resendInvitation, cancelInvitation } = useAuth();

  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('NOC');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ text: string; isError?: boolean } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await sendInvitation(formName, formEmail, formRole);
    if (res.success) {
      setFeedback({ text: res.message || 'Invitation created.' });
      setFormName('');
      setFormEmail('');
    } else {
      setFeedback({ text: res.message || 'Failed to create invitation.', isError: true });
    }
    setTimeout(() => setFeedback(null), 4000);
  };

  const copyToken = (tok: string) => {
    navigator.clipboard.writeText(tok);
    setCopiedToken(tok);
    setTimeout(() => setCopiedToken(null), 2500);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Accepted':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800';
      case 'Pending':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800';
      case 'Expired':
        return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700';
      default:
        return 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-5 dark:border-slate-800">
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          User Invitations & Tokens
        </h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Issue time-limited activation tokens and monitor acceptance status
        </p>
      </div>

      {feedback && (
        <div
          className={`flex items-center gap-2 rounded-xl p-3.5 text-xs font-medium ${
            feedback.isError
              ? 'border border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300'
              : 'border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300'
          }`}
        >
          {feedback.isError ? (
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          ) : (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Send Invitation Form */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
          <MailPlus className="h-4 w-4 text-blue-600" />
          <span>Dispatch New Portal Invitation</span>
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          The system creates a cryptographically signed token valid for 7 days.
        </p>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g. Mohd Suhairie"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Work Email
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
              <option value="NOC">NOC</option>
              <option value="OPS">OPS</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full rounded-xl bg-blue-600 py-2.5 px-4 font-semibold text-white hover:bg-blue-700 shadow-xs transition-colors"
            >
              Send Invitation
            </button>
          </div>
        </form>
      </div>

      {/* Invitations Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
            <tr>
              <th className="py-3 px-4">Recipient</th>
              <th className="py-3 px-4">Assigned Role</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Invited Date</th>
              <th className="py-3 px-4">Token (Test Mode)</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {invitations.length > 0 ? (
              invitations.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900 dark:text-white">{inv.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{inv.email}</div>
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-semibold">{inv.role}</span>
                  </td>

                  <td className="py-3 px-4">
                    <span className={`inline-block rounded-md px-2 py-0.5 text-[11px] font-bold ${getStatusBadge(inv.status)}`}>
                      {inv.status}
                    </span>
                  </td>

                  <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                    {formatDateDisplay(inv.invitedDate)}
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                      <span className="truncate max-w-[120px]">{inv.token}</span>
                      <button
                        onClick={() => copyToken(inv.token)}
                        className="p-1 hover:text-blue-600"
                        title="Copy token"
                      >
                        {copiedToken === inv.token ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                      </button>
                    </div>
                  </td>

                  <td className="py-3 px-4 text-right">
                    {inv.status === 'Pending' ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => resendInvitation(inv.id)}
                          className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                        >
                          <RefreshCw className="h-3 w-3" /> Resend
                        </button>
                        <button
                          onClick={() => cancelInvitation(inv.id)}
                          className="flex items-center gap-1 text-xs text-rose-600 hover:underline"
                        >
                          <XCircle className="h-3 w-3" /> Cancel
                        </button>
                      </div>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">
                  No invitations dispatched yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
