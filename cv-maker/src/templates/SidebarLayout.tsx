// Phase 3 stub — sidebar layout (two-column with configurable side)
// Not yet implemented. Exported so template registry can reference it.

interface SidebarLayoutProps {
  children: React.ReactNode;
}

/** @todo Implement in Phase 3 */
export function SidebarLayout({ children }: SidebarLayoutProps) {
  return (
    <main className="min-h-screen pt-8 pb-24 px-4 flex justify-center print:pt-0 print:pb-0 print:px-0 print:block print:min-h-0 print:bg-white">
      <div
        id="cv-document"
        className="bg-white w-full max-w-4xl mx-auto shadow-lg rounded-sm px-9 py-8 font-sans text-gray-800 leading-normal print:shadow-none print:rounded-none print:max-w-full print:px-0 print:py-0"
      >
        {/* Sidebar columns go here in Phase 3 */}
        {children}
      </div>
    </main>
  );
}
