import React, { useState, useEffect } from 'react';
import { Wallet, ArrowDownCircle, ArrowUpCircle, Clock, Receipt } from 'lucide-react';
import { employeeApi } from '../../services/api';
import { EmployeeProfile, FinancialLedger } from '../../types';
import { StatCard } from '../../components/common/StatCard';

export const EmployeeFinance: React.FC = () => {
  const [employee, setEmployee] = useState<EmployeeProfile | null>(null);
  const [pendingAmount, setPendingAmount] = useState<number>(0);
  const [ledger, setLedger] = useState<FinancialLedger[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFinance = async () => {
      try {
        const data = await employeeApi.getFinance();
        setEmployee(data.employee);
        setPendingAmount(data.pendingAmount || 0);
        setLedger(data.ledger || []);
      } catch (err) {
        console.error('Failed to load employee finance:', err);
      } finally {
        setLoading(false);
      }
    };
    loadFinance();
  }, []);

  if (loading || !employee) {
    return <div className="p-8 text-center text-xs text-slate-400">Loading financial ledger...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">My Financial Balance &amp; Ledger</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Track working capital allocations, approved withdrawal settlements, and pending claim totals.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Available Balance"
          value={`₹${employee.availableBalance.toLocaleString()}`}
          subtitle="Current working float"
          icon={Wallet}
          accentColor="teal"
        />
        <StatCard
          title="Total Allocated"
          value={`₹${employee.totalAllocated.toLocaleString()}`}
          subtitle="Disbursed by Sub-Admin"
          icon={ArrowDownCircle}
          accentColor="emerald"
        />
        <StatCard
          title="Approved Withdrawals"
          value={`₹${employee.totalApprovedWithdrawals.toLocaleString()}`}
          subtitle="Settled claims"
          icon={ArrowUpCircle}
          accentColor="blue"
        />
        <StatCard
          title="Pending Claims Value"
          value={`₹${pendingAmount.toLocaleString()}`}
          subtitle={`${employee.pendingWithdrawalsCount} awaiting review`}
          icon={Clock}
          accentColor="amber"
        />
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Receipt className="w-4 h-4 text-teal-600" />
            Personal Transaction Ledger ({ledger.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Reference</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Balance Transition</th>
                <th className="py-3 px-4">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {ledger.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No financial transactions recorded yet.
                  </td>
                </tr>
              ) : (
                ledger.map((item) => {
                  const isCredit = item.type === 'ALLOCATION';
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 text-slate-600">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${
                            isCredit
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-blue-50 text-blue-800 border-blue-200'
                          }`}
                        >
                          {item.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                        {item.reference}
                      </td>
                      <td
                        className={`py-3 px-4 font-bold ${
                          isCredit ? 'text-emerald-700' : 'text-slate-900'
                        }`}
                      >
                        {isCredit ? '+' : '-'}₹{item.amount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        ₹{item.balanceBefore.toLocaleString()} →{' '}
                        <span className="font-bold text-slate-900">
                          ₹{item.balanceAfter.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500">{item.notes || '—'}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
