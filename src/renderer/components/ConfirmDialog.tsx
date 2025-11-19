import React, { useState, useEffect } from "react";
import "./ConfirmDialog.css";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  storageKey?: string; // Key for "Don't ask again" preference
  showDontAskAgain?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  storageKey,
  showDontAskAgain = true,
}) => {
  const [dontAskAgain, setDontAskAgain] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setDontAskAgain(false);
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleConfirm = () => {
    if (dontAskAgain && storageKey) {
      localStorage.setItem(storageKey, "true");
    }
    onConfirm();
  };

  const handleCancel = () => {
    onCancel();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleCancel();
    }
  };

  return (
    <div className="confirm-dialog-backdrop" onClick={handleBackdropClick}>
      <div className="confirm-dialog">
        <div className="confirm-dialog-header">
          <h3 className="confirm-dialog-title">{title}</h3>
          <button
            className="confirm-dialog-close"
            onClick={handleCancel}
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        <div className="confirm-dialog-content">
          <p className="confirm-dialog-message">{message}</p>

          {showDontAskAgain && storageKey && (
            <label className="confirm-dialog-checkbox">
              <input
                type="checkbox"
                checked={dontAskAgain}
                onChange={(e) => setDontAskAgain(e.target.checked)}
              />
              <span>Don't ask again</span>
            </label>
          )}
        </div>

        <div className="confirm-dialog-actions">
          <button
            className="confirm-dialog-button confirm-dialog-button-secondary"
            onClick={handleCancel}
          >
            {cancelLabel}
          </button>
          <button
            className="confirm-dialog-button confirm-dialog-button-danger"
            onClick={handleConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

// Utility function to check if user has disabled confirmation
export const shouldShowConfirmation = (storageKey: string): boolean => {
  return localStorage.getItem(storageKey) !== "true";
};

// Utility function to reset confirmation preference
export const resetConfirmationPreference = (storageKey: string): void => {
  localStorage.removeItem(storageKey);
};
