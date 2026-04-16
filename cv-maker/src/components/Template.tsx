import { useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { CVData, CVSection, CVItem, SocialLink } from '../types';
import { EditableText } from '../layouts/EditableText';
import { ReorderButtons, DeleteButton } from '../layouts/Buttons';
import { LinkManager } from './links';
import { SectionRenderer } from '../engine/SectionRenderer';
import { SingleColumn } from '../templates/SingleColumn';
import { SidebarLayout } from '../templates/SidebarLayout';


// ============================================================================
// Header Section
// ============================================================================

interface HeaderSectionProps {
  header: CVData['header'];
  onChange: (h: CVData['header']) => void;
}

export function HeaderSection({ header, onChange }: HeaderSectionProps) {
  const update = (key: keyof CVData['header'], value: string | SocialLink[] | undefined) =>
    onChange({ ...header, [key]: value });

  return (
    <header className="text-center mb-2">
      <h1 className="text-4xl font-bold text-gray-900 mb-1">
        <EditableText
          value={header.name}
          onChange={(v) => update('name', v)}
          className="text-4xl font-bold text-gray-900"
          placeholder="Your Name"
        />
      </h1>
      {header.headline !== undefined ? (
        <p className="text-sm text-gray-500 mb-2">
          <EditableText
            value={header.headline}
            onChange={(v) => update('headline', v)}
            placeholder="e.g. Full-Stack Engineer | 4 Years Experience"
            className="text-sm text-gray-500"
          />
        </p>
      ) : (
        <button
          className="no-print text-xs text-gray-400 hover:text-gray-600 mb-2 underline underline-offset-2"
          onClick={() => update('headline', '')}
        >
          + Add headline
        </button>
      )}
      <div className="flex flex-wrap justify-center items-center gap-4 text-sm text-gray-600 mb-3">
        <div className="flex items-center gap-1">
          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          <EditableText value={header.location} onChange={(v) => update('location', v)} placeholder="City, Country" />
        </div>
        <div className="flex items-center gap-1">
          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
          </svg>
          <EditableText value={header.phone} onChange={(v) => update('phone', v)} placeholder="+1 234 567 890" />
        </div>
        <div className="flex items-center gap-1">
          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
          </svg>
          <EditableText value={header.email} onChange={(v) => update('email', v)} placeholder="email@example.com" className="text-blue-600" />
        </div>
      </div>
      <LinkManager
        links={header.socialLinks || []}
        onChange={(links) => update('socialLinks', links)}
        layout="compact"
      />
    </header>
  );
}

// ============================================================================
// CVDocument — assembles the full CV using the selected page template
// ============================================================================

type PanelType = 'layout-settings';

interface CVDocumentProps {
  cv: CVData;
  onUpdateHeader: (h: CVData['header']) => void;
  onUpdateSection: (sIdx: number, updated: CVSection) => void;
  onMoveSection: (sIdx: number, delta: -1 | 1) => void;
  onDeleteSection: (sIdx: number) => void;
  onReorderSections: (oldIndex: number, newIndex: number) => void;
  onChangeItem: (sIdx: number, iIdx: number, item: CVItem) => void;
  onMoveItem: (sIdx: number, iIdx: number, delta: -1 | 1) => void;
  onReorderItems: (sIdx: number, oldIndex: number, newIndex: number) => void;
  onDeleteItem: (sIdx: number, iIdx: number) => void;
  onAddItem: (sIdx: number) => void;
  onOpenPanel: (type: PanelType, sectionId?: string) => void;
}

function SectionShell({
  section,
  sIdx,
  total,
  onUpdateSection,
  onMoveSection,
  onDeleteSection,
  onChangeItem,
  onMoveItem,
  onReorderItems,
  onDeleteItem,
  onAddItem,
  onOpenPanel,
}: {
  section: CVSection;
  sIdx: number;
  total: number;
  onUpdateSection: (sIdx: number, updated: CVSection) => void;
  onMoveSection: (sIdx: number, delta: -1 | 1) => void;
  onDeleteSection: (sIdx: number) => void;
  onChangeItem: (sIdx: number, iIdx: number, item: CVItem) => void;
  onMoveItem: (sIdx: number, iIdx: number, delta: -1 | 1) => void;
  onReorderItems: (oldIndex: number, newIndex: number) => void;
  onDeleteItem: (sIdx: number, iIdx: number) => void;
  onAddItem: (sIdx: number) => void;
  onOpenPanel: (type: PanelType, sectionId?: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <hr className="border-t border-gray-300 mb-2" />
      <section className="mb-3">
        <div className="flex items-center gap-1 mb-3">
          <div className="no-print flex items-center gap-1">
            <ReorderButtons
              index={sIdx}
              total={total}
              onMove={(d) => onMoveSection(sIdx, d)}
              dragHandleProps={{ ...listeners }}
            />
            <DeleteButton onClick={() => onDeleteSection(sIdx)} title="Delete section" />
          </div>
          <h2 className="text-lg font-bold text-gray-800 flex-1">
            <EditableText
              value={section.title}
              onChange={(v) => onUpdateSection(sIdx, { ...section, title: v })}
              className="text-lg font-bold text-gray-800"
              placeholder="SECTION TITLE"
            />
          </h2>
          <button
            onClick={() => onOpenPanel('layout-settings', section.id)}
            title="Layout settings"
            className="no-print w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
        <SectionRenderer
          section={section}
          onChangeItem={(iIdx, item) => onChangeItem(sIdx, iIdx, item)}
          onMoveItem={(iIdx, d) => onMoveItem(sIdx, iIdx, d)}
          onReorderItems={onReorderItems}
          onDeleteItem={(iIdx) => onDeleteItem(sIdx, iIdx)}
          onAddItem={() => onAddItem(sIdx)}
        />
      </section>
    </div>
  );
}

export function CVDocument({
  cv,
  onUpdateHeader,
  onUpdateSection,
  onMoveSection,
  onDeleteSection,
  onReorderSections,
  onChangeItem,
  onMoveItem,
  onReorderItems,
  onDeleteItem,
  onAddItem,
  onOpenPanel,
}: CVDocumentProps) {
  const TemplateShell =
    cv.template.id === 'single-column' ? SingleColumn : SidebarLayout;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleSectionDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = cv.sections.findIndex((s) => s.id === active.id);
      const newIndex = cv.sections.findIndex((s) => s.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        onReorderSections(oldIndex, newIndex);
      }
    }
  }, [cv.sections, onReorderSections]);

  return (
    <TemplateShell>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleSectionDragEnd}
      >
        <SortableContext
          items={cv.sections.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <HeaderSection header={cv.header} onChange={onUpdateHeader} />
          {cv.sections.map((section, sIdx) => (
            <SectionShell
              key={section.id}
              section={section}
              sIdx={sIdx}
              total={cv.sections.length}
              onUpdateSection={onUpdateSection}
              onMoveSection={onMoveSection}
              onDeleteSection={onDeleteSection}
              onChangeItem={onChangeItem}
              onMoveItem={onMoveItem}
              onReorderItems={(oldIndex, newIndex) => onReorderItems(sIdx, oldIndex, newIndex)}
              onDeleteItem={onDeleteItem}
              onAddItem={onAddItem}
              onOpenPanel={onOpenPanel}
            />
          ))}
        </SortableContext>
      </DndContext>
    </TemplateShell>
  );
}
