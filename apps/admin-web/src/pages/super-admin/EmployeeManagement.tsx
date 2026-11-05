import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Search,
  Filter,
  Download,
  Plus,
  Eye,
  Building2,
  DollarSign,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { superAdminApi } from '../../services/api';
import { EmployeeProfile } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ExportModal } from '../../components/common/ExportModal';
import { EmployeeDetailModal } from '../../components/common/EmployeeDetailModal';

export const GlobalEmployeeManagement: React.FC = () => {
  const [employees, setEmployees] = useState<EmployeeProfile[]>([]);
  const [subAdmins, setSubAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [subAdminFilter, setSubAdminFilter] = useState('ALL');
  const [attendanceFilter, setAttendanceFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 8;

  // Modals
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New Employee Form
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formSubAdminId, setFormSubAdminId] = useState('');
  const [formBankName, setFormBankName] = useState('HDFC Bank');
  const [formAccount, setFormAccount] = useState('');
  const [formIfsc, setFormIfsc] = useState('HDFC0001248');
  const [formLocation, setFormLocation] = useState('North Metro Tech Hub');
  const [creating, setCreating] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [empList, saList] = await Promise.all([
        superAdminApi.getAllEmployees(),
        superAdminApi.getSubAdmins(),
      ]);
      setEmployees(empList);
      setSubAdmins(saList);
      if (saList.length > 0 && !formSubAdminId) {
        setFormSubAdminId(saList[0].id);
      }
    } catch (err) {
      console.error('Failed to load employees:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await superAdminApi.createEmployee({
        name: formName,
        email: formEmail,
        phone: formPhone,
        subAdminId: formSubAdminId,
        bankName: formBankName,
        bankAccountNumber: formAccount,
        ifscCode: formIfsc,
        locationName: formLocation,
      });
      await fetchData();
      setIsCreateModalOpen(false);
      setFormName('');
      setFormEmail('');
      setFormPhone('');
      setFormAccount('');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create employee');
    } finally {
      setCreating(false);
    }
  };

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase()) ||
      emp.employeeCode.toLowerCase().includes(search.toLowerCase());

    const matchesSubAdmin = subAdminFilter === 'ALL' || emp.subAdminId === subAdminFilter;
    const matchesAttendance = attendanceFilter === 'ALL' || emp.attendanceToday === attendanceFilter;
    const matchesStatus = statusFilter === 'ALL' || emp.status === statusFilter;

    return matchesSearch && matchesSubAdmin && matchesAttendance && matchesStatus;
  });

  const totalPages = Math.ceil(filteredEmployees.length / pageSize) || 1;
  const paginatedEmployees = filteredEmployees.slice((page - 1) * pageSize, page * pageSize);

  const exportColumns = [
    { key: 'employeeCode', label: 'Employee ID' },
    { key: 'name', label: 'Employee Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'subAdminName', label: 'Assigned Sub-Admin' },
    { key: 'attendanceToday', label: 'Attendance Status' },
    { key: 'availableBalance', label: 'Available Balance (INR)' },
    { key: 'totalAllocated', label: 'Total Allocated (INR)' },
    { key: 'totalApprovedWithdrawals', label: 'Approved Withdrawals (INR)' },
    { key: 'status', label: 'Account Status' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Global Employee Directory</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Enterprise database of {employees.length} registered field and hub personnel across all zones.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsExportOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-2xs transition-colors"
          >
            <Download className="w-4 h-4 text-slate-500" />
            Export to Excel / CSV
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            Onboard Employee
          </button>
        </div>
      </div>

      {/* Filter and Search Ribbon */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-wrap gap-3 items-center justify-between">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by code, name, or email..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Sub-Admin Filter */}
          <select
            value={subAdminFilter}
            onChange={(e) => {
              setSubAdminFilter(e.target.value);
              setPage(1);
            }}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="ALL">All Hubs &amp; Supervisors</option>
            {subAdmins.map((sa) => (
              <option key={sa.id} value={sa.id}>
                {sa.name} ({sa.region})
              </option>
            ))}
          </select>

          {/* Attendance Filter */}
          <select
            value={attendanceFilter}
            onChange={(e) => {
              setAttendanceFilter(e.target.value);
              setPage(1);
            }}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="ALL">All Attendance States</option>
            <option value="PRESENT">PRESENT</option>
            <option value="CHECKED_IN">CHECKED_IN (Live)</option>
            <option value="MISSING_CHECKOUT">MISSING_CHECKOUT</option>
            <option value="ABSENT">ABSENT</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="ALL">All Account Status</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="DEACTIVATED">DEACTIVATED</option>
          </select>
        </div>
      </div>

      {/* Employees Data Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">Employee ID &amp; Name</th>
              <th className="py-3 px-4">Assigned Sub-Admin</th>
              <th className="py-3 px-4">Today's Attendance</th>
              <th className="py-3 px-4">Available Balance</th>
              <th className="py-3 px-4">Pending Claims</th>
              <th className="py-3 px-4">Account Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  Loading employee records...
                </td>
              </tr>
            ) : paginatedEmployees.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  No employee records found matching your filters.
                </td>
              </tr>
            ) : (
              paginatedEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-800 font-bold flex items-center justify-center text-xs shrink-0 border border-teal-100">
                        {emp.name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block">{emp.name}</span>
                        <span className="text-[11px] font-mono text-slate-500">{emp.employeeCode} · {emp.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-800 block">{emp.subAdminName}</span>
                    <span className="text-[10px] text-slate-400">{emp.subAdminRegion}</span>
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={emp.attendanceToday} size="sm" />
                  </td>
                  <td className="py-3 px-4 font-bold text-teal-700">
                    ₹{emp.availableBalance.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800">
                    {emp.pendingWithdrawalsCount > 0 ? (
                      <span className="text-amber-700 font-bold">{emp.pendingWithdrawalsCount} pending</span>
                    ) : (
                      <span className="text-slate-400">0</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={emp.status} size="sm" />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setSelectedEmployeeId(emp.id)}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" /> Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination Footer */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, filteredEmployees.length)} of {filteredEmployees.length} employees
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1 rounded border border-slate-200 disabled:opacity-40 hover:bg-white"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-medium text-slate-800">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1 rounded border border-slate-200 disabled:opacity-40 hover:bg-white"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Excel / CSV Export Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        title="Comprehensive Employee Roster"
        filenamePrefix="Employees_Master_Export"
        data={filteredEmployees}
        availableColumns={exportColumns}
      />

      {/* 7-Tab Comprehensive Detail Modal */}
      <EmployeeDetailModal
        isOpen={!!selectedEmployeeId}
        employeeId={selectedEmployeeId}
        onClose={() => setSelectedEmployeeId(null)}
      />

      {/* Onboard Employee Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-sm">Onboard Field Employee</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateEmployee} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Deepak Joshi"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="e.g. deepak@enterprise.com"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mobile Phone Number</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+91 98765 00000"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assigned Sub-Admin *</label>
                  <select
                    value={formSubAdminId}
                    onChange={(e) => setFormSubAdminId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                  >
                    {subAdmins.map((sa) => (
                      <option key={sa.id} value={sa.id}>
                        {sa.name} ({sa.region})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                <span className="font-bold text-slate-900 block">Bank Account Routing Details</span>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1">
                    <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Bank</label>
                    <input
                      type="text"
                      value={formBankName}
                      onChange={(e) => setFormBankName(e.target.value)}
                      className="w-full px-2 py-1.5 border border-slate-200 rounded"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Account No.</label>
                    <input
                      type="text"
                      value={formAccount}
                      onChange={(e) => setFormAccount(e.target.value)}
                      placeholder="50100..."
                      className="w-full px-2 py-1.5 border border-slate-200 rounded font-mono"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-[11px] font-medium text-slate-600 mb-0.5">IFSC</label>
                    <input
                      type="text"
                      value={formIfsc}
                      onChange={(e) => setFormIfsc(e.target.value)}
                      className="w-full px-2 py-1.5 border border-slate-200 rounded font-mono"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assigned Work Hub Perimeter</label>
                <input
                  type="text"
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  placeholder="e.g. North Metro Tech Hub"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow-xs disabled:opacity-50"
                >
                  {creating ? 'Saving...' : 'Register Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
