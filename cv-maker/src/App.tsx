import { useState, useCallback, useEffect } from 'react';
import { initialCVData } from './data/initialCVData';
import type { CVData, CVItem, CVSection } from './types';
import { moveItem, newItem } from './utils/helpers';
import { loadCVData, saveCVData, clearCVData } from './utils/settings';
import { Toolbar, HeaderSection, SectionContent, EditableText, ReorderButtons, SectionModal, DeleteButton } from './components';

export default function App() {
  const [cv, setCv] = useState<CVData>(() => loadCVData());
  const [sectionModalOpen, setSectionModalOpen] = useState(false);

  // Auto-save CV data to localStorage when it changes
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

  const deleteItem = useCallback((sIdx: number, iIdx: number) => {
    setCv((prev) => {
      const sections = [...prev.sections];
      sections[sIdx] = { ...sections[sIdx], items: sections[sIdx].items.filter((_, i) => i !== iIdx) };
      return { ...prev, sections };
    });
  }, []);

  const addSection = useCallback((section: CVSection) => {
    setCv((prev) => ({
      ...prev,
      sections: [...prev.sections, section],
    }));
  }, []);

  const deleteSection = useCallback((sIdx: number) => {
    setCv((prev) => {
      if (prev.sections.length <= 1) return prev;
      return {
        ...prev,
        sections: prev.sections.filter((_, i) => i !== sIdx),
      };
    });
  }, []);

  const addItem = useCallback((sIdx: number) => {
    setCv((prev) => {
      const sections = [...prev.sections];
      sections[sIdx] = { ...sections[sIdx], items: [...sections[sIdx].items, newItem(sections[sIdx].type)] };
      return { ...prev, sections };
    });
  }, []);

  const handlePrint = () => window.print();

  const handleReset = () => {
    if (window.confirm('Reset CV to original data? All changes will be lost.')) {
      clearCVData();
      setCv(initialCVData);
    }
  };

  return (
    <>
      <Toolbar
        onReset={handleReset}
        onPrint={handlePrint}
        onAddSection={() => setSectionModalOpen(true)}
      />

      <SectionModal
        isOpen={sectionModalOpen}
        onClose={() => setSectionModalOpen(false)}
        onAddSection={addSection}
      />

      {/* CV page wrapper */}
      <main className="min-h-screen pt-8 pb-24 px-4 flex justify-center print:pt-0 print:pb-0 print:px-0 print:block print:min-h-0 print:bg-white">
        <div
          id="cv-document"
          className="bg-white w-full max-w-4xl mx-auto shadow-lg rounded-sm px-9 py-8 font-sans text-gray-800 leading-normal print:shadow-none print:rounded-none print:max-w-full print:px-0 print:py-0"
        >
          <HeaderSection header={cv.header} onChange={updateHeader} />

          {cv.sections.map((section, sIdx) => (
            <div key={section.id}>
              <hr className="border-t border-gray-300 mb-2" />
              <section className="mb-3">
                <div className="flex items-center gap-1 mb-3">
                  <div className="no-print flex items-center gap-1">
                    <ReorderButtons index={sIdx} total={cv.sections.length} onMove={(d: -1 | 1) => moveSection(sIdx, d)} />
                    <DeleteButton onClick={() => deleteSection(sIdx)} title="Delete section" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-800 flex-1">
                    <EditableText
                      value={section.title}
                      onChange={(v: string) => updateSection(sIdx, { ...section, title: v })}
                      className="text-lg font-bold text-gray-800"
                      placeholder="SECTION TITLE"
                    />
                  </h2>
                </div>
                <SectionContent
                  section={section}
                  onChangeItem={(iIdx, item) => changeItem(sIdx, iIdx, item)}
                  onMoveItem={(iIdx, d) => moveItem_(sIdx, iIdx, d)}
                  onDeleteItem={(iIdx) => deleteItem(sIdx, iIdx)}
                  onAddItem={() => addItem(sIdx)}
                />
              </section>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
