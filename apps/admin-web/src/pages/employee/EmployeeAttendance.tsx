import React, { useState, useEffect } from 'react';
import { Clock, MapPin, LogIn, LogOut, CheckCircle2, AlertTriangle } from 'lucide-react';
import { employeeApi } from '../../services/api';
import { AttendancePunch, EmployeeProfile } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';

export const EmployeeAttendance: React.FC = () => {
  const [employee, setEmployee] = useState<EmployeeProfile | null>(null);
  const [punches, setPunches] = useState<AttendancePunch[]>([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [profile, punchList] = await Promise.all([
        employeeApi.getMyProfile(),
        employeeApi.getAttendance(),
      ]);
      setEmployee(profile);
      setPunches(punchList);
    } catch (err) {
      console.error('Failed to load attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePunch = async (punchType: 'CHECK_IN' | 'CHECK_OUT') => {
    setSubmitting(true);
    setMessage(null);
    try {
      await employeeApi.punchAttendance(punchType, notes.trim() || undefined);
      setNotes('');
      setMessage(
        punchType === 'CHECK_IN'
          ? 'Check-In recorded with verified GPS coordinates.'
          : 'Check-Out recorded. Shift log updated.'
      );
      await loadData();
    } catch (err: any) {
      setMessage(err?.response?.data?.message || 'Failed to record attendance punch.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !employee) {
    return <div className="p-8 text-center text-xs text-slate-400">Loading attendance records...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">My Attendance &amp; Shift Punches</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Register GPS-verified check-in and check-out punches for {employee.assignedLocation.name}.
          </p>
        </div>
        <StatusBadge status={employee.attendanceToday} />
      </div>

      {/* Punch Action Card */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-teal-50 text-teal-700 rounded-lg border border-teal-100">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Assigned Geofence Zone</h3>
              <p className="text-xs text-slate-500">
                {employee.assignedLocation.name} · Radius: {employee.assignedLocation.allowedRadiusMeters}m
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handlePunch('CHECK_IN')}
              disabled={submitting || employee.attendanceToday === 'CHECKED_IN'}
              className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors disabled:opacity-40"
            >
              <LogIn className="w-4 h-4" />
              Check In
            </button>
            <button
              onClick={() => handlePunch('CHECK_OUT')}
              disabled={submitting || employee.attendanceToday !== 'CHECKED_IN'}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors disabled:opacity-40"
            >
              <LogOut className="w-4 h-4" />
              Check Out
            </button>
          </div>
        </div>

        <div className="text-xs">
          <label className="block font-semibold text-slate-700 mb-1">Optional Shift / Field Note</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g., Morning hub arrival, client site visit, or evening wrap-up..."
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {message && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            {message}
          </div>
        )}
      </div>

      {/* Punch History Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Clock className="w-4 h-4 text-teal-600" />
            Personal Punch Log ({punches.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Date &amp; Time</th>
                <th className="py-3 px-4">Punch Type</th>
                <th className="py-3 px-4">Verified Location</th>
                <th className="py-3 px-4">Geofence Status</th>
                <th className="py-3 px-4">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {punches.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No punch history found.
                  </td>
                </tr>
              ) : (
                punches.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-800">
                      {p.date} <span className="text-slate-500">{p.time}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${
                          p.punchType === 'CHECK_IN'
                            ? 'bg-teal-50 text-teal-800 border-teal-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        {p.punchType.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700">{p.address}</td>
                    <td className="py-3 px-4">
                      {p.isLocationDiscrepancy ? (
                        <span className="inline-flex items-center gap-1 text-rose-700 font-semibold">
                          <AlertTriangle className="w-3.5 h-3.5" /> Out of Zone
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Verified (±{p.accuracyMeters}m)
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-500 italic">{p.notes || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
