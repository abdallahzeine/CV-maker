// ============================================================================
// Toolbar Component
// ============================================================================

import { useFocusedEditor } from '../editor/focusedEditorContext';

interface ToolbarProps {
  onReset: () => void;
  onPrint: () => void;
  onAddSection: () => void;
  onOpenSaves: () => void;
}

export function Toolbar({ onReset, onPrint, onAddSection, onOpenSaves }: ToolbarProps) {
  const editor = useFocusedEditor();

  const formatButtons = [
    {
      key: 'bold',
      label: 'B',
      style: 'font-bold',
      active: editor?.isActive('bold') ?? false,
      run: () => editor?.chain().focus().toggleBold().run(),
    },
    {
      key: 'italic',
      label: 'I',
      style: 'italic',
      active: editor?.isActive('italic') ?? false,
      run: () => editor?.chain().focus().toggleItalic().run(),
    },
    {
      key: 'underline',
      label: 'U',
      style: 'underline',
      active: editor?.isActive('underline') ?? false,
      run: () => editor?.chain().focus().toggleUnderline().run(),
    },
  ];

  return (
    <div className="no-print toolbar-bounce-in fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 bg-white/95 backdrop-blur border border-gray-200 shadow-lg rounded-2xl print:hidden">
      <button onClick={onReset}
        className="toolbar-btn px-3 py-1.5 text-sm rounded-xl border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-800 transition-colors shadow-sm flex items-center gap-1">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Reset
      </button>
      <button onClick={onPrint}
        className="toolbar-btn px-3 py-1.5 text-sm rounded-xl border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-800 transition-colors shadow-sm flex items-center gap-1.5">
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a1 1 0 001 1h8a1 1 0 001-1v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a1 1 0 00-1-1H6a1 1 0 00-1 1zm2 0h6v3H7V4zm-1 9h8v3H6v-3zm8-4a1 1 0 110 2 1 1 0 010-2z" clipRule="evenodd" />
        </svg>
        Print
      </button>
      <button onClick={onAddSection}
        className="toolbar-btn px-3 py-1.5 text-sm rounded-xl bg-violet-100 text-violet-700 hover:bg-violet-200 transition-colors shadow-sm flex items-center gap-1">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Section
      </button>
      <button onClick={onOpenSaves}
        className="toolbar-btn px-3 py-1.5 text-sm rounded-xl border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-800 transition-colors shadow-sm flex items-center gap-1.5">
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M4 3.5A1.5 1.5 0 0 1 5.5 2h10.879a1.5 1.5 0 0 1 1.06.44l2.121 2.121A1.5 1.5 0 0 1 20 5.621V20.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 20.5v-17ZM8 4.5v4h8v-4H8Zm0 9a1 1 0 0 0-1 1v5h10v-5a1 1 0 0 0-1-1H8Z" />
        </svg>
        Saves
      </button>
      <div className="h-5 w-px bg-gray-200 mx-1" />
      <span className="text-xs font-semibold text-gray-500 mr-1 tracking-wide">FORMAT</span>
      {formatButtons.map(({ key, label, style, active, run }) => (
        <button
          key={key}
          onMouseDown={(e) => {
            e.preventDefault();
            run();
          }}
          title={key}
          disabled={!editor}
          className={`toolbar-btn w-8 h-8 ${style} rounded transition-colors text-sm border ${
            active
              ? 'bg-violet-100 text-violet-700 border-violet-300'
              : 'text-gray-700 border-transparent hover:bg-gray-100 hover:text-gray-900 hover:border-gray-200'
          } ${!editor ? 'opacity-40 cursor-not-allowed hover:bg-transparent hover:border-transparent' : ''}`}
        >
          {label}
        </button>
      ))}
      <span className="text-xs text-gray-400 italic ml-1">Select text</span>
    </div>
  );
}
