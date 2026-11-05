import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Calendar,
  DollarSign,
  FileText,
  Clock,
  History,
  Shield,
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle,
  MapPin,
  ExternalLink,
  CreditCard,
  Building,
} from 'lucide-react';
import { EmployeeProfile, AttendancePunch, EntrySubmission, FinancialLedger, EmployeeUpdateLog } from '../../types';
import { subAdminApi } from '../../services/api';
import { StatusBadge } from './StatusBadge';

interface EmployeeDetailModalProps {
  employeeId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onViewScreenshot?: (entry: EntrySubmission) => void;
}

export const EmployeeDetailModal: React.FC<EmployeeDetailModalProps> = ({
  employeeId,
  isOpen,
  onClose,
  onViewScreenshot,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'profile' | 'attendance' | 'entries' | 'finance' | 'documents' | 'updates'>('overview');
  const [loading, setLoading] = useState<boolean>(true);
  const [employee, setEmployee] = useState<EmployeeProfile | null>(null);
  const [punches, setPunches] = useState<AttendancePunch[]>([]);
  const [entries, setEntries] = useState<EntrySubmission[]>([]);
  const [ledger, setLedger] = useState<FinancialLedger[]>([]);
  const [updates, setUpdates] = useState<EmployeeUpdateLog[]>([]);
  const [isBankUnmasked, setIsBankUnmasked] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen || !employeeId) return;

    const fetchDetail = async () => {
      setLoading(true);
      try {
        const data = await subAdminApi.getEmployeeDetail(employeeId);
        setEmployee(data.employee);
        setPunches(data.punches || []);
        setEntries(data.entries || []);
        setLedger(data.ledger || []);
        setUpdates(data.updates || []);
        setIsBankUnmasked(false);
      } catch (err) {
        console.error('Failed to load employee details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [isOpen, employeeId]);

  if (!isOpen || !employeeId) return null;

  const handleToggleBankMask = async () => {
    if (!isBankUnmasked && employee) {
      // Log unmask audit to backend
      try {
        await subAdminApi.logUnmaskAudit(employee.id, employee.name);
      } catch (err) {
        console.error('Failed to log unmask audit:', err);
      }
    }
    setIsBankUnmasked(!isBankUnmasked);
  };

  const maskedBankNumber = employee?.bankAccountNumber
    ? `•••• •••• •••• ${employee.bankAccountNumber.slice(-4)}`
    : 'N/A';

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'profile', label: 'Profile', icon: Shield },
    { id: 'attendance', label: 'Attendance', icon: Calendar, badge: punches.length },
    { id: 'entries', label: 'Entries', icon: FileText, badge: entries.length },
    { id: 'finance', label: 'Financial History', icon: DollarSign },
    { id: 'documents', label: 'Uploaded Documents', icon: CreditCard },
    { id: 'updates', label: 'Update History', icon: History, badge: updates.length },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 md:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-teal-600 text-white font-bold flex items-center justify-center text-lg shadow-xs">
              {employee ? employee.name.charAt(0) : 'E'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-slate-900 text-lg leading-none">
                  {loading ? 'Loading...' : employee?.name}
                </h2>
                {employee && <StatusBadge status={employee.status} size="sm" />}
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                <span>{employee?.employeeCode}</span>
                <span aria-hidden="true">·</span>
                <span>{employee?.email}</span>
                <span aria-hidden="true">·</span>
                <span>{employee?.phone}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-200 bg-white px-6 gap-2 overflow-x-auto shrink-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-3 px-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? 'border-teal-600 text-teal-700 font-semibold'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-teal-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? 'bg-teal-100 text-teal-800' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          {loading ? (
            <div className="h-64 flex items-center justify-center text-slate-400 text-xs">
              Loading detailed records...
            </div>
          ) : !employee ? (
            <div className="text-center py-12 text-slate-500 text-xs">Employee records not found.</div>
          ) : (
            <>
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Financial & Attendance Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                        Available Balance
                      </span>
                      <span className="text-2xl font-bold text-teal-700 mt-1 block">
                        ₹{employee.availableBalance.toLocaleString()}
                      </span>
                      <span className="text-xs text-slate-400 mt-1 block">Ready for withdrawal claims</span>
                    </div>

                    <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                        Total Allocated
                      </span>
                      <span className="text-2xl font-bold text-slate-900 mt-1 block">
                        ₹{employee.totalAllocated.toLocaleString()}
                      </span>
                      <span className="text-xs text-slate-400 mt-1 block">Cumulative operational float</span>
                    </div>

                    <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                        Approved Withdrawals
                      </span>
                      <span className="text-2xl font-bold text-slate-900 mt-1 block">
                        ₹{employee.totalApprovedWithdrawals.toLocaleString()}
                      </span>
                      <span className="text-xs text-slate-400 mt-1 block">Settled payouts</span>
                    </div>

                    <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                        Today's Attendance
                      </span>
                      <div className="mt-2">
                        <StatusBadge status={employee.attendanceToday} />
                      </div>
                      <span className="text-xs text-slate-400 mt-1.5 block">{employee.lastPunch || 'No punch registered'}</span>
                    </div>
                  </div>

                  {/* Quick Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Bank & Sensitive Details */}
                    <div className="p-5 bg-white rounded-xl border border-slate-200/80 shadow-xs space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-slate-500" />
                          <h4 className="font-bold text-slate-900 text-sm">Designated Bank Information</h4>
                        </div>
                        <button
                          type="button"
                          onClick={handleToggleBankMask}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
                        >
                          {isBankUnmasked ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          <span>{isBankUnmasked ? 'Mask Details' : 'Unmask (Audited)'}</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-slate-500 block">Bank Name</span>
                          <span className="font-semibold text-slate-800">{employee.bankName}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">IFSC Code</span>
                          <span className="font-mono font-semibold text-slate-800">{employee.ifscCode}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-slate-500 block">Account Number</span>
                          <span className="font-mono font-bold text-slate-900 text-sm">
                            {isBankUnmasked ? employee.bankAccountNumber : maskedBankNumber}
                          </span>
                          {!isBankUnmasked && (
                            <span className="text-[11px] text-slate-400 block mt-0.5">
                              Masked per security policy. Unmasking events are logged to the audit ledger.
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Geofence & Location */}
                    <div className="p-5 bg-white rounded-xl border border-slate-200/80 shadow-xs space-y-4">
                      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                        <MapPin className="w-4 h-4 text-teal-600" />
                        <h4 className="font-bold text-slate-900 text-sm">Assigned Geofence Perimeter</h4>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div>
                          <span className="text-slate-500 block">Assigned Work Hub</span>
                          <span className="font-semibold text-slate-800">{employee.assignedLocation.name}</span>
                        </div>
                        <div className="flex items-center gap-6">
                          <div>
                            <span className="text-slate-500 block">Coordinates</span>
                            <span className="font-mono text-slate-700">
                              {employee.assignedLocation.latitude.toFixed(4)},{' '}
                              {employee.assignedLocation.longitude.toFixed(4)}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Allowed Perimeter Radius</span>
                            <span className="font-semibold text-teal-700">
                              {employee.assignedLocation.allowedRadiusMeters} meters
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: PROFILE */}
              {activeTab === 'profile' && (
                <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs space-y-6">
                  <h4 className="font-bold text-slate-900 text-sm pb-3 border-b border-slate-100">
                    Employee Personal &amp; Organization Master Record
                  </h4>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-xs">
                    <div>
                      <span className="text-slate-500 block mb-1">Full Legal Name</span>
                      <span className="font-semibold text-slate-900 text-sm">{employee.name}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block mb-1">Employee ID Code</span>
                      <span className="font-mono font-bold text-slate-900 text-sm">{employee.employeeCode}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block mb-1">Employment Status</span>
                      <StatusBadge status={employee.status} />
                    </div>
                    <div>
                      <span className="text-slate-500 block mb-1">Work Email Address</span>
                      <span className="font-medium text-slate-800">{employee.email}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block mb-1">Direct Phone Contact</span>
                      <span className="font-medium text-slate-800">{employee.phone}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block mb-1">Onboarding Date</span>
                      <span className="font-medium text-slate-800">
                        {new Date(employee.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block mb-1">Sub-Admin Supervisor</span>
                      <span className="font-semibold text-teal-700">{employee.subAdminName || 'Assigned Regional Sub-Admin'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block mb-1">Android Application Status</span>
                      <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                        <CheckCircle className="w-3.5 h-3.5" /> Paired &amp; Active
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: ATTENDANCE */}
              {activeTab === 'attendance' && (
                <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-xs">
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-sm">Attendance Punch Telemetry</h4>
                    <span className="text-xs text-slate-500">{punches.length} records logged</span>
                  </div>

                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-4">Date &amp; Time</th>
                        <th className="py-3 px-4">Punch Type</th>
                        <th className="py-3 px-4">GPS Location</th>
                        <th className="py-3 px-4">Geofence Status</th>
                        <th className="py-3 px-4">Work Duration</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {punches.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-slate-400">
                            No attendance punches recorded yet.
                          </td>
                        </tr>
                      ) : (
                        punches.map((p) => (
                          <tr key={p.id} className="hover:bg-slate-50/70">
                            <td className="py-3 px-4">
                              <span className="font-semibold text-slate-900 block">{p.date}</span>
                              <span className="text-slate-500 text-[11px] font-mono">{p.time}</span>
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`inline-flex px-2 py-0.5 rounded text-[11px] font-bold border ${
                                  p.punchType === 'CHECK_IN'
                                    ? 'bg-teal-50 text-teal-800 border-teal-200'
                                    : 'bg-slate-100 text-slate-700 border-slate-200'
                                }`}
                              >
                                {p.punchType}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="block font-medium">{p.address}</span>
                              <span className="text-[11px] font-mono text-slate-400">
                                {p.latitude.toFixed(4)}, {p.longitude.toFixed(4)} (±{p.accuracyMeters}m)
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              {p.isLocationDiscrepancy ? (
                                <span className="inline-flex items-center gap-1 text-rose-700 font-semibold text-[11px]">
                                  <AlertTriangle className="w-3.5 h-3.5" /> Outside Geofence
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-emerald-700 font-medium text-[11px]">
                                  <CheckCircle className="w-3.5 h-3.5" /> Verified
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 font-mono">
                              {p.workDurationMinutes ? `${Math.floor(p.workDurationMinutes / 60)}h ${p.workDurationMinutes % 60}m` : '—'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* TAB 4: ENTRIES */}
              {activeTab === 'entries' && (
                <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-xs">
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-sm">Submitted Payment Entries</h4>
                    <span className="text-xs text-slate-500">{entries.length} submissions</span>
                  </div>

                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-4">Ref ID</th>
                        <th className="py-3 px-4">Claimed Amount</th>
                        <th className="py-3 px-4">Task URL</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4 text-right">Proof</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {entries.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-400">
                            No entries submitted yet.
                          </td>
                        </tr>
                      ) : (
                        entries.map((entry) => (
                          <tr key={entry.id} className="hover:bg-slate-50/70">
                            <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                              {entry.referenceId}
                            </td>
                            <td className="py-3 px-4 font-bold text-slate-900">
                              ₹{entry.withdrawalAmount.toLocaleString()}
                            </td>
                            <td className="py-3 px-4 max-w-xs truncate text-teal-600">
                              <a href={entry.websiteUrl} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1">
                                {entry.websiteUrl} <ExternalLink className="w-3 h-3" />
                              </a>
                            </td>
                            <td className="py-3 px-4">
                              <StatusBadge status={entry.status} size="sm" />
                            </td>
                            <td className="py-3 px-4 text-slate-500">
                              {new Date(entry.submittedAt).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => onViewScreenshot && onViewScreenshot(entry)}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-medium text-[11px]"
                              >
                                View Proof
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* TAB 5: FINANCIAL HISTORY */}
              {activeTab === 'finance' && (
                <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-xs">
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-sm">Financial Ledger Transactions</h4>
                    <span className="text-xs text-slate-500">{ledger.length} ledger operations</span>
                  </div>

                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-4">Timestamp</th>
                        <th className="py-3 px-4">Type</th>
                        <th className="py-3 px-4">Amount</th>
                        <th className="py-3 px-4">Balance After</th>
                        <th className="py-3 px-4">Reference / Notes</th>
                        <th className="py-3 px-4">Created By</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {ledger.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-400">
                            No ledger entries found.
                          </td>
                        </tr>
                      ) : (
                        ledger.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50/70">
                            <td className="py-3 px-4 text-slate-500">
                              {new Date(item.createdAt).toLocaleString()}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                                  item.type === 'ALLOCATION'
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    : 'bg-rose-50 text-rose-800 border-rose-200'
                                }`}
                              >
                                {item.type.replace('_', ' ')}
                              </span>
                            </td>
                            <td
                              className={`py-3 px-4 font-bold ${
                                item.type === 'ALLOCATION' ? 'text-emerald-700' : 'text-slate-900'
                              }`}
                            >
                              {item.type === 'ALLOCATION' ? '+' : '-'}₹{item.amount.toLocaleString()}
                            </td>
                            <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                              ₹{item.balanceAfter.toLocaleString()}
                            </td>
                            <td className="py-3 px-4">
                              <span className="font-semibold block">{item.reference}</span>
                              <span className="text-slate-500 text-[11px]">{item.notes}</span>
                            </td>
                            <td className="py-3 px-4 text-slate-600 font-medium">
                              {item.createdByName}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* TAB 6: UPLOADED DOCUMENTS */}
              {activeTab === 'documents' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-5 bg-white rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="p-3 bg-teal-50 text-teal-700 rounded-lg w-fit mb-3">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm">Bank Passbook / Cancelled Cheque</h4>
                      <p className="text-xs text-slate-500 mt-1">Verified against NPCI routing records.</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-emerald-700 font-medium flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Verified
                      </span>
                      <button
                        onClick={() => alert(`Showing document: Passbook copy for ${employee.name}`)}
                        className="text-teal-600 font-semibold hover:underline"
                      >
                        Preview Document
                      </button>
                    </div>
                  </div>

                  <div className="p-5 bg-white rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="p-3 bg-sky-50 text-sky-700 rounded-lg w-fit mb-3">
                        <FileText className="w-5 h-5" />
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm">Employment Agreement</h4>
                      <p className="text-xs text-slate-500 mt-1">Digital signoff from Android mobile registration.</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-emerald-700 font-medium flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Signed
                      </span>
                      <button
                        onClick={() => alert(`Showing employment agreement for ${employee.name}`)}
                        className="text-teal-600 font-semibold hover:underline"
                      >
                        Preview Document
                      </button>
                    </div>
                  </div>

                  <div className="p-5 bg-white rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="p-3 bg-indigo-50 text-indigo-700 rounded-lg w-fit mb-3">
                        <Shield className="w-5 h-5" />
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm">Government Photo ID (Aadhaar / Voter)</h4>
                      <p className="text-xs text-slate-500 mt-1">Identity validation completed.</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-emerald-700 font-medium flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Approved
                      </span>
                      <button
                        onClick={() => alert(`Showing identity verification for ${employee.name}`)}
                        className="text-teal-600 font-semibold hover:underline"
                      >
                        Preview Document
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 7: UPDATE HISTORY */}
              {activeTab === 'updates' && (
                <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-xs">
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-sm">Profile Field Update History</h4>
                    <span className="text-xs text-slate-500">{updates.length} updates logged</span>
                  </div>

                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-4">Updated Field</th>
                        <th className="py-3 px-4">Previous Value</th>
                        <th className="py-3 px-4">New Value</th>
                        <th className="py-3 px-4">Updated By</th>
                        <th className="py-3 px-4">Timestamp</th>
                        <th className="py-3 px-4">Review Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {updates.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-400">
                            No profile update events recorded.
                          </td>
                        </tr>
                      ) : (
                        updates.map((upd) => (
                          <tr key={upd.id} className="hover:bg-slate-50/70">
                            <td className="py-3 px-4 font-semibold text-slate-900">
                              {upd.fieldName}
                            </td>
                            <td className="py-3 px-4 font-mono text-slate-500">
                              {upd.isMasked && !isBankUnmasked ? '•••• •••• ••••' : upd.oldValue}
                            </td>
                            <td className="py-3 px-4 font-mono font-semibold text-teal-800">
                              {upd.isMasked && !isBankUnmasked ? '•••• •••• ••••' : upd.newValue}
                            </td>
                            <td className="py-3 px-4 text-slate-600">{upd.updatedByName}</td>
                            <td className="py-3 px-4 text-slate-500">
                              {new Date(upd.updatedAt).toLocaleString()}
                            </td>
                            <td className="py-3 px-4">
                              <StatusBadge status={upd.reviewStatus} size="sm" />
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Close Detail View
          </button>
        </div>
      </div>
    </div>
  );
};
