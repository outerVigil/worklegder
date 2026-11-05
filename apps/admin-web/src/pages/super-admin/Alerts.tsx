import React, { useState, useEffect } from 'react';
import {
  Bell,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Search,
  ShieldAlert,
  Clock,
  Eye,
} from 'lucide-react';
import { superAdminApi } from '../../services/api';
import { SystemAlert, AlertSeverity } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';

export const AlertsCenter: React.FC = () => {
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const data = await superAdminApi.getAlerts();
      setAlerts(data);
    } catch (err) {
      console.error('Failed to load alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleReviewAlert = async (id: string) => {
    try {
      await superAdminApi.reviewAlert(id);
      await fetchAlerts();
    } catch (err) {
      console.error('Failed to review alert:', err);
    }
  };

  const filteredAlerts = alerts.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.description.toLowerCase().includes(search.toLowerCase()) ||
      (a.employeeName && a.employeeName.toLowerCase().includes(search.toLowerCase()));

    const matchesSeverity = severityFilter === 'ALL' || a.severity === severityFilter;

    return matchesSearch && matchesSeverity;
  });

  const unreviewedCount = alerts.filter((a) => !a.reviewed).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Active System &amp; Telemetry Alerts</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational anomalies, GPS geofence breaches, missing punches, and financial ledger validation warnings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800">
            {unreviewedCount} Action Required
          </span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-wrap gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search alerts by title, employee, or description..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">CRITICAL</option>
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="LOW">LOW</option>
          </select>
        </div>
      </div>

      {/* Alert Feed List */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs">Loading operational alerts...</div>
        ) : filteredAlerts.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-400 text-xs">
            No system alerts matching your criteria.
          </div>
        ) : (
          filteredAlerts.map((alt) => (
            <div
              key={alt.id}
              className={`bg-white rounded-xl border p-4 shadow-xs transition-all ${
                alt.reviewed
                  ? 'border-slate-200 opacity-70 bg-slate-50/50'
                  : alt.severity === 'HIGH' || alt.severity === 'CRITICAL'
                  ? 'border-rose-300 bg-rose-50/20 ring-1 ring-rose-200'
                  : 'border-slate-200/90'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2.5 rounded-lg shrink-0 mt-0.5 border ${
                      alt.severity === 'CRITICAL' || alt.severity === 'HIGH'
                        ? 'bg-rose-50 text-rose-600 border-rose-100'
                        : alt.severity === 'MEDIUM'
                        ? 'bg-amber-50 text-amber-600 border-amber-100'
                        : 'bg-blue-50 text-blue-600 border-blue-100'
                    }`}
                  >
                    <AlertTriangle className="w-5 h-5" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-slate-900 text-sm">{alt.title}</h4>
                      <StatusBadge status={alt.severity} size="sm" />
                      <span className="text-[11px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                        {alt.type}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{alt.description}</p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2">
                      {alt.employeeName && (
                        <span>
                          Target: <strong className="text-slate-700">{alt.employeeName}</strong>
                        </span>
                      )}
                      <span>·</span>
                      <span>{new Date(alt.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {alt.reviewed ? (
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-medium bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Reviewed by {alt.reviewedBy || 'Admin'}
                    </span>
                  ) : (
                    <button
                      onClick={() => handleReviewAlert(alt.id)}
                      className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                    >
                      Mark as Reviewed
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
