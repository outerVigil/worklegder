import React, { useEffect, useState } from 'react';
import {
  Users,
  UserCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  BadgeDollarSign,
  TrendingUp,
  FileCheck,
  ArrowUpRight,
  ShieldAlert,
  Calendar,
  ExternalLink,
} from 'lucide-react';
import { StatCard } from '../../components/common/StatCard';
import { superAdminApi } from '../../services/api';
import { useNavigate } from 'react-router-dom';

export const SuperAdminOverview: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadOverview = async () => {
      try {
        const res = await superAdminApi.getDashboard();
        setData(res);
      } catch (err) {
        console.error('Failed to load super admin overview:', err);
      } finally {
        setLoading(false);
      }
    };

    loadOverview();
  }, []);

  if (loading || !data) {
    return (
      <div className="h-96 flex items-center justify-center text-slate-400 text-xs">
        Loading real-time executive dashboard telemetry...
      </div>
    );
  }

  const { metrics, attendanceTrends, financialFlowTrends, recentPunches, recentAudit } = data;

  return (
    <div className="space-y-6">
      {/* Top Banner: Global System Health */}
      <div className="bg-gradient-to-r from-[#3B030B] via-[#4D0612] to-[#2B0308] border border-[#5C0A18] rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-[#F29CA9] font-mono text-[11px] uppercase tracking-wider font-semibold">
            CENTRALIZED WORKFORCE DISPATCH
          </span>
          <h2 className="text-xl font-bold mt-1 tracking-tight">Organization Command Center</h2>
          <p className="text-xs text-[#EBE5DB] mt-1">
            Supervising {metrics.totalEmployees} deployed employees across {metrics.totalSubAdmins} regional hub sub-admins.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/super-admin/employees')}
            className="px-4 py-2 bg-[#FAF8F5] hover:bg-[#EBE5DB] text-[#3B030B] font-bold text-xs rounded-lg transition-colors shadow-xs"
          >
            Manage Employees
          </button>
          <button
            onClick={() => navigate('/super-admin/finance')}
            className="px-4 py-2 bg-[#540A17] hover:bg-[#6B081A] text-[#FDF2F4] font-semibold text-xs rounded-lg border border-[#6B081A] transition-colors"
          >
            Financial Ledger
          </button>
        </div>
      </div>

      {/* Row 1: Primary KPI Metrics (Attendance & Staff) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Workforce"
          value={metrics.totalEmployees}
          subtitle={`${metrics.totalSubAdmins} Sub-Admin Hubs`}
          icon={Users}
          accentColor="slate"
          onClick={() => navigate('/super-admin/employees')}
        />
        <StatCard
          title="Present Today"
          value={metrics.presentToday}
          subtitle={`${metrics.checkedInNow} Active Field Check-Ins`}
          icon={CheckCircle2}
          accentColor="emerald"
          trend={{ value: `${Math.round((metrics.presentToday / metrics.totalEmployees) * 100)}% Turnout`, positive: true }}
          onClick={() => navigate('/super-admin/attendance')}
        />
        <StatCard
          title="Absent / Missing Punch"
          value={metrics.absentToday + metrics.missingCheckout}
          subtitle={`${metrics.missingCheckout} Missing Shift Checkouts`}
          icon={Clock}
          accentColor="amber"
          trend={{ value: `${metrics.absentToday} Absent`, positive: false }}
          onClick={() => navigate('/super-admin/attendance')}
        />
        <StatCard
          title="Active Alerts"
          value={metrics.activeAlerts}
          subtitle="Location & Telemetry anomalies"
          icon={ShieldAlert}
          accentColor="rose"
          trend={{ value: 'Requires Review', positive: false }}
          onClick={() => navigate('/super-admin/alerts')}
        />
      </div>

      {/* Row 2: Financial Flow KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Allocated Funds"
          value={`₹${metrics.totalAllocated.toLocaleString()}`}
          subtitle="Cumulative operational float"
          icon={BadgeDollarSign}
          accentColor="teal"
          onClick={() => navigate('/super-admin/finance')}
        />
        <StatCard
          title="Approved Withdrawals"
          value={`₹${metrics.totalApprovedWithdrawals.toLocaleString()}`}
          subtitle={`${metrics.approvedEntries} Settled claims`}
          icon={FileCheck}
          accentColor="emerald"
          onClick={() => navigate('/super-admin/finance')}
        />
        <StatCard
          title="Pending Claims"
          value={`₹${metrics.pendingWithdrawalsAmount.toLocaleString()}`}
          subtitle={`${metrics.pendingEntries} Claims awaiting review`}
          icon={Clock}
          accentColor="amber"
          onClick={() => navigate('/super-admin/finance')}
        />
        <StatCard
          title="Remaining Float"
          value={`₹${metrics.remainingAllocation.toLocaleString()}`}
          subtitle="Available operational liquidity"
          icon={TrendingUp}
          accentColor="blue"
          onClick={() => navigate('/super-admin/finance')}
        />
      </div>

      {/* Row 3: Interactive Visual Trends (SVG Analytics) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weekly Attendance Distribution */}
        <div className="lg:col-span-6 bg-white p-6 rounded-xl border border-[#E8E2D8] shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-[#EBE5DB]">
            <div>
              <h3 className="font-bold text-[#2D2526] text-sm">Attendance Trends (7-Day Overview)</h3>
              <p className="text-xs text-[#74675B]">Live employee check-in vs absent volume</p>
            </div>
            <span className="text-xs font-semibold text-[#880E23] bg-[#FDF2F4] px-2 py-0.5 rounded border border-[#F8CAD1]">
              Live Feed
            </span>
          </div>

          <div className="mt-6 h-52 flex items-end justify-between gap-3 px-2">
            {attendanceTrends.map((t: any) => {
              const total = 12; // max height scale
              const presentHeight = Math.min(100, (t.present / total) * 100);
              const absentHeight = Math.min(100, (t.absent / total) * 100);

              return (
                <div key={t.day} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="w-full flex items-end justify-center gap-1 h-36">
                    {/* Present Bar: Matte Crimson */}
                    <div
                      style={{ height: `${presentHeight}%` }}
                      className="w-4 bg-[#880E23] rounded-t-sm group-hover:bg-[#6B081A] transition-all relative"
                    >
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#2D040A] text-white text-[10px] px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                        {t.present} Pres
                      </div>
                    </div>
                    {/* Absent Bar: Soft Beige/Stone */}
                    <div
                      style={{ height: `${absentHeight}%` }}
                      className="w-4 bg-[#DDD5C7] rounded-t-sm group-hover:bg-[#C8BDAA] transition-all relative"
                    >
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#2D040A] text-white text-[10px] px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                        {t.absent} Abs
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-[#685E4E]">{t.day}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-[#EBE5DB] flex items-center justify-center gap-6 text-xs text-[#74675B]">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-[#880E23]" /> Present / Checked-In
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-[#DDD5C7]" /> Absent / Discrepancy
            </span>
          </div>
        </div>

        {/* Financial Allocation vs Settlement Trends */}
        <div className="lg:col-span-6 bg-white p-6 rounded-xl border border-[#E8E2D8] shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-[#EBE5DB]">
            <div>
              <h3 className="font-bold text-[#2D2526] text-sm">Financial Allocation vs Withdrawal Trends</h3>
              <p className="text-xs text-[#74675B]">Capital deployment across all sub-admin accounts</p>
            </div>
            <button
              onClick={() => navigate('/super-admin/finance')}
              className="text-xs text-[#880E23] font-semibold hover:underline flex items-center gap-1"
            >
              Full Ledger <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-6 h-52 flex items-end justify-between gap-2 px-2">
            {financialFlowTrends.map((f: any) => {
              const maxScale = 200000;
              const allocHeight = Math.min(100, (f.allocated / maxScale) * 100);
              const withHeight = Math.min(100, (f.withdrawals / maxScale) * 100);

              return (
                <div key={f.month} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="w-full flex items-end justify-center gap-1 h-36">
                    <div
                      style={{ height: `${allocHeight}%` }}
                      className="w-4 bg-[#4E463A] rounded-t-sm group-hover:bg-[#363028] transition-all relative"
                    >
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#2D040A] text-white text-[10px] px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                        ₹{(f.allocated / 1000).toFixed(0)}k
                      </div>
                    </div>
                    <div
                      style={{ height: `${withHeight}%` }}
                      className="w-4 bg-[#880E23] rounded-t-sm group-hover:bg-[#6B081A] transition-all relative"
                    >
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#2D040A] text-white text-[10px] px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                        ₹{(f.withdrawals / 1000).toFixed(0)}k
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-[#685E4E] truncate max-w-[50px]">{f.month}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-[#EBE5DB] flex items-center justify-center gap-6 text-xs text-[#74675B]">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-[#4E463A]" /> Working Float Allocated
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-[#880E23]" /> Settled Withdrawals
            </span>
          </div>
        </div>
      </div>

      {/* Row 4: Recent Live Punch Feed & Recent Audit Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Live Punches Feed */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-[#E8E2D8] shadow-xs overflow-hidden">
          <div className="p-4 border-b border-[#EBE5DB] flex items-center justify-between">
            <h3 className="font-bold text-[#2D2526] text-sm">Live Attendance Punches (Today)</h3>
            <button
              onClick={() => navigate('/super-admin/attendance')}
              className="text-xs text-[#880E23] font-semibold hover:underline"
            >
              View Map &amp; Logs
            </button>
          </div>

          <div className="divide-y divide-[#EBE5DB] text-xs">
            {recentPunches.map((punch: any) => (
              <div key={punch.id} className="p-3.5 flex items-center justify-between hover:bg-[#F5F1EB]/80 transition-colors">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                      punch.punchType === 'CHECK_IN'
                        ? 'bg-[#FDF2F4] text-[#880E23] border border-[#F8CAD1]'
                        : 'bg-[#F5F1EB] text-[#5A504E] border border-[#EBE5DB]'
                    }`}
                  >
                    {punch.punchType === 'CHECK_IN' ? 'IN' : 'OUT'}
                  </div>
                  <div>
                    <span className="font-semibold text-[#2D2526] block">{punch.employeeName}</span>
                    <span className="text-[#74675B] text-[11px] truncate max-w-xs block">{punch.address}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-mono text-[#2D2526] font-medium block">{punch.time}</span>
                  {punch.isLocationDiscrepancy ? (
                    <span className="text-[#880E23] font-bold text-[10px] inline-flex items-center gap-0.5">
                      <AlertTriangle className="w-3 h-3" /> Geofence Discrepancy
                    </span>
                  ) : (
                    <span className="text-emerald-700 font-medium text-[10px]">Within Geofence</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Audit Activity */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-[#E8E2D8] shadow-xs overflow-hidden">
          <div className="p-4 border-b border-[#EBE5DB] flex items-center justify-between">
            <h3 className="font-bold text-[#2D2526] text-sm">System Audit Trail</h3>
            <button
              onClick={() => navigate('/super-admin/audit-logs')}
              className="text-xs text-[#880E23] font-semibold hover:underline"
            >
              Full Audit Log
            </button>
          </div>

          <div className="divide-y divide-[#EBE5DB] text-xs">
            {recentAudit.map((log: any) => (
              <div key={log.id} className="p-3.5 hover:bg-[#F5F1EB]/80 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#2D2526]">{log.action.replace(/_/g, ' ')}</span>
                  <span className="text-[#877A65] text-[11px]">{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
                <p className="text-[#5A504E] text-[11px] mt-0.5">
                  <span className="font-medium text-[#2D2526]">{log.actorName}</span> ({log.actorRole}) · {log.newValue || log.entityId}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
