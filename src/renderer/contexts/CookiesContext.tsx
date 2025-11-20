import React, { createContext, useContext, useState, useCallback } from "react";
import { CookieEntry } from "../types/cookies";
import { cookiesApi } from "../utils/cookiesApi";
import { filterCookies, sortCookies } from "../utils/cookieUtils";

interface CookiesContextValue {
  cookies: CookieEntry[];
  filteredCookies: CookieEntry[];
  selectedCookie: CookieEntry | null;
  searchTerm: string;
  selectedDomain: string;
  selectedUrl: string;
  browserProfiles: any[];
  selectedSource: string;
  isLoading: boolean;
  error: string | null;

  refreshCookies: () => Promise<void>;
  selectCookie: (cookie: CookieEntry | null) => void;
  setSearchTerm: (term: string) => void;
  setSelectedDomain: (domain: string) => void;
  setSelectedUrl: (url: string) => void;
  setSelectedSource: (source: string) => Promise<void>;
  loadBrowserProfiles: () => Promise<void>;
  deleteCookie: (name: string, domain: string, path: string) => Promise<void>;
  clearAllCookies: () => Promise<number>;
  exportCookies: () => Promise<void>;
}

const CookiesContext = createContext<CookiesContextValue | undefined>(
  undefined
);

export const useCookies = () => {
  const context = useContext(CookiesContext);
  if (!context) {
    throw new Error("useCookies must be used within CookiesProvider");
  }
  return context;
};

interface CookiesProviderProps {
  children: React.ReactNode;
}

export const CookiesProvider: React.FC<CookiesProviderProps> = ({
  children,
}) => {
  const [cookies, setCookies] = useState<CookieEntry[]>([]);
  const [selectedCookie, setSelectedCookie] = useState<CookieEntry | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("");
  const [selectedUrl, setSelectedUrl] = useState("");
  const [browserProfiles, setBrowserProfiles] = useState<any[]>([]);
  const [selectedSource, setSelectedSourceState] = useState("electron");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshCookies = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const allCookies = await cookiesApi.getAll();
      const sorted = sortCookies(allCookies);
      setCookies(sorted);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load cookies";
      setError(message);
      console.error("Error refreshing cookies:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const selectCookie = useCallback((cookie: CookieEntry | null) => {
    setSelectedCookie(cookie);
  }, []);

  const handleSetSearchTerm = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  const handleSetSelectedDomain = useCallback((domain: string) => {
    setSelectedDomain(domain);
  }, []);

  const handleSetSelectedUrl = useCallback((url: string) => {
    setSelectedUrl(url);
  }, []);

  const loadBrowserProfiles = useCallback(async () => {
    try {
      const profiles = await cookiesApi.getBrowserProfiles();
      setBrowserProfiles(profiles);
    } catch (err) {
      console.error("Error loading browser profiles:", err);
    }
  }, []);

  const handleSetSelectedSource = useCallback(
    async (source: string) => {
      try {
        setIsLoading(true);
        await cookiesApi.setSource(source);
        setSelectedSourceState(source);
        await refreshCookies();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to change cookie source";
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [refreshCookies]
  );

  const deleteCookie = useCallback(
    async (name: string, domain: string, path: string) => {
      try {
        await cookiesApi.delete(name, domain, path);
        await refreshCookies();
        // Clear selection if deleted cookie was selected
        if (
          selectedCookie &&
          selectedCookie.name === name &&
          selectedCookie.domain === domain &&
          selectedCookie.path === path
        ) {
          setSelectedCookie(null);
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to delete cookie";
        setError(message);
        throw err;
      }
    },
    [refreshCookies, selectedCookie]
  );

  const clearAllCookies = useCallback(async () => {
    try {
      const result = await cookiesApi.clearAll();
      await refreshCookies();
      setSelectedCookie(null);
      return result.count;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to clear cookies";
      setError(message);
      throw err;
    }
  }, [refreshCookies]);

  const exportCookies = useCallback(async () => {
    try {
      const cookiesToExport = filterCookies(cookies, searchTerm, selectedDomain, selectedUrl);
      const json = JSON.stringify(cookiesToExport, null, 2);
      await navigator.clipboard.writeText(json);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to export cookies";
      setError(message);
      throw err;
    }
  }, [cookies, searchTerm, selectedDomain, selectedUrl]);

  const filteredCookies = React.useMemo(() => {
    return filterCookies(cookies, searchTerm, selectedDomain, selectedUrl);
  }, [cookies, searchTerm, selectedDomain, selectedUrl]);

  const value: CookiesContextValue = {
    cookies,
    filteredCookies,
    selectedCookie,
    searchTerm,
    selectedDomain,
    selectedUrl,
    browserProfiles,
    selectedSource,
    isLoading,
    error,
    refreshCookies,
    selectCookie,
    setSearchTerm: handleSetSearchTerm,
    setSelectedDomain: handleSetSelectedDomain,
    setSelectedUrl: handleSetSelectedUrl,
    setSelectedSource: handleSetSelectedSource,
    loadBrowserProfiles,
    deleteCookie,
    clearAllCookies,
    exportCookies,
  };

  return (
    <CookiesContext.Provider value={value}>{children}</CookiesContext.Provider>
  );
};
