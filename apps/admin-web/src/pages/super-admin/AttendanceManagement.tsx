import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Search,
  Filter,
  MapPin,
  AlertTriangle,
  Download,
  Calendar,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { superAdminApi } from '../../services/api';
import { AttendancePunch } from '../../types';
import { MapViewModal } from '../../components/common/MapViewModal';
import { ExportModal } from '../../components/common/ExportModal';

export const AttendanceManagement: React.FC = () => {
  const [punches, setPunches] = useState<AttendancePunch[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [search, setSearch] = useState('');
  const [discrepancyFilter, setDiscrepancyFilter] = useState<'ALL' | 'DISCREPANCY_ONLY'>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  // Modals
  const [selectedPunchForMap, setSelectedPunchForMap] = useState<AttendancePunch | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const data = await superAdminApi.getAttendance();
      setPunches(data);
    } catch (err) {
      console.error('Failed to load attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const filteredPunches = punches.filter((p) => {
    const matchesSearch =
      p.employeeName.toLowerCase().includes(search.toLowerCase()) ||
      p.address.toLowerCase().includes(search.toLowerCase());

    const matchesDiscrepancy =
      discrepancyFilter === 'ALL' || (discrepancyFilter === 'DISCREPANCY_ONLY' && p.isLocationDiscrepancy);

    const matchesType = typeFilter === 'ALL' || p.punchType === typeFilter;

    return matchesSearch && matchesDiscrepancy && matchesType;
  });

  const exportColumns = [
    { key: 'employeeName', label: 'Employee Name' },
    { key: 'punchType', label: 'Punch Type' },
    { key: 'date', label: 'Date' },
    { key: 'time', label: 'Time' },
    { key: 'address', label: 'Registered Address' },
    { key: 'latitude', label: 'Latitude' },
    { key: 'longitude', label: 'Longitude' },
    { key: 'accuracyMeters', label: 'Accuracy (Meters)' },
    { key: 'isLocationDiscrepancy', label: 'Geofence Discrepancy' },
    { key: 'notes', label: 'System Notes' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Workforce Attendance &amp; GPS Telemetry</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor real-time field check-ins, check-outs, geofence radius violations, and shift working durations.
          </p>
        </div>

        <button
          onClick={() => setIsExportOpen(true)}
          className="inline-flex items-center gap-2 px-3.5 py-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-2xs transition-colors"
        >
          <Download className="w-4 h-4 text-slate-500" />
          Export Attendance Logs
        </button>
      </div>

      {/* Filter Ribbon */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-wrap gap-3 items-center justify-between">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search employee or punch address..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="ALL">All Punch Types</option>
            <option value="CHECK_IN">CHECK_IN Only</option>
            <option value="CHECK_OUT">CHECK_OUT Only</option>
          </select>

          <button
            onClick={() =>
              setDiscrepancyFilter(discrepancyFilter === 'ALL' ? 'DISCREPANCY_ONLY' : 'ALL')
            }
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold border transition-colors ${
              discrepancyFilter === 'DISCREPANCY_ONLY'
                ? 'bg-rose-50 border-rose-300 text-rose-800 ring-1 ring-rose-400'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
            <span>Geofence Violations ({punches.filter((p) => p.isLocationDiscrepancy).length})</span>
          </button>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">Employee</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Date &amp; Time</th>
              <th className="py-3 px-4">GPS Coordinates</th>
              <th className="py-3 px-4">Address / Zone</th>
              <th className="py-3 px-4">Geofence Status</th>
              <th className="py-3 px-4 text-right">Map Telemetry</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  Loading attendance records...
                </td>
              </tr>
            ) : filteredPunches.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  No attendance punches match your current filter.
                </td>
              </tr>
            ) : (
              filteredPunches.map((punch) => (
                <tr
                  key={punch.id}
                  className={`transition-colors ${
                    punch.isLocationDiscrepancy ? 'bg-rose-50/30 hover:bg-rose-50/60' : 'hover:bg-slate-50/80'
                  }`}
                >
                  <td className="py-3 px-4 font-bold text-slate-900">{punch.employeeName}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold border ${
                        punch.punchType === 'CHECK_IN'
                          ? 'bg-teal-50 text-teal-800 border-teal-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {punch.punchType}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold block">{punch.date}</span>
                    <span className="font-mono text-slate-500 text-[11px]">{punch.time}</span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600">
                    {punch.latitude.toFixed(4)}, {punch.longitude.toFixed(4)}
                    <span className="text-slate-400 block text-[10px]">±{punch.accuracyMeters}m</span>
                  </td>
                  <td className="py-3 px-4 max-w-xs truncate text-slate-700" title={punch.address}>
                    {punch.address}
                  </td>
                  <td className="py-3 px-4">
                    {punch.isLocationDiscrepancy ? (
                      <span className="inline-flex items-center gap-1 text-rose-700 font-bold text-[11px]">
                        <AlertTriangle className="w-3.5 h-3.5" /> Outside Perimeter
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-medium text-[11px]">
                        <CheckCircle className="w-3.5 h-3.5" /> Inside Geofence
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setSelectedPunchForMap(punch)}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-700 rounded text-xs font-semibold border border-slate-200 transition-colors"
                    >
                      <MapPin className="w-3.5 h-3.5 text-teal-600" />
                      View Map
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* GPS Map Modal */}
      <MapViewModal
        isOpen={!!selectedPunchForMap}
        punch={selectedPunchForMap}
        onClose={() => setSelectedPunchForMap(null)}
      />

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        title="Attendance &amp; Telemetry Logs"
        filenamePrefix="Attendance_Punches"
        data={filteredPunches}
        availableColumns={exportColumns}
      />
    </div>
  );
};
