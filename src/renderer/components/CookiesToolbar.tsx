import React, { useState } from "react";
import { useCookies } from "../contexts/CookiesContext";
import { calculateTotalSize, formatCookieSize, isTotalSizeWarning } from "../utils/cookieUtils";
import "./CookiesToolbar.css";

export const CookiesToolbar: React.FC = () => {
  const { filteredCookies, refreshCookies, clearAllCookies, exportCookies, isLoading } = useCookies();
  const [showConfirm, setShowConfirm] = useState(false);

  const totalSize = calculateTotalSize(filteredCookies);
  const hasSizeWarning = isTotalSizeWarning(totalSize);

  const handleRefresh = async () => {
    try {
      await refreshCookies();
    } catch (err) {
      console.error("Failed to refresh cookies:", err);
    }
  };

  const handleClearAll = () => {
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
          disabled={filteredCookies.length === 0}
          title="Clear all cookies"
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
