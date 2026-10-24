import React, { useState, useRef, useEffect } from 'react';
import { useCubes } from '../context/CubesContext';
import {
  X,
  Send,
  Mic,
  Sliders,
  Brain,
  Plus,
  Loader2,
  Terminal,
  BookOpen,
} from 'lucide-react';

export const CubeChatModal: React.FC = () => {
  const {
    chatModalCube,
    setChatModalCube,
    setVoiceModalCube,
    setStudioModalData,
    chatMessages,
    sendDirectMessage,
    addMemoryToCube,
  } = useCubes();

  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [newMemoryInput, setNewMemoryInput] = useState('');
  const [showMemoryInput, setShowMemoryInput] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  if (!chatModalCube) return null;

  const cube = chatModalCube;
  const messages = chatMessages[cube.id] || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isSending) return;
    const msg = inputMessage;
    setInputMessage('');
    setIsSending(true);
    try {
      await sendDirectMessage(cube.id, msg);
    } finally {
      setIsSending(false);
    }
  };

  const handleAddMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemoryInput.trim()) return;
    addMemoryToCube(cube.id, newMemoryInput.trim());
    setNewMemoryInput('');
    setShowMemoryInput(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#0D121D] border border-slate-800 rounded-2xl w-full max-w-4xl h-[88vh] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/90 bg-[#101624]">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center border shadow-inner"
              style={{
                backgroundColor: `${cube.accentColor}15`,
                borderColor: `${cube.accentColor}40`,
              }}
            >
              <Terminal className="w-5 h-5" style={{ color: cube.accentColor }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">{cube.name}</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {cube.permissions.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">{cube.role}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Switch to Voice Interface */}
            <button
              onClick={() => {
                setVoiceModalCube(cube);
                setChatModalCube(null);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-400 bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-800/40 rounded-lg transition-colors"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Voice Channel</span>
            </button>

            {/* Inspect SOPs */}
            <button
              onClick={() => {
                setStudioModalData({ cube, isNew: false });
                setChatModalCube(null);
              }}
              className="p-2 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors"
              title="Inspect SOPs & Knowledge"
            >
              <Sliders className="w-4 h-4" />
            </button>

            {/* Close */}
            <button
              onClick={() => setChatModalCube(null)}
              className="p-2 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body: Split between Chat (Left) and Knowledge/SOP Drawer (Right) */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col bg-[#090D14]">
            {/* Messages Scroll View */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Introduction Card */}
              <div className="p-4 bg-slate-900/50 border border-slate-800/80 rounded-xl text-xs text-slate-300 mb-6">
                <span className="font-semibold text-white block mb-1">
                  Connected to {cube.name} · {cube.role}
                </span>
                <p className="text-slate-400 leading-relaxed">{cube.systemInstruction}</p>
              </div>

              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-[#121824] border border-slate-800 text-slate-200'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono mt-1 px-1">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}

              {isSending && (
                <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                  <span>{cube.name} is computing response according to SOPs...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSend} className="p-4 bg-[#101624] border-t border-slate-800 flex items-center gap-3">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={`Instruct or query ${cube.name}...`}
                disabled={isSending}
                className="flex-1 px-4 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isSending}
                className="px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-xl transition-colors flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </form>
          </div>

          {/* Right Sidebar: Active SOPs & Persistent Memory */}
          <div className="hidden lg:flex w-72 bg-[#0D121D] border-l border-slate-800/80 flex-col overflow-y-auto p-4 space-y-6">
            {/* Active SOPs */}
            <div>
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                <span>Active SOPs ({cube.sops?.length || 0})</span>
              </h4>
              <div className="space-y-2">
                {cube.sops?.map((sop) => (
                  <div key={sop.id} className="p-2.5 bg-slate-950/70 border border-slate-800/80 rounded-lg text-xs">
                    <span className="font-semibold text-slate-200 block truncate">{sop.name}</span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">Trigger: {sop.trigger}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Persistent Memory Bank */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Brain className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Memory Bank</span>
                </h4>
                <button
                  onClick={() => setShowMemoryInput(!showMemoryInput)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Learn</span>
                </button>
              </div>

              {showMemoryInput && (
                <form onSubmit={handleAddMemory} className="mb-3 space-y-1.5">
                  <input
                    type="text"
                    value={newMemoryInput}
                    onChange={(e) => setNewMemoryInput(e.target.value)}
                    placeholder="E.g., Prefers strict TypeScript types..."
                    className="w-full p-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none"
                  />
                  <div className="flex justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => setShowMemoryInput(false)}
                      className="px-2 py-1 text-[11px] text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-2.5 py-1 text-[11px] font-semibold text-white bg-emerald-600 rounded-md"
                    >
                      Save Memory
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-1.5">
                {cube.memory?.map((mem, idx) => (
                  <div key={idx} className="p-2 bg-slate-950/50 border border-slate-800/60 rounded-md text-[11px] text-slate-300 leading-snug">
                    • {mem}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
