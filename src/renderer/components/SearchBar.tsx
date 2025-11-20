import React, { useState, useEffect, useCallback } from "react";
import "./SearchBar.css";

interface SearchBarProps {
  value: string;
  onChange: (query: string) => void;
  onClear: () => void;
  placeholder?: string;
  debounceMs?: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onClear,
  placeholder = "Search tools...",
  debounceMs = 100,
}) => {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(localValue);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [localValue, debounceMs, onChange]);

  const handleClear = useCallback(() => {
    setLocalValue("");
    onClear();
  }, [onClear]);

  return (
    <div className="search-bar">
      <input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        className="search-input"
        aria-label="Search tools"
      />
      {localValue && (
        <button
          onClick={handleClear}
          className="search-clear"
          aria-label="Clear search"
        >
          ×
        </button>
      )}
    </div>
  );
};
