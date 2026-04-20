import type { SectionDef } from './registry';
import { classicLayouts, professionalLayouts } from '../presets';
import { HeadingBlock } from '../layouts/HeadingBlock';
import { ItemFrame } from '../layouts/ItemFrame';
import { HeadingBlockPrint } from '../print/layouts/HeadingBlockPrint';
import { ItemFramePrint } from '../print/layouts/ItemFramePrint';
import { uid } from '../utils/helpers';

const renderVolunteeringEditor: NonNullable<SectionDef['renderItemEditor']> = ({
  itemPath,
  item,
  layout,
  index,
  total,
  onMove,
  onDelete,
}) => (
  <ItemFrame itemId={item.id} density={layout.density} index={index} total={total} onMove={onMove} onDelete={onDelete}>
    <HeadingBlock
      title={item.title ?? ''}
      titlePath={`${itemPath}.title`}
      role={item.role ?? ''}
      rolePath={`${itemPath}.role`}
      date={item.date ?? ''}
      datePath={`${itemPath}.date`}
      dateSlot={layout.dateSlot}
    />
  </ItemFrame>
);

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
  renderItemEditor: renderVolunteeringEditor,
  renderItem: renderVolunteeringEditor,
  renderItemPrint: ({ item, layout }) => (
    <ItemFramePrint density={layout.density}>
      <HeadingBlockPrint
        title={item.title ?? ''}
        role={item.role}
        date={item.date}
        dateSlot={layout.dateSlot}
      />
    </ItemFramePrint>
  ),
};
