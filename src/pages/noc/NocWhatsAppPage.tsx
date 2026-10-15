import React, { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { WhatsAppChat } from '../../types';
import { Search, MessageSquare, Smartphone, HelpCircle, Check, Send } from 'lucide-react';
import { formatDateDisplay } from '../../utils/dateUtils';

export const NocWhatsAppPage: React.FC = () => {
  const { whatsappChats, whatsappQueue } = useData();
  const [selectedChatName, setSelectedChatName] = useState<string>(
    whatsappChats.length > 0 ? whatsappChats[0].name : ''
  );
  const [searchQuery, setSearchQuery] = useState('');

  const selectedChat = useMemo(() => {
    return whatsappChats.find(c => c.name === selectedChatName) || null;
  }, [whatsappChats, selectedChatName]);

  // Color generator for sender names
  const getSenderColor = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = [
      'text-blue-600 dark:text-blue-400',
      'text-emerald-600 dark:text-emerald-400',
      'text-purple-600 dark:text-purple-400',
      'text-amber-600 dark:text-amber-400',
      'text-rose-600 dark:text-rose-400',
      'text-cyan-600 dark:text-cyan-400'
    ];
    return colors[Math.abs(hash) % colors.length];
  };

  // Search across all chats
  const searchResults = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) return null;
    const q = searchQuery.toLowerCase();
    const hits: { chatName: string; time: string; sender: string; text: string }[] = [];

    whatsappChats.forEach(c => {
      c.msgs.forEach(m => {
        const [time, sender, text] = m;
        if (sender.toLowerCase().includes(q) || text.toLowerCase().includes(q)) {
          hits.push({ chatName: c.name, time, sender, text });
        }
      });
    });

    return hits.reverse();
  }, [whatsappChats, searchQuery]);

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-5 dark:border-slate-800">
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          WhatsApp Operations Workgroups
        </h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Scanned escalations, incident sync chats, and field technical alerts
        </p>
      </div>

      {/* Global Search across all WhatsApp chats */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search all WhatsApp conversations..."
          className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-hidden dark:border-slate-800 dark:bg-slate-900 dark:text-white"
        />
      </div>

      {/* If Searching, show search results */}
      {searchResults ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs font-bold text-slate-500 mb-4">
            Found {searchResults.length} matching messages:
          </div>

          <div className="space-y-3">
            {searchResults.length > 0 ? (
              searchResults.map((hit, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-100 bg-slate-50 p-3.5 text-xs dark:border-slate-800 dark:bg-slate-800/40"
                >
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {hit.chatName}
                    </span>
                    <span className="font-mono text-slate-400">{formatDateDisplay(hit.time)}</span>
                  </div>
                  <span className={`font-semibold ${getSenderColor(hit.sender)}`}>
                    {hit.sender}:{' '}
                  </span>
                  <span className="text-slate-700 dark:text-slate-300">{hit.text}</span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-slate-400">
                No WhatsApp messages matching "{searchQuery}".
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Regular WhatsApp Chat Interface */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat List (Left) */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Workgroup Channels
            </h3>
            {whatsappChats.map(c => {
              const lastMsg = c.msgs[c.msgs.length - 1];
              const isSelected = c.name === selectedChatName;
              return (
                <button
                  key={c.name}
                  onClick={() => setSelectedChatName(c.name)}
                  className={`w-full text-left rounded-2xl border p-4 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/50 dark:border-emerald-700 dark:bg-emerald-950/30 shadow-xs'
                      : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {c.name}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {c.msgs.length} msgs
                    </span>
                  </div>
                  {lastMsg && (
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {lastMsg[1]}:{' '}
                      </span>
                      {lastMsg[2]}
                    </p>
                  )}
                </button>
              );
            })}
          </div>

          {/* Chat Viewer (Right) */}
          <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col h-[520px]">
            <div className="border-b border-slate-100 pb-3 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {selectedChat?.name || 'Select a workgroup'}
                </h3>
                <span className="text-[11px] text-slate-400">
                  {selectedChat ? `${selectedChat.msgs.length} messages logged` : ''}
                </span>
              </div>
            </div>

            {/* Messages stream */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              {selectedChat && selectedChat.msgs.length > 0 ? (
                selectedChat.msgs.map((m, idx) => {
                  const [time, sender, text] = m;
                  return (
                    <div
                      key={idx}
                      className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-xs dark:border-slate-800 dark:bg-slate-800/40"
                    >
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className={`font-bold ${getSenderColor(sender)}`}>
                          {sender}
                        </span>
                        <span className="font-mono text-slate-400">{formatDateDisplay(time)}</span>
                      </div>
                      <p className="text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                        {text}
                      </p>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-16 text-xs text-slate-400">
                  No messages available for this workgroup.
                </div>
              )}
            </div>

            {/* Info note */}
            <div className="border-t border-slate-100 pt-3 dark:border-slate-800 text-[11px] text-slate-400 flex items-center gap-1.5">
              <Smartphone className="h-3.5 w-3.5" />
              <span>WhatsApp logs are synchronized periodically from official bridge exports.</span>
            </div>
          </div>
        </div>
      )}

      {/* Guide & SOP Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-emerald-600" />
          <span>Exporting WhatsApp Group History for NOC Logging</span>
        </h3>
        <ol className="list-decimal pl-5 text-xs text-slate-600 dark:text-slate-400 space-y-1.5 leading-relaxed">
          <li>On your mobile device, open the workgroup chat (e.g. <i>Scicom IT & TM UCC Ops Escalation</i>).</li>
          <li>Android: tap menu (⋮) &gt; More &gt; <b>Export chat</b> &gt; <b>Without media</b>. iPhone: tap chat header &gt; <b>Export Chat</b> &gt; <b>Without Media</b>.</li>
          <li>Save the exported text file into the configured sync directory.</li>
          <li>The NOC portal parser will automatically digest new customer incidents and map them to tickets.</li>
        </ol>
      </div>
    </div>
  );
};
