// Phase 3 stub — sidebar layout (two-column with configurable side)
// Not yet implemented. Exported so template registry can reference it.

interface SidebarLayoutProps {
  children: React.ReactNode;
  documentId?: string;
  documentClassName?: string;
}

/** @todo Implement in Phase 3 */
export function SidebarLayout({ children, documentId, documentClassName }: SidebarLayoutProps) {
  const className = [
    'cv-document',
    'bg-white w-full max-w-4xl mx-auto shadow-lg rounded-sm px-9 py-8 font-sans text-gray-800 leading-normal print:shadow-none print:rounded-none print:max-w-full print:px-0 print:py-0',
    documentClassName,
  ].filter(Boolean).join(' ');

  return (
    <main className="grid-dots-static min-h-screen pt-8 pb-24 px-4 flex justify-center print:pt-0 print:pb-0 print:px-0 print:block print:min-h-0 print:bg-white">
      <div
        id={documentId}
        className={className}
      >
        {/* Sidebar columns go here in Phase 3 */}
        {children}
      </div>
    </main>
  );
}
