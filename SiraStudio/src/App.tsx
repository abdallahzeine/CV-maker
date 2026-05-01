import { useState, useCallback, useEffect, lazy, Suspense } from 'react';
import type { CVData, CVSection } from './types';
import { Toolbar, SectionModal, SavesPanel, ConfirmModal, SplashScreen, AIAssistant } from './components';
import { PrintTutorialModal } from './components/PrintTutorialModal.tsx';
import { hasSeenPrintTutorial, markPrintTutorialSeen } from './utils/printTutorial.ts';
import { SidePanel } from './components/SidePanel';
import { SectionLayoutContent } from './components/SectionLayoutPanel';
import { ErrorBoundary } from './components/ErrorBoundary';
import { loadSidePanelWidth, saveSidePanelWidth } from './utils/sidePanel';
import { useMediaQuery } from './utils/useMediaQuery';
import { createBlankCVData, isValidCVData } from './utils/snapshots';
import { sectionRegistry } from './sections/registry';
import { useCVSelector, useDispatch, useHistory } from './store';

const EditorDocument = lazy(() => import('./editor/EditorDocument').then((m) => ({ default: m.EditorDocument })));
const PrintDocument = lazy(() => import('./print/PrintDocument').then((m) => ({ default: m.PrintDocument })));

type PanelType = 'layout-settings' | 'saves' | 'agent';

interface PanelState {
  type: PanelType;
  sectionId?: string;
}

export default function App() {
  const cv = useCVSelector((s) => s.data);
  const revision = useCVSelector((s) => s.revision);
  const dispatch = useDispatch();
  const history = useHistory();
  const [showSplash, setShowSplash] = useState(true);
  const [sectionModalOpen, setSectionModalOpen] = useState(false);
  const [panel, setPanel] = useState<PanelState | null>(null);
  const [panelWidth, setPanelWidth] = useState(loadSidePanelWidth);
  const [confirmModal, setConfirmModal] = useState<{ message: string; onConfirm: () => void } | null>(null);
  const [showPrintTutorial, setShowPrintTutorial] = useState(false);
  const [printAfterTutorial, setPrintAfterTutorial] = useState(false);

  useEffect(() => {
    void import('./editor/EditorDocument');
    void import('./print/PrintDocument');
  }, []);

  const openConfirm = (message: string, action: () => void) =>
    setConfirmModal({ message, onConfirm: action });
  const closeConfirm = () => setConfirmModal(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const hasCommandModifier = event.ctrlKey || event.metaKey;
      if (!hasCommandModifier || event.altKey) {
        return;
      }

      const isUndo = key === 'z' && !event.shiftKey;
      const isRedo = (key === 'z' && event.shiftKey) || key === 'y';

      if (isUndo) {
        const entry = history.undo();
        if (!entry) {
          return;
        }

        event.preventDefault();
        const result = dispatch(entry.inverse, {
          origin: 'undo',
          label: 'history:undo',
        });

        if (!result.success) {
          history.redo();
        }

        return;
      }

      if (isRedo) {
        const entry = history.redo();
        if (!entry) {
          return;
        }

        event.preventDefault();
        const result = dispatch(entry.patches, {
          origin: 'redo',
          label: 'history:redo',
        });

        if (!result.success) {
          history.undo();
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [dispatch, history]);

  const [pendingScrollId, setPendingScrollId] = useState<string | null>(null);

  useEffect(() => {
    if (!pendingScrollId) return;
    const timer = setTimeout(() => {
      document.getElementById(`section-${pendingScrollId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setPendingScrollId(null);
    }, 50);
    return () => clearTimeout(timer);
  }, [pendingScrollId]);

  const addSection = useCallback((section: CVSection) => {
    dispatch({ op: 'insert', path: 'sections[-1]', value: section });
    setPendingScrollId(section.id);
  }, [dispatch]);

  const handlePanelWidthChange = useCallback((w: number) => {
    setPanelWidth(w);
    saveSidePanelWidth(w);
  }, []);

  const handlePrint = () => {
    setPanel(null);
    if (!hasSeenPrintTutorial()) {
      setPrintAfterTutorial(true);
      setShowPrintTutorial(true);
      return;
    }
    setTimeout(() => window.print(), 300);
  };

  const handleTutorialClose = () => {
    markPrintTutorialSeen();
    setShowPrintTutorial(false);
    if (printAfterTutorial) {
      setTimeout(() => window.print(), 300);
    }
    setPrintAfterTutorial(false);
  };

  const handleShowTutorial = () => {
    setPrintAfterTutorial(false);
    setShowPrintTutorial(true);
  };

  const handleReset = () => {
    openConfirm('Reset CV to blank data? All changes will be lost.', () => {
      dispatch({ op: 'replace', path: '', value: createBlankCVData() });
    });
  };

  const openPanel = useCallback((type: PanelType, sectionId?: string) => {
    setPanel({ type, sectionId });
  }, []);

  const closePanel = useCallback(() => {
    setPanel(null);
  }, []);

  const handleLoadSnapshot = useCallback((data: CVData) => {
    openConfirm('Load this snapshot and replace your current CV?', () => {
      dispatch({ op: 'replace', path: '', value: data });
      closePanel();
    });
  }, [closePanel, dispatch]);

  const handleLoadBlank = useCallback(() => {
    openConfirm('Load a blank CV and replace your current CV?', () => {
      dispatch({ op: 'replace', path: '', value: createBlankCVData() });
      closePanel();
    });
  }, [closePanel, dispatch]);

  const handleApplyAgentCV = useCallback((data: CVData) => {
    if (!isValidCVData(data)) {
      console.error('[agent] Ignored invalid CV payload', data);
      return;
    }

    dispatch({ op: 'replace', path: '', value: data }, { origin: 'agent', label: 'agent:apply' });
  }, [dispatch]);

  const panelOpen = panel !== null;
  const effectiveWidth = panelOpen ? panelWidth : 0;
  const isMobile = useMediaQuery('(max-width: 767px)');
  const toolbarOffsetX = panelOpen && !isMobile ? panelWidth / 2 : 0;

  return (
    <>
    {showSplash && <SplashScreen onDone={() => setShowSplash(false)} />}
    <div className="transition-[margin-right] duration-300 ease-in-out" style={{ marginRight: isMobile ? 0 : effectiveWidth }}>
<Toolbar
        onReset={handleReset}
        onPrint={handlePrint}
        onAddSection={() => setSectionModalOpen(true)}
        onOpenSaves={() => setPanel({ type: 'saves' })}
        onOpenAI={() => setPanel({ type: 'agent' })}
        panelOffsetX={toolbarOffsetX}
      />
      {sectionModalOpen && (
        <SectionModal
          onClose={() => setSectionModalOpen(false)}
          onAddSection={addSection}
        />
      )}
      {!showSplash && (
        <ErrorBoundary>
          <Suspense fallback={null}>
            <div id="editor-root">
              <EditorDocument onOpenPanel={openPanel} />
            </div>
            <div id="print-root">
              <PrintDocument doc={cv} />
            </div>
          </Suspense>
        </ErrorBoundary>
      )}
      {confirmModal && (
        <ConfirmModal
          message={confirmModal.message}
          onConfirm={() => { confirmModal.onConfirm(); closeConfirm(); }}
          onCancel={closeConfirm}
        />
      )}
      {showPrintTutorial && (
        <PrintTutorialModal onClose={handleTutorialClose} />
      )}
      <SidePanel
        open={panelOpen}
        onClose={closePanel}
        width={panelWidth}
        onWidthChange={handlePanelWidthChange}
        title={panel?.type === 'layout-settings' ? 'Layout Settings' : panel?.type === 'saves' ? 'Saved CVs' : panel?.type === 'agent' ? 'AI Assistant' : ''}
        subtitle={panel?.type === 'layout-settings' && panel.sectionId != null ? (() => { const s = cv.sections.find((x) => x.id === panel.sectionId); return s ? `${(sectionRegistry[s.type] ?? sectionRegistry.custom).label} · ${s.title}` : undefined; })() : undefined}
        hideHeader={panel?.type === 'agent'}
        bodyClassName={panel?.type === 'agent' ? 'flex min-h-0 flex-col overflow-hidden !px-0 !py-0' : undefined}
        bodyScrollable={panel?.type !== 'agent'}
      >
        {panel?.type === 'saves' && (
          <SavesPanel
            currentCVData={cv}
            onLoadSnapshot={handleLoadSnapshot}
            onLoadBlank={handleLoadBlank}
            onShowTutorial={handleShowTutorial}
          />
        )}
        {panel?.type === 'agent' && (
          <AIAssistant cv={cv} revision={revision} onApplyCV={handleApplyAgentCV} onClose={closePanel} />
        )}
        {panel?.type === 'layout-settings' && panel.sectionId != null && (() => {
          const panelSection = cv.sections.find((x) => x.id === panel.sectionId);
          if (!panelSection) return null;
          const panelSIdx = cv.sections.indexOf(panelSection);
          return (
            <SectionLayoutContent
              section={panelSection}
              onChangeLayout={(layout) => dispatch({ op: 'replace', path: `sections[${panelSIdx}].layout`, value: layout })}
            />
          );
        })()}
      </SidePanel>
    </div>
    <a
      href="https://abdallahzeine.vercel.app"
      target="_blank"
      rel="noopener noreferrer"
      className="no-print hidden md:block fixed bottom-4 right-4 z-30 rounded-full border border-gray-200 bg-white/90 px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm backdrop-blur transition-colors hover:bg-white hover:text-gray-900"
      aria-label="Made by Abdallah Zeine Elabidine"
    >
      Made by Abdallah Zeine Elabidine
    </a>
    </>
  );
}
