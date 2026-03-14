import { useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { ChatMessage } from '../types/chat.types';
import { QUICK_ACTIONS } from '../constants/config';

// ============================================================================
// Toolbar Component
// ============================================================================

interface ToolbarProps {
  onOpenChat: () => void;
  onOpenSettings: () => void;
  onReset: () => void;
  onPrint: () => void;
  onAddSection: () => void;
  chatBadge: number;
  chatOpen: boolean;
  sidebarWidth: number;
}

export function Toolbar({ onOpenChat, onOpenSettings, onReset, onPrint, onAddSection, chatBadge, chatOpen, sidebarWidth }: ToolbarProps) {
  const exec = (cmd: string) => document.execCommand(cmd, false);
  return (
    <div 
      className="no-print fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 bg-white/95 backdrop-blur border border-gray-200 shadow-lg rounded-2xl print:hidden transition-all duration-300"
      style={chatOpen ? { marginLeft: `-${(sidebarWidth + 16) / 2}px` } : {}}
    >
      <button
        onClick={onOpenChat}
        className="relative px-3 py-1.5 text-sm rounded-xl bg-violet-600 text-white hover:bg-violet-700 transition-colors shadow-md flex items-center gap-1.5"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
        AI Chat
        {chatBadge > 0 && (
          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-violet-300 text-violet-900 text-[9px] font-bold rounded-full flex items-center justify-center">
            {chatBadge}
          </span>
        )}
      </button>
      <button
        onClick={onOpenSettings}
        className="px-3 py-1.5 text-sm rounded-xl border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-800 transition-colors shadow-sm flex items-center gap-1"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Settings
      </button>
      <button onClick={onReset}
        className="px-3 py-1.5 text-sm rounded-xl border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-800 transition-colors shadow-sm flex items-center gap-1">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Reset
      </button>
      <button onClick={onPrint}
        className="px-4 py-1.5 text-sm rounded-xl bg-gray-900 text-white hover:bg-gray-700 transition-colors shadow-sm flex items-center gap-1.5">
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a1 1 0 001 1h8a1 1 0 001-1v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a1 1 0 00-1-1H6a1 1 0 00-1 1zm2 0h6v3H7V4zm-1 9h8v3H6v-3zm8-4a1 1 0 110 2 1 1 0 010-2z" clipRule="evenodd" />
        </svg>
        Print
      </button>
      <button onClick={onAddSection}
        className="px-3 py-1.5 text-sm rounded-xl bg-violet-100 text-violet-700 hover:bg-violet-200 transition-colors shadow-sm flex items-center gap-1">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Section
      </button>
      <div className="h-5 w-px bg-gray-200 mx-1" />
      <span className="text-xs font-semibold text-gray-500 mr-1 tracking-wide">FORMAT</span>
      {[
        { cmd: 'bold', label: 'B', style: 'font-bold' },
        { cmd: 'italic', label: 'I', style: 'italic' },
        { cmd: 'underline', label: 'U', style: 'underline' },
      ].map(({ cmd, label, style }) => (
        <button
          key={cmd}
          onMouseDown={(e) => { e.preventDefault(); exec(cmd); }}
          title={cmd}
          className={`w-8 h-8 ${style} rounded hover:bg-gray-100 text-gray-700 hover:text-gray-900 transition-colors text-sm border border-transparent hover:border-gray-200`}
        >
          {label}
        </button>
      ))}
      <span className="text-xs text-gray-400 italic ml-1">Select text</span>
    </div>
  );
}

// ============================================================================
// AI Chat Sidebar Component
// ============================================================================

interface AIChatSidebarProps {
  open: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  loading: boolean;
  sidebarWidth: number;
  setSidebarWidth: (w: number) => void;
  planMode: boolean;
  setPlanMode: (v: boolean) => void;
  pendingActions: any[];
  onExecute: () => void;
}

export function AIChatSidebar({
  open, onClose, messages, value, onChange, onSubmit, loading, sidebarWidth, setSidebarWidth,
  planMode, setPlanMode, pendingActions, onExecute,
}: AIChatSidebarProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (open) textareaRef.current?.focus();
  }, [open]);

  const handleResize = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = sidebarWidth;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const delta = startX - moveEvent.clientX;
      const newWidth = Math.min(Math.max(startWidth + delta, 280), 650);
      setSidebarWidth(newWidth);
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  // Auto-grow textarea
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!loading && value.trim()) onSubmit();
    }
  };

  const applyQuickAction = (prompt: string) => {
    onChange(prompt);
    textareaRef.current?.focus();
  };

  return (
    <>
      {open && (
        <div className="no-print fixed inset-0 z-30 bg-black/10 lg:hidden print:hidden" onClick={onClose} />
      )}
      <aside
        className={`no-print fixed top-0 right-0 z-50 h-screen flex flex-col bg-[#fafafa] border-l border-gray-100 shadow-2xl transition-transform duration-300 ease-in-out print:hidden ${open ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ width: `${sidebarWidth}px` }}
      >
        {/* Resize handle */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-violet-300 bg-transparent transition-colors"
          onMouseDown={handleResize}
          title="Drag to resize"
        />
        {/* Header */}
        <div className="flex items-center justify-end px-3 py-2 bg-white border-b border-gray-100 shrink-0">
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors text-base"
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Quick Actions */}
        <div className="px-4 py-2 border-b border-gray-100 bg-white shrink-0">
          <p className="text-xs text-gray-500 mb-2">Quick actions:</p>
          <div className="flex flex-wrap gap-1">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.label}
                onClick={() => applyQuickAction(action.prompt)}
                className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 transition-colors"
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center pt-8">
              <p className="text-sm text-gray-500">Ask me anything about your CV</p>
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className={`${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
              {msg.role === 'thinking' ? (
                <details className="inline-block max-w-[90%] text-left">
                  <summary className="cursor-pointer text-xs text-gray-500 hover:text-gray-700">
                    Thinking...
                  </summary>
                  <div className="mt-2 text-xs text-gray-400 whitespace-pre-wrap">
                    {msg.text}
                  </div>
                </details>
              ) : (
                <div className={`inline-block max-w-[90%] px-3 py-2 text-sm prose prose-sm max-w-none ${
                  msg.role === 'user'
                    ? 'bg-gray-100 text-gray-800 rounded-2xl rounded-br-sm prose-p:my-0 prose-ul:my-1 prose-ol:my-1 prose-table:my-2'
                    : msg.role === 'error'
                    ? 'text-red-600 prose-p:my-0 prose-ul:my-1 prose-ol:my-1 prose-table:my-2'
                    : 'text-gray-800 prose-p:my-0 prose-ul:my-1 prose-ol:my-1 prose-table:my-2'
                }`}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="text-left">
              <span className="text-gray-400 text-sm">...</span>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div className="shrink-0 px-4 py-3 bg-white border-t border-gray-100">
          <div className="flex items-end gap-2">
            <textarea
              ref={textareaRef}
              rows={1}
              value={value}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="Message..."
              disabled={loading}
              className="flex-1 resize-none text-sm bg-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:bg-gray-200 disabled:text-gray-400 leading-snug min-h-[36px] max-h-[120px]"
              style={{ height: '36px' }}
            />
            <button
              onClick={onSubmit}
              disabled={loading || !value.trim()}
              className="px-3 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Send
            </button>
          </div>
          
          {pendingActions.length > 0 && (
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-gray-600">
                {pendingActions.length} pending
              </span>
              <button
                onClick={onExecute}
                disabled={loading}
                className="px-3 py-1 text-xs bg-gray-900 text-white rounded hover:bg-gray-800 disabled:opacity-50"
              >
                Apply
              </button>
            </div>
          )}
          
          <button
            onClick={() => setPlanMode(!planMode)}
            className="mt-3 text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1.5"
          >
            {planMode ? (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                Plan mode
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Edit mode
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
