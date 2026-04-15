// ============================================================================
// Toolbar Component
// ============================================================================

interface ToolbarProps {
  onReset: () => void;
  onPrint: () => void;
  onAddSection: () => void;
}

export function Toolbar({ onReset, onPrint, onAddSection }: ToolbarProps) {
  const exec = (cmd: string) => document.execCommand(cmd, false);
  return (
    <div className="no-print fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 bg-white/95 backdrop-blur border border-gray-200 shadow-lg rounded-2xl print:hidden">
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
