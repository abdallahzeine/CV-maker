import type { CVData, CVItem, CVSection, SkillGroup, SocialLink } from '../types';
import { moveItem, uid } from '../utils/helpers';
import { LinkManager } from './links';

// ============================================================================
// Basic UI Components
// ============================================================================

interface EditableTextProps {
  value: string;
  onChange: (v: string) => void;
  className?: string;
  multiline?: boolean;
  placeholder?: string;
}

export function EditableText({
  value,
  onChange,
  className = '',
  multiline = false,
  placeholder = 'Click to edit...',
}: EditableTextProps) {
  if (multiline) {
    return (
      <div
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => onChange(e.currentTarget.innerHTML)}
        dangerouslySetInnerHTML={{ __html: value }}
        data-placeholder={placeholder}
        className={`min-h-[1em] ${className} empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400`}
      />
    );
  }
  return (
    <span
      contentEditable
      suppressContentEditableWarning
      onBlur={(e) => onChange(e.currentTarget.textContent ?? '')}
      data-placeholder={placeholder}
      className={`inline-block min-w-[40px] ${className} empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400`}
    >
      {value}
    </span>
  );
}

interface ReorderButtonsProps {
  index: number;
  total: number;
  onMove: (delta: -1 | 1) => void;
}

export function ReorderButtons({ index, total, onMove }: ReorderButtonsProps) {
  return (
    <div className="no-print flex flex-col gap-0.5">
      <button onClick={() => onMove(-1)} disabled={index === 0} title="Move up"
        className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-700 disabled:opacity-20 disabled:cursor-not-allowed text-xs leading-none">▲</button>
      <button onClick={() => onMove(1)} disabled={index === total - 1} title="Move down"
        className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-700 disabled:opacity-20 disabled:cursor-not-allowed text-xs leading-none">▼</button>
    </div>
  );
}

interface DeleteButtonProps {
  onClick: () => void;
  title?: string;
}

export function DeleteButton({ onClick, title = 'Delete' }: DeleteButtonProps) {
  return (
    <button onClick={onClick} title={title}
      className="no-print w-5 h-5 flex items-center justify-center text-red-300 hover:text-red-600 text-sm leading-none">✕</button>
  );
}

interface AddButtonProps {
  onClick: () => void;
  label: string;
}

export function AddButton({ onClick, label }: AddButtonProps) {
  return (
    <button onClick={onClick}
      className="no-print mt-1 text-xs text-blue-500 hover:text-blue-700 border border-dashed border-blue-300 hover:border-blue-500 rounded px-2 py-0.5 transition-colors">
      + {label}
    </button>
  );
}

// ============================================================================
// Header Section
// ============================================================================

interface HeaderSectionProps {
  header: CVData['header'];
  onChange: (h: CVData['header']) => void;
}

export function HeaderSection({ header, onChange }: HeaderSectionProps) {
  const update = (key: keyof CVData['header'], value: string | SocialLink[]) =>
    onChange({ ...header, [key]: value });

  return (
    <header className="text-center mb-2">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">
        <EditableText value={header.name} onChange={(v) => update('name', v)} className="text-4xl font-bold text-gray-900" placeholder="Your Name" />
      </h1>
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
      
      {/* Social Links */}
      <LinkManager 
        links={header.socialLinks || []} 
        onChange={(links) => update('socialLinks', links)}
        layout="compact"
      />
    </header>
  );
}

// ============================================================================
// Summary Item
// ============================================================================

interface SummaryItemProps {
  item: CVItem;
  onChange: (i: CVItem) => void;
}

export function SummaryItem({ item, onChange }: SummaryItemProps) {
  return (
    <p className="text-gray-700 text-sm leading-relaxed">
      <EditableText multiline value={item.body ?? ''} onChange={(v) => onChange({ ...item, body: v })}
        placeholder="Write your professional summary..." className="text-gray-700 text-sm leading-relaxed" />
    </p>
  );
}

// ============================================================================
// Education Item
// ============================================================================

interface EducationItemProps {
  item: CVItem;
  index: number;
  total: number;
  onChange: (i: CVItem) => void;
  onMove: (d: -1 | 1) => void;
  onDelete: () => void;
}

export function EducationItem({ item, index, total, onChange, onMove, onDelete }: EducationItemProps) {
  return (
    <div className="flex items-start gap-1 mb-1 avoid-break group">
      <div className="no-print flex items-center gap-1 pt-0.5">
        <ReorderButtons index={index} total={total} onMove={onMove} />
        <DeleteButton onClick={onDelete} />
      </div>
      <div className="flex-1 flex justify-between items-start">
        <div>
          <h3 className="text-base font-semibold">
            <EditableText value={item.title ?? ''} onChange={(v) => onChange({ ...item, title: v })} placeholder="Degree / Certificate" />
          </h3>
          <p className="text-gray-700 text-sm">
            <EditableText value={item.subtitle ?? ''} onChange={(v) => onChange({ ...item, subtitle: v })} placeholder="Institution · GPA" />
          </p>
        </div>
        <p className="text-gray-600 text-sm mt-1 whitespace-nowrap ml-4">
          <EditableText value={item.date ?? ''} onChange={(v) => onChange({ ...item, date: v })} placeholder="MM/YYYY" />
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// Skills Item
// ============================================================================

interface SkillsItemProps {
  item: CVItem;
  onChange: (i: CVItem) => void;
}

export function SkillsItem({ item, onChange }: SkillsItemProps) {
  const groups = item.skillGroups ?? [];
  const updateGroup = (idx: number, sg: SkillGroup) => {
    const next = [...groups]; next[idx] = sg;
    onChange({ ...item, skillGroups: next });
  };
  const addGroup = () => onChange({ ...item, skillGroups: [...groups, { id: uid(), label: 'Category', value: 'Skills...' }] });
  const deleteGroup = (idx: number) => onChange({ ...item, skillGroups: groups.filter((_, i) => i !== idx) });
  const moveGroup = (idx: number, delta: -1 | 1) => onChange({ ...item, skillGroups: moveItem(groups, idx, delta) });

  return (
    <div className="text-gray-700 text-sm space-y-0.5">
      {groups.map((sg, idx) => (
        <div key={sg.id} className="flex items-center gap-1 group">
          <div className="no-print flex items-center gap-1">
            <ReorderButtons index={idx} total={groups.length} onMove={(d) => moveGroup(idx, d)} />
            <DeleteButton onClick={() => deleteGroup(idx)} />
          </div>
          <p>
            <strong className="font-semibold">
              <EditableText value={sg.label} onChange={(v) => updateGroup(idx, { ...sg, label: v })} placeholder="Category" />
              {': '}
            </strong>
            <EditableText value={sg.value} onChange={(v) => updateGroup(idx, { ...sg, value: v })} placeholder="skill1, skill2" />
          </p>
        </div>
      ))}
      <AddButton onClick={addGroup} label="Add skill category" />
    </div>
  );
}

// ============================================================================
// Certifications / Awards Item
// ============================================================================

interface TitledDateItemProps {
  item: CVItem;
  index: number;
  total: number;
  onChange: (i: CVItem) => void;
  onMove: (d: -1 | 1) => void;
  onDelete: () => void;
}

export function TitledDateItem({ item, index, total, onChange, onMove, onDelete }: TitledDateItemProps) {
  return (
    <div className="mb-1 avoid-break group flex items-start gap-1">
      <div className="no-print flex items-center gap-1 pt-0.5">
        <ReorderButtons index={index} total={total} onMove={onMove} />
        <DeleteButton onClick={onDelete} />
      </div>
      <div className="flex-1">
        <div className="flex flex-wrap justify-between items-baseline gap-x-2">
          <h3 className="text-base font-semibold leading-tight">
            <EditableText value={item.title ?? ''} onChange={(v) => onChange({ ...item, title: v })} placeholder="Title" />
          </h3>
          <p className="text-gray-600 text-sm text-right whitespace-nowrap leading-tight">
            <EditableText value={item.date ?? ''} onChange={(v) => onChange({ ...item, date: v })} placeholder="MM/YYYY" />
          </p>
        </div>
        <p className="text-gray-700 text-sm">
          <EditableText value={item.subtitle ?? ''} onChange={(v) => onChange({ ...item, subtitle: v })} placeholder="Organization / Issuer" />
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// Project Item
// ============================================================================

interface ProjectItemProps {
  item: CVItem;
  index: number;
  total: number;
  onChange: (i: CVItem) => void;
  onMove: (d: -1 | 1) => void;
  onDelete: () => void;
}

export function ProjectItem({ item, index, total, onChange, onMove, onDelete }: ProjectItemProps) {
  const bullets = item.bullets ?? [];
  const updateBullet = (i: number, v: string) => { const next = [...bullets]; next[i] = v; onChange({ ...item, bullets: next }); };
  const addBullet = () => onChange({ ...item, bullets: [...bullets, 'New bullet point.'] });
  const deleteBullet = (i: number) => onChange({ ...item, bullets: bullets.filter((_, j) => j !== i) });
  const moveBullet = (i: number, delta: -1 | 1) => onChange({ ...item, bullets: moveItem(bullets, i, delta) });

  return (
    <div className="mb-4 avoid-break group">
      <div className="flex items-start gap-1">
        <div className="no-print flex items-center gap-1 pt-0.5">
          <ReorderButtons index={index} total={total} onMove={onMove} />
          <DeleteButton onClick={onDelete} title="Delete project" />
        </div>
        <h3 className="text-base font-semibold flex-1">
          <EditableText value={item.title ?? ''} onChange={(v) => onChange({ ...item, title: v })} placeholder="Project Name" />
        </h3>
      </div>
      <ul className="list-none ml-8 text-gray-700 text-sm mt-0.5 space-y-0.5">
        {bullets.map((b, i) => (
          <li key={i} className="flex items-start gap-1 group/bullet">
            <span className="shrink-0 select-none">•</span>
            <div className="no-print flex items-center gap-0.5 shrink-0">
              <ReorderButtons index={i} total={bullets.length} onMove={(d) => moveBullet(i, d)} />
              <DeleteButton onClick={() => deleteBullet(i)} title="Delete bullet" />
            </div>
            <EditableText multiline value={b} onChange={(v) => updateBullet(i, v)} placeholder="Bullet point..." className="flex-1" />
          </li>
        ))}
      </ul>
      <AddButton onClick={addBullet} label="Add bullet" />
    </div>
  );
}

// ============================================================================
// Volunteering Item
// ============================================================================

interface VolunteeringItemProps {
  item: CVItem;
  index: number;
  total: number;
  onChange: (i: CVItem) => void;
  onMove: (d: -1 | 1) => void;
  onDelete: () => void;
}

export function VolunteeringItem({ item, index, total, onChange, onMove, onDelete }: VolunteeringItemProps) {
  return (
    <div className="mb-1 avoid-break flex items-start gap-1 group">
      <div className="no-print flex items-center gap-1 pt-0.5">
        <ReorderButtons index={index} total={total} onMove={onMove} />
        <DeleteButton onClick={onDelete} />
      </div>
      <div className="flex-1">
        <div className="flex flex-wrap justify-between items-baseline gap-x-2">
          <div className="flex items-center gap-1 flex-wrap">
            <h3 className="text-base font-semibold leading-tight">
              <EditableText value={item.title ?? ''} onChange={(v) => onChange({ ...item, title: v })} placeholder="Organization" />
            </h3>
            <span className="text-gray-400">·</span>
            <p className="text-gray-700 text-sm">
              <EditableText value={item.role ?? ''} onChange={(v) => onChange({ ...item, role: v })} placeholder="Role" />
            </p>
          </div>
          <p className="text-gray-600 text-sm text-right whitespace-nowrap leading-tight">
            <EditableText value={item.date ?? ''} onChange={(v) => onChange({ ...item, date: v })} placeholder="MM/YYYY - MM/YYYY" />
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Section Content Renderer
// ============================================================================

interface SectionContentProps {
  section: CVSection;
  onChangeItem: (i: number, item: CVItem) => void;
  onMoveItem: (i: number, d: -1 | 1) => void;
  onDeleteItem: (i: number) => void;
  onAddItem: () => void;
}

export function SectionContent({ section, onChangeItem, onMoveItem, onDeleteItem, onAddItem }: SectionContentProps) {
  const { type, items } = section;
  if (type === 'summary') return <SummaryItem item={items[0]} onChange={(item) => onChangeItem(0, item)} />;
  if (type === 'skills') return <SkillsItem item={items[0]} onChange={(item) => onChangeItem(0, item)} />;
  return (
    <div>
      {items.map((item, idx) => {
        const props = {
          key: item.id, item, index: idx, total: items.length,
          onChange: (i: CVItem) => onChangeItem(idx, i),
          onMove: (d: -1 | 1) => onMoveItem(idx, d),
          onDelete: () => onDeleteItem(idx),
        };
        if (type === 'education') return <EducationItem {...props} />;
        if (type === 'certifications' || type === 'awards') return <TitledDateItem {...props} />;
        if (type === 'projects') return <ProjectItem {...props} />;
        if (type === 'volunteering') return <VolunteeringItem {...props} />;
        return null;
      })}
      <AddButton onClick={onAddItem} label={`Add ${type === 'certifications' ? 'certification' : type === 'awards' ? 'award' : type === 'volunteering' ? 'entry' : type === 'projects' ? 'project' : 'item'}`} />
    </div>
  );
}
