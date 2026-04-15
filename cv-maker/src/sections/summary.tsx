import type { SectionDef } from './registry';
import { classicLayouts, professionalLayouts } from '../presets';
import { BodyBlock } from '../layouts/BodyBlock';
import { uid } from '../utils/helpers';

export const summaryDef: SectionDef = {
  type: 'summary',
  label: 'Professional Summary',
  description: 'A brief overview of your professional background',
  defaultTitle: 'PROFESSIONAL SUMMARY',
  defaultLayout: classicLayouts.summary,
  recommendedLayout: professionalLayouts.summary,
  category: 'body-text',
  allowedLayoutOptions: {
    dateSlot: ['hidden'],
    iconStyle: ['none'],
    separator: ['none', 'space'],
    density: ['compact', 'normal', 'relaxed'],
    columns: [1],
  },
  singleItem: true,
  addItemLabel: 'Add paragraph',
  availablePresetIds: ['classic'],
  newItem: () => ({ id: uid(), body: '' }),
  renderItem: ({ item, onChange }) => (
    <BodyBlock
      value={item.body ?? ''}
      onChange={(v) => onChange({ ...item, body: v })}
      placeholder="Write your professional summary..."
    />
  ),
};
