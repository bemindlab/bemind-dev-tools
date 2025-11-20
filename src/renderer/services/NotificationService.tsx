import React, { createContext, useContext, ReactNode, useMemo } from "react";
import toast, { Toaster, Toast } from "react-hot-toast";
import { PortInfo } from "../contexts/types";

/**
 * Notification types supported by the service
 */
export type NotificationType = "info" | "warning" | "error" | "success";

/**
 * Notification action that can be triggered from a notification
 */
export interface NotificationAction {
  label: string;
  onClick: () => void;
}

/**
 * Configuration for a notification
 */
export interface NotificationConfig {
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
  actions?: NotificationAction[];
}

/**
 * Notification Service Interface
 */
interface INotificationService {
  show: (config: NotificationConfig) => void;
  showPortConflict: (
    port: number,
    processName: string,
    onView?: () => void,
    onKill?: () => void
  ) => void;
  showCopyConfirmation: (type: "port" | "url" | "process") => void;
  showKillSuccess: (port: number, processName: string) => void;
  showKillError: (port: number, error: string) => void;
  showOpenBrowserSuccess: (port: number) => void;
  showOpenBrowserError: (port: number, error: string) => void;
  showPermissionError: (action: string, instructions?: string) => void;
  showPlatformError: (error: string, onRetry?: () => void) => void;
}

const NotificationContext = createContext<INotificationService | null>(null);

/**
 * Custom notification component with actions
 */
const CustomNotification: React.FC<{
  t: Toast;
  title: string;
  message: string;
  type: NotificationType;
  actions?: NotificationAction[];
}> = ({ t, title, message, type, actions }) => {
  const getIcon = () => {
    switch (type) {
      case "success":
        return "✓";
      case "error":
        return "✕";
      case "warning":
        return "⚠";
      case "info":
      default:
        return "ℹ";
    }
  };

  const getTypeClass = () => {
    return `notification-${type}`;
  };

  return (
    <div
      className={`custom-notification ${getTypeClass()} ${
        t.visible ? "notification-enter" : "notification-exit"
      }`}
    >
      <div className="notification-icon">{getIcon()}</div>
      <div className="notification-content">
        <div className="notification-title">{title}</div>
        <div className="notification-message">{message}</div>
        {actions && actions.length > 0 && (
          <div className="notification-actions">
            {actions.map((action, index) => (
              <button
                key={index}
                className="notification-action-button"
                onClick={() => {
                  action.onClick();
                  toast.dismiss(t.id);
                }}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
      <button
        className="notification-close"
        onClick={() => toast.dismiss(t.id)}
      >
        ✕
      </button>
    </div>
  );
};

/**
 * Notification Service Provider Component
 */
export const NotificationServiceProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const service = useMemo<INotificationService>(() => {
    const api: INotificationService = {
      show: (config: NotificationConfig) => {
        const duration =
          config.duration ??
          (config.actions && config.actions.length > 0 ? Infinity : 2000);

      toast.custom(
        (t) => (
          <CustomNotification
            t={t}
            title={config.title}
            message={config.message}
            type={config.type}
            actions={config.actions}
          />
        ),
        {
          duration,
          position: "top-right",
        }
      );
    },

    showPortConflict: (
      port: number,
      processName: string,
      onView?: () => void,
      onKill?: () => void
    ) => {
      const actions: NotificationAction[] = [];

      if (onView) {
        actions.push({
          label: "View Port",
          onClick: onView,
        });
      }

      if (onKill) {
        actions.push({
          label: "Kill Process",
          onClick: onKill,
        });
      }

      api.show({
        type: "warning",
        title: "Port Conflict Detected",
        message: `Port ${port} is already in use by ${processName}`,
        duration: Infinity, // Persistent for conflicts
        actions,
      });
    },

    showCopyConfirmation: (type: "port" | "url" | "process") => {
      const messages = {
        port: "Port number copied to clipboard",
        url: "URL copied to clipboard",
        process: "Process info copied to clipboard",
      };

      api.show({
        type: "success",
        title: "Copied",
        message: messages[type],
        duration: 2000,
      });
    },

    showKillSuccess: (port: number, processName: string) => {
      api.show({
        type: "success",
        title: "Process Terminated",
        message: `Successfully killed ${processName} on port ${port}`,
        duration: 2000,
      });
    },

    showKillError: (port: number, error: string) => {
      api.show({
        type: "error",
        title: "Failed to Kill Process",
        message: `Could not terminate process on port ${port}: ${error}`,
        duration: 4000,
      });
    },

    showOpenBrowserSuccess: (port: number) => {
      api.show({
        type: "success",
        title: "Browser Opened",
        message: `Opened http://localhost:${port} in browser`,
        duration: 2000,
      });
    },

    showOpenBrowserError: (port: number, error: string) => {
      api.show({
        type: "error",
        title: "Failed to Open Browser",
        message: `Could not open port ${port}: ${error}`,
        duration: 4000,
      });
    },

    showPermissionError: (action: string, instructions?: string) => {
      const defaultInstructions =
        "You may need to run the application with elevated permissions or check your system security settings.";

      api.show({
        type: "error",
        title: "Permission Denied",
        message: `Cannot ${action}. ${instructions || defaultInstructions}`,
        duration: 6000,
      });
    },

    showPlatformError: (error: string, onRetry?: () => void) => {
      const actions: NotificationAction[] = [];

      if (onRetry) {
        actions.push({
          label: "Retry",
          onClick: onRetry,
        });
      }

      api.show({
        type: "error",
        title: "Platform Command Failed",
        message: `System command failed: ${error}. This may be due to platform-specific issues or missing system utilities.`,
        duration: onRetry ? Infinity : 6000,
        actions: actions.length > 0 ? actions : undefined,
      });
    },
    };

    return api;
  }, []);

  return (
    <NotificationContext.Provider value={service}>
      {children}
      <Toaster />
    </NotificationContext.Provider>
  );
};

/**
 * Hook to access the notification service
 */
export const useNotifications = (): INotificationService => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within NotificationServiceProvider"
    );
  }
  return context;
};
