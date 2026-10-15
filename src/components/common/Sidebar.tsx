import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import {
  LayoutDashboard,
  Bell,
  MessageSquareReply,
  TicketCheck,
  Laptop,
  MessageCircle,
  BookOpen,
  BarChart3,
  Users,
  MailPlus,
  Settings,
  ShieldCheck,
  TrendingUp,
  FileSpreadsheet,
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const { tickets, whatsappQueue } = useData();

  if (!currentUser) return null;

  // Calculate live badges
  const toReplyCount = tickets.filter(
    t => t.auto === 'NOC to respond' || t.replyNeeded === 'now' || t.flag === 'OVERDUE'
  ).length;

  const openTicketsCount = tickets.filter(
    t => t.normalizedStatus === 'Open' || t.normalizedStatus === 'In Progress'
  ).length;

  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
      isActive
        ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-semibold shadow-xs'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200'
    }`;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 dark:border-slate-800 dark:bg-slate-900 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-sm shadow-xs">
              TM
            </div>
            <div>
              <div className="text-sm font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
                NOC & OPS
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Operations Portal
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 lg:hidden dark:hover:bg-slate-800"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Content */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {/* 1. ADMIN SECTION (Visible to Admin) */}
          {currentUser.role === 'Admin' && (
            <div>
              <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Administration
              </div>
              <nav className="space-y-1">
                <NavLink to="/admin" end className={navItemClass} onClick={onClose}>
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    <span>Admin Overview</span>
                  </div>
                </NavLink>

                <NavLink to="/admin/users" className={navItemClass} onClick={onClose}>
                  <div className="flex items-center gap-2.5">
                    <Users className="h-4 w-4" />
                    <span>User Management</span>
                  </div>
                </NavLink>

                <NavLink to="/admin/invitations" className={navItemClass} onClick={onClose}>
                  <div className="flex items-center gap-2.5">
                    <MailPlus className="h-4 w-4" />
                    <span>Invitations</span>
                  </div>
                </NavLink>

                <NavLink to="/admin/settings" className={navItemClass} onClick={onClose}>
                  <div className="flex items-center gap-2.5">
                    <Settings className="h-4 w-4" />
                    <span>System Settings</span>
                  </div>
                </NavLink>
              </nav>
            </div>
          )}

          {/* 2. NOC SECTION (Visible to NOC and Admin) */}
          {(currentUser.role === 'NOC' || currentUser.role === 'Admin') && (
            <div>
              <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center justify-between">
                <span>NOC Operations</span>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-mono">Live</span>
              </div>
              <nav className="space-y-1">
                <NavLink to="/noc" end className={navItemClass} onClick={onClose}>
                  <div className="flex items-center gap-2.5">
                    <LayoutDashboard className="h-4 w-4" />
                    <span>What's New</span>
                  </div>
                </NavLink>

                <NavLink to="/noc/reply" className={navItemClass} onClick={onClose}>
                  <div className="flex items-center gap-2.5">
                    <MessageSquareReply className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                    <span>To Reply</span>
                  </div>
                  {toReplyCount > 0 && (
                    <span className="rounded-full bg-rose-600 px-1.5 py-0.5 text-[10px] font-bold text-white font-mono">
                      {toReplyCount}
                    </span>
                  )}
                </NavLink>

                <NavLink to="/noc/tickets" className={navItemClass} onClick={onClose}>
                  <div className="flex items-center gap-2.5">
                    <TicketCheck className="h-4 w-4" />
                    <span>Tickets Log</span>
                  </div>
                  {openTicketsCount > 0 && (
                    <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[11px] font-medium text-slate-600 dark:text-slate-300 font-mono">
                      {openTicketsCount}
                    </span>
                  )}
                </NavLink>

                <NavLink to="/noc/assets" className={navItemClass} onClick={onClose}>
                  <div className="flex items-center gap-2.5">
                    <Laptop className="h-4 w-4" />
                    <span>Asset Tracking</span>
                  </div>
                </NavLink>

                <NavLink to="/noc/whatsapp" className={navItemClass} onClick={onClose}>
                  <div className="flex items-center gap-2.5">
                    <MessageCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span>WhatsApp</span>
                  </div>
                </NavLink>

                <NavLink to="/noc/guide" className={navItemClass} onClick={onClose}>
                  <div className="flex items-center gap-2.5">
                    <BookOpen className="h-4 w-4" />
                    <span>How-To Guide</span>
                  </div>
                </NavLink>

                <NavLink to="/noc/reports" className={navItemClass} onClick={onClose}>
                  <div className="flex items-center gap-2.5">
                    <BarChart3 className="h-4 w-4" />
                    <span>NOC Reports</span>
                  </div>
                </NavLink>
              </nav>
            </div>
          )}

          {/* 3. OPS SECTION (Visible to OPS and Admin) */}
          {(currentUser.role === 'OPS' || currentUser.role === 'Admin') && (
            <div>
              <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                OPS Executive
              </div>
              <nav className="space-y-1">
                <NavLink to="/ops" end className={navItemClass} onClick={onClose}>
                  <div className="flex items-center gap-2.5">
                    <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span>OPS Overview</span>
                  </div>
                </NavLink>

                <NavLink to="/ops/issues" className={navItemClass} onClick={onClose}>
                  <div className="flex items-center gap-2.5">
                    <FileSpreadsheet className="h-4 w-4" />
                    <span>Issues Table</span>
                  </div>
                </NavLink>

                <NavLink to="/ops/reports" className={navItemClass} onClick={onClose}>
                  <div className="flex items-center gap-2.5">
                    <BarChart3 className="h-4 w-4" />
                    <span>Executive Reports</span>
                  </div>
                </NavLink>
              </nav>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="border-t border-slate-200 p-3 text-[11px] text-slate-400 dark:border-slate-800 dark:text-slate-500 text-center">
          <div>TM UCC / Scicom Operations</div>
          <div className="font-mono text-[10px] mt-0.5">v4.2 Production</div>
        </div>
      </aside>
    </>
  );
};
