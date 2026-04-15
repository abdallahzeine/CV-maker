import { useCallback, useMemo } from 'react';
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
  arrayMove,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { CVItem, SkillGroup } from '../types';
import { EditableText } from './EditableText';
import { ReorderButtons, DeleteButton, AddButton } from './Buttons';
import { uid } from '../utils/helpers';

interface SkillGridProps {
  item: CVItem;
  onChange: (i: CVItem) => void;
}

function SortableSkillGroup({
  group,
  index,
  total,
  onUpdate,
  onMove,
  onDelete,
}: {
  group: SkillGroup;
  index: number;
  total: number;
  onUpdate: (sg: SkillGroup) => void;
  onMove: (d: -1 | 1) => void;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: group.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} className="flex items-center gap-1 group">
      <div className="no-print flex items-center gap-1">
        <ReorderButtons
          index={index}
          total={total}
          onMove={onMove}
          dragHandleProps={{ ...listeners }}
        />
        <DeleteButton onClick={onDelete} />
      </div>
      <p>
        <strong className="font-semibold">
          <EditableText value={group.label} onChange={(v) => onUpdate({ ...group, label: v })} placeholder="Category" />
          {': '}
        </strong>
        <EditableText value={group.value} onChange={(v) => onUpdate({ ...group, value: v })} placeholder="skill1, skill2" />
      </p>
    </div>
  );
}

export function SkillGrid({ item, onChange }: SkillGridProps) {
  const groups = useMemo(() => item.skillGroups ?? [], [item.skillGroups]);

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
      const oldIndex = groups.findIndex((g) => g.id === active.id);
      const newIndex = groups.findIndex((g) => g.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        onChange({ ...item, skillGroups: arrayMove(groups, oldIndex, newIndex) });
      }
    }
  }, [groups, item, onChange]);

  const updateGroup = (idx: number, sg: SkillGroup) => {
    const next = [...groups];
    next[idx] = sg;
    onChange({ ...item, skillGroups: next });
  };
  const addGroup = () =>
    onChange({ ...item, skillGroups: [...groups, { id: uid(), label: 'Category', value: 'Skills...' }] });
  const deleteGroup = (idx: number) =>
    onChange({ ...item, skillGroups: groups.filter((_, i) => i !== idx) });
  const moveGroup = (idx: number, delta: -1 | 1) => {
    const next = [...groups];
    const target = idx + delta;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange({ ...item, skillGroups: next });
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={groups.map((g) => g.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="text-gray-700 text-sm space-y-0.5">
          {groups.map((sg, idx) => (
            <SortableSkillGroup
              key={sg.id}
              group={sg}
              index={idx}
              total={groups.length}
              onUpdate={(updated) => updateGroup(idx, updated)}
              onMove={(d) => moveGroup(idx, d)}
              onDelete={() => deleteGroup(idx)}
            />
          ))}
          <AddButton onClick={addGroup} label="Add skill category" />
        </div>
      </SortableContext>
    </DndContext>
  );
}
