import { extractDomain } from './linkValidation';

export interface FaviconResult {
  url: string | null;
  error: string | null;
  isLoading: boolean;
}

// Cache for favicon results to avoid repeated requests
const faviconCache = new Map<string, string>();

/**
 * Attempts to fetch a favicon for a given URL
 * Uses Google's favicon service as a fallback
 */
export const fetchFavicon = async (url: string): Promise<FaviconResult> => {
  if (!url) {
    return { url: null, error: 'No URL provided', isLoading: false };
  }

  const domain = extractDomain(url);
  
  // Check cache first
  if (faviconCache.has(domain)) {
    return { url: faviconCache.get(domain)!, error: null, isLoading: false };
  }

  try {
    // Try Google's favicon service (most reliable)
    const googleFaviconUrl = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`;
    
    // Verify the favicon exists by attempting to load it
    const exists = await checkImageExists(googleFaviconUrl);
    
    if (exists) {
      faviconCache.set(domain, googleFaviconUrl);
      return { url: googleFaviconUrl, error: null, isLoading: false };
    }

    // Fallback: try direct favicon.ico
    const directFaviconUrl = `https://${domain}/favicon.ico`;
    const directExists = await checkImageExists(directFaviconUrl);
    
    if (directExists) {
      faviconCache.set(domain, directFaviconUrl);
      return { url: directFaviconUrl, error: null, isLoading: false };
    }

    return { url: null, error: 'No favicon found', isLoading: false };
  } catch (error) {
    return { url: null, error: 'Failed to fetch favicon', isLoading: false };
  }
};

/**
 * Checks if an image URL is valid and loadable
 */
const checkImageExists = (url: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
    
    // Timeout after 3 seconds
    setTimeout(() => resolve(false), 3000);
  });
};

/**
 * Gets a favicon URL synchronously (returns cached value or null)
 */
export const getCachedFavicon = (url: string): string | null => {
  const domain = extractDomain(url);
  return faviconCache.get(domain) || null;
};

/**
 * Clears the favicon cache
 */
export const clearFaviconCache = (): void => {
  faviconCache.clear();
};

/**
 * Returns a data URL for a default icon based on domain
 */
export const getDefaultFaviconDataUrl = (domain: string): string => {
  // Create a simple colored circle with initials as a fallback
  const initials = domain
    .split('.')[0]
    .slice(0, 2)
    .toUpperCase();
  
  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
  ];
  const color = colors[domain.length % colors.length];
  
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <rect width="100" height="100" rx="20" fill="${color}"/>
      <text x="50" y="65" font-family="Arial, sans-serif" font-size="35" font-weight="bold" fill="white" text-anchor="middle">${initials}</text>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};
