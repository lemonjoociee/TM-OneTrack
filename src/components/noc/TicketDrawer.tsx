import React, { useState, useEffect } from 'react';
import { Ticket } from '../../types';
import {
  X,
  Copy,
  ExternalLink,
  Clock,
  AlertCircle,
  HelpCircle,
  Check,
  ChevronDown,
  ChevronUp,
  MessageSquare
} from 'lucide-react';
import { formatDateDisplay } from '../../utils/dateUtils';

interface TicketDrawerProps {
  ticket: Ticket | null;
  onClose: () => void;
  onMarkReplied?: (ticketId: string) => void;
}

export const TicketDrawer: React.FC<TicketDrawerProps> = ({ ticket, onClose, onMarkReplied }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showAllDetails, setShowAllDetails] = useState<boolean>(false);
  const [showCallQuestions, setShowCallQuestions] = useState<boolean>(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!ticket) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('closed') || s.includes('resolved') || s.includes('done') || s.includes('logged')) {
      return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800';
    }
    if (s.includes('progress') || s.includes('pending')) {
      return 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200 dark:border-blue-800';
    }
    if (s.includes('monitor')) {
      return 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400 border border-purple-200 dark:border-purple-800';
    }
    return 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800';
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Nubitel': return 'bg-blue-600 text-white';
      case 'Asset': return 'bg-emerald-600 text-white';
      case 'Access': return 'bg-purple-600 text-white';
      case 'Network': return 'bg-cyan-600 text-white';
      default: return 'bg-indigo-600 text-white';
    }
  };

  // Quick reply options from NOC SOP
  const quickReplies = [
    {
      title: 'Acknowledge',
      text: `Hi Team,\nNoted, we are checking this and will update you shortly.`
    },
    {
      title: 'Escalate to Nubitel',
      text: `Hi Team,\nWe have escalated this issue to Nubitel${ticket.nubTicket ? ` (case #${ticket.nubTicket})` : ''} and will update you once we receive their feedback.`
    },
    {
      title: 'Fixed, please check',
      text: `Hi Team,\nNubitel has informed us that the issue has been fixed. Kindly check on your side and let us know if the issue persists.`
    },
    {
      title: 'RCA Requested',
      text: `Hi Team,\nWe have requested the Root Cause Analysis (RCA) from Nubitel and will share the findings once received.`
    }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <aside className="w-screen max-w-2xl bg-white shadow-2xl flex flex-col dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-200">
          {/* Top Bar */}
          <div className="border-b border-slate-200 p-5 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/90">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className={`rounded-md px-2 py-0.5 text-xs font-bold ${getTypeColor(ticket.type)}`}>
                  {ticket.type}
                </span>
                <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400">
                  {ticket.id}
                </span>
                {ticket.pri && (
                  <span className="rounded bg-rose-100 dark:bg-rose-950/70 px-1.5 py-0.5 text-[10px] font-bold text-rose-700 dark:text-rose-300">
                    {ticket.pri}
                  </span>
                )}
              </div>

              <button
                onClick={onClose}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                aria-label="Close panel"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <h2 className="mt-2 text-base font-bold text-slate-900 dark:text-white leading-snug">
              {ticket.subject}
            </h2>

            {/* Status chips */}
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${getStatusBadge(ticket.status)}`}>
                {ticket.status}
              </span>

              {ticket.stage && (
                <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  {ticket.stage}
                </span>
              )}

              {ticket.flag && (
                <span className="rounded-md bg-rose-50 px-2 py-0.5 text-xs font-bold text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                  {ticket.flag}
                </span>
              )}

              {ticket.auto === 'NOC to respond' && (
                <span className="flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-400">
                  <Clock className="h-3.5 w-3.5" />
                  <span>15-min response rule</span>
                </span>
              )}

              <div className="ml-auto flex items-center gap-2">
                {ticket.portalUrl && (
                  <a
                    href={ticket.portalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-white dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                  >
                    <ExternalLink className="h-3 w-3" />
                    <span>Portal</span>
                  </a>
                )}
                {onMarkReplied && ticket.auto === 'NOC to respond' && (
                  <button
                    onClick={() => onMarkReplied(ticket.id)}
                    className="rounded-md bg-slate-900 px-3 py-1 text-xs font-medium text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition-colors"
                  >
                    Mark Replied
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* AI Summary Block */}
            {(ticket.aiSum || ticket.aiNext) && (
              <div className="rounded-xl border border-purple-200 bg-purple-50/50 p-4 dark:border-purple-900/60 dark:bg-purple-950/20">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400">
                  <span>AI Operational Summary</span>
                </div>
                {ticket.aiSum && (
                  <p className="mt-1 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {ticket.aiSum}
                  </p>
                )}
                {ticket.aiNext && (
                  <div className="mt-2 text-xs">
                    <span className="font-semibold text-purple-800 dark:text-purple-300">Next Action: </span>
                    <span className="text-slate-700 dark:text-slate-300">{ticket.aiNext}</span>
                  </div>
                )}
              </div>
            )}

            {/* Quick Facts Grid */}
            <div className="grid grid-cols-2 gap-3 rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 text-xs sm:grid-cols-3 dark:border-slate-800 dark:bg-slate-900/40">
              <div>
                <span className="block text-[11px] font-medium text-slate-400 dark:text-slate-500">Reported By</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{ticket.reporter || '—'}</span>
              </div>
              <div>
                <span className="block text-[11px] font-medium text-slate-400 dark:text-slate-500">Site</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{ticket.site || 'Unknown Site'}</span>
              </div>
              <div>
                <span className="block text-[11px] font-medium text-slate-400 dark:text-slate-500">Area</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{ticket.area || '—'}</span>
              </div>
              <div>
                <span className="block text-[11px] font-medium text-slate-400 dark:text-slate-500">Reported Time</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">{ticket.opened || '—'}</span>
              </div>
              <div>
                <span className="block text-[11px] font-medium text-slate-400 dark:text-slate-500">Last Updated</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">{ticket.last || '—'}</span>
              </div>
              <div>
                <span className="block text-[11px] font-medium text-slate-400 dark:text-slate-500">Assigned Contact</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{ticket.owner || 'Unassigned'}</span>
              </div>
            </div>

            {/* Suggested Reply / Quick Action */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Quick Reply Snippets (Click to Copy)
                </span>
                {copiedKey && (
                  <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                    <Check className="h-3 w-3" /> Copied to clipboard!
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {quickReplies.map((r, i) => (
                  <button
                    key={i}
                    onClick={() => copyToClipboard(r.text, `qr-${i}`)}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
                  >
                    <Copy className="h-3 w-3 text-slate-400" />
                    <span>{r.title}</span>
                  </button>
                ))}
              </div>

              {ticket.sugReply && (
                <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50/60 p-3 dark:border-emerald-900/60 dark:bg-emerald-950/30">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                      Context-Specific Reply
                    </span>
                    <button
                      onClick={() => copyToClipboard(ticket.sugReply || '', 'sug')}
                      className="flex items-center gap-1 text-xs font-medium text-emerald-700 hover:underline dark:text-emerald-300"
                    >
                      <Copy className="h-3 w-3" /> Copy
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                    {ticket.sugReply}
                  </p>
                </div>
              )}
            </div>

            {/* Questions to ask on Call Accordion for New Issues */}
            {ticket.callQ && (
              <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-900/60 dark:bg-amber-950/20">
                <button
                  onClick={() => setShowCallQuestions(!showCallQuestions)}
                  className="flex w-full items-center justify-between text-left text-xs font-bold text-amber-800 dark:text-amber-300"
                >
                  <span className="flex items-center gap-1.5">
                    <HelpCircle className="h-4 w-4" />
                    <span>New Issue: Questions to ask on the call</span>
                  </span>
                  {showCallQuestions ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>

                {showCallQuestions && (
                  <div className="mt-2 text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed border-t border-amber-200 dark:border-amber-900/60 pt-2">
                    {ticket.callQ}
                  </div>
                )}
              </div>
            )}

            {/* Conversation Thread */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Conversation Log ({ticket.thread?.length || 0} Emails)
                </h3>
              </div>

              {ticket.thread && ticket.thread.length > 0 ? (
                <div className="space-y-3">
                  {ticket.thread.map((msg, idx) => {
                    const [time, sender, role, content] = msg;
                    const isNoc = role === 'NOC';
                    return (
                      <div
                        key={idx}
                        className={`rounded-xl border p-3.5 text-xs transition-colors ${
                          isNoc
                            ? 'border-blue-200 bg-blue-50/50 dark:border-blue-900/50 dark:bg-blue-950/20 ml-4'
                            : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 mr-4'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-slate-900 dark:text-white">
                              {sender}
                            </span>
                            <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[10px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                              {role}
                            </span>
                          </div>
                          <span className="font-mono text-[11px] text-slate-400 dark:text-slate-500">
                            {formatDateDisplay(time)}
                          </span>
                        </div>
                        <div className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                          {content}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-xs text-slate-400 dark:border-slate-800">
                  No email thread logs recorded for this ticket.
                </div>
              )}
            </div>

            {/* All Details Drawer Accordion */}
            <div className="border-t border-slate-200 pt-4 dark:border-slate-800">
              <button
                onClick={() => setShowAllDetails(!showAllDetails)}
                className="flex w-full items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              >
                <span>Full Technical & Resolution Metadata</span>
                {showAllDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>

              {showAllDetails && (
                <div className="mt-3 grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-xl dark:bg-slate-800/40">
                  {ticket.resolution && (
                    <div className="col-span-2">
                      <span className="font-semibold text-slate-500 block">Resolution:</span>
                      <span className="text-slate-800 dark:text-slate-200">{ticket.resolution}</span>
                    </div>
                  )}
                  {ticket.root && (
                    <div className="col-span-2">
                      <span className="font-semibold text-slate-500 block">Root Cause (RCA):</span>
                      <span className="text-slate-800 dark:text-slate-200">{ticket.root}</span>
                    </div>
                  )}
                  {ticket.action && (
                    <div className="col-span-2">
                      <span className="font-semibold text-slate-500 block">Action Taken:</span>
                      <span className="text-slate-800 dark:text-slate-200">{ticket.action}</span>
                    </div>
                  )}
                  <div>
                    <span className="font-semibold text-slate-500 block">Nubitel Ticket:</span>
                    <span className="text-slate-800 dark:text-slate-200">{ticket.nubTicket || '—'}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-500 block">RCA Status:</span>
                    <span className="text-slate-800 dark:text-slate-200">{ticket.rca || '—'}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-500 block">Escalated:</span>
                    <span className="text-slate-800 dark:text-slate-200">{ticket.esc || 'No'}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-500 block">First Response (Mins):</span>
                    <span className="text-slate-800 dark:text-slate-200">{ticket.firstMins || '—'}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
