import React from "react";
import { useCookies } from "../contexts/CookiesContext";
import { calculateCookieSize, formatExpirationDate, formatCookieSize, isCookieSizeWarning } from "../utils/cookieUtils";
import { CookieEntry } from "../types/cookies";
import "./CookiesList.css";

export const CookiesList: React.FC = () => {
  const { filteredCookies, selectedCookie, selectedSource, selectCookie, deleteCookie } = useCookies();

  const isReadOnly = selectedSource !== "electron";

  const handleRowClick = (cookie: CookieEntry) => {
    selectCookie(cookie);
  };

  const handleDelete = async (e: React.MouseEvent, cookie: CookieEntry) => {
    e.stopPropagation();
    
    if (isReadOnly) {
      alert("Cannot delete cookies from external browsers (read-only)");
      return;
    }
    
    if (confirm(`Delete cookie "${cookie.name}"?`)) {
      try {
        await deleteCookie(cookie.name, cookie.domain, cookie.path);
      } catch (err) {
        console.error("Failed to delete cookie:", err);
      }
    }
  };

  if (filteredCookies.length === 0) {
    return (
      <div className="cookies-list-empty">
        <p>No cookies found</p>
      </div>
    );
  }

  return (
    <div className="cookies-list-container">
      <table className="cookies-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Domain</th>
            <th>Expiration</th>
            <th>Size</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredCookies.map((cookie, index) => {
            const size = calculateCookieSize(cookie);
            const isSelected = selectedCookie?.name === cookie.name && 
                              selectedCookie?.domain === cookie.domain &&
                              selectedCookie?.path === cookie.path;
            const hasWarning = isCookieSizeWarning(size);

            return (
              <tr
                key={`${cookie.domain}-${cookie.name}-${cookie.path}-${index}`}
                className={`cookie-row ${isSelected ? "selected" : ""} ${hasWarning ? "warning" : ""}`}
                onClick={() => handleRowClick(cookie)}
              >
                <td className="cookie-name">{cookie.name}</td>
                <td className="cookie-domain">{cookie.domain}</td>
                <td className="cookie-expiration">
                  {formatExpirationDate(cookie.expirationDate)}
                </td>
                <td className="cookie-size">
                  {formatCookieSize(size)}
                  {hasWarning && <span className="warning-icon" title="Large cookie (>4KB)">⚠️</span>}
                </td>
                <td className="cookie-actions">
                  <button
                    className="delete-btn"
                    onClick={(e) => handleDelete(e, cookie)}
                    disabled={isReadOnly}
                    title={isReadOnly ? "Cannot delete browser cookies (read-only)" : "Delete cookie"}
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
