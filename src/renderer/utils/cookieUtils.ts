import { CookieEntry } from "../types/cookies";

/**
 * Calculate the size of a cookie in bytes
 * Includes name, value, domain, and path
 */
export function calculateCookieSize(cookie: CookieEntry): number {
  const encoder = new TextEncoder();
  const nameSize = encoder.encode(cookie.name).length;
  const valueSize = encoder.encode(cookie.value).length;
  const domainSize = encoder.encode(cookie.domain).length;
  const pathSize = encoder.encode(cookie.path).length;

  return nameSize + valueSize + domainSize + pathSize;
}

/**
 * Sort cookies alphabetically by name
 */
export function sortCookies(cookies: CookieEntry[]): CookieEntry[] {
  return [...cookies].sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Format expiration date for display
 * Returns "Session" if no expiration date
 */
export function formatExpirationDate(expirationDate?: number): string {
  if (!expirationDate) {
    return "Session";
  }

  const date = new Date(expirationDate * 1000);
  return date.toLocaleString();
}

/**
 * Format cookie size for display
 */
export function formatCookieSize(sizeInBytes: number): string {
  if (sizeInBytes < 1024) {
    return `${sizeInBytes} B`;
  }
  return `${(sizeInBytes / 1024).toFixed(2)} KB`;
}

/**
 * Check if cookie size exceeds warning threshold (4096 bytes)
 */
export function isCookieSizeWarning(sizeInBytes: number): boolean {
  return sizeInBytes > 4096;
}

/**
 * Calculate total size of all cookies
 */
export function calculateTotalSize(cookies: CookieEntry[]): number {
  return cookies.reduce((total, cookie) => total + calculateCookieSize(cookie), 0);
}

/**
 * Check if total size exceeds warning threshold (10KB)
 */
export function isTotalSizeWarning(sizeInBytes: number): boolean {
  return sizeInBytes > 10 * 1024;
}

/**
 * Extract unique domains from cookies
 */
export function getUniqueDomains(cookies: CookieEntry[]): string[] {
  const domains = new Set(cookies.map((c) => c.domain));
  return Array.from(domains).sort();
}

/**
 * Filter cookies by search term (searches name, value, domain)
 */
export function filterCookiesBySearch(
  cookies: CookieEntry[],
  searchTerm: string
): CookieEntry[] {
  if (!searchTerm) return cookies;

  const lowerSearch = searchTerm.toLowerCase();
  return cookies.filter(
    (cookie) =>
      cookie.name.toLowerCase().includes(lowerSearch) ||
      cookie.value.toLowerCase().includes(lowerSearch) ||
      cookie.domain.toLowerCase().includes(lowerSearch)
  );
}

/**
 * Filter cookies by domain
 */
export function filterCookiesByDomain(
  cookies: CookieEntry[],
  domain: string
): CookieEntry[] {
  if (!domain) return cookies;
  return cookies.filter((cookie) => cookie.domain === domain);
}

/**
 * Filter cookies by URL (checks if cookie would be sent to this URL)
 */
export function filterCookiesByUrl(
  cookies: CookieEntry[],
  url: string
): CookieEntry[] {
  if (!url) return cookies;
  
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    const pathname = urlObj.pathname;
    const isSecure = urlObj.protocol === 'https:';
    
    return cookies.filter((cookie) => {
      // Check domain match
      const cookieDomain = cookie.domain.startsWith('.') 
        ? cookie.domain.substring(1) 
        : cookie.domain;
      
      const domainMatch = hostname === cookieDomain || 
                         hostname.endsWith('.' + cookieDomain) ||
                         cookieDomain.endsWith('.' + hostname);
      
      if (!domainMatch) return false;
      
      // Check path match
      const pathMatch = pathname.startsWith(cookie.path);
      if (!pathMatch) return false;
      
      // Check secure flag
      if (cookie.secure && !isSecure) return false;
      
      return true;
    });
  } catch (err) {
    // Invalid URL, return all cookies
    console.warn('Invalid URL for filtering:', url);
    return cookies;
  }
}

/**
 * Apply multiple filters to cookies
 */
export function filterCookies(
  cookies: CookieEntry[],
  searchTerm: string,
  domain: string,
  url?: string
): CookieEntry[] {
  let filtered = cookies;
  
  if (searchTerm) {
    filtered = filterCookiesBySearch(filtered, searchTerm);
  }
  
  if (domain) {
    filtered = filterCookiesByDomain(filtered, domain);
  }
  
  if (url) {
    filtered = filterCookiesByUrl(filtered, url);
  }
  
  return filtered;
}
