import type { CVItem } from '../types';

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

// Create new item based on section type
export function newItem(type: string): CVItem {
  const id = uid();
  if (type === 'experience') return { id, title: 'Job Title', subtitle: 'Company · Location', date: 'MM/YYYY – Present', bullets: ['Action verb + task + result.'] };
  if (type === 'projects') return { id, title: 'New Project', bullets: ['Description...'] };
  if (type === 'volunteering') return { id, title: 'Organization', role: 'Role', date: 'MM/YYYY - Present' };
  if (type === 'languages') return { id, title: 'Language', subtitle: 'Level' };
  if (type === 'publications') return { id, title: 'Paper Title', subtitle: 'Venue / Journal', date: 'MM/YYYY', body: 'Co-authors' };
  if (type === 'references') return { id, title: 'Full Name', subtitle: 'Title · Company', body: 'email@example.com | +1 234 567 890' };
  return { id, title: 'New Entry', subtitle: 'Details', date: 'MM/YYYY' };
}
