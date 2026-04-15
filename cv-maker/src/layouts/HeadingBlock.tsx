import type { DateSlot } from '../types';
import { EditableText } from './EditableText';

interface HeadingBlockProps {
  title: string;
  onChangeTitle: (v: string) => void;
  subtitle?: string;
  onChangeSubtitle?: (v: string) => void;
  role?: string;
  onChangeRole?: (v: string) => void;
  location?: string;
  onChangeLocation?: (v: string) => void;
  date?: string;
  onChangeDate?: (v: string) => void;
  dateSlot: DateSlot;
  titleClassName?: string;
  subtitleClassName?: string;
}

export function HeadingBlock({
  title, onChangeTitle,
  subtitle, onChangeSubtitle,
  role, onChangeRole,
  location, onChangeLocation,
  date, onChangeDate,
  dateSlot,
  titleClassName = 'text-base font-semibold',
  subtitleClassName = 'text-gray-700 text-sm',
}: HeadingBlockProps) {
  const dateEl = (date !== undefined && dateSlot !== 'hidden') ? (
    <span className="text-gray-600 text-sm whitespace-nowrap">
      {onChangeDate
        ? <EditableText value={date} onChange={onChangeDate} placeholder="MM/YYYY" />
        : date}
    </span>
  ) : null;

  const locationEl = location !== undefined && onChangeLocation ? (
    <EditableText value={location} onChange={onChangeLocation} placeholder="City, Country" className="text-gray-500" />
  ) : null;

  const subtitleEl = (subtitle !== undefined && onChangeSubtitle) ? (
    <p className={subtitleClassName}>
      <EditableText value={subtitle} onChange={onChangeSubtitle} placeholder="Subtitle" />
      {locationEl && (
        <> <span className="text-gray-400">·</span> {locationEl}</>
      )}
    </p>
  ) : locationEl ? (
    <p className={subtitleClassName}>{locationEl}</p>
  ) : null;

  const roleEl = role !== undefined && onChangeRole ? (
    <p className={subtitleClassName}>
      <EditableText value={role} onChange={onChangeRole} placeholder="Role" />
    </p>
  ) : null;

  const titleEl = (
    <h3 className={`${titleClassName} leading-tight`}>
      <EditableText value={title} onChange={onChangeTitle} placeholder="Title" />
    </h3>
  );

  if (dateSlot === 'right-inline') {
    return (
      <div className="flex flex-wrap justify-between items-start gap-x-2 text-left">
        <div>
          {titleEl}
          {subtitleEl}
          {roleEl}
        </div>
        {dateEl && <div className="mt-0.5 ml-4 shrink-0">{dateEl}</div>}
      </div>
    );
  }

  if (dateSlot === 'left-margin') {
    const hasDate = date && date.trim() !== '';
    return (
      <div className="text-left">
        <h3 className={`${titleClassName} leading-tight`}>
          <EditableText value={title} onChange={onChangeTitle} placeholder="Title" />
          {hasDate && <span className="text-gray-400 mx-1">–</span>}
          {hasDate && dateEl}
        </h3>
        {subtitleEl}
        {roleEl}
      </div>
    );
  }

  // below-title or hidden
  return (
    <div className="text-left">
      {titleEl}
      {dateSlot === 'below-title' && dateEl}
      {subtitleEl}
      {roleEl}
    </div>
  );
}
