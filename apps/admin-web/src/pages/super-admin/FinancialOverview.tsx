import React, { useState, useEffect } from 'react';
import {
  BadgeDollarSign,
  TrendingUp,
  Download,
  Filter,
  Search,
  Building,
  UserCheck,
  CheckCircle2,
  Clock,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react';
import { superAdminApi } from '../../services/api';
import { FinancialLedger } from '../../types';
import { StatCard } from '../../components/common/StatCard';
import { ExportModal } from '../../components/common/ExportModal';

export const FinancialOverview: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [isExportOpen, setIsExportOpen] = useState(false);

  const fetchFinance = async () => {
    setLoading(true);
    try {
      const res = await superAdminApi.getFinance();
      setData(res);
    } catch (err) {
      console.error('Failed to load finance overview:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinance();
  }, []);

  if (loading || !data) {
    return (
      <div className="h-96 flex items-center justify-center text-slate-400 text-xs">
        Loading financial ledger and capital allocation telemetry...
      </div>
    );
  }

  const { metrics, subAdminSummary, transactions } = data;

  const filteredTransactions = transactions.filter((t: FinancialLedger) => {
    const matchesSearch =
      t.employeeName.toLowerCase().includes(search.toLowerCase()) ||
      t.reference.toLowerCase().includes(search.toLowerCase()) ||
      (t.notes && t.notes.toLowerCase().includes(search.toLowerCase()));

    const matchesType = typeFilter === 'ALL' || t.type === typeFilter;

    return matchesSearch && matchesType;
  });

  const exportColumns = [
    { key: 'createdAt', label: 'Timestamp' },
    { key: 'employeeName', label: 'Employee' },
    { key: 'type', label: 'Transaction Type' },
    { key: 'amount', label: 'Amount (INR)' },
    { key: 'balanceBefore', label: 'Balance Before (INR)' },
    { key: 'balanceAfter', label: 'Balance After (INR)' },
    { key: 'reference', label: 'Reference Code' },
    { key: 'createdByName', label: 'Authorized By' },
    { key: 'notes', label: 'Ledger Remarks' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Organization Financial Ledger</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Single Source of Truth: Operational float allocations, field disbursements, and verified withdrawal settlements.
          </p>
        </div>

        <button
          onClick={() => setIsExportOpen(true)}
          className="inline-flex items-center gap-2 px-3.5 py-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-2xs transition-colors"
        >
          <Download className="w-4 h-4 text-slate-500" />
          Export Financial Ledger
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Allocated Float"
          value={`₹${metrics.totalAllocated.toLocaleString()}`}
          subtitle="Total funds injected into field pools"
          icon={BadgeDollarSign}
          accentColor="teal"
        />
        <StatCard
          title="Approved Withdrawals"
          value={`₹${metrics.totalApprovedWithdrawals.toLocaleString()}`}
          subtitle="Settled against UPI & receipts"
          icon={CheckCircle2}
          accentColor="emerald"
        />
        <StatCard
          title="Pending Claims"
          value={`₹${metrics.pendingWithdrawals.toLocaleString()}`}
          subtitle="Awaiting Sub-Admin verification"
          icon={Clock}
          accentColor="amber"
        />
        <StatCard
          title="Available Net Float"
          value={`₹${metrics.availableBalance.toLocaleString()}`}
          subtitle="Remaining active working capital"
          icon={TrendingUp}
          accentColor="blue"
        />
      </div>

      {/* Sub-Admin Regional Allocation Summary */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-slate-600" />
            <h3 className="font-bold text-slate-900 text-sm">Sub-Admin Regional Allocation Breakdown</h3>
          </div>
          <span className="text-xs text-slate-500">Real-time ledger aggregation</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {subAdminSummary.map((sa: any) => (
            <div key={sa.subAdminId} className="p-4 bg-slate-50 rounded-xl border border-slate-200/70 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{sa.subAdminName}</h4>
                  <p className="text-[11px] text-slate-500">{sa.region}</p>
                </div>
                <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-100">
                  {sa.employeeCount} Staff
                </span>
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Allocated:</span>
                  <span className="font-semibold text-slate-800">₹{sa.allocated.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Withdrawn:</span>
                  <span className="font-semibold text-emerald-700">₹{sa.withdrawn.toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200">
                  <span className="font-bold text-slate-700">Available Float:</span>
                  <span className="font-bold text-teal-700">₹{sa.availableBalance.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction History Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-3 items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">Immutable Financial Ledger Stream</h3>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search ledger by employee or ref..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="ALL">All Operations</option>
              <option value="ALLOCATION">ALLOCATION</option>
              <option value="WITHDRAWAL_APPROVAL">WITHDRAWAL_APPROVAL</option>
            </select>
          </div>
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">Employee</th>
              <th className="py-3 px-4">Operation Type</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4">Balance After</th>
              <th className="py-3 px-4">Reference &amp; Notes</th>
              <th className="py-3 px-4">Authorized By</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  No financial ledger entries match your filter.
                </td>
              </tr>
            ) : (
              filteredTransactions.map((tx: FinancialLedger) => (
                <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 text-slate-500">
                    {new Date(tx.createdAt).toLocaleDateString()}
                    <span className="text-[10px] block font-mono text-slate-400">
                      {new Date(tx.createdAt).toLocaleTimeString()}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">{tx.employeeName}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold border ${
                        tx.type === 'ALLOCATION'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-rose-50 text-rose-800 border-rose-200'
                      }`}
                    >
                      {tx.type === 'ALLOCATION' ? (
                        <ArrowDownLeft className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <ArrowUpRight className="w-3 h-3 text-rose-600" />
                      )}
                      {tx.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td
                    className={`py-3 px-4 font-bold text-sm ${
                      tx.type === 'ALLOCATION' ? 'text-emerald-700' : 'text-slate-900'
                    }`}
                  >
                    {tx.type === 'ALLOCATION' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                    ₹{tx.balanceAfter.toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono font-semibold text-teal-700 block">{tx.reference}</span>
                    <span className="text-[11px] text-slate-500">{tx.notes}</span>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-800">{tx.createdByName}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        title="Complete Financial Ledger Records"
        filenamePrefix="Financial_Ledger_Export"
        data={filteredTransactions}
        availableColumns={exportColumns}
      />
    </div>
  );
};
