import React, { useState, useMemo } from 'react';
import { Ticket, StandardStatus } from '../../types';
import { useData } from '../../contexts/DataContext';
import {
  Search,
  Filter,
  Download,
  FileSpreadsheet,
  FileText,
  RotateCcw,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Tag
} from 'lucide-react';
import { formatDateDisplay } from '../../utils/dateUtils';
import { exportToCsv, exportToExcel, generateReportFilename } from '../../utils/exportUtils';
import { OpsIssueDrawer } from './OpsIssueDrawer';

interface OpsIssueTableProps {
  statusFilterOverride?: string;
  onClearStatusOverride?: () => void;
}

export const OpsIssueTable: React.FC<OpsIssueTableProps> = ({
  statusFilterOverride,
  onClearStatusOverride
}) => {
  const { opsFilteredTickets, selectedYear, selectedMonth, opsPeriodHeading } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedSite, setSelectedSite] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortField, setSortField] = useState<'date' | 'status' | 'id'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [activeDrawerIssue, setActiveDrawerIssue] = useState<Ticket | null>(null);

  // Sync external status filter override (e.g. clicking KPI card or chart segment)
  React.useEffect(() => {
    if (statusFilterOverride) {
      setSelectedStatus(statusFilterOverride);
      setCurrentPage(1);
    }
  }, [statusFilterOverride]);

  // Dynamic Sites & Categories detected from current filtered pool
  const { availableSites, availableCategories } = useMemo(() => {
    const siteSet = new Set<string>();
    const catSet = new Set<string>();

    opsFilteredTickets.forEach(t => {
      siteSet.add(t.site ? t.site.trim() : 'Unknown Site');
      catSet.add(t.type ? t.type.trim() : 'Uncategorized');
    });

    return {
      availableSites: Array.from(siteSet).sort(),
      availableCategories: Array.from(catSet).sort()
    };
  }, [opsFilteredTickets]);

  // Apply search and table filters on top of the reporting period
  const processedTickets = useMemo(() => {
    return opsFilteredTickets.filter(t => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesId = t.id.toLowerCase().includes(q);
        const matchesSubj = t.subject.toLowerCase().includes(q);
        const matchesOwner = (t.owner || '').toLowerCase().includes(q);
        if (!matchesId && !matchesSubj && !matchesOwner) return false;
      }

      // 2. Status Filter
      if (selectedStatus !== 'All') {
        if (t.normalizedStatus !== selectedStatus) return false;
      }

      // 3. Site Filter
      if (selectedSite !== 'All') {
        const siteVal = t.site ? t.site.trim() : 'Unknown Site';
        if (siteVal !== selectedSite) return false;
      }

      // 4. Category Filter
      if (selectedCategory !== 'All') {
        const catVal = t.type ? t.type.trim() : 'Uncategorized';
        if (catVal !== selectedCategory) return false;
      }

      return true;
    }).sort((a, b) => {
      let comparison = 0;
      if (sortField === 'date') {
        const dateA = a.opened || '';
        const dateB = b.opened || '';
        comparison = dateA.localeCompare(dateB);
      } else if (sortField === 'status') {
        comparison = (a.normalizedStatus || '').localeCompare(b.normalizedStatus || '');
      } else if (sortField === 'id') {
        comparison = (a.id || '').localeCompare(b.id || '');
      }
      return sortDirection === 'desc' ? -comparison : comparison;
    });
  }, [
    opsFilteredTickets,
    searchQuery,
    selectedStatus,
    selectedSite,
    selectedCategory,
    sortField,
    sortDirection
  ]);

  // Pagination
  const totalPages = Math.ceil(processedTickets.length / pageSize) || 1;
  const paginatedTickets = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedTickets.slice(start, start + pageSize);
  }, [processedTickets, currentPage, pageSize]);

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedStatus('All');
    setSelectedSite('All');
    setSelectedCategory('All');
    setCurrentPage(1);
    if (onClearStatusOverride) onClearStatusOverride();
  };

  const handleSort = (field: 'date' | 'status' | 'id') => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleExport = (format: 'csv' | 'xlsx') => {
    const filename = generateReportFilename(
      selectedStatus !== 'All' ? selectedStatus : undefined,
      selectedYear,
      selectedMonth,
      format
    );

    const meta = {
      title: 'OPS Issue Tracker Operational Report',
      reportingPeriod: opsPeriodHeading,
      exportDateTime: new Date().toLocaleString(),
      activeFilters: {
        status: selectedStatus,
        site: selectedSite,
        category: selectedCategory,
        search: searchQuery || undefined
      }
    };

    if (format === 'csv') {
      exportToCsv(processedTickets, meta, filename);
    } else {
      exportToExcel(processedTickets, meta, filename);
    }
  };

  const getStatusBadge = (status: StandardStatus) => {
    switch (status) {
      case 'Open':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-900';
      case 'In Progress':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-900';
      case 'Resolved':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900';
      case 'Closed':
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
      {/* Table Toolbar */}
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 dark:border-slate-800 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Issue Records ({processedTickets.length} matching)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Filtered by {opsPeriodHeading}
          </p>
        </div>

        {/* Action Buttons: Export & Reset */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleExport('csv')}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
            title="Export filtered records to CSV"
          >
            <Download className="h-3.5 w-3.5 text-slate-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => handleExport('xlsx')}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
            title="Export formatted Excel report"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Export Excel</span>
          </button>

          {(searchQuery || selectedStatus !== 'All' || selectedSite !== 'All' || selectedCategory !== 'All') && (
            <button
              onClick={clearAllFilters}
              className="flex items-center gap-1 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Clear Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Controls Row */}
      <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search ticket ID or subject..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>

        {/* Status Filter */}
        <select
          value={selectedStatus}
          onChange={(e) => {
            setSelectedStatus(e.target.value);
            setCurrentPage(1);
          }}
          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-800 focus:border-blue-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
        >
          <option value="All">All Statuses</option>
          <option value="Open">Open</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
          <option value="Closed">Closed</option>
        </select>

        {/* Site Filter */}
        <select
          value={selectedSite}
          onChange={(e) => {
            setSelectedSite(e.target.value);
            setCurrentPage(1);
          }}
          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-800 focus:border-blue-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
        >
          <option value="All">All Sites</option>
          {availableSites.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setCurrentPage(1);
          }}
          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-800 focus:border-blue-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
        >
          <option value="All">All Categories</option>
          {availableCategories.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
            <tr>
              <th
                onClick={() => handleSort('id')}
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <div className="flex items-center gap-1.5">
                  <span>Ticket ID</span>
                  <ArrowUpDown className="h-3 w-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4">Subject / Issue</th>
              <th className="py-3 px-4">Site</th>
              <th className="py-3 px-4">Category</th>
              <th
                onClick={() => handleSort('status')}
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <div className="flex items-center gap-1.5">
                  <span>Status</span>
                  <ArrowUpDown className="h-3 w-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4">Owner</th>
              <th
                onClick={() => handleSort('date')}
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <div className="flex items-center gap-1.5">
                  <span>Created Date</span>
                  <ArrowUpDown className="h-3 w-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4">Last Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {paginatedTickets.length > 0 ? (
              paginatedTickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  onClick={() => setActiveDrawerIssue(ticket)}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                    {ticket.id}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-900 dark:text-white max-w-xs truncate">
                    {ticket.subject}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                    {ticket.site || 'Unknown Site'}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                    {ticket.type || 'Uncategorized'}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-block rounded-md px-2 py-0.5 text-[11px] font-semibold ${getStatusBadge(ticket.normalizedStatus)}`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                    {ticket.owner || '—'}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {formatDateDisplay(ticket.opened)}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {formatDateDisplay(ticket.last)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="py-10 text-center text-slate-400">
                  No issue data is available for the selected reporting period or active filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {processedTickets.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div>
            Showing <span className="font-semibold text-slate-900 dark:text-white font-mono">{(currentPage - 1) * pageSize + 1}</span> to{' '}
            <span className="font-semibold text-slate-900 dark:text-white font-mono">
              {Math.min(currentPage * pageSize, processedTickets.length)}
            </span>{' '}
            of <span className="font-semibold text-slate-900 dark:text-white font-mono">{processedTickets.length}</span> records
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-slate-700 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Previous
            </button>

            <span className="font-mono text-slate-700 dark:text-slate-300 px-2">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-slate-700 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Next <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Drill-down Drawer */}
      <OpsIssueDrawer
        issue={activeDrawerIssue}
        onClose={() => setActiveDrawerIssue(null)}
      />
    </div>
  );
};
