import React, { useState } from 'react';
import { BookOpen, Copy, Check, Terminal, PhoneCall, ShieldAlert, Cpu } from 'lucide-react';

export const NocGuidePage: React.FC = () => {
  const [copiedTemplate, setCopiedTemplate] = useState(false);

  const portalTicketTemplate = `Hi Team,

Issue: (what is wrong, in one or two sentences)
Affected: (agent names / IDs, how many agents, which team)
IDs: (chat / interaction / session / call IDs)
Time observed: (date and exact time)
Still happening: (yes / no, since when)
Impact: (SLA, customers waiting, agents unable to work)
What the agent sees: (error message, steps)
Attached: (screenshots, export, HAR / console log)

Kindly investigate and advise the root cause, the fix and the timeline.`;

  const copyTemplate = () => {
    navigator.clipboard.writeText(portalTicketTemplate);
    setCopiedTemplate(true);
    setTimeout(() => setCopiedTemplate(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="border-b border-slate-200 pb-5 dark:border-slate-800">
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-blue-600" />
          <span>NOC Operational SOP & Troubleshooting Guide</span>
        </h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Standard operating procedures, call diagnostic scripts, log capture protocols, and Nubitel escalation guidelines
        </p>
      </div>

      {/* 1. Start of Shift SOP */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-950 dark:text-blue-300">
            1
          </div>
          <span>Start of Shift Standard Operating Procedure</span>
        </h2>
        <ol className="list-decimal pl-5 text-xs text-slate-700 dark:text-slate-300 space-y-2 leading-relaxed">
          <li>
            Open classic Outlook and this dashboard. In Claude or your terminal, ensure scans for Outlook, the WhatsApp work groups and the Nubitel portal are up to date.
          </li>
          <li>
            Work the <b>To reply</b> page, filter <b>Reply today</b>: attend only to what came in today and still needs a NOC reply. Reply within <b>15 minutes</b>, even if it is only "Noted, we are checking".
          </li>
          <li>
            Issue raised for the first time: <b>call the reporter</b> with the questions shown on the ticket (call questions appear automatically for new issues). Record the call, transcribe it, and attach details.
          </li>
          <li>
            Platform issue: raise a <b>Nubitel portal ticket</b> on <code>care.nubitel.io</code> using the template below and provide the case number to the reporter.
          </li>
          <li>
            <b>Solved, waiting for RCA</b> filter: no immediate reply to reporter needed. Chase Nubitel for the RCA and send it on when it arrives.
          </li>
          <li>
            <b>Access: tell manager</b> filter (SES, SciTM email, lockouts): inform your manager, then click <b>Mark informed</b>.
          </li>
        </ol>
      </div>

      {/* 2. Questions to ask on the Call */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 text-xs font-bold dark:bg-emerald-950 dark:text-emerald-300">
            2
          </div>
          <span>Diagnostic Questions to Ask on the Call</span>
        </h2>

        <div className="space-y-4 text-xs text-slate-700 dark:text-slate-300">
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-1 text-xs">For Every Reported Issue:</h4>
            <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400">
              <li>Which agent(s)? Name and staff ID / Nubitel ID.</li>
              <li>How many are affected: one agent, a team, or everyone?</li>
              <li>When did it start (exact time)? Is it still happening now?</li>
              <li>Which channel: voice, live chat, email, or social media?</li>
              <li>What exactly does the agent see? Any error message? Request a screenshot or screen recording.</li>
              <li>Did anything change before it started (settings, PC, network, password, new campaign)?</li>
              <li>Already tried: refresh, log out and back in, another browser or PC?</li>
              <li>Customer impact: calls or chats stuck, SLA affected?</li>
            </ul>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-1">Routing & Agent Status:</h4>
              <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400">
                <li>Chat / interaction IDs and exact times.</li>
                <li>Agent status at that moment, and when it changed.</li>
                <li>Screenshot of the TL view and the agent view.</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-1">Reports & Raw Data:</h4>
              <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400">
                <li>Report name, date filter used and when it was exported.</li>
                <li>Which IDs are wrong: expected value vs what the report shows.</li>
                <li>Request attachment of exported Excel / CSV file.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Saving Browser Logs (HAR & Console) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-100 text-amber-700 text-xs font-bold dark:bg-amber-950 dark:text-amber-300">
            3
          </div>
          <span>Saving Browser Logs for Nubitel (Console Log & HAR File)</span>
        </h2>
        <p className="text-xs text-slate-500 mb-3">
          Perform this on the agent's PC in the browser they use for Nubitel (Chrome or Edge).
        </p>

        <ol className="list-decimal pl-5 text-xs text-slate-700 dark:text-slate-300 space-y-1.5 leading-relaxed">
          <li>Open Nubitel. Press <b>F12</b> (or right-click anywhere on the page and select <b>Inspect</b>).</li>
          <li><b>Network</b> tab: tick <b>Preserve log</b>, then click the clear button (circle with a line).</li>
          <li><b>Console</b> tab: click the settings gear, tick <b>Preserve log</b>.</li>
          <li>Leave DevTools open and reproduce the problem. Note the exact time and agent ID.</li>
          <li><b>Network</b> tab: click the download arrow <b>Export HAR</b>. Use normal (sanitized) export. Save as <code>HAR_agentID_date_time.har</code>.</li>
          <li><b>Console</b> tab: right-click in the messages area &gt; <b>Save as...</b> &gt; save as <code>console_agentID_date.log</code>.</li>
          <li>Zip files and attach to portal ticket reply (max 3 files, 8 MB each). Never email HAR files or send them in public chat groups.</li>
        </ol>
      </div>

      {/* 4. Raising Nubitel Portal Ticket Template */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-purple-100 text-purple-700 text-xs font-bold dark:bg-purple-950 dark:text-purple-300">
              4
            </div>
            <span>Raising a Nubitel Portal Ticket (care.nubitel.io)</span>
          </h2>

          <button
            onClick={copyTemplate}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            {copiedTemplate ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copiedTemplate ? 'Copied Template!' : 'Copy Template'}</span>
          </button>
        </div>

        <pre className="rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-xs text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
          {portalTicketTemplate}
        </pre>
      </div>

      {/* 5. Responsibility Matrix */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-100 text-slate-700 text-xs font-bold dark:bg-slate-800 dark:text-slate-300">
            5
          </div>
          <span>Responsibility & Escalation Matrix</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/60 font-semibold text-slate-700 dark:text-slate-300">
              <tr>
                <th className="py-2.5 px-3">Issue Category</th>
                <th className="py-2.5 px-3">Nubitel Involved?</th>
                <th className="py-2.5 px-3">Primary Handling Team / Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-300">
              <tr>
                <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-white">Chat / call routing, agent status wrong</td>
                <td className="py-2.5 px-3">Yes</td>
                <td className="py-2.5 px-3">Raise Nubitel Portal Ticket (care.nubitel.io)</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-white">Reports / raw data wrong (SLA, timestamps)</td>
                <td className="py-2.5 px-3">Yes</td>
                <td className="py-2.5 px-3">Raise Portal Ticket with sample session IDs and exported file</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-white">Platform Outage / P1 Down</td>
                <td className="py-2.5 px-3">Yes, Immediate</td>
                <td className="py-2.5 px-3">Call Nubitel hotline 1800 18 9388, email support.my@nubitel.co, alert Management</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-white">SES / SciTM / MFA / OTP Login</td>
                <td className="py-2.5 px-3">No</td>
                <td className="py-2.5 px-3">Your Manager / ICT Helpdesk (raise Technical Support ticket)</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-white">Wi-Fi / LAN / SSL</td>
                <td className="py-2.5 px-3">No</td>
                <td className="py-2.5 px-3">Network Team (issue dongle as temporary workaround)</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-white">Laptop / Headset / Dongle / SIM</td>
                <td className="py-2.5 px-3">No</td>
                <td className="py-2.5 px-3">NOC Asset team (issue replacement and sign ATF)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
