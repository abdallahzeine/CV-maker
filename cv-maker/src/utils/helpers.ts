import type { CVData, CVItem } from '../types';

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

// Path resolver for AI patch operations
export function parsePath(path: string): Array<string | number> {
  return path.replace(/\[(\d+)\]/g, '.$1').split('.').map((s) => (/^\d+$/.test(s) ? parseInt(s, 10) : s));
}

// Apply AI patch to CV data
export function applyPatch(cv: CVData, act: any): { next: CVData; desc: string } | null {
  const next: any = JSON.parse(JSON.stringify(cv));
  const path: string = act.path ?? act.collection_path ?? '';
  const segments = parsePath(path);
  let node: any = next;
  for (let i = 0; i < segments.length - 1; i++) {
    node = node[segments[i]];
    if (node == null) { console.warn('[AI patch] path not found at', segments[i], 'in', path); return null; }
  }
  const lastKey = segments[segments.length - 1];

  if (act.action === 'setField') {
    const old = String(node[lastKey] ?? '').slice(0, 50);
    node[lastKey] = act.value;
    return { next, desc: `Set ${path}: "${old}" → "${String(act.value).slice(0, 50)}"` };
  }
  if (act.action === 'deleteAt') {
    if (!Array.isArray(node)) { console.warn('[AI patch] deleteAt: parent not array at', path); return null; }
    const removed = node[lastKey as number];
    node.splice(lastKey as number, 1);
    return { next, desc: `Removed "${String(removed?.title ?? removed?.label ?? removed?.body ?? 'item').slice(0, 50)}"` };
  }
  if (act.action === 'appendItem') {
    const target = node[lastKey];
    if (!Array.isArray(target)) { console.warn('[AI patch] appendItem: target not array at', path); return null; }
    target.push(act.item);
    return { next, desc: `Added "${String(act.item?.title ?? act.item?.label ?? act.item ?? 'item').slice(0, 50)}"` };
  }
  return null;
}

// Create new item based on section type
export function newItem(type: string): CVItem {
  const id = uid();
  if (type === 'projects') return { id, title: 'New Project', bullets: ['Description...'] };
  if (type === 'volunteering') return { id, title: 'Organization', role: 'Role', date: 'MM/YYYY - Present' };
  return { id, title: 'New Entry', subtitle: 'Details', date: 'MM/YYYY' };
}
