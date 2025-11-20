import React, { useState, useEffect } from "react";
import { useCookies } from "../contexts/CookiesContext";
import { calculateTotalSize, formatCookieSize, isTotalSizeWarning } from "../utils/cookieUtils";
import "./CookiesToolbar.css";

const getBrowserIcon = (browser: string): string => {
  switch (browser.toLowerCase()) {
    case "chrome":
      return "🌐";
    case "firefox":
      return "🦊";
    case "edge":
      return "🔷";
    case "brave":
      return "🦁";
    default:
      return "🌐";
  }
};

export const CookiesToolbar: React.FC = () => {
  const { 
    filteredCookies, 
    browserProfiles, 
    selectedSource, 
    refreshCookies, 
    clearAllCookies, 
    exportCookies, 
    setSelectedSource,
    loadBrowserProfiles,
    isLoading 
  } = useCookies();
  const [showConfirm, setShowConfirm] = useState(false);

  const totalSize = calculateTotalSize(filteredCookies);
  const hasSizeWarning = isTotalSizeWarning(totalSize);
  const isReadOnly = selectedSource !== "electron";

  // Load browser profiles on mount
  useEffect(() => {
    loadBrowserProfiles();
  }, [loadBrowserProfiles]);

  const handleRefresh = async () => {
    try {
      await refreshCookies();
    } catch (err) {
      console.error("Failed to refresh cookies:", err);
    }
  };

  const handleSourceChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSource = e.target.value;
    try {
      await setSelectedSource(newSource);
    } catch (err) {
      console.error("Failed to change source:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to change cookie source";
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleClearAll = () => {
    if (isReadOnly) {
      alert("Cannot delete cookies from external browsers (read-only)");
      return;
    }
    setShowConfirm(true);
  };

  const confirmClearAll = async () => {
    try {
      const count = await clearAllCookies();
      alert(`Cleared ${count} cookies`);
    } catch (err) {
      alert("Failed to clear cookies");
      console.error("Failed to clear cookies:", err);
    } finally {
      setShowConfirm(false);
    }
  };

  const cancelClearAll = () => {
    setShowConfirm(false);
  };

  const handleExport = async () => {
    try {
      await exportCookies();
      alert("Cookies exported to clipboard!");
    } catch (err) {
      alert("Failed to export cookies");
      console.error("Failed to export cookies:", err);
    }
  };

  return (
    <div className="cookies-toolbar">
      <div className="toolbar-left">
        <div className="source-selector">
          <label htmlFor="cookie-source" className="source-label">
            Source:
          </label>
          <select
            id="cookie-source"
            className="source-dropdown"
            value={selectedSource}
            onChange={handleSourceChange}
            disabled={isLoading}
          >
            <option value="electron">⚡ Electron (Built-in)</option>
            {browserProfiles.map((profile) => {
              const profileId = `${profile.browser}-${profile.profileName}`;
              const icon = getBrowserIcon(profile.browser);
              return (
                <option key={profileId} value={profileId}>
                  {icon} {profile.browser} - {profile.profileName}
                </option>
              );
            })}
          </select>
          {isReadOnly && (
            <span className="read-only-badge" title="Browser cookies are read-only">
              👁️ Read-Only
            </span>
          )}
        </div>

        <div className="toolbar-stats">
          <div className="stat-item">
            <span className="stat-label">Total:</span>
            <span className="stat-value">{filteredCookies.length}</span>
          </div>
          <div className={`stat-item ${hasSizeWarning ? "warning" : ""}`}>
            <span className="stat-label">Size:</span>
            <span className="stat-value">
              {formatCookieSize(totalSize)}
              {hasSizeWarning && <span className="warning-icon" title="Total size exceeds 10KB">⚠️</span>}
            </span>
          </div>
        </div>
      </div>

      <div className="toolbar-actions">
        <button
          className="toolbar-btn refresh-btn"
          onClick={handleRefresh}
          disabled={isLoading}
          title="Refresh cookies"
        >
          🔄 Refresh
        </button>

        <button
          className="toolbar-btn export-btn"
          onClick={handleExport}
          disabled={filteredCookies.length === 0}
          title="Export cookies to clipboard"
        >
          📋 Export
        </button>

        <button
          className="toolbar-btn clear-btn"
          onClick={handleClearAll}
          disabled={filteredCookies.length === 0 || isReadOnly}
          title={isReadOnly ? "Cannot delete browser cookies (read-only)" : "Clear all cookies"}
        >
          🗑️ Clear All
        </button>
      </div>

      {showConfirm && (
        <div className="confirm-dialog-overlay">
          <div className="confirm-dialog">
            <h3>Clear All Cookies?</h3>
            <p>This will delete all cookies. This action cannot be undone.</p>
            <div className="confirm-actions">
              <button className="confirm-btn cancel" onClick={cancelClearAll}>
                Cancel
              </button>
              <button className="confirm-btn danger" onClick={confirmClearAll}>
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
