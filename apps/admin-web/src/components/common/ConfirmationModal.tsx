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
    danger: <AlertCircle className="w-6 h-6 text-[#880E23]" />,
    warning: <AlertTriangle className="w-6 h-6 text-amber-600" />,
    success: <CheckCircle className="w-6 h-6 text-emerald-600" />,
    info: <Info className="w-6 h-6 text-[#880E23]" />,
  };

  const bgIconMap = {
    danger: 'bg-[#FDF2F4] border-[#F8CAD1]',
    warning: 'bg-amber-50 border-amber-100',
    success: 'bg-emerald-50 border-emerald-100',
    info: 'bg-[#FDF2F4] border-[#F8CAD1]',
  };

  const buttonStyleMap = {
    danger: 'bg-[#880E23] hover:bg-[#6B081A] text-white shadow-xs',
    warning: 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs',
    success: 'bg-[#880E23] hover:bg-[#6B081A] text-white shadow-xs',
    info: 'bg-[#880E23] hover:bg-[#6B081A] text-white shadow-xs',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2D040A]/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl border border-[#E8E2D8] w-full max-w-md overflow-hidden">
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className={`p-2.5 rounded-xl border ${bgIconMap[variant]}`}>
              {iconMap[variant]}
            </div>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="text-[#877A65] hover:text-[#2D2526] p-1 rounded-md"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-4">
            <h3 className="text-base font-bold text-[#2D2526]">{title}</h3>
            <p className="text-xs text-[#74675B] mt-1 leading-relaxed">{description}</p>
          </div>

          {children && <div className="mt-4">{children}</div>}

          <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-[#EBE5DB]">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 border border-[#DDD5C7] text-[#4E463A] bg-[#FAF8F5] hover:bg-[#EBE5DB] rounded-lg text-xs font-semibold transition-colors"
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
