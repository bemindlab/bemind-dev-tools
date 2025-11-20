import React, { useEffect, useRef } from "react";
import { ToolComponentProps } from "../types/dashboard";
import { CookiesProvider, useCookies } from "../contexts/CookiesContext";
import { CookiesToolbar } from "../components/CookiesToolbar";
import { CookieSearchBar } from "../components/CookieSearchBar";
import { CookiesList } from "../components/CookiesList";
import { CookieDetailsPanel } from "../components/CookieDetailsPanel";
import "./CookiesMonitorTool.css";

const POLLING_INTERVAL = 500;

const CookiesMonitorContent: React.FC<ToolComponentProps> = ({ isActive }) => {
  const { refreshCookies, error } = useCookies();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Load cookies on mount
    refreshCookies();
  }, [refreshCookies]);

  useEffect(() => {
    if (isActive) {
      // Start polling when active
      intervalRef.current = setInterval(() => {
        refreshCookies();
      }, POLLING_INTERVAL);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    } else {
      // Stop polling when inactive
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [isActive, refreshCookies]);

  return (
    <div className="cookies-monitor-tool">
      <CookiesToolbar />
      <CookieSearchBar />
      
      <div className="cookies-content">
        <CookiesList />
        <CookieDetailsPanel />
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}
    </div>
  );
};

export const CookiesMonitorTool: React.FC<ToolComponentProps> = (props) => {
  return (
    <CookiesProvider>
      <CookiesMonitorContent {...props} />
    </CookiesProvider>
  );
};
