export type UserRole = 'Admin' | 'NOC' | 'OPS';

export type UserStatus = 'Active' | 'Deactivated';

export type InvitationStatus = 'Pending' | 'Accepted' | 'Expired' | 'Cancelled';

export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  role: UserRole;
  status: UserStatus;
  invitationStatus: InvitationStatus;
  createdDate: string;
  lastLogin?: string;
  avatarUrl?: string;
  department?: string;
}

export interface Invitation {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  token: string;
  status: InvitationStatus;
  invitedBy: string;
  invitedDate: string;
  expiresDate: string;
}

export type StandardStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed';

export type TicketType = 'Nubitel' | 'Asset' | 'Access' | 'Network' | 'Other';

export interface TicketThreadMessage {
  timestamp: string;
  sender: string;
  role: 'Reporter' | 'NOC' | 'Scicom management' | 'RTA' | 'Nubitel' | string;
  content: string;
}

export interface Ticket {
  id: string;
  ticketId: string;
  type: TicketType;
  status: string; // Original status e.g. "New", "In Progress", "Resolved", "Logged (FYI)", "Monitoring", "Closed"
  normalizedStatus: StandardStatus;
  owner: string;
  area: string;
  subject: string;
  description?: string;
  other?: string;
  pri?: string; // Priority: P1, P2, P3, P4 or empty
  site: string; // e.g. "KL", "Kuching", "Penang", "Marang", "Melaka"
  reporter: string;
  fwd?: string;
  impact?: string;
  refs?: string;
  opened: string; // yyyy-MM-dd HH:mm
  last: string;
  lastFrom?: string;
  msgs: number;
  auto?: string; // "NOC to respond", "Waiting on reporter", "Likely resolved", "Internal (NOC only)", etc.
  age: number; // in hours
  flag?: string; // "OVERDUE", "NO UPDATE", "RCA DUE", "STALE", "MONITOR ENDED", "REOPENED"
  nudges: number;
  dup?: string;
  expected?: string;
  action?: string;
  resolution?: string;
  root?: string;
  resolvedAt?: string;
  msg?: string;
  stage?: string;
  nubTicket?: string;
  monitorUntil?: string;
  portal?: string;
  portalUrl?: string;
  esc?: string; // "Yes" / "No"
  chan?: string;
  handled?: string;
  cause?: string;
  rca?: string; // "Sent", "Requested", etc.
  sugReply?: string;
  callQ?: string;
  replyNeeded?: string;
  waitingOn?: string;
  ai?: string;
  aiSum?: string;
  aiNext?: string;
  firstReply?: string;
  escOn?: string;
  resOn?: string;
  lastSort?: string;
  thread?: [string, string, string, string][]; // [timestamp, name, role, text]
  wa?: any[] | null;
  w15?: string; // "Yes" / "No" / "" (replied within 15 mins)
  firstMins?: string | number;
  source?: 'Ollama AI (Outlook/WA)' | 'Manual' | 'Email' | 'Portal';
}

export interface AssetRecord {
  Date: string;
  TicketID: string;
  Action: string;
  Site: string;
  Name: string;
  XID: string;
  LaptopSN: string;
  EUC: string;
  HeadsetSN: string;
  DongleSN: string;
  SimSerial: string;
  SimNo: string;
  Brand: string;
  Reason: string;
  Source: string;
}

export interface WhatsAppQueueItem {
  chat: string;
  from: string;
  at: string;
  summary: string;
  status: 'fyi' | 'update' | 'needs_reply' | 'chased';
  ticket: string;
  suggested_reply: string;
  call_questions: string[];
}

export interface WhatsAppChat {
  name: string;
  msgs: [string, string, string][]; // [time, sender, text]
}

export interface SyncStatus {
  lastSyncTime: string | null;
  isSyncing: boolean;
  status: 'success' | 'syncing' | 'error' | 'cached';
  errorMessage?: string;
  itemCount: number;
  dataSource: 'Ollama Local AI (Live)' | 'Local Cache' | 'Demo / Sample Mode';
  ollamaModel?: string;
  outlookScannedCount?: number;
  whatsappScannedCount?: number;
}

export interface OllamaConfig {
  endpoint: string; // e.g. http://localhost:11434
  model: string; // e.g. llama3, mistral, qwen2.5
  outlookFolder: string;
  whatsappFolder: string;
  autoScanInterval: number; // minutes
}

export interface OpsSummaryData {
  totalIssues: number;
  openIssues: number;
  inProgressIssues: number;
  resolvedIssues: number;
  closedIssues: number;
  slaWithinCount: number;
  slaNearBreachCount: number;
  slaBreachedCount: number;
  slaComplianceRate: number;
  topSite: string;
  mostCommonCategory: string;
  health: 'HEALTHY' | 'ATTENTION NEEDED' | 'CRITICAL';
  healthReason: string;
  periodLabel: string;
  previousYearData?: {
    totalIssues: number;
    openIssues: number;
    resolvedIssues: number;
    closedIssues: number;
    slaComplianceRate: number;
    periodLabel: string;
  };
}
