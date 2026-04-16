import type { CVData } from '../types';
import { initialCVData } from '../data/initialCVData';

const CV_KEY = 'cv-maker-cv-data';

function isValidSchema(parsed: unknown): parsed is CVData {
  if (!parsed || typeof parsed !== 'object') return false;
  const data = parsed as Record<string, unknown>;
  // Require new-schema fields: template at root, layout on every section
  if (!data.header || !Array.isArray(data.sections) || !data.template) return false;
  const sections = data.sections as Array<Record<string, unknown>>;
  if (sections.some((s) => !s.layout)) return false;
  return true;
}

export function loadCVData(): CVData {
  try {
    const stored = localStorage.getItem(CV_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as unknown;
      if (isValidSchema(parsed)) return parsed;
      // Old schema — back up then reset
      try { localStorage.setItem(CV_KEY + '-backup', stored); } catch { /* ignore */ }
      console.info('[cv-maker] Stored CV schema outdated — backed up to cv-maker-cv-data-backup, resetting to defaults.');
    }
  } catch (error) {
    console.error('Failed to load CV data from localStorage:', error);
  }
  return initialCVData;
}

export function saveCVData(cv: CVData): void {
  try {
    localStorage.setItem(CV_KEY, JSON.stringify(cv));
  } catch (error) {
    console.error('Failed to save CV data to localStorage:', error);
  }
}

export function clearCVData(): void {
  try {
    localStorage.removeItem(CV_KEY);
  } catch (error) {
    console.error('Failed to clear CV data:', error);
  }
}
