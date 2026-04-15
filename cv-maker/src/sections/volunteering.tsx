import type { SectionDef } from './registry';
import { classicLayouts, professionalLayouts } from '../presets';
import { HeadingBlock } from '../layouts/HeadingBlock';
import { ItemFrame } from '../layouts/ItemFrame';
import { uid } from '../utils/helpers';

export const volunteeringDef: SectionDef = {
  type: 'volunteering',
  label: 'Volunteering',
  description: 'Volunteer work and leadership roles',
  defaultTitle: 'VOLUNTEERING & LEADERSHIP',
  defaultLayout: classicLayouts.volunteering,
  recommendedLayout: professionalLayouts.volunteering,
  category: 'heading-date',
  allowedLayoutOptions: {
    dateSlot: ['right-inline', 'below-title', 'left-margin', 'hidden'],
    iconStyle: ['none'],
    separator: ['none', 'rule', 'dot', 'space'],
    density: ['compact', 'normal', 'relaxed'],
    columns: [1, 2],
  },
  singleItem: false,
  addItemLabel: 'Add entry',
  availablePresetIds: ['classic'],
  newItem: () => ({ id: uid(), title: 'Organization', role: 'Role', date: 'MM/YYYY - Present' }),
  renderItem: ({ item, layout, index, total, onChange, onMove, onDelete }) => (
    <ItemFrame itemId={item.id} density={layout.density} index={index} total={total} onMove={onMove} onDelete={onDelete}>
      <HeadingBlock
        title={item.title ?? ''}
        onChangeTitle={(v) => onChange({ ...item, title: v })}
        role={item.role ?? ''}
        onChangeRole={(v) => onChange({ ...item, role: v })}
        date={item.date ?? ''}
        onChangeDate={(v) => onChange({ ...item, date: v })}
        dateSlot={layout.dateSlot}
      />
    </ItemFrame>
  ),
};
