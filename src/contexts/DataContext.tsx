import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { Ticket, AssetRecord, WhatsAppQueueItem, WhatsAppChat, SyncStatus } from '../types';
import { sharepointService } from '../services/sharepointService';
import { INITIAL_ASSETS, INITIAL_WAQ, INITIAL_WA_CHATS } from '../data/nocInitialData';
import {
  getAvailableYears,
  getAvailableMonthsForYear,
  filterTicketsByPeriod,
  getPeriodHeading
} from '../utils/dateUtils';
import { evaluateOperationsHealth } from '../config/operationsHealth';
import { calculateSlaCategory } from '../config/slaConfig';

interface DataContextType {
  tickets: Ticket[];
  assets: AssetRecord[];
  whatsappQueue: WhatsAppQueueItem[];
  whatsappChats: WhatsAppChat[];
  syncStatus: SyncStatus;
  refreshData: () => Promise<void>;
  updateTicket: (id: string, updates: Partial<Ticket>) => void;
  // OPS Period Filter State
  selectedYear: string;
  setSelectedYear: (year: string) => void;
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  resetPeriodFilters: () => void;
  compareWithPreviousYear: boolean;
  setCompareWithPreviousYear: (val: boolean) => void;
  // Dynamic Year and Month options
  availableYears: string[];
  hasUnknownDateRecords: boolean;
  availableMonths: string[];
  // Filtered tickets based on active period
  opsFilteredTickets: Ticket[];
  opsPeriodHeading: string;
  // Metrics for active OPS period
  opsMetrics: {
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    closed: number;
    slaWithin: number;
    slaNearBreach: number;
    slaBreached: number;
    slaCompliance: number;
    topSite: string;
    mostCommonCategory: string;
    health: 'HEALTHY' | 'ATTENTION NEEDED' | 'CRITICAL';
    healthReason: string;
    previousYearComparison?: {
      total: number;
      open: number;
      resolved: number;
      closed: number;
      slaCompliance: number;
      totalDeltaPct: number;
      openDeltaPct: number;
      resolvedDeltaPct: number;
      slaDeltaPct: number;
      periodLabel: string;
    };
  };
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tickets, setTickets] = useState<Ticket[]>(() => sharepointService.getCachedTickets());
  const [assets] = useState<AssetRecord[]>(INITIAL_ASSETS);
  const [whatsappQueue] = useState<WhatsAppQueueItem[]>(INITIAL_WAQ);
  const [whatsappChats] = useState<WhatsAppChat[]>(INITIAL_WA_CHATS);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(() => sharepointService.getCachedSyncStatus());

  // Available years calculated dynamically
  const { years: availableYears, hasUnknown: hasUnknownDateRecords } = useMemo(() => {
    return getAvailableYears(tickets);
  }, [tickets]);

  // Default year to latest available year or 'All Years'
  const defaultYear = availableYears.length > 0 ? availableYears[0] : 'All Years';
  const [selectedYear, setSelectedYearState] = useState<string>(defaultYear);

  // Available months calculated dynamically for selected year
  const { months: availableMonths } = useMemo(() => {
    return getAvailableMonthsForYear(tickets, selectedYear);
  }, [tickets, selectedYear]);

  // Default month to latest available month for that year or 'All Months'
  const defaultMonth = useMemo(() => {
    if (selectedYear === 'All Years' || selectedYear === 'All Data' || selectedYear === 'Unknown Date') {
      return 'All Months';
    }
    return availableMonths.length > 0 ? availableMonths[availableMonths.length - 1] : 'All Months';
  }, [selectedYear, availableMonths]);

  const [selectedMonth, setSelectedMonthState] = useState<string>(defaultMonth);
  const [compareWithPreviousYear, setCompareWithPreviousYear] = useState<boolean>(false);

  // When selected year changes, automatically choose the latest valid month or All Months
  const setSelectedYear = useCallback((newYear: string) => {
    setSelectedYearState(newYear);
    if (newYear === 'All Years' || newYear === 'All Data' || newYear === 'Unknown Date') {
      setSelectedMonthState('All Months');
    } else {
      const monthsInfo = getAvailableMonthsForYear(tickets, newYear);
      if (monthsInfo.months.length > 0) {
        // default to latest available month
        setSelectedMonthState(monthsInfo.months[monthsInfo.months.length - 1]);
      } else {
        setSelectedMonthState('All Months');
      }
    }
  }, [tickets]);

  const setSelectedMonth = (newMonth: string) => {
    setSelectedMonthState(newMonth);
  };

  const resetPeriodFilters = useCallback(() => {
    const latestYear = availableYears.length > 0 ? availableYears[0] : 'All Years';
    setSelectedYearState(latestYear);
    const monthsInfo = getAvailableMonthsForYear(tickets, latestYear);
    if (monthsInfo.months.length > 0) {
      setSelectedMonthState(monthsInfo.months[monthsInfo.months.length - 1]);
    } else {
      setSelectedMonthState('All Months');
    }
  }, [availableYears, tickets]);

  // Periodic refresh & initial load
  const refreshData = async () => {
    setSyncStatus(prev => ({ ...prev, isSyncing: true }));
    try {
      const result = await sharepointService.syncTickets();
      setTickets(result.tickets);
      setSyncStatus(result.syncStatus);
    } catch (err: any) {
      console.error('Data sync failed', err);
      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        status: 'error',
        errorMessage: 'Unable to retrieve the latest SharePoint data. The last successfully synchronized data is being displayed.'
      }));
    }
  };

  const updateTicket = (id: string, updates: Partial<Ticket>) => {
    const updated = sharepointService.updateTicket(id, updates);
    if (updated) {
      setTickets(prev => prev.map(t => (t.id === id ? { ...t, ...updated } : t)));
    }
  };

  // Filtered tickets for current OPS period
  const opsFilteredTickets = useMemo(() => {
    return filterTicketsByPeriod(tickets, selectedYear, selectedMonth);
  }, [tickets, selectedYear, selectedMonth]);

  const opsPeriodHeading = useMemo(() => {
    return getPeriodHeading(selectedYear, selectedMonth);
  }, [selectedYear, selectedMonth]);

  // Previous year dataset for comparison if requested
  const previousYearTickets = useMemo(() => {
    if (!compareWithPreviousYear || selectedYear === 'All Years' || selectedYear === 'Unknown Date') {
      return null;
    }
    const currentYearNum = parseInt(selectedYear, 10);
    if (isNaN(currentYearNum)) return null;
    const prevYearStr = String(currentYearNum - 1);
    return filterTicketsByPeriod(tickets, prevYearStr, selectedMonth);
  }, [tickets, compareWithPreviousYear, selectedYear, selectedMonth]);

  // Calculate executive OPS metrics
  const opsMetrics = useMemo(() => {
    const total = opsFilteredTickets.length;
    let open = 0;
    let inProgress = 0;
    let resolved = 0;
    let closed = 0;
    let openP1 = 0;

    let slaWithin = 0;
    let slaNearBreach = 0;
    let slaBreached = 0;

    const siteCounts = new Map<string, number>();
    const categoryCounts = new Map<string, number>();

    opsFilteredTickets.forEach(t => {
      const norm = t.normalizedStatus;
      if (norm === 'Open') open++;
      else if (norm === 'In Progress') inProgress++;
      else if (norm === 'Resolved') resolved++;
      else if (norm === 'Closed') closed++;

      if (norm === 'Open' && (t.pri === 'P1' || t.flag === 'OVERDUE')) {
        openP1++;
      }

      // SLA calculation
      const isDone = norm === 'Resolved' || norm === 'Closed';
      const slaCategory = calculateSlaCategory(t.pri, t.age, isDone);
      if (slaCategory === 'Within SLA') slaWithin++;
      else if (slaCategory === 'Near SLA Breach') slaNearBreach++;
      else if (slaCategory === 'SLA Breached') slaBreached++;

      // Sites tally
      const s = t.site ? t.site.trim() : 'Unknown Site';
      siteCounts.set(s, (siteCounts.get(s) || 0) + 1);

      // Categories tally
      const cat = t.type ? t.type.trim() : 'Uncategorized';
      categoryCounts.set(cat, (categoryCounts.get(cat) || 0) + 1);
    });

    const slaCompliance = total > 0 ? ((slaWithin + slaNearBreach) / total) * 100 : 100;

    // Top site
    let topSite = 'None';
    let maxSiteCount = 0;
    siteCounts.forEach((count, s) => {
      if (count > maxSiteCount) {
        maxSiteCount = count;
        topSite = s;
      }
    });

    // Top category
    let mostCommonCategory = 'None';
    let maxCategoryCount = 0;
    categoryCounts.forEach((count, c) => {
      if (count > maxCategoryCount) {
        maxCategoryCount = count;
        mostCommonCategory = c;
      }
    });

    // Operations Health
    const healthEval = evaluateOperationsHealth({
      totalIssues: total,
      openIssues: open,
      resolvedIssues: resolved,
      slaComplianceRate: slaCompliance,
      openP1Count: openP1
    });

    // Previous year comparison metrics
    let previousYearComparison;
    if (previousYearTickets) {
      const prevTotal = previousYearTickets.length;
      let prevOpen = 0;
      let prevResolved = 0;
      let prevClosed = 0;
      let prevSlaWithin = 0;

      previousYearTickets.forEach(pt => {
        if (pt.normalizedStatus === 'Open') prevOpen++;
        if (pt.normalizedStatus === 'Resolved') prevResolved++;
        if (pt.normalizedStatus === 'Closed') prevClosed++;
        const isDone = pt.normalizedStatus === 'Resolved' || pt.normalizedStatus === 'Closed';
        const sla = calculateSlaCategory(pt.pri, pt.age, isDone);
        if (sla === 'Within SLA' || sla === 'Near SLA Breach') prevSlaWithin++;
      });

      const prevSlaCompliance = prevTotal > 0 ? (prevSlaWithin / prevTotal) * 100 : 100;

      const calcPct = (curr: number, prev: number) => {
        if (prev === 0) return curr === 0 ? 0 : 100;
        return ((curr - prev) / prev) * 100;
      };

      previousYearComparison = {
        total: prevTotal,
        open: prevOpen,
        resolved: prevResolved,
        closed: prevClosed,
        slaCompliance: prevSlaCompliance,
        totalDeltaPct: calcPct(total, prevTotal),
        openDeltaPct: calcPct(open, prevOpen),
        resolvedDeltaPct: calcPct(resolved, prevResolved),
        slaDeltaPct: slaCompliance - prevSlaCompliance,
        periodLabel: `${selectedMonth} ${parseInt(selectedYear, 10) - 1}`
      };
    }

    return {
      total,
      open,
      inProgress,
      resolved,
      closed,
      slaWithin,
      slaNearBreach,
      slaBreached,
      slaCompliance,
      topSite,
      mostCommonCategory,
      health: healthEval.status,
      healthReason: healthEval.reason,
      previousYearComparison
    };
  }, [opsFilteredTickets, previousYearTickets, selectedYear, selectedMonth]);

  return (
    <DataContext.Provider
      value={{
        tickets,
        assets,
        whatsappQueue,
        whatsappChats,
        syncStatus,
        refreshData,
        updateTicket,
        selectedYear,
        setSelectedYear,
        selectedMonth,
        setSelectedMonth,
        resetPeriodFilters,
        compareWithPreviousYear,
        setCompareWithPreviousYear,
        availableYears,
        hasUnknownDateRecords,
        availableMonths,
        opsFilteredTickets,
        opsPeriodHeading,
        opsMetrics
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
