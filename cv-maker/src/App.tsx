import { useState, useCallback, useRef, useEffect } from 'react';
import { initialCVData } from './data/initialCVData';
import type { CVData, CVItem, CVSection, AISettings } from './types';
import { SERVER_URL } from './constants/config';
import { moveItem, uid, applyPatch, newItem } from './utils/helpers';
import { loadSettings, loadSettingsFromAPI, saveSettingsToAPI, loadCVData, saveCVData, clearCVData } from './utils/settings';
import { Toolbar, AIChatSidebar, HeaderSection, SectionContent, EditableText, ReorderButtons, SettingsModal, SectionModal, DeleteButton } from './components';

export default function App() {
  const [cv, setCv] = useState<CVData>(() => loadCVData());
  const [sessionId] = useState<string>(() => crypto.randomUUID());
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sectionModalOpen, setSectionModalOpen] = useState(false);
  const [aiSettings, setAiSettings] = useState<AISettings>(loadSettings);
  const [chatMessages, setChatMessages] = useState<{ id: string; role: 'user' | 'assistant' | 'error' | 'thinking'; text: string }[]>([]);
  const [sidebarWidth, setSidebarWidth] = useState(420);
  const [planMode, setPlanMode] = useState(true);
  const [pendingActions, setPendingActions] = useState<any[]>([]);
  const cvRef = useRef(cv);
  cvRef.current = cv;

  // Load settings from backend on mount
  useEffect(() => {
    loadSettingsFromAPI(sessionId).then((settings) => {
      setAiSettings(settings);
    });
  }, [sessionId]);

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
      // Don't delete if it's the last section
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

  // Opens the chat sidebar pre-filled with a prompt for a specific section
  const openChatForSection = useCallback((sectionTitle: string) => {
    setAiInput(`How can I improve the ${sectionTitle} section of my CV?`);
    setChatOpen(true);
  }, []);

  const handlePrint = () => window.print();

  const handleReset = () => {
    if (window.confirm('Reset CV to original data? All changes will be lost.')) {
      clearCVData();
      setCv(initialCVData);
    }
  };

  const handleSaveSettings = useCallback(async (settings: AISettings) => {
    await saveSettingsToAPI(sessionId, settings);
    setAiSettings(settings);
  }, [sessionId]);

  const handleAISubmit = useCallback(async () => {
    const instruction = aiInput.trim();
    if (!instruction || aiLoading) return;

    setChatMessages((prev) => [...prev, { id: uid(), role: 'user', text: instruction }]);
    setAiInput('');
    setAiLoading(true);

    try {
      const res = await fetch(`${SERVER_URL}/agent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sessionId, 
          instruction, 
          cv: cvRef.current, 
          planMode,
          settings: aiSettings,
        }),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      const { actions, content } = data;
      console.log('[AI] actions received:', actions);
      console.log('[AI] content received:', content);

      let thinkingText = '';

      if (planMode) {
        console.log('[AI] Setting pendingActions from server, planMode=true, actions:', JSON.stringify(actions));
        const pending = actions.filter((a: any) => a.action !== 'thinking');
        setPendingActions(pending);
        for (const act of actions) {
          if (act.action === 'thinking') thinkingText = act.text;
        }
        if (thinkingText) {
          setChatMessages((prev) => [...prev, { id: uid(), role: 'thinking', text: thinkingText }]);
        }
        const desc = pending.length > 0 
          ? `I'll make ${pending.length} change${pending.length > 1 ? 's' : ''}. Review and click Execute to apply.`
          : 'No changes needed.';
        setChatMessages((prev) => [...prev, { id: uid(), role: 'assistant', text: content?.trim() || desc }]);
      } else {
        const applied: string[] = [];
        setCv((prev) => {
          let current: CVData = prev;
          for (const act of actions as any[]) {
            if (act.action === 'thinking') { thinkingText = act.text; continue; }
            
            // Handle section-level actions (add/delete sections) in Edit Mode
            if (act.action === 'addSection') {
              current = {
                ...current,
                sections: [...current.sections, act.section],
              };
              applied.push(`Added ${act.section.title} section`);
            } else if (act.action === 'deleteSection') {
              if (current.sections.length > 1) {
                const deletedSection = current.sections[act.index];
                current = {
                  ...current,
                  sections: current.sections.filter((_, i) => i !== act.index),
                };
                applied.push(`Deleted ${deletedSection?.title || 'section'} (index ${act.index})`);
              } else {
                applied.push('Cannot delete the last section');
              }
            } else {
              // Handle item-level actions
              const result = applyPatch(current, act);
              if (result) { current = result.next as CVData; applied.push(result.desc); }
              else console.warn('[AI] Failed to apply:', act);
            }
          }
          return current;
        });

        if (thinkingText) {
          setChatMessages((prev) => [...prev, { id: uid(), role: 'thinking', text: thinkingText }]);
        }

        const responseText = content && content.trim() 
          ? content.trim()
          : applied.length > 0
            ? `Here's what changed:\n${applied.map((a) => `• ${a}`).join('\n')}`
            : actions.filter((a: any) => a.action !== 'thinking').length > 0
            ? 'The CV was updated.'
            : 'No changes were needed.';

        setChatMessages((prev) => [...prev, { id: uid(), role: 'assistant', text: responseText }]);
      }
    } catch (err: any) {
      console.error('[AI] Error:', err);
      setChatMessages((prev) => [...prev, { id: uid(), role: 'error', text: `Error: ${err.message}` }]);
    } finally {
      setAiLoading(false);
    }
  }, [aiInput, aiLoading, sessionId, planMode, aiSettings]);

  const handleExecute = useCallback(() => {
    console.log('[handleExecute] pendingActions:', JSON.stringify(pendingActions));
    const applied: string[] = [];
    setCv((prev) => {
      let current: CVData = prev;
      for (const act of pendingActions) {
        console.log('[handleExecute] Processing action:', JSON.stringify(act));
        // Handle section-level actions (add/delete sections)
        if (act.action === 'addSection') {
          current = {
            ...current,
            sections: [...current.sections, act.section],
          };
          applied.push(`Added ${act.section.title} section`);
        } else if (act.action === 'deleteSection') {
          console.log('[handleExecute] deleteSection - index:', act.index, 'current sections:', current.sections.length);
          if (current.sections.length > 1) {
            const deletedSection = current.sections[act.index];
            current = {
              ...current,
              sections: current.sections.filter((_, i) => i !== act.index),
            };
            applied.push(`Deleted ${deletedSection?.title || 'section'} (index ${act.index})`);
          } else {
            applied.push('Cannot delete the last section');
          }
        } else {
          // Handle item-level actions
          const result = applyPatch(current, act);
          if (result) { current = result.next as CVData; applied.push(result.desc); }
          else console.warn('[AI] Failed to apply:', act);
        }
      }
      return current;
    });
    setPendingActions([]);
    setChatMessages((prev) => [...prev, { 
      id: uid(), 
      role: 'assistant', 
      text: applied.length > 0 
        ? `Executed:\n${applied.map((a) => `• ${a}`).join('\n')}`
        : 'No changes to execute.'
    }]);
  }, [pendingActions]);

  return (
    <>
      <AIChatSidebar
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        messages={chatMessages}
        value={aiInput}
        onChange={setAiInput}
        onSubmit={handleAISubmit}
        loading={aiLoading}
        sidebarWidth={sidebarWidth}
        setSidebarWidth={setSidebarWidth}
        planMode={planMode}
        setPlanMode={setPlanMode}
        pendingActions={pendingActions}
        onExecute={handleExecute}
      />

      <Toolbar 
        onOpenChat={() => setChatOpen((o) => !o)}
        onOpenSettings={() => setSettingsOpen(true)}
        onReset={handleReset}
        onPrint={handlePrint}
        onAddSection={() => setSectionModalOpen(true)}
        chatBadge={chatMessages.filter((m) => m.role === 'assistant').length}
        chatOpen={chatOpen}
        sidebarWidth={sidebarWidth}
      />

      <SectionModal
        isOpen={sectionModalOpen}
        onClose={() => setSectionModalOpen(false)}
        onAddSection={addSection}
      />

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={aiSettings}
        onSave={handleSaveSettings}
      />

      {/* CV page wrapper */}
      <main className="min-h-screen pt-8 pb-24 px-4 flex justify-center print:pt-0 print:pb-0 print:px-0 print:block print:min-h-0 print:bg-white transition-all duration-300" style={chatOpen ? { paddingRight: `${sidebarWidth + 16}px` } : {}}>
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
                  {/* Magic wand — opens AI chat pre-filled for this section */}
                  <button
                    onClick={() => openChatForSection(section.title)}
                    title={`Improve ${section.title} with AI`}
                    className="no-print opacity-0 group-hover:opacity-100 hover:opacity-100 ml-1 w-6 h-6 flex items-center justify-center text-violet-400 hover:text-violet-600 hover:bg-violet-50 rounded-md transition-all text-sm"
                  >
                    ✦
                  </button>
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
