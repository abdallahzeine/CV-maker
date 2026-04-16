import type { IconStyle, Density, SectionLayout, DateSlot } from '../types';
import type { SectionCategory } from '../sections/categories';

// ─── Base skeleton primitives ─────────────────────────────────────────────────

function Block({ className = '' }: { className?: string }) {
  return <div className={`bg-gray-200 rounded-sm animate-pulse ${className}`} />;
}

function Line({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={`bg-gray-200 rounded-sm animate-pulse h-1.5 ${className}`} style={style} />;
}

function TitleBar({ className = '' }: { className?: string }) {
  return <div className={`bg-gray-300 rounded-sm animate-pulse h-2.5 ${className}`} />;
}

// ─── Category skeleton cards (used in SectionModal) ───────────────────────────

export function HeadingDateSkeleton() {
  return (
    <div className="w-full space-y-1.5 py-1">
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1 space-y-1">
          <TitleBar className="w-3/4" />
          <Line className="w-1/2" />
        </div>
        <Line className="w-16 shrink-0" />
      </div>
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1 space-y-1">
          <TitleBar className="w-3/5" />
          <Line className="w-2/5" />
        </div>
        <Line className="w-12 shrink-0" />
      </div>
    </div>
  );
}

export function BodyTextSkeleton() {
  return (
    <div className="w-full space-y-1 py-1">
      <Line className="w-full" />
      <Line className="w-11/12" />
      <Line className="w-4/5" />
    </div>
  );
}

export function TitleBulletsSkeleton({ iconStyle }: { iconStyle?: IconStyle } = {}) {
  const icon = iconStyle === 'bullet' ? '•' : iconStyle === 'dash' ? '–' : iconStyle === 'chevron' ? '›' : '';
  return (
    <div className="w-full space-y-1.5 py-1">
      <TitleBar className="w-3/5" />
      {[3/4, 11/12, 2/3].map((w, i) => (
        <div key={i} className="flex items-start gap-1">
          {icon && <span className="text-[8px] text-gray-300 leading-none select-none">{icon}</span>}
          <Line className='' style={{ width: `${w * 100}%` }} />
        </div>
      ))}
    </div>
  );
}

export function CustomFieldsSkeleton() {
  return (
    <div className="w-full space-y-1.5 py-1">
      <div className="flex items-baseline gap-2">
        <Block className="w-14 h-1.5 shrink-0" />
        <Line className="flex-1" />
      </div>
      <div className="flex items-baseline gap-2">
        <Block className="w-16 h-1.5 shrink-0" />
        <Line className="flex-1 w-3/5" />
      </div>
      <div className="space-y-0.5 ml-3">
        <div className="flex items-start gap-1">
          <span className="text-[8px] text-gray-300 select-none">•</span>
          <Line className="w-4/5" />
        </div>
      </div>
    </div>
  );
}

// ─── Layout option skeleton cards (used in layout wizard) ──────────────────────

export function DateSlotPreview({ value }: { value: DateSlot }) {
  if (value === 'right-inline') {
    return (
      <div className="w-full space-y-1">
        <div className="flex justify-between items-start gap-1">
          <div className="flex-1 space-y-0.5">
            <TitleBar className="w-3/4 !h-2" />
            <Line className="w-1/2" />
          </div>
          <Line className="w-10 shrink-0" />
        </div>
      </div>
    );
  }
  if (value === 'below-title') {
    return (
      <div className="w-full space-y-0.5">
        <TitleBar className="w-3/4 !h-2" />
        <Line className="w-12" />
        <Line className="w-1/2" />
      </div>
    );
  }
  if (value === 'left-margin') {
    return (
      <div className="w-full space-y-0.5">
        <TitleBar className="w-3/4 !h-2" />
        <div className="flex gap-1.5">
          <div className="w-3 shrink-0" />
          <Line className="w-10" />
        </div>
        <Line className="w-1/2" />
      </div>
    );
  }
  // hidden
  return (
    <div className="w-full space-y-0.5">
      <TitleBar className="w-3/4 !h-2" />
      <Line className="w-1/2" />
    </div>
  );
}

export function DensityPreview({ value }: { value: Density }) {
  const gap = value === 'compact' ? 'gap-0.5' : value === 'normal' ? 'gap-1.5' : 'gap-3';
  return (
    <div className={`w-full flex flex-col ${gap}`}>
      <TitleBar className="w-3/4 !h-2" />
      <Line className="w-full" />
      <Line className="w-5/6" />
    </div>
  );
}

export function IconStylePreview({ value }: { value: IconStyle }) {
  const char = value === 'bullet' ? '•' : value === 'dash' ? '–' : value === 'chevron' ? '›' : '';
  return (
    <div className="w-full space-y-1">
      {char ? (
        <>
          <div className="flex items-start gap-1.5">
            <span className="text-[10px] text-gray-400 leading-none select-none">{char}</span>
            <Line className="flex-1" />
          </div>
          <div className="flex items-start gap-1.5">
            <span className="text-[10px] text-gray-400 leading-none select-none">{char}</span>
            <Line className="flex-1 w-5/6" />
          </div>
        </>
      ) : (
        <>
          <Line className="w-full" />
          <Line className="w-5/6" />
        </>
      )}
    </div>
  );
}

const densitySpacing: Record<string, string> = {
  compact: 'space-y-1',
  normal: 'space-y-2.5',
  relaxed: 'space-y-4',
};

export function CategorySkeleton({ category }: { category: SectionCategory }) {
  switch (category) {
    case 'work-experience':
      return <TitleBulletsSkeleton />;
    case 'heading-date':
      return <HeadingDateSkeleton />;
    case 'body-text':
      return <BodyTextSkeleton />;
    case 'title-bullets':
      return <TitleBulletsSkeleton />;
    case 'custom':
      return <CustomFieldsSkeleton />;
  }
}

// ─── Live layout preview with example text (used in wizard Step 2) ──────────────

function HeadingDateEntry({
  title,
  subtitle,
  date,
  dateSlot,
}: {
  title: string;
  subtitle: string;
  date: string;
  dateSlot: DateSlot;
}) {
  const titleEl = <span className="font-semibold text-gray-800">{title}</span>;
  const subtitleEl = <span className="text-gray-500">{subtitle}</span>;
  const dateEl = <span className="text-gray-400 whitespace-nowrap">{date}</span>;

  if (dateSlot === 'right-inline') {
    return (
      <div className="flex flex-wrap justify-between items-start gap-x-3 text-left">
        <div>
          <div className="leading-tight">{titleEl}</div>
          <div className="leading-tight">{subtitleEl}</div>
        </div>
        <div className="mt-0.5 shrink-0">{dateEl}</div>
      </div>
    );
  }

  if (dateSlot === 'below-title') {
    return (
      <div className="text-left">
        <div className="leading-tight">{titleEl}</div>
        <div className="leading-tight">{dateEl}</div>
        <div className="leading-tight">{subtitleEl}</div>
      </div>
    );
  }

  if (dateSlot === 'left-margin') {
    return (
      <div className="text-left">
        <div className="leading-tight">
          {titleEl}
          <span className="text-gray-400 mx-1">–</span>
          {dateEl}
        </div>
        <div className="leading-tight">{subtitleEl}</div>
      </div>
    );
  }

  // hidden
  return (
    <div className="text-left">
      <div className="leading-tight">{titleEl}</div>
      <div className="leading-tight">{subtitleEl}</div>
    </div>
  );
}

export function LayoutPreviewSkeleton({
  category,
  layout,
}: {
  category: SectionCategory;
  layout: SectionLayout;
}) {
  const spacing = densitySpacing[layout.density];

  const titleRule = layout.showTitleRule
    ? <div className="h-px bg-gray-200 mt-1" />
    : null;

  if (category === 'heading-date') {
    return (
      <div className={`w-full ${spacing} text-xs`}>
        <HeadingDateEntry
          title="Bachelor of Computer Science"
          subtitle="MIT University"
          date="2019 — 2023"
          dateSlot={layout.dateSlot}
        />
        <HeadingDateEntry
          title="AWS Solutions Architect"
          subtitle="Amazon Web Services"
          date="2022"
          dateSlot={layout.dateSlot}
        />
        {titleRule}
      </div>
    );
  }

  if (category === 'body-text') {
    return (
      <div className={`w-full ${spacing} text-xs text-left`}>
        <p className="text-gray-600 leading-relaxed">
          Experienced software engineer with 5+ years building scalable web applications.
          Passionate about clean architecture and mentoring junior developers.
          Led a team of 8 engineers to deliver a microservices platform serving 2M+ users.
        </p>
        {titleRule}
      </div>
    );
  }

  if (category === 'work-experience') {
    const iconChar = layout.iconStyle === 'bullet' ? '•' : layout.iconStyle === 'dash' ? '–' : layout.iconStyle === 'chevron' ? '›' : '';
    return (
      <div className={`w-full ${spacing} text-xs`}>
        <div className="flex justify-between items-start">
          <div>
            <div className="font-semibold text-gray-800 leading-tight">Software Engineer</div>
            <div className="text-gray-600">Google · New York</div>
          </div>
          {layout.dateSlot !== 'hidden' && <div className="text-gray-500 whitespace-nowrap">Jan 2020 – Present</div>}
        </div>
        {titleRule}
        <div className="flex flex-col gap-0.5">
          {['Led a team of 5 engineers to ship a new product', 'Reduced latency by 40% via query optimization'].map((b, i) => (
            <div key={i} className="flex items-start gap-1.5">
              {iconChar && <span className="text-gray-400 shrink-0">{iconChar}</span>}
              <span className="text-gray-600">{b}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (category === 'title-bullets') {
    const iconChar =
      layout.iconStyle === 'bullet'
        ? '•'
        : layout.iconStyle === 'dash'
          ? '–'
          : layout.iconStyle === 'chevron'
            ? '›'
            : '';

    const bullets = [
      'Built a full-stack e-commerce platform with React and Node.js',
      'Reduced page load time by 60% through code splitting and lazy loading',
      'Implemented CI/CD pipeline serving 500K daily active users',
    ];

    const dateStr = layout.dateSlot !== 'hidden'
      ? <span className="text-gray-500 whitespace-nowrap">Jan 2020 &ndash; Present</span>
      : null;
    const titleBlock = <span className="font-semibold text-gray-800 leading-tight">E-commerce Platform</span>;

    let heading: React.ReactNode;
    if (layout.dateSlot === 'right-inline') {
      heading = (
        <div className="flex justify-between items-start gap-x-2 text-left">
          <div>{titleBlock}</div>
          {dateStr && <div className="mt-0.5 shrink-0">{dateStr}</div>}
        </div>
      );
    } else if (layout.dateSlot === 'below-title') {
      heading = (
        <div className="text-left">
          {titleBlock}
          {dateStr && <div className="leading-tight">{dateStr}</div>}
        </div>
      );
    } else if (layout.dateSlot === 'left-margin') {
      heading = (
        <div className="flex items-start gap-2 text-left">
          <span className="font-semibold text-gray-800 leading-tight">E-commerce Platform</span>
          <span className="text-gray-400">–</span>
          {dateStr}
        </div>
      );
    } else {
      heading = <div className="text-left">{titleBlock}</div>;
    }

    return (
      <div className={`w-full ${spacing} text-xs`}>
        {heading}
        {titleRule}
        <div className={`flex flex-col ${layout.density === 'compact' ? 'gap-0.5' : layout.density === 'relaxed' ? 'gap-2' : 'gap-1'}`}>
          {bullets.map((b, i) => (
            <div key={i} className="flex items-start gap-1.5 text-left">
              {iconChar && (
                <span className="text-gray-400 leading-none select-none shrink-0">{iconChar}</span>
              )}
              <span className="text-gray-600">{b}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (category === 'custom') {
    return (
      <div className={`w-full ${spacing} text-xs`}>
        <div className="flex items-baseline gap-2">
          <span className="text-gray-400 font-medium shrink-0">Language:</span>
          <span className="text-gray-600">English — Native</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-gray-400 font-medium shrink-0">Language:</span>
          <span className="text-gray-600">French — Fluent</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-gray-400 font-medium shrink-0">Language:</span>
          <span className="text-gray-600">Spanish — Intermediate</span>
        </div>
        {titleRule}
      </div>
    );
  }

  return null;
}