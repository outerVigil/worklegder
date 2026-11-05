import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Eye,
  DollarSign,
  PlusCircle,
  Building,
  Phone,
  Mail,
} from 'lucide-react';
import { subAdminApi } from '../../services/api';
import { EmployeeProfile } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EmployeeDetailModal } from '../../components/common/EmployeeDetailModal';
import { useNavigate } from 'react-router-dom';

export const SubAdminEmployees: React.FC = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<EmployeeProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssignedEmployees = async () => {
      setLoading(true);
      try {
        const data = await subAdminApi.getEmployees();
        setEmployees(data);
      } catch (err) {
        console.error('Failed to load assigned employees:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignedEmployees();
  }, []);

  const filtered = employees.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.employeeCode.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Assigned Hub Workforce</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            You have direct supervisory responsibility and fund allocation control over these {employees.length} employees.
          </p>
        </div>

        <button
          onClick={() => navigate('/admin/money')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
        >
          <DollarSign className="w-4 h-4" />
          Allocate Working Funds
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search assigned employees by name or code..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <span className="text-xs text-slate-500 font-medium">
          Showing {filtered.length} of {employees.length} assigned
        </span>
      </div>

      {/* Employee Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-3 py-16 text-center text-slate-400 text-xs">
            Loading assigned personnel...
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-3 bg-white p-12 text-center text-slate-400 text-xs rounded-xl border border-slate-200">
            No employees match search query.
          </div>
        ) : (
          filtered.map((emp) => (
            <div
              key={emp.id}
              className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-800 font-bold flex items-center justify-center text-sm border border-teal-100 shadow-2xs">
                      {emp.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm leading-tight">{emp.name}</h3>
                      <span className="text-[11px] font-mono text-slate-500">{emp.employeeCode}</span>
                    </div>
                  </div>
                  <StatusBadge status={emp.attendanceToday} size="sm" />
                </div>

                <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Available Balance:</span>
                    <span className="font-bold text-teal-700 text-sm">
                      ₹{emp.availableBalance.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Total Allocated:</span>
                    <span className="font-semibold text-slate-800">
                      ₹{emp.totalAllocated.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Approved Withdrawals:</span>
                    <span className="font-semibold text-emerald-700">
                      ₹{emp.totalApprovedWithdrawals.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="mt-3 text-[11px] text-slate-500 space-y-1">
                  <div className="flex items-center gap-1.5 truncate">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{emp.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{emp.phone}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => setSelectedEmployeeId(emp.id)}
                  className="flex-1 py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition-colors flex items-center justify-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" /> Full Dossier
                </button>
                <button
                  onClick={() => navigate(`/admin/money?employeeId=${emp.id}`)}
                  className="py-1.5 px-3 border border-teal-200 text-teal-700 hover:bg-teal-50 font-semibold rounded-lg text-xs transition-colors flex items-center gap-1"
                >
                  <DollarSign className="w-3.5 h-3.5" /> Allocate
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <EmployeeDetailModal
        isOpen={!!selectedEmployeeId}
        employeeId={selectedEmployeeId}
        onClose={() => setSelectedEmployeeId(null)}
      />
    </div>
  );
};
