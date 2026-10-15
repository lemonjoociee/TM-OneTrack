import React, { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { Ticket } from '../../types';
import { TicketDrawer } from '../../components/noc/TicketDrawer';
import {
  Clock,
  Copy,
  Check,
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { formatDateDisplay } from '../../utils/dateUtils';

type QueueFilterType = 'today' | 'rca' | 'mgr' | 'older' | 'mate';

export const NocToReplyPage: React.FC = () => {
  const { tickets, updateTicket } = useData();
  const [activeFilter, setActiveFilter] = useState<QueueFilterType>('today');
  const [activeDrawerTicket, setActiveDrawerTicket] = useState<Ticket | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Group tickets into the designated operational reply buckets
  const queueBuckets = useMemo(() => {
    const today: Ticket[] = [];
    const rca: Ticket[] = [];
    const mgr: Ticket[] = [];
    const older: Ticket[] = [];
    const mate: Ticket[] = [];

    const now = new Date();
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    tickets.forEach(t => {
      const isResolved =
        t.normalizedStatus === 'Resolved' ||
        t.normalizedStatus === 'Closed' ||
        t.status.toLowerCase().includes('logged');

      // Solved waiting for RCA bucket
      if (isResolved && t.type === 'Nubitel' && (t.rca === 'Requested' || t.flag === 'RCA DUE')) {
        rca.push(t);
        return;
      }

      if (isResolved) return; // Don't require reply if resolved and no RCA owed

      // Access: tell manager bucket
      if (t.type === 'Access') {
        mgr.push(t);
        return;
      }

      const needsReply =
        t.auto === 'NOC to respond' ||
        t.replyNeeded === 'now' ||
        t.flag === 'OVERDUE' ||
        (t.stage && t.stage.includes('Pending Customer'));

      if (!needsReply) return;

      // Colleague handling
      if (t.owner && (t.owner.toLowerCase().includes('harveet') || t.owner.toLowerCase().includes('murugesh'))) {
        mate.push(t);
        return;
      }

      // Check if ticket updated today vs older
      const effectiveDate = new Date(t.lastSort || t.last || t.opened);
      if (effectiveDate >= todayMidnight) {
        today.push(t);
      } else {
        older.push(t);
      }
    });

    return { today, rca, mgr, older, mate };
  }, [tickets]);

  const activeTickets = queueBuckets[activeFilter] || [];

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const getSuggestedReply = (t: Ticket, kind: QueueFilterType): string => {
    if (t.sugReply) return t.sugReply;
    if (kind === 'rca') {
      return `Hi Team, the issue "${t.subject}"${t.nubTicket ? ` (case #${t.nubTicket})` : ''} is resolved on our side. Kindly share the RCA so we can close it with the reporter. Thank you.`;
    }
    if (kind === 'mgr') {
      return `Hi Manager, FYI: ${t.subject} (${t.id}) requires administrative credential reset on SES / SciTM. Reporter is waiting for update.`;
    }
    return `Hi Team,\nNoted with thanks, we are investigating this issue and will update you shortly.`;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-5 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            To Reply Queue
          </h1>
          <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-700 dark:bg-rose-950 dark:text-rose-300">
            {queueBuckets.today.length} today
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Strict 15-minute response rule for new issues. Copy pre-drafted templates and mark replied once sent.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setActiveFilter('today')}
          className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-colors ${
            activeFilter === 'today'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
          }`}
        >
          <span>Reply Today (15-min rule)</span>
          <span className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono ${activeFilter === 'today' ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800'}`}>
            {queueBuckets.today.length}
          </span>
        </button>

        <button
          onClick={() => setActiveFilter('rca')}
          className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-colors ${
            activeFilter === 'rca'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
          }`}
        >
          <span>Solved, Waiting for RCA</span>
          <span className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono ${activeFilter === 'rca' ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800'}`}>
            {queueBuckets.rca.length}
          </span>
        </button>

        <button
          onClick={() => setActiveFilter('mgr')}
          className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-colors ${
            activeFilter === 'mgr'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
          }`}
        >
          <span>Access: Tell Manager</span>
          <span className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono ${activeFilter === 'mgr' ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800'}`}>
            {queueBuckets.mgr.length}
          </span>
        </button>

        <button
          onClick={() => setActiveFilter('older')}
          className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-colors ${
            activeFilter === 'older'
              ? 'bg-slate-800 text-white shadow-xs dark:bg-slate-200 dark:text-slate-900'
              : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
          }`}
        >
          <span>Older, Not Today</span>
          <span className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono ${activeFilter === 'older' ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800'}`}>
            {queueBuckets.older.length}
          </span>
        </button>

        <button
          onClick={() => setActiveFilter('mate')}
          className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-colors ${
            activeFilter === 'mate'
              ? 'bg-slate-800 text-white shadow-xs dark:bg-slate-200 dark:text-slate-900'
              : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
          }`}
        >
          <span>Colleague Handling</span>
          <span className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono ${activeFilter === 'mate' ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800'}`}>
            {queueBuckets.mate.length}
          </span>
        </button>
      </div>

      {/* Queue Items */}
      <div className="space-y-4">
        {activeTickets.length > 0 ? (
          activeTickets.map(ticket => {
            const replyText = getSuggestedReply(ticket, activeFilter);
            const nubitelChaseText = `Hi Team, our reporter is chasing for an update on "${ticket.subject}"${ticket.nubTicket ? ` (case #${ticket.nubTicket})` : ''}. Kindly share the latest findings and timeline ASAP. Thank you.`;

            return (
              <div
                key={ticket.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-3.5"
              >
                {/* Header row */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                      {ticket.id}
                    </span>
                    <span className="text-slate-300 dark:text-slate-700">·</span>
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {ticket.type}
                    </span>
                    {ticket.pri && (
                      <span className="rounded bg-rose-100 px-1.5 py-0.2 text-[10px] font-bold text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                        {ticket.pri}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    {activeFilter === 'today' && (
                      <span className="flex items-center gap-1 font-bold text-rose-600 dark:text-rose-400">
                        <Clock className="h-3.5 w-3.5" /> 15-min SLA rule
                      </span>
                    )}
                    <span className="font-mono text-slate-400">
                      {formatDateDisplay(ticket.lastSort || ticket.last || ticket.opened)}
                    </span>
                  </div>
                </div>

                {/* Subject & Context */}
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {ticket.subject}
                  </h3>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span>Reported by: <span className="font-semibold text-slate-700 dark:text-slate-300">{ticket.reporter || '—'}</span></span>
                    <span>·</span>
                    <span>Site: {ticket.site || 'Unknown Site'}</span>
                    {ticket.nubTicket && (
                      <>
                        <span>·</span>
                        <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                          Case #{ticket.nubTicket}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Suggested Reply Box */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {activeFilter === 'rca'
                        ? 'Chase Nubitel for RCA (Portal / WhatsApp)'
                        : activeFilter === 'mgr'
                        ? 'Notification for Management'
                        : 'Suggested Reply (1-Click Copy)'}
                    </span>
                    {copiedKey === `reply-${ticket.id}` && (
                      <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                        <Check className="h-3 w-3" /> Copied!
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                    {replyText}
                  </p>
                </div>

                {/* Actions Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => copyToClipboard(replyText, `reply-${ticket.id}`)}
                      className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 shadow-xs transition-colors"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy Reply</span>
                    </button>

                    {ticket.type === 'Nubitel' && (
                      <button
                        onClick={() => copyToClipboard(nubitelChaseText, `chase-${ticket.id}`)}
                        className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors"
                      >
                        <Copy className="h-3.5 w-3.5 text-slate-400" />
                        <span>Copy Nubitel Chase</span>
                      </button>
                    )}

                    <button
                      onClick={() => setActiveDrawerTicket(ticket)}
                      className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                      <MessageSquare className="h-3.5 w-3.5 text-slate-400" />
                      <span>View Conversation</span>
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      updateTicket(ticket.id, {
                        auto: 'Waiting on reporter',
                        replyNeeded: 'no'
                      });
                    }}
                    className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-400 transition-colors"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>{activeFilter === 'mgr' ? 'Mark Informed' : 'Mark Replied'}</span>
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white/50 p-12 text-center dark:border-slate-800 dark:bg-slate-900/50">
            <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500 mb-2" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              No Pending Replies in this Category
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              All reporters have been responded to within operational thresholds.
            </p>
          </div>
        )}
      </div>

      {/* Ticket Drawer */}
      <TicketDrawer
        ticket={activeDrawerTicket}
        onClose={() => setActiveDrawerTicket(null)}
        onMarkReplied={(id) => {
          updateTicket(id, { auto: 'Waiting on reporter', replyNeeded: 'no' });
          setActiveDrawerTicket(null);
        }}
      />
    </div>
  );
};
