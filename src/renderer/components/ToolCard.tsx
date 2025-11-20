import React, { forwardRef, useState, useRef, useEffect } from "react";
import { Tool, ToolStatus } from "../types/dashboard";
import "./ToolCard.css";

interface ToolCardProps {
  tool: Tool;
  isPinned: boolean;
  isRecentlyUsed: boolean;
  status?: ToolStatus;
  notificationCount?: number;
  onSelect: () => void;
  onPin: () => void;
  onUnpin: () => void;
}

interface TooltipPosition {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
  transform?: string;
}

export const ToolCard = forwardRef<HTMLDivElement, ToolCardProps>(
  (
    {
      tool,
      isPinned,
      isRecentlyUsed,
      status,
      notificationCount,
      onSelect,
      onPin,
      onUnpin,
    },
    ref
  ) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition>({});
    const showTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const cardRef = useRef<HTMLDivElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);

    const handleContextMenu = (e: React.MouseEvent) => {
      e.preventDefault();
      if (isPinned) {
        onUnpin();
      } else {
        onPin();
      }
    };

    const calculateTooltipPosition = () => {
      if (!cardRef.current || !tooltipRef.current) return;

      const cardRect = cardRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      const position: TooltipPosition = {};

      // Try to position above the card by default
      const spaceAbove = cardRect.top;
      const spaceBelow = windowHeight - cardRect.bottom;
      const spaceLeft = cardRect.left;
      const spaceRight = windowWidth - cardRect.right;

      // Vertical positioning
      if (spaceAbove >= tooltipRect.height + 8) {
        // Position above
        position.bottom = windowHeight - cardRect.top + 8;
      } else if (spaceBelow >= tooltipRect.height + 8) {
        // Position below
        position.top = cardRect.bottom + 8;
      } else {
        // Not enough space above or below, position above anyway
        position.bottom = windowHeight - cardRect.top + 8;
      }

      // Horizontal positioning - try to center
      const cardCenter = cardRect.left + cardRect.width / 2;
      const tooltipHalfWidth = tooltipRect.width / 2;

      if (cardCenter - tooltipHalfWidth < 0) {
        // Too close to left edge
        position.left = 8;
        position.transform = undefined;
      } else if (cardCenter + tooltipHalfWidth > windowWidth) {
        // Too close to right edge
        position.right = 8;
        position.transform = undefined;
      } else {
        // Center horizontally
        position.left = cardCenter;
        position.transform = "translateX(-50%)";
      }

      setTooltipPosition(position);
    };

    const handleMouseEnter = () => {
      // Clear any pending hide timeout
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }

      // Set show timeout (500ms delay)
      showTimeoutRef.current = setTimeout(() => {
        setShowTooltip(true);
      }, 500);
    };

    const handleMouseLeave = () => {
      // Clear any pending show timeout
      if (showTimeoutRef.current) {
        clearTimeout(showTimeoutRef.current);
        showTimeoutRef.current = null;
      }

      // Set hide timeout (200ms delay)
      hideTimeoutRef.current = setTimeout(() => {
        setShowTooltip(false);
      }, 200);
    };

    // Calculate position when tooltip becomes visible
    useEffect(() => {
      if (showTooltip) {
        calculateTooltipPosition();
      }
    }, [showTooltip]);

    // Cleanup timeouts on unmount
    useEffect(() => {
      return () => {
        if (showTimeoutRef.current) {
          clearTimeout(showTimeoutRef.current);
        }
        if (hideTimeoutRef.current) {
          clearTimeout(hideTimeoutRef.current);
        }
      };
    }, []);

    const statusColor =
      status?.state === "active"
        ? "blue"
        : status?.state === "warning"
        ? "yellow"
        : status?.state === "error"
        ? "red"
        : undefined;

    return (
      <div
        ref={(node) => {
          (cardRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          if (typeof ref === "function") {
            ref(node);
          } else if (ref) {
            (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
          }
        }}
        className="tool-card"
        onClick={onSelect}
        onContextMenu={handleContextMenu}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onSelect();
          }
        }}
        aria-label={`Open ${tool.name}`}
      >
        {isRecentlyUsed && (
          <div className="recently-used-indicator" aria-label="Recently used">
            ⭐
          </div>
        )}
        {status && (
          <div
            className={`status-badge status-${statusColor}`}
            aria-label={`Status: ${status.state}`}
          >
            {status.state}
          </div>
        )}
        {notificationCount !== undefined && notificationCount > 0 && (
          <div
            className="notification-badge"
            aria-label={`${notificationCount} notifications`}
          >
            {notificationCount}
          </div>
        )}
        <div className="tool-icon">{tool.icon}</div>
        <h3 className="tool-name">{tool.name}</h3>
        <p className="tool-description">{tool.description}</p>
        {tool.features && tool.features.length > 0 && showTooltip && (
          <div
            ref={tooltipRef}
            className="tool-tooltip"
            style={tooltipPosition}
            role="tooltip"
          >
            <strong>Features:</strong>
            <ul>
              {tool.features.map((feature, idx) => (
                <li key={idx}>{feature}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }
);

ToolCard.displayName = "ToolCard";
