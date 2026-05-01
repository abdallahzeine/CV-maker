import type { SectionDef } from './registry';
import { classicLayouts, professionalLayouts } from '../presets';
import { HeadingBlock } from '../layouts/HeadingBlock';
import { ItemFrame } from '../layouts/ItemFrame';
import { HeadingBlockPrint } from '../print/layouts/HeadingBlockPrint';
import { ItemFramePrint } from '../print/layouts/ItemFramePrint';
import { uid } from '../utils/helpers';

const renderEducationEditor: NonNullable<SectionDef['renderItemEditor']> = ({
  itemPath,
  item,
  layout,
  index,
  total,
  onMove,
  onDelete,
}) => (
  <ItemFrame itemId={item.id} density={layout.density} index={index} total={total} onMove={onMove} onDelete={onDelete} path={itemPath}>
    <HeadingBlock
      title={item.title ?? ''}
      titlePath={`${itemPath}.title`}
      subtitle={item.subtitle ?? ''}
      subtitlePath={`${itemPath}.subtitle`}
      date={item.date ?? ''}
      datePath={`${itemPath}.date`}
      dateSlot={layout.dateSlot}
    />
  </ItemFrame>
);

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
  renderItemEditor: renderEducationEditor,
  renderItem: renderEducationEditor,
  renderItemPrint: ({ item, layout }) => (
    <ItemFramePrint density={layout.density}>
      <HeadingBlockPrint
        title={item.title ?? ''}
        subtitle={item.subtitle}
        date={item.date}
        dateSlot={layout.dateSlot}
      />
    </ItemFramePrint>
  ),
};
