import React, { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { AssetRecord } from '../../types';
import { TicketDrawer } from '../../components/noc/TicketDrawer';
import { Search, Laptop, Filter, Download } from 'lucide-react';
import { exportToCsv } from '../../utils/exportUtils';

export const NocAssetsPage: React.FC = () => {
  const { assets, tickets } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);

  const filteredAssets = useMemo(() => {
    if (!searchQuery.trim()) return assets;
    const q = searchQuery.toLowerCase();
    return assets.filter(a => {
      return Object.values(a).some(val =>
        String(val || '').toLowerCase().includes(q)
      );
    });
  }, [assets, searchQuery]);

  const activeTicket = useMemo(() => {
    if (!activeTicketId) return null;
    return tickets.find(t => t.id === activeTicketId) || null;
  }, [tickets, activeTicketId]);

  const handleExportCsv = () => {
    const meta = {
      title: 'NOC Asset Log Inventory Report',
      reportingPeriod: 'All Logged Assets',
      exportDateTime: new Date().toLocaleString(),
      activeFilters: { search: searchQuery || 'None' }
    };

    // Transform asset records to mock tickets for standard CSV utility
    const mockTickets: any[] = filteredAssets.map(a => ({
      id: a.TicketID || 'AST-LOG',
      subject: `${a.Action} - ${a.Name || a.XID || 'Agent'} (${a.Site})`,
      site: a.Site,
      type: 'Asset',
      status: a.Action,
      pri: 'Standard',
      reporter: a.Name,
      owner: a.XID,
      opened: a.Date,
      last: a.Date,
      flag: a.Reason,
      resolution: `Laptop: ${a.LaptopSN || '—'} | EUC: ${a.EUC || '—'} | Headset: ${a.HeadsetSN || '—'} | Dongle: ${a.DongleSN || '—'} | SIM: ${a.SimNo || '—'}`
    }));

    exportToCsv(mockTickets, meta, `NOC-Asset-Log-${new Date().toISOString().slice(0, 10)}.csv`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Asset Tracking & Handover Log
            </h1>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              {assets.length} items
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Hardware handover logs, serial numbers, EUC tagging, SIM/dongle tracking, and replacement audit trail
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors self-start sm:self-auto"
        >
          <Download className="h-3.5 w-3.5 text-slate-400" />
          <span>Export Asset Log</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search name, staff ID, serial number, site, ticket ID..."
          className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-hidden dark:border-slate-800 dark:bg-slate-900 dark:text-white"
        />
      </div>

      {/* Assets Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
            <tr>
              <th className="py-3 px-3.5">Date</th>
              <th className="py-3 px-3.5">Action</th>
              <th className="py-3 px-3.5">Site</th>
              <th className="py-3 px-3.5">Name</th>
              <th className="py-3 px-3.5">Staff ID</th>
              <th className="py-3 px-3.5">Laptop S/N</th>
              <th className="py-3 px-3.5">EUC Tag</th>
              <th className="py-3 px-3.5">Headset S/N</th>
              <th className="py-3 px-3.5">Dongle S/N</th>
              <th className="py-3 px-3.5">SIM Details</th>
              <th className="py-3 px-3.5">Fault / Reason</th>
              <th className="py-3 px-3.5">Linked Ticket</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
            {filteredAssets.length > 0 ? (
              filteredAssets.map((asset, index) => (
                <tr
                  key={index}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td className="py-3 px-3.5 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {asset.Date}
                  </td>
                  <td className="py-3 px-3.5 font-sans font-medium text-slate-900 dark:text-white whitespace-nowrap">
                    {asset.Action}
                  </td>
                  <td className="py-3 px-3.5 font-sans text-slate-700 dark:text-slate-300">
                    {asset.Site || '—'}
                  </td>
                  <td className="py-3 px-3.5 font-sans text-slate-900 dark:text-white font-medium max-w-[130px] truncate">
                    {asset.Name || '—'}
                  </td>
                  <td className="py-3 px-3.5 text-blue-600 dark:text-blue-400 font-bold">
                    {asset.XID || '—'}
                  </td>
                  <td className="py-3 px-3.5 text-slate-700 dark:text-slate-300">
                    {asset.LaptopSN || '—'}
                  </td>
                  <td className="py-3 px-3.5 text-slate-600 dark:text-slate-400">
                    {asset.EUC || '—'}
                  </td>
                  <td className="py-3 px-3.5 text-slate-600 dark:text-slate-400 max-w-[120px] truncate">
                    {asset.HeadsetSN || '—'}
                  </td>
                  <td className="py-3 px-3.5 text-slate-600 dark:text-slate-400">
                    {asset.DongleSN || '—'}
                  </td>
                  <td className="py-3 px-3.5 text-slate-600 dark:text-slate-400 max-w-[140px] truncate">
                    {[asset.SimNo, asset.SimSerial].filter(Boolean).join(' / ') || '—'}
                  </td>
                  <td className="py-3 px-3.5 font-sans text-slate-500 dark:text-slate-400 max-w-xs truncate">
                    {asset.Reason || asset.Source || '—'}
                  </td>
                  <td className="py-3 px-3.5">
                    {asset.TicketID ? (
                      <button
                        onClick={() => setActiveTicketId(asset.TicketID)}
                        className="text-blue-600 dark:text-blue-400 hover:underline font-bold"
                      >
                        {asset.TicketID}
                      </button>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={12} className="py-10 text-center font-sans text-slate-400">
                  No asset records match your search criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Ticket Drawer */}
      <TicketDrawer
        ticket={activeTicket}
        onClose={() => setActiveTicketId(null)}
      />
    </div>
  );
};
