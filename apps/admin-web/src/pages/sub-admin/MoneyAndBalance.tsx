import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  BadgeDollarSign,
  TrendingUp,
  FileCheck,
  Search,
  CheckCircle2,
  Clock,
  ArrowDownLeft,
  ArrowUpRight,
  Send,
  AlertCircle,
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { subAdminApi } from '../../services/api';
import { EmployeeProfile, FinancialLedger } from '../../types';
import { StatCard } from '../../components/common/StatCard';

export const SubAdminMoneyAndBalance: React.FC = () => {
  const [searchParams] = useSearchParams();
  const preselectedEmpId = searchParams.get('employeeId');

  const [employees, setEmployees] = useState<EmployeeProfile[]>([]);
  const [ledgerHistory, setLedgerHistory] = useState<FinancialLedger[]>([]);
  const [loading, setLoading] = useState(true);

  // Allocation Form State
  const [selectedEmpId, setSelectedEmpId] = useState(preselectedEmpId || '');
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [remarks, setRemarks] = useState('');
  const [allocating, setAllocating] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const emps = await subAdminApi.getEmployees();
      setEmployees(emps);

      if (emps.length > 0 && !selectedEmpId) {
        setSelectedEmpId(emps[0].id);
      }

      // Fetch financial statement for first employee or selected
      const targetId = preselectedEmpId || (emps.length > 0 ? emps[0].id : null);
      if (targetId) {
        const stmt = await subAdminApi.getEmployeeFinance(targetId);
        setLedgerHistory(stmt.ledger || []);
      }
    } catch (err) {
      console.error('Failed to load financial records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [preselectedEmpId]);

  const handleEmployeeChange = async (id: string) => {
    setSelectedEmpId(id);
    try {
      const stmt = await subAdminApi.getEmployeeFinance(id);
      setLedgerHistory(stmt.ledger || []);
    } catch (err) {
      console.error('Failed to load employee ledger:', err);
    }
  };

  const handleAllocate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpId || !amount || parseFloat(amount) <= 0) {
      setFeedback({ type: 'error', text: 'Please enter a valid allocation amount greater than zero.' });
      return;
    }

    setAllocating(true);
    try {
      const res = await subAdminApi.allocateFunds({
        employeeId: selectedEmpId,
        amount: parseFloat(amount),
        reference: reference.trim() || undefined,
        remarks: remarks.trim() || undefined,
      });

      setFeedback({
        type: 'success',
        text: `Successfully allocated ₹${parseFloat(amount).toLocaleString()} to ${res.employee.name}. Balance updated.`,
      });

      setAmount('');
      setReference('');
      setRemarks('');
      await fetchData();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        text: err.response?.data?.message || 'Fund allocation failed.',
      });
    } finally {
      setAllocating(false);
      setTimeout(() => setFeedback(null), 6000);
    }
  };

  const selectedEmployee = employees.find((e) => e.id === selectedEmpId);

  const totalAllocatedAll = employees.reduce((sum, e) => sum + e.totalAllocated, 0);
  const totalWithdrawnAll = employees.reduce((sum, e) => sum + e.totalApprovedWithdrawals, 0);
  const totalBalanceAll = employees.reduce((sum, e) => sum + e.availableBalance, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Hub Working Capital &amp; Float Allocation</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Allocate operational cash buffers directly to assigned field personnel and audit transaction histories.
        </p>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-start gap-3 animate-in fade-in duration-200 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <div>
            <p className="font-bold">{feedback.type === 'success' ? 'Allocation Recorded' : 'Action Blocked'}</p>
            <p className="mt-0.5">{feedback.text}</p>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Float Injected"
          value={`₹${totalAllocatedAll.toLocaleString()}`}
          subtitle="Cumulative team allocations"
          icon={BadgeDollarSign}
          accentColor="teal"
        />
        <StatCard
          title="Settled Disbursements"
          value={`₹${totalWithdrawnAll.toLocaleString()}`}
          subtitle="Approved and disbursed claims"
          icon={FileCheck}
          accentColor="emerald"
        />
        <StatCard
          title="Current Available Float"
          value={`₹${totalBalanceAll.toLocaleString()}`}
          subtitle="Net deployable balance across team"
          icon={TrendingUp}
          accentColor="blue"
        />
      </div>

      {/* Two Column Section: Allocation Form on Left, Employee Ledger on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Allocation Form */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs space-y-5">
          <div className="pb-3 border-b border-slate-100 flex items-center gap-2">
            <div className="p-2 bg-teal-50 text-teal-700 rounded-lg">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Disburse Working Capital</h3>
              <p className="text-[11px] text-slate-500">Inject money into employee available balance</p>
            </div>
          </div>

          <form onSubmit={handleAllocate} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Select Beneficiary Employee *
              </label>
              <select
                value={selectedEmpId}
                onChange={(e) => handleEmployeeChange(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white font-medium text-slate-800"
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.employeeCode}) · Available: ₹{emp.availableBalance.toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            {selectedEmployee && (
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-500 block">Current Balance:</span>
                  <span className="font-bold text-teal-700 text-xs">
                    ₹{selectedEmployee.availableBalance.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Bank Account:</span>
                  <span className="font-mono text-slate-700">
                    •••• {selectedEmployee.bankAccountNumber.slice(-4)}
                  </span>
                </div>
              </div>
            )}

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Allocation Amount (INR) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  required
                  min="1"
                  step="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 10000"
                  className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-bold text-sm text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Allocation Reference Voucher (Optional)
              </label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="e.g. ALLOC-NORTH-NOV-01"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Purpose / Working Notes (Optional)
              </label>
              <textarea
                rows={2}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="e.g. Weekly field travel float and supplier demonstration budget."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <button
              type="submit"
              disabled={allocating || !selectedEmpId}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#880E23] hover:bg-[#6B081A] text-white font-bold rounded-lg shadow-xs transition-colors disabled:opacity-50"
            >
              {allocating ? 'Processing Allocation...' : 'Confirm Working Capital Allocation'}
              {!allocating && <Send className="w-3.5 h-3.5" />}
            </button>
          </form>
        </div>

        {/* Selected Employee Transaction Statement */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-[#E8E2D8] shadow-xs overflow-hidden flex flex-col">
          <div className="p-4 border-b border-[#E8E2D8] flex items-center justify-between bg-[#FAF8F5]">
            <div>
              <h3 className="font-bold text-[#2D2526] text-sm">
                Financial Statement: {selectedEmployee ? selectedEmployee.name : 'Employee'}
              </h3>
              <p className="text-xs text-[#74675B]">Chronological ledger transactions for selected agent</p>
            </div>
            <span className="text-xs font-mono font-bold text-[#880E23] bg-[#FDF2F4] px-2.5 py-1 rounded border border-[#F8CAD1]">
              Bal: ₹{selectedEmployee ? selectedEmployee.availableBalance.toLocaleString() : 0}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[460px]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] border-b border-[#E8E2D8] text-[#74675B] font-semibold uppercase tracking-wider sticky top-0">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Balance After</th>
                  <th className="py-2.5 px-3">Ref &amp; Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {ledgerHistory.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      No transactions recorded for this employee yet.
                    </td>
                  </tr>
                ) : (
                  ledgerHistory.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-3 text-slate-500">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                            item.type === 'ALLOCATION'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-rose-50 text-rose-800 border-rose-200'
                          }`}
                        >
                          {item.type === 'ALLOCATION' ? '+ ALLOC' : '- WITHDRAW'}
                        </span>
                      </td>
                      <td
                        className={`py-2.5 px-3 font-bold ${
                          item.type === 'ALLOCATION' ? 'text-emerald-700' : 'text-slate-900'
                        }`}
                      >
                        {item.type === 'ALLOCATION' ? '+' : '-'}₹{item.amount.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-semibold text-slate-900">
                        ₹{item.balanceAfter.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 max-w-xs truncate">
                        <span className="font-semibold block truncate">{item.reference}</span>
                        <span className="text-[10px] text-slate-400 truncate block">{item.notes}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
