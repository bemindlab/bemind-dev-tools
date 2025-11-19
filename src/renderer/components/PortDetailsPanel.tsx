import React, { memo, useState } from "react";
import { PortInfo } from "../contexts/types";
import { useNotifications, ClipboardService } from "../services";
import { ConfirmDialog, shouldShowConfirmation } from "./ConfirmDialog";
import { getPortsAPI } from "../utils/portsApi";
import "./PortDetailsPanel.css";

interface PortDetailsPanelProps {
  port: PortInfo | null;
  onClose: () => void;
}

export const PortDetailsPanel: React.FC<PortDetailsPanelProps> = memo(
  ({ port, onClose }) => {
    const notifications = useNotifications();
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    if (!port) {
      return null;
    }

    const canOpenInBrowser = port.port >= 3000 && port.port <= 9999;

    const handleOpenInBrowser = async () => {
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

    const handleKillProcess = async () => {
      const storageKey = `confirm-kill-process`;
      if (shouldShowConfirmation(storageKey)) {
        setShowConfirmDialog(true);
        return;
      }

      await executeKillProcess();
    };

    const executeKillProcess = async () => {
      try {
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
      }
    };

    const handleConfirmKill = () => {
      setShowConfirmDialog(false);
      executeKillProcess();
    };

    const handleCancelKill = () => {
      setShowConfirmDialog(false);
    };

    const handleCopyPort = async () => {
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
    };

    const handleCopyURL = async () => {
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
    };

    const handleCopyProcessInfo = async () => {
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
    };

    return (
      <div className="port-details-panel">
        <div className="port-details-header">
          <div className="port-details-title">
            <h2>Port Details</h2>
            <span className="port-details-port-number">{port.port}</span>
          </div>
          <button
            className="port-details-close"
            onClick={onClose}
            title="Close Details"
          >
            ✕
          </button>
        </div>

        <div className="port-details-content">
          {/* Protocol and State Section */}
          <div className="port-details-section">
            <h3 className="port-details-section-title">Connection Info</h3>
            <div className="port-details-info-grid">
              <div className="port-details-info-item">
                <span className="port-details-label">Protocol</span>
                <span
                  className={`port-details-value protocol-${port.protocol.toLowerCase()}`}
                >
                  {port.protocol}
                </span>
              </div>
              <div className="port-details-info-item">
                <span className="port-details-label">State</span>
                <span className="port-details-value">{port.state}</span>
              </div>
              {port.localAddress && (
                <div className="port-details-info-item">
                  <span className="port-details-label">Local Address</span>
                  <span className="port-details-value port-details-mono">
                    {port.localAddress}
                  </span>
                </div>
              )}
              {port.remoteAddress && (
                <div className="port-details-info-item">
                  <span className="port-details-label">Remote Address</span>
                  <span className="port-details-value port-details-mono">
                    {port.remoteAddress}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Application/Framework Section */}
          {port.framework && (
            <div className="port-details-section">
              <h3 className="port-details-section-title">Application</h3>
              <div className="port-details-framework">
                <span className="port-details-framework-icon">⚡</span>
                <span className="port-details-framework-name">
                  {port.framework.displayName}
                </span>
              </div>
            </div>
          )}

          {/* Process Information Section */}
          <div className="port-details-section">
            <h3 className="port-details-section-title">Process Information</h3>
            <div className="port-details-info-grid">
              <div className="port-details-info-item">
                <span className="port-details-label">Process Name</span>
                <span className="port-details-value port-details-mono">
                  {port.processName}
                </span>
              </div>
              <div className="port-details-info-item">
                <span className="port-details-label">Process ID</span>
                <span className="port-details-value port-details-mono">
                  {port.processId}
                </span>
              </div>
              {(port as any).startTime && (
                <div className="port-details-info-item">
                  <span className="port-details-label">Start Time</span>
                  <span className="port-details-value">
                    {new Date((port as any).startTime).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Command Line Section */}
          <div className="port-details-section">
            <h3 className="port-details-section-title">Command Line</h3>
            <div className="port-details-command-wrapper">
              <textarea
                className="port-details-command"
                value={port.commandLine}
                readOnly
                rows={4}
              />
            </div>
          </div>

          {/* Action Buttons Section */}
          <div className="port-details-actions">
            {canOpenInBrowser && (
              <button
                className="port-details-action-button port-details-action-primary"
                onClick={handleOpenInBrowser}
              >
                <span className="port-details-action-icon">🌐</span>
                <span>Open in Browser</span>
              </button>
            )}

            <button
              className="port-details-action-button port-details-action-danger"
              onClick={handleKillProcess}
            >
              <span className="port-details-action-icon">⛔</span>
              <span>Kill Process</span>
            </button>

            <div className="port-details-copy-actions">
              <button
                className="port-details-action-button port-details-action-secondary"
                onClick={handleCopyPort}
                title="Copy Port Number"
              >
                <span className="port-details-action-icon">📋</span>
                <span>Copy Port</span>
              </button>
              <button
                className="port-details-action-button port-details-action-secondary"
                onClick={handleCopyURL}
                title="Copy URL"
              >
                <span className="port-details-action-icon">🔗</span>
                <span>Copy URL</span>
              </button>
              <button
                className="port-details-action-button port-details-action-secondary"
                onClick={handleCopyProcessInfo}
                title="Copy Process Info"
              >
                <span className="port-details-action-icon">📄</span>
                <span>Copy Info</span>
              </button>
            </div>
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

PortDetailsPanel.displayName = "PortDetailsPanel";
