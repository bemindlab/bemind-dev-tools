import React, { useState, useEffect, useCallback, useRef } from "react";
import { usePortsManager } from "../contexts";
import "./PortsToolbar.css";

// Common port ranges for development
const PORT_RANGES = [
  { label: "All Dev Ports (3000-9999)", start: 3000, end: 9999 },
  { label: "Node.js (3000-3999)", start: 3000, end: 3999 },
  { label: "Angular (4200-4299)", start: 4200, end: 4299 },
  { label: "Flask/Python (5000-5999)", start: 5000, end: 5999 },
  { label: "Django/General (8000-8999)", start: 8000, end: 8999 },
  { label: "General Dev (9000-9999)", start: 9000, end: 9999 },
];

const PROTOCOL_OPTIONS = [
  { label: "All Protocols", value: "ALL" as const },
  { label: "TCP", value: "TCP" as const },
  { label: "UDP", value: "UDP" as const },
];

// LocalStorage keys
const STORAGE_KEYS = {
  SEARCH: "ports-manager-search",
  PORT_RANGE: "ports-manager-port-range",
  PROTOCOL: "ports-manager-protocol",
};

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = "Search by port, process, or framework...",
}) => {
  const [localValue, setLocalValue] = useState(value);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Update local value when prop changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new debounced timer (200ms)
    debounceTimerRef.current = setTimeout(() => {
      onChange(newValue);
      // Persist to localStorage
      localStorage.setItem(STORAGE_KEYS.SEARCH, newValue);
    }, 200);
  };

  const handleClear = () => {
    setLocalValue("");
    onChange("");
    localStorage.removeItem(STORAGE_KEYS.SEARCH);
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="search-input-container">
      <span className="search-icon">🔍</span>
      <input
        type="text"
        className="search-input"
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
      />
      {localValue && (
        <button
          className="search-clear-button"
          onClick={handleClear}
          aria-label="Clear search"
        >
          ✕
        </button>
      )}
    </div>
  );
};

interface FilterDropdownProps<T> {
  label: string;
  value: T;
  options: Array<{ label: string; value: T }>;
  onChange: (value: T) => void;
  storageKey?: string;
}

function FilterDropdown<T extends string | [number, number] | null>({
  label,
  value,
  options,
  onChange,
  storageKey,
}: FilterDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get display label for current value
  const getDisplayLabel = () => {
    const option = options.find((opt) => {
      if (Array.isArray(opt.value) && Array.isArray(value)) {
        return opt.value[0] === value[0] && opt.value[1] === value[1];
      }
      return opt.value === value;
    });
    return option ? option.label : label;
  };

  const handleSelect = (selectedValue: T) => {
    onChange(selectedValue);
    setIsOpen(false);

    // Persist to localStorage if storage key provided
    if (storageKey) {
      if (selectedValue === null) {
        localStorage.removeItem(storageKey);
      } else {
        localStorage.setItem(storageKey, JSON.stringify(selectedValue));
      }
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="filter-dropdown" ref={dropdownRef}>
      <button
        className="filter-dropdown-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span>{getDisplayLabel()}</span>
        <span className="dropdown-arrow">{isOpen ? "▲" : "▼"}</span>
      </button>
      {isOpen && (
        <div className="filter-dropdown-menu">
          {options.map((option, index) => {
            const isSelected =
              Array.isArray(option.value) && Array.isArray(value)
                ? option.value[0] === value[0] && option.value[1] === value[1]
                : option.value === value;

            return (
              <button
                key={index}
                className={`filter-dropdown-item ${
                  isSelected ? "selected" : ""
                }`}
                onClick={() => handleSelect(option.value)}
              >
                {option.label}
                {isSelected && <span className="check-mark">✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export const PortsToolbar: React.FC = () => {
  const { state, actions } = usePortsManager();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load persisted filters on mount
  useEffect(() => {
    const savedSearch = localStorage.getItem(STORAGE_KEYS.SEARCH);
    const savedPortRange = localStorage.getItem(STORAGE_KEYS.PORT_RANGE);
    const savedProtocol = localStorage.getItem(STORAGE_KEYS.PROTOCOL);

    if (savedSearch) {
      actions.setSearchFilter(savedSearch);
    }

    if (savedPortRange) {
      try {
        const range = JSON.parse(savedPortRange) as [number, number];
        actions.setPortRangeFilter(range);
      } catch (error) {
        console.error("Failed to parse saved port range:", error);
      }
    }

    if (savedProtocol) {
      try {
        const protocol = JSON.parse(savedProtocol) as "TCP" | "UDP" | "ALL";
        actions.setProtocolFilter(protocol);
      } catch (error) {
        console.error("Failed to parse saved protocol:", error);
      }
    }
  }, [actions]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await actions.refreshPorts();
    } finally {
      setIsRefreshing(false);
    }
  }, [actions]);

  const handlePortRangeChange = useCallback(
    (range: [number, number] | null) => {
      actions.setPortRangeFilter(range);
    },
    [actions]
  );

  const handleProtocolChange = useCallback(
    (protocol: "TCP" | "UDP" | "ALL") => {
      actions.setProtocolFilter(protocol);
    },
    [actions]
  );

  // Convert port ranges to dropdown options
  const portRangeOptions = [
    { label: "All Ports", value: null as [number, number] | null },
    ...PORT_RANGES.map((range) => ({
      label: range.label,
      value: [range.start, range.end] as [number, number],
    })),
  ];

  return (
    <div className="ports-toolbar">
      <div className="toolbar-left">
        <SearchInput
          value={state.filters.search}
          onChange={actions.setSearchFilter}
        />
      </div>

      <div className="toolbar-right">
        <FilterDropdown
          label="Port Range"
          value={state.filters.portRange}
          options={portRangeOptions}
          onChange={handlePortRangeChange}
          storageKey={STORAGE_KEYS.PORT_RANGE}
        />

        <FilterDropdown
          label="Protocol"
          value={state.filters.protocol}
          options={PROTOCOL_OPTIONS}
          onChange={handleProtocolChange}
          storageKey={STORAGE_KEYS.PROTOCOL}
        />

        <button
          className={`refresh-button ${isRefreshing ? "refreshing" : ""}`}
          onClick={handleRefresh}
          disabled={isRefreshing || state.isScanning}
          aria-label="Refresh ports"
          title="Refresh ports"
        >
          <span className="refresh-icon">🔄</span>
          {isRefreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>
    </div>
  );
};
