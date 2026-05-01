import type { SectionDef } from './registry';
import { classicLayouts, professionalLayouts } from '../presets';
import { HeadingBlock } from '../layouts/HeadingBlock';
import { ItemFrame } from '../layouts/ItemFrame';
import { HeadingBlockPrint } from '../print/layouts/HeadingBlockPrint';
import { ItemFramePrint } from '../print/layouts/ItemFramePrint';
import { uid } from '../utils/helpers';

const renderCertificationsEditor: NonNullable<SectionDef['renderItemEditor']> = ({
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

export const certificationsDef: SectionDef = {
  type: 'certifications',
  label: 'Certifications',
  description: 'Professional certifications and licenses',
  defaultTitle: 'CERTIFICATIONS',
  defaultLayout: classicLayouts.certifications,
  recommendedLayout: professionalLayouts.certifications,
  category: 'heading-date',
  allowedLayoutOptions: {
    dateSlot: ['right-inline', 'below-title', 'left-margin', 'hidden'],
    iconStyle: ['none', 'bullet', 'dash', 'chevron'],
    separator: ['none', 'rule', 'dot', 'space'],
    density: ['compact', 'normal', 'relaxed'],
    columns: [1, 2],
  },
  singleItem: false,
  addItemLabel: 'Add certification',
  availablePresetIds: ['classic'],
  newItem: () => ({ id: uid(), title: '', subtitle: '', date: '' }),
  renderItemEditor: renderCertificationsEditor,
  renderItem: renderCertificationsEditor,
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
