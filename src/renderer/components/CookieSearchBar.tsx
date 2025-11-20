import React, { useState, useEffect } from "react";
import { useCookies } from "../contexts/CookiesContext";
import { getUniqueDomains } from "../utils/cookieUtils";
import "./CookieSearchBar.css";

export const CookieSearchBar: React.FC = () => {
  const { cookies, searchTerm, selectedDomain, setSearchTerm, setSelectedDomain } = useCookies();
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

  const domains = React.useMemo(() => getUniqueDomains(cookies), [cookies]);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(localSearchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearchTerm, setSearchTerm]);

  const handleClearFilters = () => {
    setLocalSearchTerm("");
    setSearchTerm("");
    setSelectedDomain("");
  };

  const hasFilters = searchTerm || selectedDomain;

  return (
    <div className="cookie-search-bar">
      <input
        type="text"
        className="search-input"
        placeholder="Search cookies (name, value, domain)..."
        value={localSearchTerm}
        onChange={(e) => setLocalSearchTerm(e.target.value)}
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
