import type { CVItem, SectionLayout, SectionType } from '../types';

// Generate a short unique ID
export const uid = () => Math.random().toString(36).slice(2, 9);

// Move an item in an array by index delta (-1 = up, +1 = down)
export function moveItem<T>(arr: T[], index: number, delta: -1 | 1): T[] {
  const newArr = [...arr];
  const target = index + delta;
  if (target < 0 || target >= newArr.length) return newArr;
  [newArr[index], newArr[target]] = [newArr[target], newArr[index]];
  return newArr;
}

// Default SectionLayout for a given section type (matches classic preset)
export function defaultLayoutFor(type: SectionType): SectionLayout {
  const base = {
    presetId: 'classic' as const,
    iconStyle: 'none' as const,
    separator: 'none' as const,
    density: 'compact' as const,
    columns: 1 as const,
    showTitleRule: false,
  };
  if (type === 'projects') return { ...base, dateSlot: 'hidden' as const, iconStyle: 'bullet' as const, density: 'relaxed' as const };
  if (type === 'work-experience') return { ...base, dateSlot: 'right-inline' as const, iconStyle: 'bullet' as const };
  if (type === 'summary' || type === 'skills' || type === 'custom') return { ...base, dateSlot: 'hidden' as const };
  return { ...base, dateSlot: 'right-inline' as const };
}

// Create a new blank item for the given section type
export function newItem(type: SectionType | string): CVItem {
  const id = uid();
  if (type === 'projects') return { id, title: 'New Project', bullets: ['Description...'] };
  if (type === 'work-experience') return { id, title: '', subtitle: '', location: '', dateEnd: 'present' as const, bullets: [''] };
  if (type === 'volunteering') return { id, title: 'Organization', role: 'Role', date: 'MM/YYYY - Present' };
  if (type === 'summary') return { id, body: '' };
  if (type === 'skills') return { id, skillGroups: [] };
  if (type === 'custom') return { id, values: {} };
  // education, certifications, awards, and any unknown
  return { id, title: 'New Entry', subtitle: 'Details', date: 'MM/YYYY' };
}
