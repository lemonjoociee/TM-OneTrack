import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { syncService } from '../../services/sharepointService';
import { SLA_CONFIG } from '../../config/slaConfig';
import { OPERATIONS_HEALTH_CONFIG } from '../../config/operationsHealth';
import {
  Settings,
  Bot,
  Mail,
  Smartphone,
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Server,
  ToggleLeft,
  ToggleRight,
  Terminal,
  Play
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { syncStatus, refreshData } = useData();

  const [ollamaConfig, setOllamaConfig] = useState(syncService.getOllamaConfig());
  const [isSampleMode, setIsSampleMode] = useState(syncService.isSampleMode());
  const [simulateFail, setSimulateFail] = useState(false);
  const [testResult, setTestResult] = useState<{ ok?: boolean; error?: string; models?: string[] } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    syncService.saveOllamaConfig(ollamaConfig);
    setFeedback('Ollama AI & Ingestion settings saved successfully.');
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleTestOllama = async () => {
    setIsTesting(true);
    setTestResult(null);
    const res = await syncService.testOllamaConnection();
    setTestResult(res);
    setIsTesting(false);
  };

  const handleToggleSampleMode = () => {
    const nextVal = !isSampleMode;
    setIsSampleMode(nextVal);
    syncService.setSampleDataMode(nextVal);
    setFeedback(`Ingestion mode switched to: ${nextVal ? 'Sample / Test Mode' : 'Live Ollama AI Ingestion'}.`);
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleToggleSimulateFail = () => {
    const nextVal = !simulateFail;
    setSimulateFail(nextVal);
    syncService.setSimulateFailure(nextVal);
    setFeedback(
      nextVal
        ? 'Simulated sync error ENABLED. Next scan will trigger fallback cache and warning.'
        : 'Simulated sync error disabled.'
    );
    setTimeout(() => setFeedback(null), 3500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="border-b border-slate-200 pb-5 dark:border-slate-800">
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="h-6 w-6 text-blue-600" />
          <span>Local AI &amp; Ingestion Engine Settings</span>
        </h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Configure local Ollama AI endpoints, Outlook mail parser rules, WhatsApp workgroup folders, and operational thresholds
        </p>
      </div>

      {feedback && (
        <div className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 p-3.5 text-xs font-medium text-blue-800 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-blue-600" />
          <span>{feedback}</span>
        </div>
      )}

      {/* 1. Local AI Ollama Configuration Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Local AI Engine (Ollama)
              </h3>
              <p className="text-xs text-slate-500">Autonomous email extraction, sentiment classification, and action generation</p>
            </div>
          </div>

          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            {syncStatus.status === 'error' ? 'Offline Cache Active' : syncStatus.dataSource}
          </span>
        </div>

        <form onSubmit={handleSaveConfig} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Ollama Daemon Endpoint (Localhost / LAN)
              </label>
              <input
                type="text"
                value={ollamaConfig.endpoint}
                onChange={(e) => setOllamaConfig({ ...ollamaConfig, endpoint: e.target.value })}
                placeholder="http://localhost:11434"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-mono focus:outline-hidden focus:border-blue-500"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Default: <code>http://localhost:11434</code> (run <code>ollama serve</code> in terminal)
              </span>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Local Model Tag
              </label>
              <input
                type="text"
                value={ollamaConfig.model}
                onChange={(e) => setOllamaConfig({ ...ollamaConfig, model: e.target.value })}
                placeholder="llama3"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-mono focus:outline-hidden focus:border-blue-500"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Examples: <code>llama3</code>, <code>mistral</code>, <code>qwen2.5:7b</code>, <code>phi3</code>
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={handleTestOllama}
              disabled={isTesting}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 transition-colors"
            >
              <Terminal className={`h-3.5 w-3.5 ${isTesting ? 'animate-spin text-purple-600' : ''}`} />
              <span>{isTesting ? 'Testing Ollama...' : 'Test Ollama Connection'}</span>
            </button>

            <button
              type="submit"
              className="rounded-xl bg-blue-600 px-4 py-1.5 font-semibold text-white hover:bg-blue-700 shadow-xs transition-colors"
            >
              Save Ollama Config
            </button>
          </div>

          {testResult && (
            <div
              className={`rounded-xl p-3 text-xs ${
                testResult.ok
                  ? 'border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300'
                  : 'border border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300'
              }`}
            >
              {testResult.ok ? (
                <div>
                  <div className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>Ollama Daemon Reachable!</span>
                  </div>
                  <div className="mt-1 text-[11px]">
                    Installed local models:{' '}
                    <span className="font-mono">{testResult.models?.join(', ') || 'none detected'}</span>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 text-rose-600" />
                    <span>Connection to Ollama Failed</span>
                  </div>
                  <p className="mt-1 text-[11px] leading-relaxed">{testResult.error}</p>
                  <p className="mt-1 text-[10px] text-slate-500">
                    Tip: Ensure Ollama is running in background. In terminal run: <code>ollama run {ollamaConfig.model}</code>
                  </p>
                </div>
              )}
            </div>
          )}
        </form>
      </div>

      {/* 2. Outlook & WhatsApp Data Ingestion Folders */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Mail className="h-5 w-5 text-blue-600" />
          <span>Outlook &amp; WhatsApp Ingestion Channels</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
              <Mail className="h-4 w-4 text-blue-600" />
              <span>Outlook Mail Scanner</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Scans classic Outlook inbox for emails from RTA, Nubitel Support, and Operations leaders.
            </p>
            <div className="font-mono text-[11px] text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-2 rounded-lg truncate">
              {ollamaConfig.outlookFolder}
            </div>
            <div className="text-[10px] text-slate-400">
              Target Address: <code>tmnoc@scicom.com.my</code>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
              <Smartphone className="h-4 w-4 text-emerald-600" />
              <span>WhatsApp Workgroup Folder</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Target folder where exported WhatsApp chat histories are automatically ingested and mapped to tickets.
            </p>
            <div className="font-mono text-[11px] text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-2 rounded-lg truncate">
              {ollamaConfig.whatsappFolder}
            </div>
            <div className="text-[10px] text-slate-400">
              Supported Workgroups: TM - NOC Internal, Scicom IT &amp; Ops, TM - NOC &amp; OPS
            </div>
          </div>
        </div>
      </div>

      {/* 3. Shift Ingestion & Testing Controls */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Server className="h-5 w-5 text-indigo-600" />
          <span>Ingestion Modes &amp; Test Lab</span>
        </h3>

        <div className="space-y-3 divide-y divide-slate-100 dark:divide-slate-800 text-xs">
          {/* Sample Data Toggle */}
          <div className="flex items-center justify-between pt-2">
            <div>
              <span className="font-semibold text-slate-900 dark:text-white block">
                Sample / Standalone Mode
              </span>
              <span className="text-slate-500 dark:text-slate-400">
                Use bundled high-fidelity historical data. Turn off to connect directly to local Ollama agent.
              </span>
            </div>
            <button
              onClick={handleToggleSampleMode}
              className={`p-1 text-2xl transition-colors ${
                isSampleMode ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'
              }`}
            >
              {isSampleMode ? <ToggleRight className="h-7 w-7" /> : <ToggleLeft className="h-7 w-7" />}
            </button>
          </div>

          {/* Simulate Failure Toggle */}
          <div className="flex items-center justify-between pt-3">
            <div>
              <span className="font-semibold text-slate-900 dark:text-white block">
                Simulate Ollama Connection Disconnect
              </span>
              <span className="text-slate-500 dark:text-slate-400">
                Verifies that dashboards gracefully display fallback cache and clear recovery alerts.
              </span>
            </div>
            <button
              onClick={handleToggleSimulateFail}
              className={`p-1 text-2xl transition-colors ${
                simulateFail ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'
              }`}
            >
              {simulateFail ? <ToggleRight className="h-7 w-7" /> : <ToggleLeft className="h-7 w-7" />}
            </button>
          </div>
        </div>

        <div className="pt-2 flex flex-wrap items-center gap-3">
          <button
            onClick={() => refreshData()}
            disabled={syncStatus.isSyncing}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-xs"
          >
            <Play className={`h-3.5 w-3.5 ${syncStatus.isSyncing ? 'animate-spin' : ''}`} />
            <span>Run "Start My Shift" Scan Now</span>
          </button>
        </div>
      </div>

      {/* 4. SLA & Operations Health Rules Overview */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-purple-600" />
          <span>Active SLA &amp; Operations Health Rules (Configured in Source)</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
            <h4 className="font-bold text-slate-900 dark:text-white mb-2">SLA Resolution Thresholds</h4>
            <ul className="space-y-1 text-slate-600 dark:text-slate-400">
              <li>P1 Resolution: <span className="font-mono font-bold text-slate-900 dark:text-white">{SLA_CONFIG.p1ResolutionHours} hours</span></li>
              <li>P2 Resolution: <span className="font-mono font-bold text-slate-900 dark:text-white">{SLA_CONFIG.p2ResolutionHours} hours</span></li>
              <li>P3 Resolution: <span className="font-mono font-bold text-slate-900 dark:text-white">{SLA_CONFIG.p3ResolutionHours} hours</span></li>
              <li>P4 Resolution: <span className="font-mono font-bold text-slate-900 dark:text-white">{SLA_CONFIG.p4ResolutionHours} hours</span></li>
              <li>NOC 1st Reply Rule: <span className="font-mono font-bold text-slate-900 dark:text-white">{SLA_CONFIG.nocFirstReplyMinutes} minutes</span></li>
            </ul>
          </div>

          <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
            <h4 className="font-bold text-slate-900 dark:text-white mb-2">Operations Health Formula</h4>
            <ul className="space-y-1 text-slate-600 dark:text-slate-400">
              <li>Critical Open Ratio: <span className="font-mono font-bold text-slate-900 dark:text-white">&gt; {(OPERATIONS_HEALTH_CONFIG.criticalOpenRatio * 100)}%</span></li>
              <li>Attention Open Ratio: <span className="font-mono font-bold text-slate-900 dark:text-white">&gt; {(OPERATIONS_HEALTH_CONFIG.attentionOpenRatio * 100)}%</span></li>
              <li>Critical SLA Target: <span className="font-mono font-bold text-slate-900 dark:text-white">&lt; {OPERATIONS_HEALTH_CONFIG.criticalSlaCompliance}%</span></li>
              <li>Healthy SLA Target: <span className="font-mono font-bold text-slate-900 dark:text-white">&ge; {OPERATIONS_HEALTH_CONFIG.attentionSlaCompliance}%</span></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
