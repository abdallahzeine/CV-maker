import type { SectionDef } from './registry';
import { classicLayouts, professionalLayouts } from '../presets';
import { BulletList } from '../layouts/BulletList';
import { HeadingBlock } from '../layouts/HeadingBlock';
import { ItemFrame } from '../layouts/ItemFrame';
import { StructuredDatePicker } from '../components/StructuredDatePicker';
import { uid } from '../utils/helpers';
import { dateRangeString } from '../utils/dateUtils';

export const workExperienceDef: SectionDef = {
  type: 'work-experience',
  label: 'Work Experience',
  description: 'Jobs and professional experience',
  defaultTitle: 'WORK EXPERIENCE',
  defaultLayout: classicLayouts['work-experience'],
  recommendedLayout: professionalLayouts['work-experience'],
  category: 'title-bullets',
  allowedLayoutOptions: {
    dateSlot: ['right-inline', 'below-title', 'hidden'],
    iconStyle: ['none', 'bullet', 'dash', 'chevron'],
    separator: ['none', 'rule', 'space'],
    density: ['compact', 'normal', 'relaxed'],
    columns: [1],
  },
  singleItem: false,
  addItemLabel: 'Add job',
  availablePresetIds: ['classic', 'professional'],
  newItem: () => ({
    id: uid(),
    title: '',
    subtitle: '',
    location: '',
    dateEnd: 'present' as const,
    bullets: [''],
  }),
  renderItem: ({ item, layout, index, total, onChange, onMove, onDelete }) => {
    const fmt = 'MM/YYYY';
    const displayDate =
      item.dateStart || item.dateEnd
        ? dateRangeString(item.dateStart, item.dateEnd, fmt)
        : (item.date ?? '');

    return (
      <ItemFrame itemId={item.id} density={layout.density} index={index} total={total} onMove={onMove} onDelete={onDelete}>
        <HeadingBlock
          title={item.title ?? ''}
          onChangeTitle={(v) => onChange({ ...item, title: v })}
          subtitle={item.subtitle ?? ''}
          onChangeSubtitle={(v) => onChange({ ...item, subtitle: v })}
          location={item.location ?? ''}
          onChangeLocation={(v) => onChange({ ...item, location: v })}
          date={layout.dateSlot !== 'hidden' ? displayDate : undefined}
          onChangeDate={undefined}
dateSlot={layout.dateSlot}
           titleClassName="text-base font-semibold"
          subtitleClassName="text-gray-700 text-sm"
        />
        <div className="no-print flex gap-2 mt-1 flex-wrap">
          <StructuredDatePicker
            label="From"
            value={item.dateStart}
            onChange={(v) => onChange({ ...item, dateStart: v as typeof item.dateStart })}
          />
          <StructuredDatePicker
            label="To"
            value={item.dateEnd}
            allowPresent
            onChange={(v) => onChange({ ...item, dateEnd: v as typeof item.dateEnd })}
          />
        </div>
        <BulletList
          bullets={item.bullets ?? []}
          onChange={(bullets) => onChange({ ...item, bullets })}
          iconStyle={layout.iconStyle}
        />
      </ItemFrame>
    );
  },
};
