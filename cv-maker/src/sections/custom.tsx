import type { SectionDef } from './registry';
import type { CustomFieldDef, CVItem, SectionLayout } from '../types';
import { classicLayouts, professionalLayouts } from '../presets';
import { EditableText } from '../layouts/EditableText';
import { BulletList } from '../layouts/BulletList';
import { ItemFrame } from '../layouts/ItemFrame';
import { uid } from '../utils/helpers';

function renderCustomFields(
  item: CVItem,
  fields: CustomFieldDef[],
  layout: SectionLayout,
  onChange: (i: CVItem) => void,
) {
  if (fields.length === 0) {
    return <p className="text-xs text-gray-400 italic">No fields defined. Edit section schema.</p>;
  }
  return (
    <div className="space-y-0.5 text-sm text-gray-700">
      {fields.map((field) => {
        const values = item.values ?? {};
        const val = values[field.key];

        if (field.kind === 'bullets') {
          const bullets = Array.isArray(val) ? val : [];
          return (
            <div key={field.key}>
              <span className="font-medium text-xs text-gray-500 block mb-0.5">{field.label}</span>
              <BulletList
                bullets={bullets}
                onChange={(next) => onChange({ ...item, values: { ...values, [field.key]: next } })}
                iconStyle={layout.iconStyle}
              />
            </div>
          );
        }

        const strVal = typeof val === 'string' ? val : '';

        if (field.kind === 'multiline') {
          return (
            <div key={field.key}>
              <span className="font-medium text-xs text-gray-500 block mb-0.5">{field.label}</span>
              <EditableText
                multiline
                value={strVal}
                onChange={(v) => onChange({ ...item, values: { ...values, [field.key]: v } })}
                placeholder={field.placeholder ?? `Enter ${field.label}...`}
                className="text-gray-700 text-sm leading-relaxed"
              />
            </div>
          );
        }

        return (
          <div key={field.key} className="flex items-baseline gap-2 flex-wrap">
            <span className="font-semibold shrink-0">{field.label}:</span>
            <EditableText
              value={strVal}
              onChange={(v) => onChange({ ...item, values: { ...values, [field.key]: v } })}
              placeholder={field.placeholder ?? `Enter ${field.label}...`}
            />
          </div>
        );
      })}
    </div>
  );
}

export const customDef: SectionDef = {
  type: 'custom',
  label: 'Custom Section',
  description: 'Define your own fields and layout',
  defaultTitle: 'CUSTOM SECTION',
  defaultLayout: classicLayouts.custom,
  recommendedLayout: professionalLayouts.custom,
  category: 'custom',
  allowedLayoutOptions: {
    dateSlot: ['hidden', 'right-inline', 'below-title', 'left-margin'],
    iconStyle: ['none', 'bullet', 'dash', 'chevron'],
    separator: ['none', 'rule', 'dot', 'space'],
    density: ['compact', 'normal', 'relaxed'],
    columns: [1, 2],
  },
  singleItem: false,
  addItemLabel: 'Add item',
  availablePresetIds: ['classic'],
  newItem: () => ({ id: uid(), values: {} }),
  renderItem: ({ item, layout, index, total, onChange, onMove, onDelete, schema }) => (
    <ItemFrame itemId={item.id} density={layout.density} index={index} total={total} onMove={onMove} onDelete={onDelete}>
      {renderCustomFields(item, schema?.fields ?? [], layout, onChange)}
    </ItemFrame>
  ),
};
