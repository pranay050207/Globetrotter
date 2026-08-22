import React from 'react';
import { X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmButtonClass?: string;
  isConfirmDisabled?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  children,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmButtonClass = 'bg-primary-600 hover:bg-primary-700',
  isConfirmDisabled = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
      <div className="glass-card rounded-xl shadow-glass-lg w-full max-w-md transform transition-all">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-heading">{title}</h3>
            <button onClick={onClose} className="text-body-muted hover:text-body-muted" aria-label="Close">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="text-body-muted text-sm mb-6">{children}</div>
          <div className="flex justify-end space-x-4">
            <button 
              onClick={onClose} 
              disabled={isConfirmDisabled}
              className="px-4 py-2 rounded-lg font-medium bg-base-100 hover:bg-base-200 text-heading transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelText}
            </button>
            <button 
              onClick={onConfirm} 
              disabled={isConfirmDisabled}
              className={`px-4 py-2 rounded-lg font-medium text-white transition-colors ${confirmButtonClass} disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;

