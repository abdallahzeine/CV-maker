import type { DateSlot } from '../types';
import { CVTextEditor } from '../editor/CVTextEditor';

interface HeadingBlockProps {
  title: string;
  titlePath: string;
  subtitle?: string;
  subtitlePath?: string;
  role?: string;
  rolePath?: string;
  location?: string;
  locationPath?: string;
  date?: string;
  datePath?: string;
  dateSlot: DateSlot;
  titleClassName?: string;
  subtitleClassName?: string;
}

export function HeadingBlock({
  title, titlePath,
  subtitle, subtitlePath,
  role, rolePath,
  location, locationPath,
  date, datePath,
  dateSlot,
  titleClassName = 'text-base font-semibold',
  subtitleClassName = 'text-gray-700 text-sm',
}: HeadingBlockProps) {
  const dateEl = (date !== undefined && dateSlot !== 'hidden') ? (
    <span className="text-gray-600 text-sm whitespace-nowrap">
      {datePath
        ? <CVTextEditor value={date} path={datePath} placeholder="MM/YYYY" />
        : date}
    </span>
  ) : null;

  const locationEl = location !== undefined && locationPath ? (
    <CVTextEditor value={location} path={locationPath} placeholder="City, Country" className="text-gray-500" />
  ) : null;

  const subtitleEl = (subtitle !== undefined && subtitlePath) ? (
    <p className={subtitleClassName}>
      <CVTextEditor value={subtitle} path={subtitlePath} placeholder="Subtitle" />
      {locationEl && (
        <> <span className="text-gray-400">·</span> {locationEl}</>
      )}
    </p>
  ) : locationEl ? (
    <p className={subtitleClassName}>{locationEl}</p>
  ) : null;

  const roleEl = role !== undefined && rolePath ? (
    <p className={subtitleClassName}>
      <CVTextEditor value={role} path={rolePath} placeholder="Role" />
    </p>
  ) : null;

  const titleEl = (
    <h3 className={`${titleClassName} leading-tight`}>
      <CVTextEditor value={title} path={titlePath} placeholder="Title" />
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
          <CVTextEditor value={title} path={titlePath} placeholder="Title" />
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
