import React, { useState, useEffect } from 'react';
import {
  History,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  Search,
  Shield,
  Smartphone,
} from 'lucide-react';
import { subAdminApi } from '../../services/api';
import { EmployeeUpdateLog } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';

export const SubAdminEmployeeUpdateHistory: React.FC = () => {
  const [updates, setUpdates] = useState<EmployeeUpdateLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [unmaskedRows, setUnmaskedRows] = useState<Record<string, boolean>>({});

  const fetchUpdates = async () => {
    setLoading(true);
    try {
      const data = await subAdminApi.getEmployeeUpdates();
      setUpdates(data);
    } catch (err) {
      console.error('Failed to load employee updates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpdates();
  }, []);

  const handleToggleMask = async (log: EmployeeUpdateLog) => {
    const isCurrentlyUnmasked = unmaskedRows[log.id];
    if (!isCurrentlyUnmasked) {
      try {
        await subAdminApi.logUnmaskAudit(log.employeeId, log.employeeName);
      } catch (err) {
        console.error('Failed to log audit for unmasking:', err);
      }
    }
    setUnmaskedRows((prev) => ({ ...prev, [log.id]: !isCurrentlyUnmasked }));
  };

  const handleReview = async (id: string, status: 'APPROVED' | 'DISMISSED') => {
    try {
      await subAdminApi.reviewEmployeeUpdate(id, status);
      await fetchUpdates();
    } catch (err) {
      console.error('Failed to review update:', err);
    }
  };

  const filtered = updates.filter(
    (u) =>
      u.employeeName.toLowerCase().includes(search.toLowerCase()) ||
      u.fieldName.toLowerCase().includes(search.toLowerCase()) ||
      u.updatedByName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Employee Profile Update Audit</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit mobile app profile edits (bank account, phone number) with automated masking for sensitive account data.
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by employee or field name..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <span className="text-xs text-slate-500">
          {updates.filter((u) => u.reviewStatus === 'PENDING').length} Pending Review
        </span>
      </div>

      {/* Update Logs Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">Employee</th>
              <th className="py-3 px-4">Updated Field</th>
              <th className="py-3 px-4">Previous Value</th>
              <th className="py-3 px-4">New Requested Value</th>
              <th className="py-3 px-4">Submitted Via</th>
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4 text-right">Review Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  Loading update audit log...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  No profile update records found.
                </td>
              </tr>
            ) : (
              filtered.map((log) => {
                const isUnmasked = unmaskedRows[log.id];
                const displayOld = log.isMasked && !isUnmasked ? '•••• •••• ••••' : log.oldValue;
                const displayNew = log.isMasked && !isUnmasked ? '•••• •••• ••••' : log.newValue;

                return (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{log.employeeName}</td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-teal-800">
                      {log.fieldName}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">{displayOld}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-mono font-bold text-slate-900">
                        <span>{displayNew}</span>
                        {log.isMasked && (
                          <button
                            type="button"
                            onClick={() => handleToggleMask(log)}
                            className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100"
                            title={isUnmasked ? 'Mask Account' : 'Unmask (Audit Logged)'}
                          >
                            {isUnmasked ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 flex items-center gap-1 mt-2">
                      <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{log.updatedByName}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(log.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {log.reviewStatus === 'PENDING' ? (
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleReview(log.id, 'APPROVED')}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReview(log.id, 'DISMISSED')}
                            className="px-2.5 py-1 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded text-[11px] font-semibold"
                          >
                            Dismiss
                          </button>
                        </div>
                      ) : (
                        <StatusBadge status={log.reviewStatus} size="sm" />
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
