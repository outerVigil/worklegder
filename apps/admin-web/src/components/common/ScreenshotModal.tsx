import React, { useState } from 'react';
import { X, ZoomIn, ZoomOut, CheckCircle2, XCircle, ExternalLink, ShieldCheck } from 'lucide-react';
import { EntrySubmission } from '../../types';

interface ScreenshotModalProps {
  entry: EntrySubmission | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove?: (entry: EntrySubmission) => void;
  onReject?: (entry: EntrySubmission) => void;
}

export const ScreenshotModal: React.FC<ScreenshotModalProps> = ({
  entry,
  isOpen,
  onClose,
  onApprove,
  onReject,
}) => {
  const [zoom, setZoom] = useState(1);

  if (!isOpen || !entry) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#E8E2D8] flex items-center justify-between bg-[#FAF8F5] shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#FDF2F4] text-[#880E23] rounded-lg border border-[#F8CAD1]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-[#2D2526] text-base">Payment Proof Verification Lightbox</h3>
              <p className="text-xs text-[#74675B]">
                Submitted by {entry.employeeName} · Ref: <span className="font-mono text-[#880E23] font-semibold">{entry.referenceId}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg px-2 py-1 mr-2 shadow-xs">
              <button
                onClick={() => setZoom((z) => Math.max(0.7, z - 0.2))}
                className="p-1 text-[#685E4E] hover:text-[#2D2526]"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono px-2 text-[#4E463A]">{Math.round(zoom * 100)}%</span>
              <button
                onClick={() => setZoom((z) => Math.min(2.5, z + 0.2))}
                className="p-1 text-[#685E4E] hover:text-[#2D2526]"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#877A65] hover:text-[#2D2526] hover:bg-[#EBE5DB] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Split view (Metadata on left, Screenshot on right) */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12 gap-0">
          {/* Metadata Sidebar */}
          <div className="md:col-span-5 p-6 bg-[#FAF8F5] border-r border-[#E8E2D8] space-y-4">
            <div className="p-4 bg-white rounded-xl border border-[#E8E2D8] shadow-xs">
              <span className="text-xs text-[#74675B] uppercase tracking-wider block font-semibold">Claimed Withdrawal</span>
              <span className="text-2xl font-bold text-[#880E23] mt-1 block">
                ₹{entry.withdrawalAmount.toLocaleString()}
              </span>
              <span className="text-xs text-[#74675B] mt-0.5 block">
                Gross Entry Value: ₹{entry.amount.toLocaleString()}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-white rounded-lg border border-[#E8E2D8]">
                <span className="text-[#74675B] block mb-0.5">Destination Bank Account</span>
                <span className="font-mono font-medium text-[#2D2526] text-sm">{entry.bankAccountNumber}</span>
                <span className="text-[#74675B] block mt-0.5">
                  {entry.bankName} · IFSC: {entry.ifscCode}
                </span>
              </div>

              <div className="p-3 bg-white rounded-lg border border-[#E8E2D8]">
                <span className="text-[#74675B] block mb-0.5">UPI Gateway Reference</span>
                <span className="font-mono font-semibold text-[#880E23]">{entry.referenceId}</span>
              </div>

              <div className="p-3 bg-white rounded-lg border border-[#E8E2D8]">
                <span className="text-[#74675B] block mb-0.5">Associated Website / Task URL</span>
                <a
                  href={entry.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-[#880E23] hover:underline flex items-center gap-1 break-all"
                >
                  {entry.websiteUrl}
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              </div>

              {entry.remarks && (
                <div className="p-3 bg-white rounded-lg border border-[#E8E2D8]">
                  <span className="text-[#74675B] block mb-0.5">Employee Submission Notes</span>
                  <p className="text-[#4E463A] italic">{entry.remarks}</p>
                </div>
              )}
            </div>

            {/* If Already Reviewed */}
            {entry.status !== 'PENDING' && (
              <div
                className={`p-3.5 rounded-lg border text-xs ${
                  entry.status === 'APPROVED'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-[#FDF2F4] border-[#F8CAD1] text-[#780E21]'
                }`}
              >
                <p className="font-bold">Entry Status: {entry.status}</p>
                {entry.reviewedByName && (
                  <p className="mt-0.5">Reviewed by: {entry.reviewedByName}</p>
                )}
                {entry.rejectionReason && (
                  <p className="mt-1 font-medium text-[#880E23]">Reason: {entry.rejectionReason}</p>
                )}
              </div>
            )}
          </div>

          {/* Screenshot Preview Canvas */}
          <div className="md:col-span-7 p-6 bg-[#F5F1EB] flex items-center justify-center overflow-auto min-h-[350px]">
            <div
              style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
              className="transition-transform duration-150 shadow-lg rounded-xl overflow-hidden max-w-full"
            >
              <img
                src={entry.screenshotUrl}
                alt="Payment proof screenshot"
                className="max-h-[520px] w-auto object-contain rounded-xl border border-[#DDD5C7] bg-white"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 bg-white border-t border-[#E8E2D8] flex items-center justify-between shrink-0">
          <span className="text-xs text-[#74675B]">
            Ensure the UPI RRN, amount, and recipient timestamp match before approving.
          </span>

          <div className="flex items-center gap-3">
            {entry.status === 'PENDING' && onReject && (
              <button
                onClick={() => {
                  onClose();
                  onReject(entry);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 border border-[#F8CAD1] text-[#880E23] hover:bg-[#FDF2F4] rounded-lg text-xs font-semibold transition-colors"
              >
                <XCircle className="w-4 h-4" />
                Reject Entry
              </button>
            )}

            {entry.status === 'PENDING' && onApprove && (
              <button
                onClick={() => {
                  onClose();
                  onApprove(entry);
                }}
                className="inline-flex items-center gap-1.5 px-5 py-2 bg-[#880E23] hover:bg-[#6B081A] active:bg-[#4E0512] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                Approve &amp; Settle (₹{entry.withdrawalAmount.toLocaleString()})
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#FAF8F5] hover:bg-[#EBE5DB] text-[#4E463A] border border-[#DDD5C7] rounded-lg text-xs font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
