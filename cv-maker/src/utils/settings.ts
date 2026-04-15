import type { CVData } from '../types';
import { initialCVData } from '../data/initialCVData';

const CV_KEY = 'cv-maker-cv-data';

export function loadCVData(): CVData {
  try {
    const stored = localStorage.getItem(CV_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as CVData;
      if (parsed && parsed.header && parsed.sections) {
        return parsed;
      }
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
