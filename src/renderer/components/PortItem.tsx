import React, { memo, useState } from "react";
import { PortInfo } from "../contexts/types";
import { useNotifications, ClipboardService } from "../services";
import { ConfirmDialog, shouldShowConfirmation } from "./ConfirmDialog";
import { getPortsAPI } from "../utils/portsApi";
import "./PortItem.css";

interface PortItemProps {
  port: PortInfo;
  isSelected: boolean;
  onSelect: () => void;
}

export const PortItem: React.FC<PortItemProps> = memo(
  ({ port, isSelected, onSelect }) => {
    const notifications = useNotifications();
    const [showCopyMenu, setShowCopyMenu] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [isKilling, setIsKilling] = useState(false);

    const getProtocolBadgeClass = (protocol: string) => {
      return `protocol-badge protocol-${protocol.toLowerCase()}`;
    };

    const getStateBadgeClass = (state: string) => {
      const normalizedState = state.toLowerCase();
      if (normalizedState.includes("listen")) return "state-badge state-listen";
      if (normalizedState.includes("established"))
        return "state-badge state-established";
      return "state-badge state-other";
    };

    const canOpenInBrowser = port.port >= 3000 && port.port <= 9999;

    const handleOpenInBrowser = async (e: React.MouseEvent) => {
      e.stopPropagation();
      try {
        const result = await getPortsAPI().openInBrowser(port.port);
        if (result.success) {
          notifications.showOpenBrowserSuccess(port.port);
        } else {
          const errorMessage = result.message || "Unknown error";
          if (
            errorMessage.toLowerCase().includes("permission") ||
            errorMessage.toLowerCase().includes("access denied")
          ) {
            notifications.showPermissionError("open browser");
          } else {
            notifications.showOpenBrowserError(port.port, errorMessage);
          }
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        if (
          errorMessage.toLowerCase().includes("permission") ||
          errorMessage.toLowerCase().includes("access denied")
        ) {
          notifications.showPermissionError("open browser");
        } else {
          notifications.showOpenBrowserError(port.port, errorMessage);
        }
      }
    };

    const handleKillProcess = async (e: React.MouseEvent) => {
      e.stopPropagation();

      const storageKey = `confirm-kill-process`;
      if (shouldShowConfirmation(storageKey)) {
        setShowConfirmDialog(true);
        return;
      }

      await executeKillProcess();
    };

    const executeKillProcess = async () => {
      try {
        setIsKilling(true);
        const result = await getPortsAPI().killProcess(port.port);
        if (result.success) {
          notifications.showKillSuccess(port.port, port.processName);
        } else {
          const errorMessage = result.message || "Unknown error";
          if (
            errorMessage.toLowerCase().includes("permission") ||
            errorMessage.toLowerCase().includes("access denied") ||
            errorMessage.toLowerCase().includes("elevated") ||
            errorMessage.toLowerCase().includes("administrator")
          ) {
            notifications.showPermissionError(
              "kill process",
              "This process may require administrator/root privileges to terminate."
            );
          } else if (
            errorMessage.toLowerCase().includes("command") ||
            errorMessage.toLowerCase().includes("platform")
          ) {
            notifications.showPlatformError(errorMessage, () =>
              executeKillProcess()
            );
          } else {
            notifications.showKillError(port.port, errorMessage);
          }
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        if (
          errorMessage.toLowerCase().includes("permission") ||
          errorMessage.toLowerCase().includes("access denied") ||
          errorMessage.toLowerCase().includes("elevated") ||
          errorMessage.toLowerCase().includes("administrator")
        ) {
          notifications.showPermissionError(
            "kill process",
            "This process may require administrator/root privileges to terminate."
          );
        } else if (
          errorMessage.toLowerCase().includes("command") ||
          errorMessage.toLowerCase().includes("platform")
        ) {
          notifications.showPlatformError(errorMessage, () =>
            executeKillProcess()
          );
        } else {
          notifications.showKillError(port.port, errorMessage);
        }
      } finally {
        setIsKilling(false);
      }
    };

    const handleConfirmKill = () => {
      setShowConfirmDialog(false);
      executeKillProcess();
    };

    const handleCancelKill = () => {
      setShowConfirmDialog(false);
    };

    const handleCopyPort = async (e: React.MouseEvent) => {
      e.stopPropagation();
      const result = await ClipboardService.copyPort(port.port);
      if (result.success) {
        notifications.showCopyConfirmation("port");
      } else {
        notifications.show({
          type: "error",
          title: "Copy Failed",
          message: result.error || "Failed to copy port to clipboard",
          duration: 3000,
        });
      }
      setShowCopyMenu(false);
    };

    const handleCopyURL = async (e: React.MouseEvent) => {
      e.stopPropagation();
      const result = await ClipboardService.copyURL(port.port);
      if (result.success) {
        notifications.showCopyConfirmation("url");
      } else {
        notifications.show({
          type: "error",
          title: "Copy Failed",
          message: result.error || "Failed to copy URL to clipboard",
          duration: 3000,
        });
      }
      setShowCopyMenu(false);
    };

    const handleCopyProcessInfo = async (e: React.MouseEvent) => {
      e.stopPropagation();
      const result = await ClipboardService.copyProcessInfo(port);
      if (result.success) {
        notifications.showCopyConfirmation("process");
      } else {
        notifications.show({
          type: "error",
          title: "Copy Failed",
          message: result.error || "Failed to copy process info to clipboard",
          duration: 3000,
        });
      }
      setShowCopyMenu(false);
    };

    const toggleCopyMenu = (e: React.MouseEvent) => {
      e.stopPropagation();
      setShowCopyMenu(!showCopyMenu);
    };

    return (
      <div
        className={`port-item ${isSelected ? "port-item-selected" : ""}`}
        onClick={onSelect}
      >
        <div className="port-item-main">
          <div className="port-item-header">
            <div className="port-number-section">
              <span className="port-number">{port.port}</span>
              <span className={getProtocolBadgeClass(port.protocol)}>
                {port.protocol}
              </span>
              <span className={getStateBadgeClass(port.state)}>
                {port.state}
              </span>
            </div>
            {port.framework && (
              <div className="framework-badge">
                <span className="framework-icon">⚡</span>
                <span className="framework-name">
                  {port.framework.displayName}
                </span>
              </div>
            )}
          </div>

          <div className="port-item-details">
            <div className="process-info">
              <span className="process-name">{port.processName}</span>
              <span className="process-separator">•</span>
              <span className="process-pid">PID: {port.processId}</span>
            </div>
          </div>
        </div>

        <div className="port-item-actions">
          {canOpenInBrowser && (
            <button
              className="action-button action-button-primary"
              onClick={handleOpenInBrowser}
              title="Open in Browser"
            >
              <span className="action-icon">🌐</span>
              <span className="action-label">Open</span>
            </button>
          )}

          <button
            className={`action-button action-button-danger ${isKilling ? "action-button-danger-busy" : ""}`}
            onClick={handleKillProcess}
            title={isKilling ? "Killing process..." : "Kill Process"}
            disabled={isKilling}
          >
            <span className="action-icon">{isKilling ? "…" : "⛔"}</span>
            <span className="action-label">
              {isKilling ? "Killing..." : "Kill"}
            </span>
          </button>

          <div className="copy-dropdown">
            <button
              className="action-button action-button-secondary"
              onClick={toggleCopyMenu}
              title="Copy"
            >
              <span className="action-icon">📋</span>
              <span className="action-label">Copy</span>
            </button>
            {showCopyMenu && (
              <div className="copy-menu">
                <button className="copy-menu-item" onClick={handleCopyPort}>
                  Copy Port
                </button>
                <button className="copy-menu-item" onClick={handleCopyURL}>
                  Copy URL
                </button>
                <button
                  className="copy-menu-item"
                  onClick={handleCopyProcessInfo}
                >
                  Copy Process Info
                </button>
              </div>
            )}
          </div>
        </div>

        <ConfirmDialog
          isOpen={showConfirmDialog}
          title="Kill Process"
          message={`Are you sure you want to kill the process "${port.processName}" running on port ${port.port}?`}
          confirmLabel="Kill Process"
          cancelLabel="Cancel"
          onConfirm={handleConfirmKill}
          onCancel={handleCancelKill}
          storageKey="confirm-kill-process"
          showDontAskAgain={true}
        />
      </div>
    );
  }
);

PortItem.displayName = "PortItem";
