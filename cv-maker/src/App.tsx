import { useState, useCallback, useEffect } from 'react';
import { initialCVData } from './data/initialCVData';
import type { CVData, CVItem, CVSection } from './types';
import { arrayMove } from '@dnd-kit/sortable';
import { moveItem, newItem, defaultLayoutFor } from './utils/helpers';
import { loadCVData, saveCVData, clearCVData } from './utils/settings';
import { Toolbar, SectionModal, CVDocument } from './components';
import { SidePanel } from './components/SidePanel';
import { SectionLayoutContent } from './components/SectionLayoutPanel';
import { loadSidePanelWidth, saveSidePanelWidth } from './utils/sidePanel';
import { sectionRegistry } from './sections/registry';

type PanelType = 'layout-settings';

interface PanelState {
  type: PanelType;
  sectionId?: string;
}

export default function App() {
  const [cv, setCv] = useState<CVData>(() => loadCVData());
  const [sectionModalOpen, setSectionModalOpen] = useState(false);
  const [panel, setPanel] = useState<PanelState | null>(null);
  const [panelWidth, setPanelWidth] = useState(loadSidePanelWidth);

  useEffect(() => {
    saveCVData(cv);
  }, [cv]);

  const updateHeader = useCallback((header: CVData['header']) => {
    setCv((prev) => ({ ...prev, header }));
  }, []);

  const updateSection = useCallback((sIdx: number, updated: CVSection) => {
    setCv((prev) => { const s = [...prev.sections]; s[sIdx] = updated; return { ...prev, sections: s }; });
  }, []);

  const moveSection = useCallback((sIdx: number, delta: -1 | 1) => {
    setCv((prev) => ({ ...prev, sections: moveItem(prev.sections, sIdx, delta) }));
  }, []);

  const reorderSections = useCallback((oldIndex: number, newIndex: number) => {
    setCv((prev) => ({ ...prev, sections: arrayMove(prev.sections, oldIndex, newIndex) }));
  }, []);

  const changeItem = useCallback((sIdx: number, iIdx: number, item: CVItem) => {
    setCv((prev) => {
      const sections = [...prev.sections];
      const items = [...sections[sIdx].items];
      items[iIdx] = item;
      sections[sIdx] = { ...sections[sIdx], items };
      return { ...prev, sections };
    });
  }, []);

  const moveItem_ = useCallback((sIdx: number, iIdx: number, delta: -1 | 1) => {
    setCv((prev) => {
      const sections = [...prev.sections];
      sections[sIdx] = { ...sections[sIdx], items: moveItem(sections[sIdx].items, iIdx, delta) };
      return { ...prev, sections };
    });
  }, []);

  const reorderItems = useCallback((sIdx: number, oldIndex: number, newIndex: number) => {
    setCv((prev) => {
      const sections = [...prev.sections];
      sections[sIdx] = { ...sections[sIdx], items: arrayMove(sections[sIdx].items, oldIndex, newIndex) };
      return { ...prev, sections };
    });
  }, []);

  const deleteItem = useCallback((sIdx: number, iIdx: number) => {
    setCv((prev) => {
      const sections = [...prev.sections];
      sections[sIdx] = { ...sections[sIdx], items: sections[sIdx].items.filter((_, i) => i !== iIdx) };
      return { ...prev, sections };
    });
  }, []);

  const addSection = useCallback((section: CVSection) => {
    const withLayout: CVSection = section.layout
      ? section
      : { ...section, layout: defaultLayoutFor(section.type) };
    setCv((prev) => ({ ...prev, sections: [...prev.sections, withLayout] }));
  }, []);

  const deleteSection = useCallback((sIdx: number) => {
    setCv((prev) => {
      if (prev.sections.length <= 1) return prev;
      return { ...prev, sections: prev.sections.filter((_, i) => i !== sIdx) };
    });
  }, []);

  const addItem = useCallback((sIdx: number) => {
    setCv((prev) => {
      const sections = [...prev.sections];
      sections[sIdx] = {
        ...sections[sIdx],
        items: [...sections[sIdx].items, newItem(sections[sIdx].type)],
      };
      return { ...prev, sections };
    });
  }, []);

  const handlePanelWidthChange = useCallback((w: number) => {
    setPanelWidth(w);
    saveSidePanelWidth(w);
  }, []);

  const handlePrint = () => {
    setPanel(null);
    setTimeout(() => window.print(), 300);
  };

  const handleReset = () => {
    if (window.confirm('Reset CV to original data? All changes will be lost.')) {
      clearCVData();
      setCv(initialCVData);
    }
  };

  const openPanel = useCallback((type: PanelType, sectionId?: string) => {
    setPanel({ type, sectionId });
  }, []);

  const closePanel = useCallback(() => {
    setPanel(null);
  }, []);

  const panelOpen = panel !== null;
  const effectiveWidth = panelOpen ? panelWidth : 0;

  return (
    <div className="transition-[margin-right] duration-300 ease-in-out" style={{ marginRight: effectiveWidth }}>
      <Toolbar
        onReset={handleReset}
        onPrint={handlePrint}
        onAddSection={() => setSectionModalOpen(true)}
      />
      {sectionModalOpen && (
        <SectionModal
          onClose={() => setSectionModalOpen(false)}
          onAddSection={addSection}
        />
      )}
      <CVDocument
        cv={cv}
        onUpdateHeader={updateHeader}
        onUpdateSection={updateSection}
        onMoveSection={moveSection}
        onDeleteSection={deleteSection}
        onReorderSections={reorderSections}
        onChangeItem={changeItem}
        onMoveItem={moveItem_}
        onReorderItems={reorderItems}
        onDeleteItem={deleteItem}
        onAddItem={addItem}
        onOpenPanel={openPanel}
      />
      <SidePanel
        open={panelOpen}
        onClose={closePanel}
        width={panelWidth}
        onWidthChange={handlePanelWidthChange}
        title={panel?.type === 'layout-settings' ? 'Layout Settings' : ''}
        subtitle={panel?.type === 'layout-settings' && panel.sectionId != null ? (() => { const s = cv.sections.find((x) => x.id === panel.sectionId); return s ? `${(sectionRegistry[s.type] ?? sectionRegistry.custom).label} · ${s.title}` : undefined; })() : undefined}
      >
        {panel?.type === 'layout-settings' && panel.sectionId != null && (() => {
          const panelSection = cv.sections.find((x) => x.id === panel.sectionId);
          if (!panelSection) return null;
          const panelSIdx = cv.sections.indexOf(panelSection);
          return (
            <SectionLayoutContent
              section={panelSection}
              onChangeLayout={(layout) => updateSection(panelSIdx, { ...panelSection, layout })}
            />
          );
        })()}
      </SidePanel>
    </div>
  );
}
