import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line
} from 'recharts';
import { useData } from '../../contexts/DataContext';
import { getIssueEffectiveDate, MONTH_NAMES } from '../../utils/dateUtils';
import { StandardStatus } from '../../types';

interface OpsChartsProps {
  onStatusSelect?: (status: StandardStatus | 'All') => void;
  selectedStatus?: string;
}

export const OpsCharts: React.FC<OpsChartsProps> = ({ onStatusSelect, selectedStatus }) => {
  const { opsFilteredTickets, selectedYear, selectedMonth } = useData();

  // 1. Chart 1: Issues by Status (Donut)
  const statusData = React.useMemo(() => {
    let open = 0;
    let inProgress = 0;
    let resolved = 0;
    let closed = 0;

    opsFilteredTickets.forEach(t => {
      const s = t.normalizedStatus;
      if (s === 'Open') open++;
      else if (s === 'In Progress') inProgress++;
      else if (s === 'Resolved') resolved++;
      else if (s === 'Closed') closed++;
    });

    return [
      { name: 'Open', value: open, color: '#DC2626' }, // Red
      { name: 'In Progress', value: inProgress, color: '#D97706' }, // Amber
      { name: 'Resolved', value: resolved, color: '#16A34A' }, // Green
      { name: 'Closed', value: closed, color: '#64748B' } // Slate Grey
    ].filter(item => item.value > 0);
  }, [opsFilteredTickets]);

  // 2. Chart 2: Issue Trend
  const trendData = React.useMemo(() => {
    if (selectedYear === 'All Years' || selectedYear === 'All Data') {
      // Group by Year
      const yearMap = new Map<number, number>();
      opsFilteredTickets.forEach(t => {
        const d = getIssueEffectiveDate(t);
        if (d) {
          const y = d.getFullYear();
          yearMap.set(y, (yearMap.get(y) || 0) + 1);
        }
      });
      const sortedYears = Array.from(yearMap.keys()).sort((a, b) => a - b);
      return sortedYears.map(y => ({
        label: String(y),
        count: yearMap.get(y) || 0
      }));
    } else if (selectedMonth === 'All Months') {
      // Group by Jan - Dec for the selected year
      const targetYear = parseInt(selectedYear, 10);
      const monthCounts = new Array(12).fill(0);
      opsFilteredTickets.forEach(t => {
        const d = getIssueEffectiveDate(t);
        if (d && d.getFullYear() === targetYear) {
          monthCounts[d.getMonth()]++;
        }
      });
      return MONTH_NAMES.map((name, idx) => ({
        label: name.slice(0, 3),
        count: monthCounts[idx]
      }));
    } else {
      // Group by day of the selected month
      const targetYear = parseInt(selectedYear, 10);
      const targetMonthIdx = MONTH_NAMES.indexOf(selectedMonth);
      const dayMap = new Map<number, number>();

      opsFilteredTickets.forEach(t => {
        const d = getIssueEffectiveDate(t);
        if (d && d.getFullYear() === targetYear && d.getMonth() === targetMonthIdx) {
          const day = d.getDate();
          dayMap.set(day, (dayMap.get(day) || 0) + 1);
        }
      });

      // Get days count in this month
      const daysInMonth = new Date(targetYear, targetMonthIdx + 1, 0).getDate();
      const result = [];
      for (let day = 1; day <= daysInMonth; day++) {
        // Only include if day has data or keep intervals
        result.push({
          label: `Day ${day}`,
          count: dayMap.get(day) || 0
        });
      }
      return result;
    }
  }, [opsFilteredTickets, selectedYear, selectedMonth]);

  // 3. Chart 3: Issues by Site (Bar)
  const siteData = React.useMemo(() => {
    const siteMap = new Map<string, number>();
    opsFilteredTickets.forEach(t => {
      const siteName = t.site ? t.site.trim() : 'Unknown Site';
      siteMap.set(siteName, (siteMap.get(siteName) || 0) + 1);
    });

    const entries = Array.from(siteMap.entries()).sort((a, b) => b[1] - a[1]);
    return entries.map(([site, count]) => ({
      site,
      count
    }));
  }, [opsFilteredTickets]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
      {/* Chart 1: Issues by Status */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            1. Issues by Status
          </h3>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">
            Click segment to filter table
          </span>
        </div>

        <div className="h-64 w-full mt-3">
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  onClick={(entry) => {
                    if (onStatusSelect && entry) {
                      onStatusSelect(entry.name as StandardStatus);
                    }
                  }}
                  cursor="pointer"
                >
                  {statusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      stroke={selectedStatus === entry.name ? '#000000' : 'none'}
                      strokeWidth={selectedStatus === entry.name ? 2 : 0}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`${val} issues`, 'Count']}
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    color: '#F8FAFC',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '12px'
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-slate-400">
              No data for this period
            </div>
          )}
        </div>
      </div>

      {/* Chart 2: Issue Trend */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            2. Issue Trend
          </h3>
          <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
            {selectedMonth !== 'All Months' ? 'Daily Pattern' : 'Monthly Trend'}
          </span>
        </div>

        <div className="h-64 w-full mt-3">
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 15, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.6} />
                <XAxis
                  dataKey="label"
                  stroke="#94A3B8"
                  fontSize={10}
                  tickLine={false}
                  interval={trendData.length > 15 ? 4 : 'preserveEnd'}
                />
                <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} allowDecimals={false} />
                <Tooltip
                  formatter={(val: any) => [`${val} issues`, 'Volume']}
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    color: '#F8FAFC',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '12px'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#2563EB"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#2563EB' }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-slate-400">
              No trend data available
            </div>
          )}
        </div>
      </div>

      {/* Chart 3: Issues by Site */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            3. Issues by Site
          </h3>
          <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
            {siteData.length} Locations
          </span>
        </div>

        <div className="h-64 w-full mt-3">
          {siteData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={siteData} margin={{ top: 15, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.6} />
                <XAxis dataKey="site" stroke="#94A3B8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} allowDecimals={false} />
                <Tooltip
                  formatter={(val: any) => [`${val} issues`, 'Total']}
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    color: '#F8FAFC',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="count" fill="#0284C7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-slate-400">
              No site data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
