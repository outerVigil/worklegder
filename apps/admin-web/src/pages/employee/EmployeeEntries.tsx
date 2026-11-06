import React, { useState, useEffect } from 'react';
import { Plus, Eye, FileText, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { employeeApi } from '../../services/api';
import { EntrySubmission } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ScreenshotModal } from '../../components/common/ScreenshotModal';

export const EmployeeEntries: React.FC = () => {
  const [entries, setEntries] = useState<EntrySubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<EntrySubmission | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [websiteUrl, setWebsiteUrl] = useState('https://portal.enterprise-pay.in/tx/');
  const [amount, setAmount] = useState('');
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [referenceId, setReferenceId] = useState('');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadEntries = async () => {
    try {
      const list = await employeeApi.getEntries();
      setEntries(list);
    } catch (err) {
      console.error('Failed to load entries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEntries();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      const wAmount = Number(withdrawalAmount);
      const gAmount = amount ? Number(amount) : wAmount;
      await employeeApi.submitEntry({
        websiteUrl,
        amount: gAmount,
        withdrawalAmount: wAmount,
        referenceId,
        remarks,
      });
      setIsModalOpen(false);
      setAmount('');
      setWithdrawalAmount('');
      setReferenceId('');
      setRemarks('');
      setSuccess('Entry claim submitted successfully and queued for Sub-Admin verification.');
      await loadEntries();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to submit entry.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">My Entry &amp; Withdrawal Claims</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Submit payment gateway references for Sub-Admin approval and track settlement status.
          </p>
        </div>

        <button
          onClick={() => {
            setError(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          Submit New Entry
        </button>
      </div>

      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          {success}
        </div>
      )}

      {/* Entries Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <FileText className="w-4 h-4 text-teal-600" />
            Submitted Claims ({entries.length})
          </h3>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading your submissions...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Reference ID</th>
                  <th className="py-3 px-4">Gateway / Task URL</th>
                  <th className="py-3 px-4">Claimed Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Submitted</th>
                  <th className="py-3 px-4 text-right">Proof</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {entries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      You have not submitted any entries yet.
                    </td>
                  </tr>
                ) : (
                  entries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                        {entry.referenceId}
                      </td>
                      <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                        {entry.websiteUrl}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        ₹{entry.withdrawalAmount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={entry.status} size="sm" />
                        {entry.rejectionReason && (
                          <p className="text-[11px] text-rose-600 mt-1">{entry.rejectionReason}</p>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {new Date(entry.submittedAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedEntry(entry)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-semibold transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" /> View Proof
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Submit New Entry Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-sm">Submit New Withdrawal Entry</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              {error && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  UPI / Gateway Reference ID *
                </label>
                <input
                  type="text"
                  required
                  value={referenceId}
                  onChange={(e) => setReferenceId(e.target.value)}
                  placeholder="e.g., UPI-9948271654"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Withdrawal Amount (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={withdrawalAmount}
                    onChange={(e) => setWithdrawalAmount(e.target.value)}
                    placeholder="2500"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Gross Entry Value (₹)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Optional (defaults to withdrawal)"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Associated Portal / Task URL *
                </label>
                <input
                  type="url"
                  required
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Remarks / Notes</label>
                <textarea
                  rows={2}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Field disbursement details..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg shadow-xs disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Claim'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Proof Lightbox */}
      <ScreenshotModal
        entry={selectedEntry}
        isOpen={!!selectedEntry}
        onClose={() => setSelectedEntry(null)}
      />
    </div>
  );
};
