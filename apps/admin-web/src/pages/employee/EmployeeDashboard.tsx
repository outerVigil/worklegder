import React, { useState, useEffect } from 'react';
import {
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  Clock,
  MapPin,
  LogIn,
  LogOut,
  FileText,
  CheckCircle2,
} from 'lucide-react';
import { employeeApi } from '../../services/api';
import { EmployeeProfile, AttendancePunch, EntrySubmission } from '../../types';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';

export const EmployeeDashboard: React.FC = () => {
  const [employee, setEmployee] = useState<EmployeeProfile | null>(null);
  const [recentPunches, setRecentPunches] = useState<AttendancePunch[]>([]);
  const [recentEntries, setRecentEntries] = useState<EntrySubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [punching, setPunching] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadDashboard = async () => {
    try {
      const data = await employeeApi.getDashboard();
      setEmployee(data.employee);
      setRecentPunches(data.recentPunches || []);
      setRecentEntries(data.recentEntries || []);
    } catch (err) {
      console.error('Failed to load employee dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleQuickPunch = async (punchType: 'CHECK_IN' | 'CHECK_OUT') => {
    setPunching(true);
    setFeedback(null);
    try {
      await employeeApi.punchAttendance(punchType, 'Quick punch from Employee Portal');
      setFeedback(
        punchType === 'CHECK_IN'
          ? 'Checked in successfully! GPS coordinates verified.'
          : 'Checked out successfully! Shift duration recorded.'
      );
      await loadDashboard();
    } catch (err: any) {
      setFeedback(err?.response?.data?.message || 'Unable to record punch.');
    } finally {
      setPunching(false);
    }
  };

  if (loading || !employee) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-24 bg-white rounded-xl border border-slate-200" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-white rounded-xl border border-slate-200" />
          ))}
        </div>
      </div>
    );
  }

  const isCheckedIn = employee.attendanceToday === 'CHECKED_IN';

  return (
    <div className="space-y-6">
      {/* Top Welcome & Quick Punch Banner */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Welcome back, {employee.name}
            </h2>
            <StatusBadge status={employee.attendanceToday} size="sm" />
          </div>
          <p className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="font-mono font-semibold text-slate-700">{employee.employeeCode}</span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-teal-600" />
              {employee.assignedLocation.name}
            </span>
            <span>·</span>
            <span>Supervisor: {employee.subAdminName}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          {!isCheckedIn ? (
            <button
              onClick={() => handleQuickPunch('CHECK_IN')}
              disabled={punching}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              {punching ? 'Recording...' : 'Punch Check-In'}
            </button>
          ) : (
            <button
              onClick={() => handleQuickPunch('CHECK_OUT')}
              disabled={punching}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors disabled:opacity-50"
            >
              <LogOut className="w-4 h-4" />
              {punching ? 'Recording...' : 'Punch Check-Out'}
            </button>
          )}
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          {feedback}
        </div>
      )}

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Available Float Balance"
          value={`₹${employee.availableBalance.toLocaleString()}`}
          subtitle="Ready for settlement"
          icon={Wallet}
          accentColor="teal"
        />
        <StatCard
          title="Total Funds Allocated"
          value={`₹${employee.totalAllocated.toLocaleString()}`}
          subtitle="Cumulative working capital"
          icon={ArrowDownCircle}
          accentColor="emerald"
        />
        <StatCard
          title="Approved Withdrawals"
          value={`₹${employee.totalApprovedWithdrawals.toLocaleString()}`}
          subtitle="Settled to bank account"
          icon={ArrowUpCircle}
          accentColor="blue"
        />
        <StatCard
          title="Pending Claims"
          value={employee.pendingWithdrawalsCount}
          subtitle={employee.lastPunch ? `Last punch: ${employee.lastPunch}` : 'No punch today'}
          icon={Clock}
          accentColor="amber"
        />
      </div>

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Punches */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-600" />
              Recent Attendance Punches
            </h3>
            <span className="text-[11px] text-slate-400">Latest {recentPunches.length} records</span>
          </div>

          <div className="divide-y divide-slate-100">
            {recentPunches.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">No attendance punches recorded yet.</div>
            ) : (
              recentPunches.map((p) => (
                <div key={p.id} className="px-5 py-3.5 flex items-center justify-between text-xs hover:bg-slate-50/70">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-bold ${
                          p.punchType === 'CHECK_IN' ? 'text-teal-700' : 'text-amber-700'
                        }`}
                      >
                        {p.punchType === 'CHECK_IN' ? 'CHECK IN' : 'CHECK OUT'}
                      </span>
                      <span className="text-slate-400">·</span>
                      <span className="font-mono text-slate-600">{p.date} {p.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate max-w-xs">{p.address}</p>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">±{p.accuracyMeters}m</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Entry Submissions */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-600" />
              Recent Entry Submissions
            </h3>
            <span className="text-[11px] text-slate-400">Latest {recentEntries.length} claims</span>
          </div>

          <div className="divide-y divide-slate-100">
            {recentEntries.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">No entry submissions yet.</div>
            ) : (
              recentEntries.map((ent) => (
                <div key={ent.id} className="px-5 py-3.5 flex items-center justify-between text-xs hover:bg-slate-50/70">
                  <div>
                    <div className="font-mono font-semibold text-slate-800">{ent.referenceId}</div>
                    <div className="text-[11px] text-slate-500 truncate max-w-xs mt-0.5">
                      {ent.websiteUrl}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-900">
                      ₹{ent.withdrawalAmount.toLocaleString()}
                    </span>
                    <StatusBadge status={ent.status} size="sm" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
