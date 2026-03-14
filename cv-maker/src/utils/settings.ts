import type { AISettings } from '../types';
import { DEFAULT_SETTINGS, SERVER_URL } from '../constants/config';

const SETTINGS_KEY = 'cv-maker-ai-settings';
const CV_KEY = 'cv-maker-cv-data';

// Load settings from localStorage (fallback)
export function loadSettings(): AISettings {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as AISettings;
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch (error) {
    console.error('Failed to load settings from localStorage:', error);
  }
  return { ...DEFAULT_SETTINGS };
}

// Save settings to localStorage (fallback)
export function saveSettingsLocal(settings: AISettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save settings to localStorage:', error);
  }
}

// Load settings from backend API
export async function loadSettingsFromAPI(sessionId: string): Promise<AISettings> {
  // First, load from localStorage as primary source
  const localSettings = loadSettings();
  
  try {
    const response = await fetch(`${SERVER_URL}/settings/${sessionId}`);
    if (!response.ok) {
      // If API returns error, keep using localStorage
      console.log('[Settings] API returned error, using localStorage');
      return localSettings;
    }
    const settings = await response.json();
    // Merge API settings with localStorage (localStorage takes precedence for user preferences)
    const mergedSettings = { ...settings, ...localSettings };
    // Also save to localStorage as cache
    saveSettingsLocal(mergedSettings);
    return mergedSettings;
  } catch (error) {
    console.error('[Settings] Failed to load from API:', error);
    // Fallback to localStorage
    return localSettings;
  }
}

// Save settings to backend API
export async function saveSettingsToAPI(sessionId: string, settings: AISettings): Promise<void> {
  try {
    const response = await fetch(`${SERVER_URL}/settings/${sessionId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    // Also save to localStorage as cache
    saveSettingsLocal(settings);
  } catch (error) {
    console.error('Failed to save settings to API:', error);
    // Fallback to localStorage only
    saveSettingsLocal(settings);
    throw error;
  }
}

export function clearSettings(): void {
  try {
    localStorage.removeItem(SETTINGS_KEY);
  } catch (error) {
    console.error('Failed to clear settings:', error);
  }
}

// ============================================================================
// CV Data localStorage functions
// ============================================================================

import type { CVData } from '../types';
import { initialCVData } from '../data/initialCVData';

export function loadCVData(): CVData {
  try {
    const stored = localStorage.getItem(CV_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as CVData;
      // Validate that the parsed data has the expected structure
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
