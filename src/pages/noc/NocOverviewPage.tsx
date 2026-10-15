import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { Ticket, TicketType } from '../../types';
import { formatDateDisplay } from '../../utils/dateUtils';
import { TicketDrawer } from '../../components/noc/TicketDrawer';
import {
  Clock,
  AlertCircle,
  CheckCircle2,
  Filter,
  Check,
  ChevronRight,
  MessageSquare
} from 'lucide-react';

const SEEN_STORAGE_KEY = 'noc_dashboard_seen_records_v2';

export const NocOverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { tickets, whatsappChats, updateTicket } = useData();

  const [range, setRange] = useState<'new' | '1' | '3' | '7'>('new');
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);

  // Stored last seen timestamp
  const [seenTimestamp, setSeenTimestamp] = useState<string>(() => {
    try {
      return localStorage.getItem(SEEN_STORAGE_KEY) || new Date(Date.now() - 24 * 3600 * 1000).toISOString();
    } catch (e) {
      return new Date(Date.now() - 24 * 3600 * 1000).toISOString();
    }
  });

  const markAllAsSeen = () => {
    const nowIso = new Date().toISOString();
    setSeenTimestamp(nowIso);
    try {
      localStorage.setItem(SEEN_STORAGE_KEY, nowIso);
    } catch (e) {
      // ignore
    }
  };

  // Filter feed items according to selected range
  const feedItems = useMemo(() => {
    const now = new Date();
    let thresholdDate: Date | null = null;

    if (range === 'new') {
      thresholdDate = new Date(seenTimestamp);
    } else {
      const days = parseInt(range, 10);
      thresholdDate = new Date(now.getTime() - days * 24 * 3600 * 1000);
    }

    return tickets
      .filter(t => {
        if (!t.lastSort && !t.last && !t.opened) return false;
        const d = new Date(t.lastSort || t.last || t.opened);
        return isNaN(d.getTime()) ? true : d >= thresholdDate!;
      })
      .sort((a, b) => {
        const dateA = a.lastSort || a.last || a.opened || '';
        const dateB = b.lastSort || b.last || b.opened || '';
        return dateB.localeCompare(dateA);
      });
  }, [tickets, range, seenTimestamp]);

  // Attention Chips Counts
  const overdueCount = tickets.filter(t => t.flag === 'OVERDUE').length;
  const noUpdateCount = tickets.filter(t => t.flag === 'NO UPDATE').length;
  const rcaDueCount = tickets.filter(t => t.flag === 'RCA DUE' || t.rca === 'Requested').length;
  const replyTodayCount = tickets.filter(
    t => t.auto === 'NOC to respond' || t.replyNeeded === 'now'
  ).length;

  const getTypeStyle = (type: TicketType) => {
    switch (type) {
      case 'Nubitel': return 'bg-blue-600 text-white';
      case 'Asset': return 'bg-emerald-600 text-white';
      case 'Access': return 'bg-purple-600 text-white';
      case 'Network': return 'bg-cyan-600 text-white';
      default: return 'bg-slate-700 text-white';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar with Range & Action */}
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              What's New
            </h1>
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              {feedItems.length} updates
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Real-time feed of new escalations, email replies, and operational ticket threads
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Segmented Range Control */}
          <div className="flex rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-slate-800 dark:bg-slate-900">
            <button
              onClick={() => setRange('new')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                range === 'new'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Unseen
            </button>
            <button
              onClick={() => setRange('1')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                range === '1'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setRange('3')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                range === '3'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              3 Days
            </button>
            <button
              onClick={() => setRange('7')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                range === '7'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              7 Days
            </button>
          </div>

          <button
            onClick={markAllAsSeen}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <Check className="h-3.5 w-3.5 text-emerald-600" />
            <span>Mark all as seen</span>
          </button>
        </div>
      </div>

      {/* Needs Attention Chips Bar */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 mr-1">
          Needs Attention:
        </span>

        {replyTodayCount > 0 && (
          <button
            onClick={() => navigate('/noc/reply')}
            className="flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700 hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300 transition-colors"
          >
            <span className="font-mono">{replyTodayCount}</span>
            <span>Reply Today (15-min rule)</span>
          </button>
        )}

        {overdueCount > 0 && (
          <button
            onClick={() => navigate('/noc/tickets')}
            className="flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700 hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300 transition-colors"
          >
            <span className="font-mono">{overdueCount}</span>
            <span>Overdue Tickets</span>
          </button>
        )}

        {noUpdateCount > 0 && (
          <button
            onClick={() => navigate('/noc/tickets')}
            className="flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 hover:bg-amber-100 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300 transition-colors"
          >
            <span className="font-mono">{noUpdateCount}</span>
            <span>No Update to Reporter</span>
          </button>
        )}

        {rcaDueCount > 0 && (
          <button
            onClick={() => navigate('/noc/reply')}
            className="flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 hover:bg-amber-100 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300 transition-colors"
          >
            <span className="font-mono">{rcaDueCount}</span>
            <span>Waiting for Nubitel RCA</span>
          </button>
        )}
      </div>

      {/* Feed Stream */}
      <div className="space-y-3">
        {feedItems.length > 0 ? (
          feedItems.map(ticket => {
            const lastMsg = ticket.thread && ticket.thread.length > 0 ? ticket.thread[ticket.thread.length - 1] : null;
            const isUnseen = new Date(ticket.lastSort || ticket.last || ticket.opened) > new Date(seenTimestamp);

            return (
              <div
                key={ticket.id}
                onClick={() => setActiveTicket(ticket)}
                className={`group flex items-start gap-3.5 rounded-2xl border p-4 text-left transition-all cursor-pointer bg-white dark:bg-slate-900 hover:shadow-md ${
                  isUnseen
                    ? 'border-blue-300 dark:border-blue-800 bg-blue-50/20'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* Avatar Icon */}
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-xs font-bold uppercase shrink-0 shadow-xs ${getTypeStyle(ticket.type)}`}>
                  {ticket.type.slice(0, 3)}
                </div>

                {/* Main Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400">
                        {ticket.id}
                      </span>
                      {ticket.pri && (
                        <span className="rounded bg-rose-100 dark:bg-rose-950 px-1.5 py-0.2 text-[10px] font-bold text-rose-700 dark:text-rose-300">
                          {ticket.pri}
                        </span>
                      )}
                      {isUnseen && (
                        <span className="rounded bg-blue-600 px-1.5 py-0.2 text-[10px] font-bold text-white uppercase">
                          New
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-[11px] text-slate-400 dark:text-slate-500 shrink-0">
                      {formatDateDisplay(ticket.lastSort || ticket.last || ticket.opened)}
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white mt-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                    {ticket.subject}
                  </h3>

                  {lastMsg ? (
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {lastMsg[1]}:{' '}
                      </span>
                      {lastMsg[3]}
                    </p>
                  ) : ticket.aiSum ? (
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                      {ticket.aiSum}
                    </p>
                  ) : null}

                  {/* Metadata line */}
                  <div className="mt-2.5 flex flex-wrap items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500">
                    <span>{ticket.site || 'Unknown Site'}</span>
                    <span>·</span>
                    <span>{ticket.area || ticket.type}</span>
                    <span>·</span>
                    <span>Reported by {ticket.reporter || '—'}</span>
                    {ticket.flag && (
                      <>
                        <span>·</span>
                        <span className="font-bold text-rose-600 dark:text-rose-400">
                          {ticket.flag}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-blue-600 dark:text-slate-600 shrink-0 self-center transition-colors" />
              </div>
            );
          })
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white/50 p-12 text-center dark:border-slate-800 dark:bg-slate-900/50">
            <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500 mb-2" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              You're all caught up!
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              No new emails or ticket updates for the selected range.
            </p>
          </div>
        )}
      </div>

      {/* Detail Drawer */}
      <TicketDrawer
        ticket={activeTicket}
        onClose={() => setActiveTicket(null)}
        onMarkReplied={(id) => {
          updateTicket(id, { auto: 'Waiting on reporter' });
          setActiveTicket(null);
        }}
      />
    </div>
  );
};
