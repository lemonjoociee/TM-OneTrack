import React, { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { Ticket, TicketType } from '../../types';
import { TicketDrawer } from '../../components/noc/TicketDrawer';
import {
  Search,
  Filter,
  ArrowUpDown,
  Clock,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { formatDateDisplay } from '../../utils/dateUtils';

export const NocTicketsPage: React.FC = () => {
  const { tickets, updateTicket } = useData();

  const [view, setView] = useState<'open' | 'closed' | 'all'>('open');
  const [bucket, setBucket] = useState<'All' | 'Nubitel' | 'Asset' | 'Other'>('All');
  const [selectedTile, setSelectedTile] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedOwner, setSelectedOwner] = useState<string>('All');
  const [sortField, setSortField] = useState<'opened' | 'last' | 'age' | 'id'>('last');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [activeDrawerTicket, setActiveDrawerTicket] = useState<Ticket | null>(null);

  const isClosed = (t: Ticket) =>
    /closed|resolved|done|cancel|logged|monitor/i.test(t.status || '') && t.flag !== 'REOPENED';

  const withNubitel = (t: Ticket) =>
    /Escalated|Nubitel replied|Fix in UAT/i.test(t.stage || '');

  // Base view separation
  const openTickets = useMemo(() => tickets.filter(t => !isClosed(t)), [tickets]);
  const closedTickets = useMemo(() => tickets.filter(t => isClosed(t)), [tickets]);

  const baseTickets = view === 'open' ? openTickets : view === 'closed' ? closedTickets : tickets;

  // Bucket separation
  const bucketTickets = useMemo(() => {
    if (bucket === 'All') return baseTickets;
    if (bucket === 'Nubitel') return baseTickets.filter(t => t.type === 'Nubitel');
    if (bucket === 'Asset') return baseTickets.filter(t => t.type === 'Asset');
    return baseTickets.filter(t => t.type !== 'Nubitel' && t.type !== 'Asset');
  }, [baseTickets, bucket]);

  // Dynamic Tile counts
  const tiles = useMemo(() => {
    if (view === 'closed') {
      return [
        { key: '', label: 'Closed Total', count: bucketTickets.length, color: 'text-emerald-600' },
        { key: 'Nubitel', label: 'Closed Nubitel', count: bucketTickets.filter(t => t.type === 'Nubitel').length, color: 'text-blue-600' },
        { key: 'Asset', label: 'Closed Asset', count: bucketTickets.filter(t => t.type === 'Asset').length, color: 'text-emerald-600' },
        { key: 'Other', label: 'Closed Other', count: bucketTickets.filter(t => t.type !== 'Nubitel' && t.type !== 'Asset').length, color: 'text-purple-600' },
        { key: 'mon', label: 'Resolved (Monitoring)', count: bucketTickets.filter(t => t.stage === 'Monitoring' || /monitor/i.test(t.status)).length, color: 'text-purple-600' },
        { key: 'rcadue', label: 'Waiting for Nubitel RCA', count: bucketTickets.filter(t => t.rca === 'Requested').length, color: 'text-amber-600' }
      ];
    }
    return [
      { key: '', label: 'Open Total', count: bucketTickets.length, color: 'text-slate-900 dark:text-white' },
      { key: 'Nubitel', label: 'Nubitel', count: bucketTickets.filter(t => t.type === 'Nubitel').length, color: 'text-blue-600' },
      { key: 'Asset', label: 'Asset', count: bucketTickets.filter(t => t.type === 'Asset').length, color: 'text-emerald-600' },
      { key: 'Other', label: 'Access / Other', count: bucketTickets.filter(t => t.type !== 'Nubitel' && t.type !== 'Asset').length, color: 'text-purple-600' },
      { key: 'flag:OVERDUE', label: 'Overdue', count: bucketTickets.filter(t => t.flag === 'OVERDUE').length, color: 'text-rose-600' },
      { key: 'resp', label: 'Reply Now (15-min)', count: bucketTickets.filter(t => t.auto === 'NOC to respond').length, color: 'text-rose-600' },
      { key: 'nudge', label: 'Reporter Chased', count: bucketTickets.filter(t => t.nudges > 0).length, color: 'text-amber-600' },
      { key: 'withnub', label: 'With Nubitel', count: bucketTickets.filter(withNubitel).length, color: 'text-indigo-600' },
      { key: 'flag:NO UPDATE', label: 'No Update to Reporter', count: bucketTickets.filter(t => t.flag === 'NO UPDATE').length, color: 'text-amber-600' },
      { key: 'noowner', label: 'No Contact Assigned', count: bucketTickets.filter(t => !t.owner).length, color: 'text-slate-500' }
    ];
  }, [view, bucketTickets]);

  // Unique statuses and owners for dropdowns
  const availableStatuses = useMemo(() => {
    return Array.from(new Set(bucketTickets.map(t => t.status).filter(Boolean))).sort();
  }, [bucketTickets]);

  const availableOwners = useMemo(() => {
    return Array.from(new Set(bucketTickets.map(t => t.owner).filter(Boolean))).sort();
  }, [bucketTickets]);

  // Apply Tile, Status, Owner, and Search filters
  const processedTickets = useMemo(() => {
    return bucketTickets.filter(t => {
      // Tile filter
      if (selectedTile) {
        if (selectedTile.startsWith('flag:')) {
          if (t.flag !== selectedTile.slice(5)) return false;
        } else if (selectedTile === 'resp') {
          if (t.auto !== 'NOC to respond') return false;
        } else if (selectedTile === 'nudge') {
          if (t.nudges <= 0) return false;
        } else if (selectedTile === 'withnub') {
          if (!withNubitel(t)) return false;
        } else if (selectedTile === 'noowner') {
          if (t.owner) return false;
        } else if (selectedTile === 'mon') {
          if (t.stage !== 'Monitoring' && !/monitor/i.test(t.status)) return false;
        } else if (selectedTile === 'rcadue') {
          if (t.rca !== 'Requested') return false;
        } else if (selectedTile === 'Nubitel' || selectedTile === 'Asset' || selectedTile === 'Other') {
          if (selectedTile === 'Other') {
            if (t.type === 'Nubitel' || t.type === 'Asset') return false;
          } else {
            if (t.type !== selectedTile) return false;
          }
        }
      }

      // Status dropdown
      if (selectedStatus !== 'All' && t.status !== selectedStatus) return false;

      // Owner dropdown
      if (selectedOwner !== 'All' && t.owner !== selectedOwner) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const fullString = [
          t.id,
          t.subject,
          t.reporter,
          t.owner,
          t.site,
          t.area,
          t.refs,
          t.impact,
          t.nubTicket,
          t.aiSum,
          t.status
        ].join(' ').toLowerCase();

        if (!fullString.includes(q)) return false;
      }

      return true;
    }).sort((a, b) => {
      let valA: any = a[sortField] || '';
      let valB: any = b[sortField] || '';
      if (sortField === 'age') {
        valA = a.age || 0;
        valB = b.age || 0;
        return sortDirection === 'desc' ? valB - valA : valA - valB;
      }
      const comp = String(valA).localeCompare(String(valB));
      return sortDirection === 'desc' ? -comp : comp;
    });
  }, [
    bucketTickets,
    selectedTile,
    selectedStatus,
    selectedOwner,
    searchQuery,
    sortField,
    sortDirection
  ]);

  const handleSort = (field: 'opened' | 'last' | 'age' | 'id') => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const clearFilters = () => {
    setSelectedTile('');
    setSelectedStatus('All');
    setSelectedOwner('All');
    setSearchQuery('');
  };

  return (
    <div className="space-y-6">
      {/* View & Bucket Segments */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-3">
          {/* View Segment (Open, Closed, All) */}
          <div className="flex rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-slate-800 dark:bg-slate-900">
            <button
              onClick={() => { setView('open'); setSelectedTile(''); }}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                view === 'open'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <span>Open</span>
              <span className="rounded-full bg-slate-100 dark:bg-slate-700 px-1.5 py-0.2 text-[10px] font-mono">
                {openTickets.length}
              </span>
            </button>

            <button
              onClick={() => { setView('closed'); setSelectedTile(''); }}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                view === 'closed'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <span>Closed</span>
              <span className="rounded-full bg-slate-100 dark:bg-slate-700 px-1.5 py-0.2 text-[10px] font-mono">
                {closedTickets.length}
              </span>
            </button>

            <button
              onClick={() => { setView('all'); setSelectedTile(''); }}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                view === 'all'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <span>All</span>
              <span className="rounded-full bg-slate-100 dark:bg-slate-700 px-1.5 py-0.2 text-[10px] font-mono">
                {tickets.length}
              </span>
            </button>
          </div>

          {/* Bucket Segment (All, Nubitel, Asset, Other) */}
          <div className="flex rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-slate-800 dark:bg-slate-900">
            <button
              onClick={() => setBucket('All')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                bucket === 'All'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              All Buckets
            </button>
            <button
              onClick={() => setBucket('Nubitel')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                bucket === 'Nubitel'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Nubitel
            </button>
            <button
              onClick={() => setBucket('Asset')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                bucket === 'Asset'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Asset
            </button>
            <button
              onClick={() => setBucket('Other')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                bucket === 'Other'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Access & Other
            </button>
          </div>
        </div>

        <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
          {processedTickets.length} tickets displayed
        </div>
      </div>

      {/* Tiles Row */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-6">
        {tiles.map((t, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedTile(prev => (prev === t.key ? '' : t.key))}
            className={`rounded-xl border p-3 text-left transition-all cursor-pointer bg-white dark:bg-slate-900 ${
              selectedTile === t.key
                ? 'ring-2 ring-blue-600 border-blue-400 dark:border-blue-700 bg-blue-50/30'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
            }`}
          >
            <div className={`text-xl font-bold font-mono ${t.color}`}>
              {t.count}
            </div>
            <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate mt-0.5">
              {t.label}
            </div>
          </button>
        ))}
      </div>

      {/* Filters & Search Row */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {/* Search */}
        <div className="relative sm:col-span-2">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search issue, reporter, staff ID, chat ID, site, contact..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-hidden dark:border-slate-800 dark:bg-slate-900 dark:text-white"
          />
        </div>

        {/* Status Dropdown */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:border-blue-500 focus:outline-hidden dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
        >
          <option value="All">Any Status</option>
          {availableStatuses.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        {/* Owner Dropdown */}
        <select
          value={selectedOwner}
          onChange={(e) => setSelectedOwner(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:border-blue-500 focus:outline-hidden dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
        >
          <option value="All">Any Contact</option>
          {availableOwners.map(o => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
            <tr>
              <th onClick={() => handleSort('id')} className="py-3 px-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800">
                <div className="flex items-center gap-1.5">
                  <span>Ticket</span>
                  <ArrowUpDown className="h-3 w-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Issue</th>
              <th className="py-3 px-4 hidden md:table-cell">Reported By</th>
              <th className="py-3 px-4 hidden md:table-cell">Contact</th>
              <th onClick={() => handleSort('opened')} className="py-3 px-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800">
                <div className="flex items-center gap-1.5">
                  <span>Reported</span>
                  <ArrowUpDown className="h-3 w-3 text-slate-400" />
                </div>
              </th>
              <th onClick={() => handleSort('last')} className="py-3 px-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 hidden lg:table-cell">
                <div className="flex items-center gap-1.5">
                  <span>Last Update</span>
                  <ArrowUpDown className="h-3 w-3 text-slate-400" />
                </div>
              </th>
              <th onClick={() => handleSort('age')} className="py-3 px-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800">
                <div className="flex items-center gap-1.5">
                  <span>Age</span>
                  <ArrowUpDown className="h-3 w-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4">Flag / SLA</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {processedTickets.length > 0 ? (
              processedTickets.map(ticket => (
                <tr
                  key={ticket.id}
                  onClick={() => setActiveDrawerTicket(ticket)}
                  className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 cursor-pointer transition-colors ${
                    ticket.flag === 'OVERDUE' ? 'border-l-4 border-l-rose-500' : ticket.flag ? 'border-l-4 border-l-amber-500' : ''
                  }`}
                >
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                      {ticket.id}
                    </span>
                    <div className="text-[10px] text-slate-400">{ticket.type}</div>
                  </td>

                  <td className="py-3 px-4">
                    <span className="rounded px-2 py-0.5 text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                      {ticket.status}
                    </span>
                    {ticket.pri && (
                      <span className="ml-1 text-[10px] font-bold text-rose-600">
                        {ticket.pri}
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4 max-w-sm">
                    <div className="font-semibold text-slate-900 dark:text-white truncate">
                      {ticket.subject}
                    </div>
                    {ticket.aiSum && (
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                        {ticket.aiSum}
                      </div>
                    )}
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                      {ticket.area} {ticket.site ? `· ${ticket.site}` : ''}
                    </div>
                  </td>

                  <td className="py-3 px-4 hidden md:table-cell text-slate-600 dark:text-slate-400 truncate max-w-[130px]">
                    {ticket.reporter || '—'}
                  </td>

                  <td className="py-3 px-4 hidden md:table-cell text-slate-600 dark:text-slate-400">
                    {ticket.owner || '—'}
                  </td>

                  <td className="py-3 px-4 font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {formatDateDisplay(ticket.opened)}
                  </td>

                  <td className="py-3 px-4 font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap hidden lg:table-cell">
                    {formatDateDisplay(ticket.last)}
                  </td>

                  <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300">
                    {ticket.age >= 48 ? `${Math.round(ticket.age / 24)}d` : `${Math.round(ticket.age)}h`}
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap">
                    {ticket.flag ? (
                      <span className="rounded bg-rose-50 px-1.5 py-0.5 text-[10px] font-bold text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                        {ticket.flag}
                      </span>
                    ) : ticket.auto === 'NOC to respond' ? (
                      <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                        15m Reply
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px]">—</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-400">
                  No tickets match the selected view, bucket, or search query.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Ticket Detail Drawer */}
      <TicketDrawer
        ticket={activeDrawerTicket}
        onClose={() => setActiveDrawerTicket(null)}
        onMarkReplied={(id) => {
          updateTicket(id, { auto: 'Waiting on reporter' });
          setActiveDrawerTicket(null);
        }}
      />
    </div>
  );
};
