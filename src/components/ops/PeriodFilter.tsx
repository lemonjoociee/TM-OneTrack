import React from 'react';
import { useData } from '../../contexts/DataContext';
import { RotateCcw, Calendar, CheckSquare, Square } from 'lucide-react';

export const PeriodFilter: React.FC = () => {
  const {
    selectedYear,
    setSelectedYear,
    selectedMonth,
    setSelectedMonth,
    resetPeriodFilters,
    compareWithPreviousYear,
    setCompareWithPreviousYear,
    availableYears,
    hasUnknownDateRecords,
    availableMonths
  } = useData();

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Reporting Period Filter Bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mr-1">
            <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span>Reporting Period:</span>
          </div>

          {/* Year Dropdown */}
          <div className="relative">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 pr-8 text-xs font-semibold text-slate-800 focus:border-blue-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
            >
              {availableYears.map(year => (
                <option key={year} value={year}>
                  Year: {year}
                </option>
              ))}
              <option value="All Years">All Years</option>
              {hasUnknownDateRecords && (
                <option value="Unknown Date">Unknown Date</option>
              )}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
              ▼
            </div>
          </div>

          {/* Month Dropdown (Visible unless All Years or Unknown Date is selected) */}
          {selectedYear !== 'All Years' && selectedYear !== 'Unknown Date' && (
            <div className="relative">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 pr-8 text-xs font-semibold text-slate-800 focus:border-blue-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
              >
                <option value="All Months">All Months</option>
                {availableMonths.map(month => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                ▼
              </div>
            </div>
          )}

          {/* Reset Filters Button */}
          <button
            onClick={resetPeriodFilters}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
            title="Reset period to latest available data"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Filters</span>
          </button>
        </div>

        {/* Compare with Previous Year Toggle */}
        {selectedYear !== 'All Years' && selectedYear !== 'Unknown Date' && (
          <button
            onClick={() => setCompareWithPreviousYear(!compareWithPreviousYear)}
            className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium border transition-colors ${
              compareWithPreviousYear
                ? 'border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-semibold'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            {compareWithPreviousYear ? (
              <CheckSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            ) : (
              <Square className="h-4 w-4 text-slate-400" />
            )}
            <span>Compare with Previous Year</span>
          </button>
        )}
      </div>
    </div>
  );
};
