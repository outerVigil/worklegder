import React, { useState, useEffect } from 'react';
import {
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  BadgeDollarSign,
  FileCheck,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  Building,
  Eye,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { subAdminApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ScreenshotModal } from '../../components/common/ScreenshotModal';
import { EntrySubmission } from '../../types';

export const SubAdminOverview: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedEntryForProof, setSelectedEntryForProof] = useState<EntrySubmission | null>(null);

  useEffect(() => {
    const fetchOverview = async () => {
      setLoading(true);
      try {
        const res = await subAdminApi.getDashboard();
        setData(res);
      } catch (err) {
        console.error('Failed to load sub-admin dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, [user]);

  if (loading || !data) {
    return (
      <div className="h-96 flex items-center justify-center text-slate-400 text-xs">
        Loading regional hub operations dashboard...
      </div>
    );
  }

  const { metrics, recentPunches, pendingEntriesList } = data;

  return (
    <div className="space-y-6">
      {/* Sub-Admin Regional Header Banner */}
      <div className="bg-gradient-to-r from-[#3B030B] via-[#4D0612] to-[#2B0308] border border-[#5C0A18] rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[#F29CA9] font-mono text-[11px] uppercase tracking-wider font-semibold">
              REGIONAL SUPERVISORY DESK
            </span>
            <span className="text-[#EBE5DB] text-xs">·</span>
            <span className="text-xs text-[#EBE5DB] font-semibold">{user?.region || 'Designated Region'}</span>
          </div>
          <h2 className="text-xl font-bold mt-1 tracking-tight">Hub Operations Dashboard</h2>
          <p className="text-xs text-[#EBE5DB] mt-1">
            Managing {metrics.totalEmployees} assigned employees. You have {metrics.pendingEntries} pending entry claims requiring review.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/entries')}
            className="px-4 py-2 bg-[#FAF8F5] hover:bg-[#EBE5DB] text-[#3B030B] font-bold text-xs rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
          >
            Review Entries ({metrics.pendingEntries})
          </button>
          <button
            onClick={() => navigate('/admin/money')}
            className="px-4 py-2 bg-[#540A17] hover:bg-[#6B081A] text-[#FDF2F4] font-semibold text-xs rounded-lg border border-[#6B081A] transition-colors"
          >
            Allocate Funds
          </button>
        </div>
      </div>

      {/* Row 1: Attendance & Shift Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Assigned Workforce"
          value={metrics.totalEmployees}
          subtitle="Regional field agents"
          icon={Users}
          accentColor="slate"
          onClick={() => navigate('/admin/employees')}
        />
        <StatCard
          title="Present Today"
          value={metrics.presentToday}
          subtitle={`${metrics.checkedInNow} Active Field Check-Ins`}
          icon={CheckCircle2}
          accentColor="emerald"
          trend={{ value: `${Math.round((metrics.presentToday / (metrics.totalEmployees || 1)) * 100)}% Turnout`, positive: true }}
          onClick={() => navigate('/admin/punches')}
        />
        <StatCard
          title="Missing Checkouts"
          value={metrics.missingCheckout}
          subtitle={`${metrics.absentToday} marked absent today`}
          icon={Clock}
          accentColor="amber"
          trend={{ value: 'Incomplete Shifts', positive: false }}
          onClick={() => navigate('/admin/punches')}
        />
        <StatCard
          title="Active Hub Alerts"
          value={metrics.activeAlerts}
          subtitle="Anomalies & Geofence breaches"
          icon={AlertTriangle}
          accentColor="rose"
          onClick={() => navigate('/admin/alerts')}
        />
      </div>

      {/* Row 2: Financial Pool Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Allocated Float"
          value={`₹${metrics.totalAllocated.toLocaleString()}`}
          subtitle="Budget across assigned team"
          icon={BadgeDollarSign}
          accentColor="teal"
          onClick={() => navigate('/admin/money')}
        />
        <StatCard
          title="Approved Withdrawals"
          value={`₹${metrics.totalApprovedWithdrawals.toLocaleString()}`}
          subtitle="Disbursed & settled payouts"
          icon={FileCheck}
          accentColor="emerald"
          onClick={() => navigate('/admin/money')}
        />
        <StatCard
          title="Pending Claims"
          value={metrics.pendingEntries}
          subtitle="Awaiting authorization"
          icon={Clock}
          accentColor="amber"
          onClick={() => navigate('/admin/entries')}
        />
        <StatCard
          title="Remaining Hub Float"
          value={`₹${metrics.remainingAllocation.toLocaleString()}`}
          subtitle="Available operational liquidity"
          icon={TrendingUp}
          accentColor="blue"
          onClick={() => navigate('/admin/money')}
        />
      </div>

      {/* Row 3: Pending Entry Claims Queue & Live Punches */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Pending Entry Approvals Queue */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-[#E8E2D8] shadow-xs overflow-hidden">
          <div className="p-4 border-b border-[#EBE5DB] flex items-center justify-between">
            <div>
              <h3 className="font-bold text-[#2D2526] text-sm">Pending Entry Claims (Review Queue)</h3>
              <p className="text-xs text-[#74675B]">Requires verification against uploaded payment proof</p>
            </div>
            <button
              onClick={() => navigate('/admin/entries')}
              className="text-xs text-[#880E23] font-semibold hover:underline flex items-center gap-1"
            >
              All Entries <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-[#EBE5DB] text-xs">
            {pendingEntriesList.length === 0 ? (
              <div className="py-12 text-center text-[#877A65]">
                All claims reviewed! No pending entries in your queue.
              </div>
            ) : (
              pendingEntriesList.map((entry: EntrySubmission) => (
                <div key={entry.id} className="p-4 hover:bg-[#F5F1EB]/80 transition-colors flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#2D2526]">{entry.employeeName}</span>
                      <span className="font-mono text-[11px] text-[#880E23] bg-[#FDF2F4] px-1.5 py-0.5 rounded border border-[#F8CAD1]">
                        {entry.referenceId}
                      </span>
                    </div>
                    <span className="text-[#74675B] text-[11px] block mt-0.5">
                      Bank: {entry.bankName} (•••• {entry.bankAccountNumber.slice(-4)})
                    </span>
                    <span className="text-[10px] text-[#877A65] block mt-0.5">
                      Submitted: {new Date(entry.submittedAt).toLocaleTimeString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="font-bold text-[#2D2526] text-sm block">
                        ₹{entry.withdrawalAmount.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-[#877A65]">Claim Value</span>
                    </div>

                    <button
                      onClick={() => setSelectedEntryForProof(entry)}
                      className="px-3 py-1.5 bg-[#FAF8F5] hover:bg-[#FDF2F4] hover:text-[#880E23] text-[#4E463A] border border-[#E8E2D8] rounded-lg font-semibold transition-colors flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" /> View Proof
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Live Punches for Team */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-[#E8E2D8] shadow-xs overflow-hidden">
          <div className="p-4 border-b border-[#EBE5DB] flex items-center justify-between">
            <h3 className="font-bold text-[#2D2526] text-sm">Assigned Team Live Punches</h3>
            <button
              onClick={() => navigate('/admin/punches')}
              className="text-xs text-[#880E23] font-semibold hover:underline"
            >
              Punch History
            </button>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {recentPunches.length === 0 ? (
              <div className="py-12 text-center text-slate-400">No punches registered today.</div>
            ) : (
              recentPunches.map((punch: any) => (
                <div key={punch.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50/80 transition-colors">
                  <div>
                    <span className="font-bold text-slate-900 block">{punch.employeeName}</span>
                    <span className="text-slate-500 text-[11px] truncate max-w-[200px] block">
                      {punch.address}
                    </span>
                  </div>

                  <div className="text-right">
                    <span
                      className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                        punch.punchType === 'CHECK_IN'
                          ? 'bg-teal-50 text-teal-800 border-teal-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {punch.punchType}
                    </span>
                    <span className="font-mono text-slate-500 text-[11px] block mt-0.5">{punch.time}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Proof Lightbox Modal */}
      <ScreenshotModal
        isOpen={!!selectedEntryForProof}
        entry={selectedEntryForProof}
        onClose={() => setSelectedEntryForProof(null)}
        onApprove={() => {
          setSelectedEntryForProof(null);
          navigate('/admin/entries');
        }}
        onReject={() => {
          setSelectedEntryForProof(null);
          navigate('/admin/entries');
        }}
      />
    </div>
  );
};
