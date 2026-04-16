import type { SectionDef } from './registry';
import { classicLayouts, professionalLayouts } from '../presets';
import { SkillGrid } from '../layouts/SkillGrid';
import { uid } from '../utils/helpers';

export const skillsDef: SectionDef = {
  type: 'skills',
  label: 'Skills',
  description: 'Technical skills and competencies',
  defaultTitle: 'SKILLS',
  defaultLayout: classicLayouts.skills,
  recommendedLayout: professionalLayouts.skills,
  category: 'body-text',
  allowedLayoutOptions: {
    dateSlot: ['hidden'],
    iconStyle: ['none'],
    separator: ['none', 'space'],
    density: ['compact', 'normal', 'relaxed'],
    columns: [1, 2],
  },
  singleItem: true,
  addItemLabel: 'Add skills block',
  availablePresetIds: ['classic'],
  newItem: () => ({ id: uid(), skillGroups: [] }),
  renderItem: ({ item, onChange }) => (
    <SkillGrid item={item} onChange={onChange} />
  ),
};
