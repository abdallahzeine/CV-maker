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
import type { IconStyle } from '../types';
import { EditableText } from './EditableText';
import { ReorderButtons, DeleteButton, AddButton } from './Buttons';
import { moveItem } from '../utils/helpers';

interface BulletListProps {
  bullets: string[];
  onChange: (bullets: string[]) => void;
  iconStyle: IconStyle;
}

const iconChar: Record<IconStyle, string> = {
  none: '',
  bullet: '•',
  dash: '–',
  chevron: '›',
};

function SortableBullet({
  bulletId,
  icon,
  value,
  index,
  total,
  onUpdate,
  onMove,
  onDelete,
}: {
  bulletId: string;
  icon: string;
  value: string;
  index: number;
  total: number;
  onUpdate: (v: string) => void;
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
  } = useSortable({ id: bulletId });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <li ref={setNodeRef} style={style} {...attributes} className="flex items-start gap-1 group/bullet">
      {icon && <span className="shrink-0 select-none mt-0.5">{icon}</span>}
      <div className="no-print flex items-center gap-0.5 shrink-0">
        <ReorderButtons
          index={index}
          total={total}
          onMove={onMove}
          dragHandleProps={{ ...listeners }}
        />
        <DeleteButton onClick={onDelete} title="Delete bullet" />
      </div>
      <EditableText multiline value={value} onChange={onUpdate} placeholder="Bullet point..." className="flex-1" />
    </li>
  );
}

export function BulletList({ bullets, onChange, iconStyle }: BulletListProps) {
  const icon = iconChar[iconStyle];

  const bulletIds = useMemo(
    () => bullets.map((_, i) => `bullet-${i}`),
    [bullets]
  );

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
      const oldIndex = bulletIds.indexOf(active.id as string);
      const newIndex = bulletIds.indexOf(over.id as string);
      if (oldIndex !== -1 && newIndex !== -1) {
        onChange(arrayMove(bullets, oldIndex, newIndex));
      }
    }
  }, [bullets, bulletIds, onChange]);

  const updateBullet = (i: number, v: string) => {
    const next = [...bullets];
    next[i] = v;
    onChange(next);
  };
  const addBullet = () => onChange([...bullets, 'New bullet point.']);
  const deleteBullet = (i: number) => onChange(bullets.filter((_, j) => j !== i));
  const moveBullet = (i: number, delta: -1 | 1) => onChange(moveItem(bullets, i, delta));

  return (
    <div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={bulletIds} strategy={verticalListSortingStrategy}>
          <ul className={`${icon ? 'list-none' : ''} ml-${icon ? '8' : '0'} text-gray-700 text-sm mt-0.5 space-y-0.5`}>
            {bullets.map((b, i) => (
              <SortableBullet
                key={bulletIds[i]}
                bulletId={bulletIds[i]}
                icon={icon}
                value={b}
                index={i}
                total={bullets.length}
                onUpdate={(v) => updateBullet(i, v)}
                onMove={(d) => moveBullet(i, d)}
                onDelete={() => deleteBullet(i)}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
      <AddButton onClick={addBullet} label="Add bullet" />
    </div>
  );
}
