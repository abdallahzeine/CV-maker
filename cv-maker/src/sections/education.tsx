import type { SectionDef } from './registry';
import { classicLayouts, professionalLayouts } from '../presets';
import { HeadingBlock } from '../layouts/HeadingBlock';
import { ItemFrame } from '../layouts/ItemFrame';
import { uid } from '../utils/helpers';

export const educationDef: SectionDef = {
  type: 'education',
  label: 'Education',
  description: 'Educational background and degrees',
  defaultTitle: 'EDUCATION',
  defaultLayout: classicLayouts.education,
  recommendedLayout: professionalLayouts.education,
  category: 'heading-date',
  allowedLayoutOptions: {
    dateSlot: ['right-inline', 'below-title', 'left-margin', 'hidden'],
    iconStyle: ['none'],
    separator: ['none', 'rule', 'dot', 'space'],
    density: ['compact', 'normal', 'relaxed'],
    columns: [1, 2],
  },
  singleItem: false,
  addItemLabel: 'Add education',
  availablePresetIds: ['classic'],
  newItem: () => ({ id: uid(), title: '', subtitle: '', date: '' }),
  renderItem: ({ item, layout, index, total, onChange, onMove, onDelete }) => (
    <ItemFrame itemId={item.id} density={layout.density} index={index} total={total} onMove={onMove} onDelete={onDelete}>
      <HeadingBlock
        title={item.title ?? ''}
        onChangeTitle={(v) => onChange({ ...item, title: v })}
        subtitle={item.subtitle ?? ''}
        onChangeSubtitle={(v) => onChange({ ...item, subtitle: v })}
        date={item.date ?? ''}
        onChangeDate={(v) => onChange({ ...item, date: v })}
        dateSlot={layout.dateSlot}
      />
    </ItemFrame>
  ),
};
