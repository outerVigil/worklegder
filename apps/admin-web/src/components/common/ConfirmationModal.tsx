import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'success' | 'info';
  isLoading?: boolean;
  children?: React.ReactNode;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm Action',
  cancelLabel = 'Cancel',
  variant = 'info',
  isLoading = false,
  children,
}) => {
  if (!isOpen) return null;

  const iconMap = {
    danger: <AlertCircle className="w-6 h-6 text-rose-600" />,
    warning: <AlertTriangle className="w-6 h-6 text-amber-600" />,
    success: <CheckCircle className="w-6 h-6 text-emerald-600" />,
    info: <Info className="w-6 h-6 text-teal-600" />,
  };

  const bgIconMap = {
    danger: 'bg-rose-50 border-rose-100',
    warning: 'bg-amber-50 border-amber-100',
    success: 'bg-emerald-50 border-emerald-100',
    info: 'bg-teal-50 border-teal-100',
  };

  const buttonStyleMap = {
    danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs',
    warning: 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs',
    info: 'bg-teal-600 hover:bg-teal-700 text-white shadow-xs',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className={`p-2.5 rounded-xl border ${bgIconMap[variant]}`}>
              {iconMap[variant]}
            </div>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-4">
            <h3 className="text-base font-bold text-slate-900">{title}</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">{description}</p>
          </div>

          {children && <div className="mt-4">{children}</div>}

          <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold transition-colors"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 ${buttonStyleMap[variant]}`}
            >
              {isLoading ? 'Processing...' : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
