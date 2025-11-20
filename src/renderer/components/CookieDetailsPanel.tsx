import React from "react";
import { useCookies } from "../contexts/CookiesContext";
import { calculateCookieSize, formatExpirationDate, formatCookieSize } from "../utils/cookieUtils";
import "./CookieDetailsPanel.css";

export const CookieDetailsPanel: React.FC = () => {
  const { selectedCookie } = useCookies();

  if (!selectedCookie) {
    return (
      <div className="cookie-details-panel">
        <div className="no-selection">
          <p>No cookie selected</p>
          <p className="hint">Select a cookie from the list to view details</p>
        </div>
      </div>
    );
  }

  const size = calculateCookieSize(selectedCookie);
  const isLongValue = selectedCookie.value.length > 100;

  return (
    <div className="cookie-details-panel">
      <h3 className="details-title">Cookie Details</h3>
      
      <div className="detail-section">
        <div className="detail-row">
          <span className="detail-label">Name:</span>
          <span className="detail-value">{selectedCookie.name}</span>
        </div>

        <div className="detail-row">
          <span className="detail-label">Value:</span>
          <div className={`detail-value ${isLongValue ? "scrollable" : ""}`}>
            {selectedCookie.value}
          </div>
        </div>

        <div className="detail-row">
          <span className="detail-label">Domain:</span>
          <span className="detail-value">{selectedCookie.domain}</span>
        </div>

        <div className="detail-row">
          <span className="detail-label">Path:</span>
          <span className="detail-value">{selectedCookie.path}</span>
        </div>

        <div className="detail-row">
          <span className="detail-label">Expiration:</span>
          <span className="detail-value">
            {formatExpirationDate(selectedCookie.expirationDate)}
          </span>
        </div>

        <div className="detail-row">
          <span className="detail-label">Size:</span>
          <span className="detail-value">{formatCookieSize(size)}</span>
        </div>
      </div>

      <div className="security-section">
        <h4 className="section-title">Security Flags</h4>
        
        <div className="security-flags">
          <div className={`security-flag ${selectedCookie.secure ? "enabled" : "disabled"}`}>
            <span className="flag-icon">{selectedCookie.secure ? "🔒" : "🔓"}</span>
            <span className="flag-label">Secure</span>
            <span className="flag-status">{selectedCookie.secure ? "Enabled" : "Disabled"}</span>
          </div>

          <div className={`security-flag ${selectedCookie.httpOnly ? "enabled" : "disabled"}`}>
            <span className="flag-icon">{selectedCookie.httpOnly ? "🛡️" : "⚠️"}</span>
            <span className="flag-label">HttpOnly</span>
            <span className="flag-status">{selectedCookie.httpOnly ? "Enabled" : "Disabled"}</span>
          </div>

          <div className="security-flag">
            <span className="flag-icon">🌐</span>
            <span className="flag-label">SameSite</span>
            <span className="flag-status">{selectedCookie.sameSite || "unspecified"}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
