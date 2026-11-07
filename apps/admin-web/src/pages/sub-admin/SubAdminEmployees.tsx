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
  Lock,
  Info,
  ShieldCheck,
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
  const [showPolicyModal, setShowPolicyModal] = useState(false);

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

        <div className="flex items-center gap-2.5">
          {/* Locked Employee Creation Button */}
          <button
            onClick={() => setShowPolicyModal(true)}
            title="Only the Super Admin can create new employees"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-500 hover:text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Create Employee (Super Admin Only)</span>
          </button>

          <button
            onClick={() => navigate('/admin/money')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#880E23] hover:bg-[#6B081A] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <DollarSign className="w-4 h-4" />
            Allocate Working Funds
          </button>
        </div>
      </div>

      {/* Role Policy Notice Banner */}
      <div className="bg-sky-50/70 border border-sky-200 rounded-xl p-3.5 flex items-start gap-3 text-xs text-sky-900">
        <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
        <div className="flex-1">
          <span className="font-bold">Role Permission Notice:</span>{' '}
          Employee creation and database onboarding is strictly restricted to the{' '}
          <strong className="text-sky-950 font-bold">Super Admin</strong>. As a Sub-Admin, you have operational supervision, attendance GPS monitoring, and fund allocation authority over employees assigned directly to your hub.
        </div>
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

      {/* Super Admin Exclusive Authority Explanation Modal */}
      {showPolicyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2D040A]/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-xl border border-[#E8E2D8] w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E8E2D8] flex items-center justify-between bg-[#FAF8F5]">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-[#FDF2F4] text-[#880E23] rounded-lg border border-[#F8CAD1]">
                  <Lock className="w-4 h-4 text-[#880E23]" />
                </div>
                <h3 className="font-bold text-[#2D2526] text-sm">Privilege Restriction Policy</h3>
              </div>
              <button onClick={() => setShowPolicyModal(false)} className="text-[#A89B85] hover:text-[#2D2526] transition-colors">
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs text-[#5A504E]">
              <p className="font-semibold text-[#2D2526] text-sm">
                Only the Super Admin can create and onboard new employees.
              </p>
              <p className="leading-relaxed">
                Under the platform's security and organizational hierarchy:
              </p>
              <ul className="list-disc list-inside space-y-1.5 text-[#5A504E] pl-1">
                <li><strong className="text-[#2D2526]">Super Admin</strong> has exclusive authority to register employee records, establish bank details, assign supervisors, and pair Android devices.</li>
                <li><strong className="text-[#2D2526]">Sub-Admins</strong> supervise assigned staff, review field punches, verify UPI proof receipts, and allocate operational capital.</li>
              </ul>
              <div className="p-3 bg-[#FAF8F5] rounded-lg border border-[#E8E2D8] text-[11px] text-[#74675B]">
                To onboard new staff for your regional hub, please submit an onboarding ticket to the Global Super Admin.
              </div>
            </div>

            <div className="px-6 py-3.5 bg-[#FAF8F5] border-t border-[#E8E2D8] flex justify-end">
              <button
                onClick={() => setShowPolicyModal(false)}
                className="px-4 py-2 bg-[#880E23] hover:bg-[#6B081A] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
