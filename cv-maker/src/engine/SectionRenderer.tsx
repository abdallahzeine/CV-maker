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
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import type { CVSection, CVItem } from '../types';
import { sectionRegistry } from '../sections/registry';
import { AddButton } from '../layouts/Buttons';

interface SectionRendererProps {
  section: CVSection;
  onChangeItem: (i: number, item: CVItem) => void;
  onMoveItem: (i: number, d: -1 | 1) => void;
  onReorderItems: (oldIndex: number, newIndex: number) => void;
  onDeleteItem: (i: number) => void;
  onAddItem: () => void;
}

export function SectionRenderer({
  section,
  onChangeItem,
  onMoveItem,
  onReorderItems,
  onDeleteItem,
  onAddItem,
}: SectionRendererProps) {
  const def = sectionRegistry[section.type] ?? sectionRegistry.custom;
  const { items, layout, schema } = section;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        onReorderItems(oldIndex, newIndex);
      }
    }
  }, [items, onReorderItems]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map((item) => item.id)}
        strategy={verticalListSortingStrategy}
      >
        {items.map((item, idx) =>
          def.renderItem({
            item,
            layout,
            index: idx,
            total: items.length,
            onChange: (i: CVItem) => onChangeItem(idx, i),
            onMove: (d: -1 | 1) => onMoveItem(idx, d),
            onDelete: () => onDeleteItem(idx),
            schema,
          })
        )}
      </SortableContext>
      {!def.singleItem && (
        <AddButton onClick={onAddItem} label={def.addItemLabel} />
      )}
    </DndContext>
  );
}
