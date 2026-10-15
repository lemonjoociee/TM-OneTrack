import { Ticket } from '../types';

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * Extracts the filtering date for an issue based on the required fallback order:
 * 1. Created Date (opened)
 * 2. Reported Date (opened)
 * 3. Incident Date (opened / resOn / escOn)
 * 4. Last Updated Date (last / lastSort)
 * Returns null if missing or invalid.
 */
export function getIssueEffectiveDate(ticket: Partial<Ticket>): Date | null {
  const candidates = [
    ticket.opened,
    ticket.lastSort,
    ticket.last,
    ticket.resOn,
    ticket.escOn,
    ticket.resolvedAt
  ];

  for (const raw of candidates) {
    if (!raw) continue;
    const parsed = parseFlexibleDate(raw);
    if (parsed && !isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  return null;
}

/**
 * Parses flexible dates in formats like:
 * "2026-10-13 13:02"
 * "2026-10-13"
 * "13/10/2026"
 * "13/10/2026 14:22"
 * "13-10-2026"
 */
export function parseFlexibleDate(str: string): Date | null {
  if (!str) return null;
  const clean = str.trim();

  // Format: yyyy-MM-dd or yyyy-MM-dd HH:mm
  const isoMatch = /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:[ T](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/.exec(clean);
  if (isoMatch) {
    const [, y, m, d, hh, mm, ss] = isoMatch;
    return new Date(+y, +m - 1, +d, +(hh || 0), +(mm || 0), +(ss || 0));
  }

  // Format: dd/MM/yyyy or dd-MM-yyyy or dd/MM/yyyy HH:mm
  const dmyMatch = /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})(?:[ T](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/.exec(clean);
  if (dmyMatch) {
    const [, d, m, y, hh, mm, ss] = dmyMatch;
    return new Date(+y, +m - 1, +d, +(hh || 0), +(mm || 0), +(ss || 0));
  }

  // Fallback to standard JS Date parse
  const fallback = new Date(clean);
  return isNaN(fallback.getTime()) ? null : fallback;
}

/**
 * Extracts unique available years dynamically from ticket data,
 * sorted newest to oldest. Includes "Unknown Date" if any record lacks a valid date.
 */
export function getAvailableYears(tickets: Ticket[]): { years: string[]; hasUnknown: boolean } {
  const yearSet = new Set<number>();
  let hasUnknown = false;

  tickets.forEach(ticket => {
    const date = getIssueEffectiveDate(ticket);
    if (date) {
      yearSet.add(date.getFullYear());
    } else {
      hasUnknown = true;
    }
  });

  const sortedYears = Array.from(yearSet)
    .sort((a, b) => b - a)
    .map(String);

  return {
    years: sortedYears,
    hasUnknown
  };
}

/**
 * Extracts available months for a given year in chronological order (January to December).
 */
export function getAvailableMonthsForYear(tickets: Ticket[], selectedYear: string): { months: string[]; hasUnknown: boolean } {
  if (selectedYear === 'All Years' || selectedYear === 'Unknown Date') {
    return { months: [], hasUnknown: false };
  }

  const targetYear = parseInt(selectedYear, 10);
  const monthSet = new Set<number>();
  let hasUnknown = false;

  tickets.forEach(ticket => {
    const date = getIssueEffectiveDate(ticket);
    if (date) {
      if (date.getFullYear() === targetYear) {
        monthSet.add(date.getMonth()); // 0 = Jan, 11 = Dec
      }
    } else {
      hasUnknown = true;
    }
  });

  const sortedMonths = Array.from(monthSet)
    .sort((a, b) => a - b)
    .map(idx => MONTH_NAMES[idx]);

  return {
    months: sortedMonths,
    hasUnknown
  };
}

/**
 * Filters tickets by selected year, month, or "Unknown Date".
 */
export function filterTicketsByPeriod(
  tickets: Ticket[],
  selectedYear: string,
  selectedMonth: string
): Ticket[] {
  if (selectedYear === 'All Years' || selectedYear === 'All Data') {
    return tickets;
  }

  if (selectedYear === 'Unknown Date') {
    return tickets.filter(t => getIssueEffectiveDate(t) === null);
  }

  const targetYear = parseInt(selectedYear, 10);

  return tickets.filter(t => {
    const date = getIssueEffectiveDate(t);
    if (!date) return false;
    if (date.getFullYear() !== targetYear) return false;

    if (selectedMonth === 'All Months') {
      return true;
    }

    const monthIndex = MONTH_NAMES.indexOf(selectedMonth);
    return date.getMonth() === monthIndex;
  });
}

/**
 * Generates an executive title for the selected reporting period.
 */
export function getPeriodHeading(selectedYear: string, selectedMonth: string): string {
  if (selectedYear === 'All Years' || selectedYear === 'All Data') {
    return 'OPS Summary for All Available Data';
  }
  if (selectedYear === 'Unknown Date') {
    return 'OPS Summary for Records with Unknown Dates';
  }
  if (selectedMonth === 'All Months') {
    return `OPS Summary for All Months in ${selectedYear}`;
  }
  return `OPS Summary for ${selectedMonth} ${selectedYear}`;
}

export function formatDateDisplay(dateString?: string): string {
  if (!dateString) return '—';
  const d = parseFlexibleDate(dateString);
  if (!d) return dateString;

  const day = d.getDate().toString().padStart(2, '0');
  const month = MONTH_NAMES[d.getMonth()].slice(0, 3);
  const year = d.getFullYear();
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');

  return `${day} ${month} ${year}, ${hours}:${minutes}`;
}
