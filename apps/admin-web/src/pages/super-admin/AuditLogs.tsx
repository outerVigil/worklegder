import React, { useState, useEffect } from 'react';
import { ScrollText, Search, Filter, ShieldCheck, Download, Calendar } from 'lucide-react';
import { superAdminApi } from '../../services/api';
import { AuditLog } from '../../types';
import { ExportModal } from '../../components/common/ExportModal';

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [entityFilter, setEntityFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [isExportOpen, setIsExportOpen] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await superAdminApi.getAuditLogs();
      setLogs(data);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.actorName.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.entityId.toLowerCase().includes(search.toLowerCase()) ||
      (log.newValue && log.newValue.toLowerCase().includes(search.toLowerCase()));

    const matchesEntity = entityFilter === 'ALL' || log.entityType === entityFilter;
    const matchesRole = roleFilter === 'ALL' || log.actorRole === roleFilter;

    return matchesSearch && matchesEntity && matchesRole;
  });

  const exportColumns = [
    { key: 'timestamp', label: 'Timestamp (ISO)' },
    { key: 'actorName', label: 'Actor Name' },
    { key: 'actorRole', label: 'Actor Role' },
    { key: 'action', label: 'Action Performed' },
    { key: 'entityType', label: 'Target Entity' },
    { key: 'entityId', label: 'Entity ID' },
    { key: 'previousValue', label: 'Previous State' },
    { key: 'newValue', label: 'New State' },
    { key: 'ipAddress', label: 'Client IP Address' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Enterprise Audit &amp; Security Logs</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable append-only chronological log of all administrator operations, approvals, allocations, and data accesses.
          </p>
        </div>

        <button
          onClick={() => setIsExportOpen(true)}
          className="inline-flex items-center gap-2 px-3.5 py-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-2xs transition-colors"
        >
          <Download className="w-4 h-4 text-slate-500" />
          Export Audit Trail
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-wrap gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by actor, action, or entity ID..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="ALL">All Entity Types</option>
            <option value="USER">USER</option>
            <option value="ENTRY">ENTRY</option>
            <option value="ALLOCATION">ALLOCATION</option>
            <option value="ASSIGNMENT">ASSIGNMENT</option>
            <option value="ATTENDANCE">ATTENDANCE</option>
            <option value="ALERT">ALERT</option>
          </select>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="ALL">All Roles</option>
            <option value="SUPER_ADMIN">SUPER_ADMIN</option>
            <option value="SUB_ADMIN">SUB_ADMIN</option>
            <option value="EMPLOYEE">EMPLOYEE</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">Actor</th>
              <th className="py-3 px-4">Action</th>
              <th className="py-3 px-4">Entity Type</th>
              <th className="py-3 px-4">State Transition (Diff)</th>
              <th className="py-3 px-4 text-right">IP Address</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  Loading security audit trail...
                </td>
              </tr>
            ) : filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  No audit logs matching query.
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 text-slate-500">
                    <span className="font-semibold text-slate-800 block">
                      {new Date(log.timestamp).toLocaleDateString()}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-900 block">{log.actorName}</span>
                    <span className="text-[10px] text-slate-500 uppercase">{log.actorRole}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono font-semibold text-teal-800 bg-teal-50/80 px-2 py-0.5 rounded border border-teal-100 inline-block">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-medium">{log.entityType}</td>
                  <td className="py-3 px-4 max-w-sm">
                    {log.previousValue && (
                      <span className="text-[11px] text-slate-400 line-through block">
                        Prev: {log.previousValue}
                      </span>
                    )}
                    <span className="font-medium text-slate-800 text-xs block">
                      {log.newValue || log.entityId}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-500 text-[11px]">
                    {log.ipAddress}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        title="Security Audit Trail"
        filenamePrefix="Security_Audit_Logs"
        data={filteredLogs}
        availableColumns={exportColumns}
      />
    </div>
  );
};
