import React, { useState, useRef, useEffect } from "react";
import "./Footer.css";

interface FooterProps {
  version?: string;
}

export const Footer: React.FC<FooterProps> = ({ version = "1.0.0" }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  const handleSupportClick = () => {
    setShowMenu(!showMenu);
  };

  const handleMenuAction = (action: string) => {
    setShowMenu(false);
    
    switch (action) {
      case "documentation":
        console.log("Open documentation");
        break;
      case "report-issue":
        console.log("Open issue tracker");
        break;
      case "about":
        console.log("Show about dialog");
        break;
    }
  };

  return (
    <footer className="mini-footer">
      <div className="footer-content">
        <div className="footer-left">
          <span className="app-version">v{version}</span>
        </div>
        
        <div className="footer-right" ref={menuRef}>
          <button
            className="support-button"
            onClick={handleSupportClick}
            title="Support & Help"
            aria-label="Support menu"
            aria-expanded={showMenu}
            aria-haspopup="true"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </button>

          {showMenu && (
            <div className="support-menu" role="menu">
              <button
                className="menu-item"
                role="menuitem"
                onClick={() => handleMenuAction("documentation")}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
                Documentation
              </button>
              <button
                className="menu-item"
                role="menuitem"
                onClick={() => handleMenuAction("report-issue")}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                Report Issue
              </button>
              <button
                className="menu-item"
                role="menuitem"
                onClick={() => handleMenuAction("about")}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                About
              </button>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
};
