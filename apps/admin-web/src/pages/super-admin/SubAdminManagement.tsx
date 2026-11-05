import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  UserPlus,
  Users,
  Search,
  Building,
  ArrowRightLeft,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { superAdminApi } from '../../services/api';
import { SubAdminEnriched, EmployeeProfile } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';

export const SubAdminManagement: React.FC = () => {
  const [subAdmins, setSubAdmins] = useState<SubAdminEnriched[]>([]);
  const [allEmployees, setAllEmployees] = useState<EmployeeProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');

  // Modals
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedSubAdmin, setSelectedSubAdmin] = useState<SubAdminEnriched | null>(null);
  const [selectedEmployeeToAssign, setSelectedEmployeeToAssign] = useState<string>('');
  const [assigning, setAssigning] = useState<boolean>(false);

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isCreateSubAdminOpen, setIsCreateSubAdminOpen] = useState(false);

  // New subadmin form
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRegion, setNewRegion] = useState('');
  const [newPhone, setNewPhone] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [saData, empData] = await Promise.all([
        superAdminApi.getSubAdmins(),
        superAdminApi.getAllEmployees(),
      ]);
      setSubAdmins(saData);
      setAllEmployees(empData);
    } catch (err) {
      console.error('Failed to load sub-admins:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssignEmployee = async () => {
    if (!selectedSubAdmin || !selectedEmployeeToAssign) return;
    setAssigning(true);
    try {
      await superAdminApi.assignEmployee(selectedEmployeeToAssign, selectedSubAdmin.id);
      await fetchData();
      setIsAssignModalOpen(false);
      setSelectedEmployeeToAssign('');
    } catch (err) {
      console.error('Failed to assign employee:', err);
    } finally {
      setAssigning(false);
    }
  };

  const handleCreateSubAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await superAdminApi.createUser({
        name: newName,
        email: newEmail,
        role: 'SUB_ADMIN',
        region: newRegion,
        phone: newPhone,
      });
      await fetchData();
      setIsCreateSubAdminOpen(false);
      setNewName('');
      setNewEmail('');
      setNewRegion('');
      setNewPhone('');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create sub-admin');
    }
  };

  const filtered = subAdmins.filter(
    (sa) =>
      sa.name.toLowerCase().includes(search.toLowerCase()) ||
      sa.email.toLowerCase().includes(search.toLowerCase()) ||
      (sa.region && sa.region.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Sub-Admin Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Supervise regional hub supervisors, their assigned field workers, and fund allocations.
          </p>
        </div>

        <button
          onClick={() => setIsCreateSubAdminOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Add Regional Sub-Admin
        </button>
      </div>

      {/* Sub-Admin KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {subAdmins.map((sa) => (
          <div key={sa.id} className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-teal-50 border border-teal-100 text-teal-700 font-bold flex items-center justify-center text-sm">
                  {sa.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{sa.name}</h3>
                  <span className="text-[11px] text-slate-500 block">{sa.email}</span>
                </div>
              </div>
              <StatusBadge status={sa.status} size="sm" />
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Operating Region:</span>
                <span className="font-semibold text-slate-800">{sa.region || 'Assigned Zone'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Assigned Workforce:</span>
                <span className="font-bold text-teal-700">{sa.assignedCount} Employees</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Allocated Budget:</span>
                <span className="font-semibold text-slate-900">₹{sa.totalAllocated.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  setSelectedSubAdmin(sa);
                  setIsDetailsModalOpen(true);
                }}
                className="flex-1 py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
              >
                View Employees ({sa.assignedCount})
              </button>
              <button
                onClick={() => {
                  setSelectedSubAdmin(sa);
                  setIsAssignModalOpen(true);
                }}
                className="py-1.5 px-3 border border-teal-200 text-teal-700 hover:bg-teal-50 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" /> Reassign
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Sub-Admins Detail Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">All Sub-Admin Accounts</h3>
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Sub-Admins..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">Sub-Admin Name</th>
              <th className="py-3 px-4">Region / Hub</th>
              <th className="py-3 px-4">Assigned Employees</th>
              <th className="py-3 px-4">Total Float Allocated</th>
              <th className="py-3 px-4">Approved Withdrawals</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filtered.map((sa) => (
              <tr key={sa.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-4">
                  <div className="font-bold text-slate-900">{sa.name}</div>
                  <div className="text-[11px] text-slate-500">{sa.email}</div>
                </td>
                <td className="py-3 px-4 text-slate-600">{sa.region || 'N/A'}</td>
                <td className="py-3 px-4">
                  <span className="font-bold text-slate-900">{sa.assignedCount} employees</span>
                </td>
                <td className="py-3 px-4 font-semibold text-slate-900">
                  ₹{sa.totalAllocated.toLocaleString()}
                </td>
                <td className="py-3 px-4 font-semibold text-emerald-700">
                  ₹{sa.totalApprovedWithdrawals.toLocaleString()}
                </td>
                <td className="py-3 px-4">
                  <StatusBadge status={sa.status} size="sm" />
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => {
                      setSelectedSubAdmin(sa);
                      setIsAssignModalOpen(true);
                    }}
                    className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold"
                  >
                    Assign Staff
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Assign Employee to Sub-Admin Modal */}
      {isAssignModalOpen && selectedSubAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-sm">Assign Employee to Sub-Admin</h3>
              <button onClick={() => setIsAssignModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-teal-50 border border-teal-100 rounded-lg text-teal-900">
                <span className="font-bold block">Target Supervisor:</span>
                <span>{selectedSubAdmin.name} ({selectedSubAdmin.region})</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Employee to Reassign</label>
                <select
                  value={selectedEmployeeToAssign}
                  onChange={(e) => setSelectedEmployeeToAssign(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                >
                  <option value="">-- Choose an employee --</option>
                  {allEmployees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.employeeCode}) · Currently assigned: {emp.subAdminId === selectedSubAdmin.id ? 'This Sub-Admin' : 'Another Hub'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!selectedEmployeeToAssign || assigning}
                  onClick={handleAssignEmployee}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow-xs disabled:opacity-50"
                >
                  {assigning ? 'Assigning...' : 'Confirm Assignment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Admin Employee Roster Modal */}
      {isDetailsModalOpen && selectedSubAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  {selectedSubAdmin.name}'s Assigned Workforce
                </h3>
                <p className="text-xs text-slate-500">{selectedSubAdmin.region}</p>
              </div>
              <button onClick={() => setIsDetailsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <div className="p-6">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Employee Name</th>
                    <th className="py-2.5 px-3">Code</th>
                    <th className="py-2.5 px-3">Available Balance</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedSubAdmin.assignedEmployees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{emp.name}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-500">{emp.code}</td>
                      <td className="py-2.5 px-3 font-bold text-teal-700">₹{emp.balance.toLocaleString()}</td>
                      <td className="py-2.5 px-3">
                        <StatusBadge status={emp.status} size="sm" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Sub-Admin Modal */}
      {isCreateSubAdminOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-sm">Add Sub-Admin Hub Lead</h3>
              <button onClick={() => setIsCreateSubAdminOpen(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubAdmin} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Liam Gallagher"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="e.g. subadmin.east@enterprise.com"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assigned Region / Zone *</label>
                <input
                  type="text"
                  required
                  value={newRegion}
                  onChange={(e) => setNewRegion(e.target.value)}
                  placeholder="e.g. East Coast Distribution Hub"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="+1 (555) 019-8812"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateSubAdminOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  Create Sub-Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
