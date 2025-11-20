import React, { useState, useEffect } from "react";
import { useCookies } from "../contexts/CookiesContext";
import { getUniqueDomains } from "../utils/cookieUtils";
import "./CookieSearchBar.css";

export const CookieSearchBar: React.FC = () => {
  const { cookies, searchTerm, selectedDomain, selectedUrl, setSearchTerm, setSelectedDomain, setSelectedUrl } = useCookies();
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const [localUrl, setLocalUrl] = useState(selectedUrl);

  const domains = React.useMemo(() => getUniqueDomains(cookies), [cookies]);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(localSearchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearchTerm, setSearchTerm]);

  // Debounce URL
  useEffect(() => {
    const timer = setTimeout(() => {
      setSelectedUrl(localUrl);
    }, 300);

    return () => clearTimeout(timer);
  }, [localUrl, setSelectedUrl]);

  const handleClearFilters = () => {
    setLocalSearchTerm("");
    setSearchTerm("");
    setSelectedDomain("");
    setLocalUrl("");
    setSelectedUrl("");
  };

  const hasFilters = searchTerm || selectedDomain || selectedUrl;

  return (
    <div className="cookie-search-bar">
      <input
        type="text"
        className="search-input"
        placeholder="Search cookies (name, value, domain)..."
        value={localSearchTerm}
        onChange={(e) => setLocalSearchTerm(e.target.value)}
      />

      <input
        type="url"
        className="url-input"
        placeholder="Filter by URL (e.g., https://example.com/path)..."
        value={localUrl}
        onChange={(e) => setLocalUrl(e.target.value)}
        title="Show only cookies that would be sent to this URL"
      />
      
      <select
        className="domain-filter"
        value={selectedDomain}
        onChange={(e) => setSelectedDomain(e.target.value)}
      >
        <option value="">All Domains</option>
        {domains.map((domain) => (
          <option key={domain} value={domain}>
            {domain}
          </option>
        ))}
      </select>

      {hasFilters && (
        <button className="clear-filters-btn" onClick={handleClearFilters}>
          Clear Filters
        </button>
      )}
    </div>
  );
};
