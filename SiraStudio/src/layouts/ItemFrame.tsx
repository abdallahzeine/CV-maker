import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Density } from '../types';
import { ReorderButtons, DeleteButton } from './Buttons';

interface ItemFrameProps {
  itemId: string;
  density: Density;
  index: number;
  total: number;
  onMove: (d: -1 | 1) => void;
  onDelete: () => void;
  children: React.ReactNode;
  hideControls?: boolean;
}

const densityClass: Record<Density, string> = {
  compact: 'mb-1',
  normal: 'mb-2',
  relaxed: 'mb-4',
};

export function ItemFrame({ itemId, density, index, total, onMove, onDelete, children, hideControls = false }: ItemFrameProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: itemId });

  const baseTransform = CSS.Transform.toString(transform);
  const style: React.CSSProperties = {
    transform: isDragging ? `${baseTransform ?? ''} scale(1.02)`.trim() : (baseTransform ?? undefined),
    transition,
    opacity: isDragging ? 0.85 : 1,
    boxShadow: isDragging ? '0 8px 25px rgba(0,0,0,0.12)' : undefined,
    zIndex: isDragging ? 10 : undefined,
    position: isDragging ? 'relative' : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`avoid-break group animate-item-in ${densityClass[density]}`}
    >
      <div className="flex items-start gap-1">
        {!hideControls && (
          <div className="no-print flex items-center gap-1 pt-0.5 shrink-0">
            <ReorderButtons
              index={index}
              total={total}
              onMove={onMove}
              dragHandleProps={{ ...listeners }}
            />
            <DeleteButton onClick={onDelete} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          {children}
        </div>
      </div>
    </div>
  );
}
