import { Ticket } from '../types';

export interface ExportMetadata {
  title: string;
  reportingPeriod: string;
  exportDateTime: string;
  activeFilters: {
    status?: string;
    site?: string;
    category?: string;
    search?: string;
  };
}

/**
 * Normalizes string for CSV cell (quotes and escapes internal quotes).
 */
function escapeCsvCell(val: unknown): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Generates an appropriate filename based on the active filters and period.
 */
export function generateReportFilename(
  statusFilter: string | undefined,
  selectedYear: string,
  selectedMonth: string,
  extension: 'csv' | 'xlsx'
): string {
  const sanitize = (s: string) => s.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '');

  let prefix = 'OPS-Issue-Report';
  if (statusFilter && statusFilter !== 'All') {
    prefix = `OPS-${sanitize(statusFilter)}-Issues`;
  }

  let periodStr = 'All-Data';
  if (selectedYear !== 'All Years' && selectedYear !== 'All Data' && selectedYear !== 'Unknown Date') {
    if (selectedMonth && selectedMonth !== 'All Months') {
      periodStr = `${sanitize(selectedMonth)}-${selectedYear}`;
    } else {
      periodStr = `All-Months-${selectedYear}`;
    }
  } else if (selectedYear === 'Unknown Date') {
    periodStr = 'Unknown-Date';
  }

  return `${prefix}-${periodStr}.${extension}`;
}

/**
 * Exports issue records to a well-formatted CSV file with metadata header.
 */
export function exportToCsv(
  tickets: Ticket[],
  meta: ExportMetadata,
  filename: string
): void {
  const lines: string[] = [];

  // Metadata headers
  lines.push(`"Report Title",${escapeCsvCell(meta.title)}`);
  lines.push(`"Reporting Period",${escapeCsvCell(meta.reportingPeriod)}`);
  lines.push(`"Export Timestamp",${escapeCsvCell(meta.exportDateTime)}`);
  lines.push(`"Total Records",${escapeCsvCell(tickets.length)}`);
  lines.push(
    `"Active Filters",${escapeCsvCell(
      `Status: ${meta.activeFilters.status || 'All'} | Site: ${meta.activeFilters.site || 'All'} | Category: ${meta.activeFilters.category || 'All'} | Search: ${meta.activeFilters.search || 'None'}`
    )}`
  );
  lines.push('""'); // Empty line before table

  // Table Columns
  const headers = [
    'Ticket ID',
    'Subject / Issue',
    'Site',
    'Category',
    'Status',
    'Priority',
    'Reported By',
    'Contact / Owner',
    'Created Date',
    'Last Update',
    'SLA Flag',
    'Resolution Notes'
  ];
  lines.push(headers.map(escapeCsvCell).join(','));

  // Data rows
  tickets.forEach(t => {
    lines.push([
      escapeCsvCell(t.id),
      escapeCsvCell(t.subject),
      escapeCsvCell(t.site || 'Unknown Site'),
      escapeCsvCell(t.type || 'Uncategorized'),
      escapeCsvCell(t.status || 'Open'),
      escapeCsvCell(t.pri || 'Normal'),
      escapeCsvCell(t.reporter || '—'),
      escapeCsvCell(t.owner || '—'),
      escapeCsvCell(t.opened || '—'),
      escapeCsvCell(t.last || '—'),
      escapeCsvCell(t.flag || '—'),
      escapeCsvCell(t.resolution || t.aiSum || '—')
    ].join(','));
  });

  const blob = new Blob([lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
  triggerBrowserDownload(blob, filename);
}

/**
 * Exports issue records to an Excel-compatible XML spreadsheet with formatted headers and styling.
 */
export function exportToExcel(
  tickets: Ticket[],
  meta: ExportMetadata,
  filename: string
): void {
  const escapeXml = (unsafe: unknown) => {
    if (unsafe === null || unsafe === undefined) return '';
    return String(unsafe)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };

  const activeFiltersStr = `Status: ${meta.activeFilters.status || 'All'} | Site: ${meta.activeFilters.site || 'All'} | Category: ${meta.activeFilters.category || 'All'} | Search: ${meta.activeFilters.search || 'None'}`;

  let xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Borders/>
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Color="#000000"/>
  </Style>
  <Style ss:ID="TitleStyle">
   <Font ss:FontName="Calibri" ss:Size="16" ss:Bold="1" ss:Color="#1E3A8A"/>
  </Style>
  <Style ss:ID="MetaLabel">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#475569"/>
  </Style>
  <Style ss:ID="HeaderStyle">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#1E293B" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="DataCell">
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
  </Style>
 </Styles>
 <Worksheet ss:Name="OPS Issue Report">
  <Table>
   <Column ss:Width="90"/>
   <Column ss:Width="280"/>
   <Column ss:Width="80"/>
   <Column ss:Width="90"/>
   <Column ss:Width="90"/>
   <Column ss:Width="60"/>
   <Column ss:Width="160"/>
   <Column ss:Width="120"/>
   <Column ss:Width="120"/>
   <Column ss:Width="120"/>
   <Column ss:Width="80"/>
   <Column ss:Width="300"/>

   <Row ss:Height="26">
    <Cell ss:MergeAcross="11" ss:StyleID="TitleStyle"><Data ss:Type="String">${escapeXml(meta.title)}</Data></Cell>
   </Row>
   <Row>
    <Cell ss:StyleID="MetaLabel"><Data ss:Type="String">Reporting Period:</Data></Cell>
    <Cell ss:MergeAcross="10"><Data ss:Type="String">${escapeXml(meta.reportingPeriod)}</Data></Cell>
   </Row>
   <Row>
    <Cell ss:StyleID="MetaLabel"><Data ss:Type="String">Export Timestamp:</Data></Cell>
    <Cell ss:MergeAcross="10"><Data ss:Type="String">${escapeXml(meta.exportDateTime)}</Data></Cell>
   </Row>
   <Row>
    <Cell ss:StyleID="MetaLabel"><Data ss:Type="String">Active Filters:</Data></Cell>
    <Cell ss:MergeAcross="10"><Data ss:Type="String">${escapeXml(activeFiltersStr)}</Data></Cell>
   </Row>
   <Row>
    <Cell ss:StyleID="MetaLabel"><Data ss:Type="String">Record Count:</Data></Cell>
    <Cell ss:MergeAcross="10"><Data ss:Type="Number">${tickets.length}</Data></Cell>
   </Row>
   <Row></Row>

   <Row ss:Height="22">
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Ticket ID</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Issue / Subject</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Site</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Category</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Status</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Priority</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Reported By</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Owner / Contact</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Created Date</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Last Update</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">SLA Flag</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Resolution</Data></Cell>
   </Row>
`;

  tickets.forEach(t => {
    xml += `   <Row ss:Height="19">
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">${escapeXml(t.id)}</Data></Cell>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">${escapeXml(t.subject)}</Data></Cell>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">${escapeXml(t.site || 'Unknown Site')}</Data></Cell>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">${escapeXml(t.type || 'Uncategorized')}</Data></Cell>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">${escapeXml(t.status || 'Open')}</Data></Cell>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">${escapeXml(t.pri || 'Normal')}</Data></Cell>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">${escapeXml(t.reporter || '—')}</Data></Cell>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">${escapeXml(t.owner || '—')}</Data></Cell>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">${escapeXml(t.opened || '—')}</Data></Cell>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">${escapeXml(t.last || '—')}</Data></Cell>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">${escapeXml(t.flag || '—')}</Data></Cell>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">${escapeXml(t.resolution || t.aiSum || '—')}</Data></Cell>
   </Row>\n`;
  });

  xml += `  </Table>
 </Worksheet>
</Workbook>`;

  const blob = new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  triggerBrowserDownload(blob, filename);
}

function triggerBrowserDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
