import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  FileCheck,
  Filter,
  Search,
} from 'lucide-react';
import { subAdminApi } from '../../services/api';
import { EntrySubmission } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ScreenshotModal } from '../../components/common/ScreenshotModal';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';

export const SubAdminEntryManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [entries, setEntries] = useState<EntrySubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [unmaskedAccounts, setUnmaskedAccounts] = useState<Record<string, boolean>>({});

  // Modals
  const [selectedEntryForProof, setSelectedEntryForProof] = useState<EntrySubmission | null>(null);
  const [entryToApprove, setEntryToApprove] = useState<EntrySubmission | null>(null);
  const [entryToReject, setEntryToReject] = useState<EntrySubmission | null>(null);
  const [approvalRemarks, setApprovalRemarks] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const data = await subAdminApi.getEntries();
      setEntries(data);
    } catch (err) {
      console.error('Failed to load entries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const handleToggleMask = async (entry: EntrySubmission) => {
    const isCurrentlyUnmasked = unmaskedAccounts[entry.id];
    if (!isCurrentlyUnmasked) {
      // Log unmasking event to backend audit trail
      try {
        await subAdminApi.logUnmaskAudit(entry.employeeId, entry.employeeName);
      } catch (err) {
        console.error('Unmask audit failed:', err);
      }
    }
    setUnmaskedAccounts((prev) => ({ ...prev, [entry.id]: !isCurrentlyUnmasked }));
  };

  const handleConfirmApproval = async () => {
    if (!entryToApprove) return;
    setProcessing(true);
    try {
      const res = await subAdminApi.approveEntry(entryToApprove.id, approvalRemarks);
      setFeedbackMessage({
        type: 'success',
        text: `Entry approved! ₹${entryToApprove.withdrawalAmount.toLocaleString()} deducted and settled into ledger.`,
      });
      setEntryToApprove(null);
      setApprovalRemarks('');
      await fetchEntries();
    } catch (err: any) {
      setFeedbackMessage({
        type: 'error',
        text: err.response?.data?.message || 'Approval rejected by backend engine.',
      });
    } finally {
      setProcessing(false);
      setTimeout(() => setFeedbackMessage(null), 5000);
    }
  };

  const handleConfirmRejection = async () => {
    if (!entryToReject || !rejectionReason.trim()) return;
    setProcessing(true);
    try {
      await subAdminApi.rejectEntry(entryToReject.id, rejectionReason);
      setFeedbackMessage({
        type: 'success',
        text: `Entry ${entryToReject.referenceId} rejected and logged to audit trail.`,
      });
      setEntryToReject(null);
      setRejectionReason('');
      await fetchEntries();
    } catch (err: any) {
      setFeedbackMessage({
        type: 'error',
        text: err.response?.data?.message || 'Rejection failed.',
      });
    } finally {
      setProcessing(false);
      setTimeout(() => setFeedbackMessage(null), 5000);
    }
  };

  const currentTabEntries = entries.filter((e) => e.status === activeTab);
  const filtered = currentTabEntries.filter(
    (e) =>
      e.employeeName.toLowerCase().includes(search.toLowerCase()) ||
      e.referenceId.toLowerCase().includes(search.toLowerCase()) ||
      e.bankName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Entry &amp; Withdrawal Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Two-step verification: Compare uploaded UPI payment receipts with bank records before ledger disbursement.
          </p>
        </div>
      </div>

      {feedbackMessage && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-start gap-3 animate-in fade-in duration-200 ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {feedbackMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <div>
            <p className="font-bold">{feedbackMessage.type === 'success' ? 'Operation Confirmed' : 'Verification Alert'}</p>
            <p className="mt-0.5">{feedbackMessage.text}</p>
          </div>
        </div>
      )}

      {/* Tabs and Search Bar */}
      <div className="bg-white rounded-xl border border-[#E8E2D8] shadow-xs p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-[#EBE5DB] rounded-lg w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('PENDING')}
            className={`px-4 py-2 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'PENDING'
                ? 'bg-[#880E23] text-white shadow-xs'
                : 'text-[#685E4E] hover:text-[#2D2526]'
            }`}
          >
            Pending ({entries.filter((e) => e.status === 'PENDING').length})
          </button>
          <button
            onClick={() => setActiveTab('APPROVED')}
            className={`px-4 py-2 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'APPROVED'
                ? 'bg-[#880E23] text-white shadow-xs'
                : 'text-[#685E4E] hover:text-[#2D2526]'
            }`}
          >
            Approved ({entries.filter((e) => e.status === 'APPROVED').length})
          </button>
          <button
            onClick={() => setActiveTab('REJECTED')}
            className={`px-4 py-2 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'REJECTED'
                ? 'bg-[#880E23] text-white shadow-xs'
                : 'text-[#685E4E] hover:text-[#2D2526]'
            }`}
          >
            Rejected ({entries.filter((e) => e.status === 'REJECTED').length})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#A89B85]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reference, employee, bank..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAF8F5] border border-[#DDD5C7] text-[#2D2526] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#880E23]"
          />
        </div>
      </div>

      {/* Entries Table */}
      <div className="bg-white rounded-xl border border-[#E8E2D8] overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#FAF8F5] border-b border-[#E8E2D8] text-[#74675B] font-semibold uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">Employee</th>
              <th className="py-3 px-4">UPI Ref ID</th>
              <th className="py-3 px-4">Bank Routing Details</th>
              <th className="py-3 px-4">Claimed Amount</th>
              <th className="py-3 px-4">Payment Proof</th>
              <th className="py-3 px-4">Submission Date</th>
              <th className="py-3 px-4 text-right">Review Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EBE5DB] text-[#2D2526]">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  Loading submissions...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  No {activeTab.toLowerCase()} entries in this view.
                </td>
              </tr>
            ) : (
              filtered.map((entry) => {
                const isUnmasked = unmaskedAccounts[entry.id];
                const displayAccount = isUnmasked
                  ? entry.bankAccountNumber
                  : `•••• •••• •••• ${entry.bankAccountNumber.slice(-4)}`;

                return (
                  <tr key={entry.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 block">{entry.employeeName}</span>
                      <a
                        href={entry.websiteUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-teal-600 text-[11px] hover:underline inline-flex items-center gap-1 mt-0.5"
                      >
                        Source Portal <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-semibold text-teal-800">
                      {entry.referenceId}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-slate-900">{displayAccount}</span>
                        <button
                          type="button"
                          onClick={() => handleToggleMask(entry)}
                          title={isUnmasked ? 'Mask Account' : 'Unmask (Audit Logged)'}
                          className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100"
                        >
                          {isUnmasked ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <span className="text-[11px] text-slate-500 block">
                        {entry.bankName} · {entry.ifscCode}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-sm font-bold text-slate-900 block">
                        ₹{entry.withdrawalAmount.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-400">Gross: ₹{entry.amount.toLocaleString()}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => setSelectedEntryForProof(entry)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[11px] font-semibold text-slate-700 transition-colors"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                        Preview Proof
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-slate-500">
                      <span className="block font-medium">
                        {new Date(entry.submittedAt).toLocaleDateString()}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {new Date(entry.submittedAt).toLocaleTimeString()}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {entry.status === 'PENDING' ? (
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => setEntryToApprove(entry)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#880E23] hover:bg-[#6B081A] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button
                            onClick={() => setEntryToReject(entry)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 border border-[#DDD5C7] text-[#880E23] hover:bg-[#FDF2F4] rounded-lg text-xs font-semibold transition-colors"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </button>
                        </div>
                      ) : (
                        <div className="text-right">
                          <StatusBadge status={entry.status} size="sm" />
                          {entry.reviewedByName && (
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              by {entry.reviewedByName}
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Proof Viewer Lightbox */}
      <ScreenshotModal
        isOpen={!!selectedEntryForProof}
        entry={selectedEntryForProof}
        onClose={() => setSelectedEntryForProof(null)}
        onApprove={(e) => setEntryToApprove(e)}
        onReject={(e) => setEntryToReject(e)}
      />

      {/* Approve Confirmation Modal with Remarks */}
      <ConfirmationModal
        isOpen={!!entryToApprove}
        onClose={() => setEntryToApprove(null)}
        onConfirm={handleConfirmApproval}
        title="Approve Withdrawal & Settle Ledger"
        description={`Confirm payout settlement of ₹${entryToApprove?.withdrawalAmount.toLocaleString()} for ${entryToApprove?.employeeName}. The backend financial engine will verify available float, create an immutable ledger disbursement, and deduct the employee balance.`}
        confirmLabel="Approve & Disburse Funds"
        variant="success"
        isLoading={processing}
      >
        <div className="text-xs">
          <label className="block font-semibold text-slate-700 mb-1">Supervisor Approval Remarks (Optional)</label>
          <input
            type="text"
            value={approvalRemarks}
            onChange={(e) => setApprovalRemarks(e.target.value)}
            placeholder="e.g. Verified against gateway RRN 93847291048"
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </ConfirmationModal>

      {/* Reject Confirmation Modal with Required Reason */}
      <ConfirmationModal
        isOpen={!!entryToReject}
        onClose={() => setEntryToReject(null)}
        onConfirm={handleConfirmRejection}
        title="Reject Entry Submission"
        description={`Rejecting entry ${entryToReject?.referenceId} for ${entryToReject?.employeeName}. Please specify the formal audit reason for rejection.`}
        confirmLabel="Confirm Rejection"
        variant="danger"
        isLoading={processing}
      >
        <div className="text-xs">
          <label className="block font-semibold text-slate-700 mb-1">Formal Rejection Reason *</label>
          <textarea
            required
            rows={3}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="e.g. UPI screenshot blurred or transaction RRN invalid."
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>
      </ConfirmationModal>
    </div>
  );
};
