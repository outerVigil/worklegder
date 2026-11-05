import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, Download, Users, CalendarCheck, DollarSign } from 'lucide-react';
import { subAdminApi } from '../../services/api';
import { ExportModal } from '../../components/common/ExportModal';

export const SubAdminReports: React.FC = () => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [punches, setPunches] = useState<any[]>([]);
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [exportConfig, setExportConfig] = useState<{
    isOpen: boolean;
    title: string;
    filename: string;
    data: any[];
    columns: { key: string; label: string }[];
  }>({
    isOpen: false,
    title: '',
    filename: '',
    data: [],
    columns: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [empData, punchData, entryData] = await Promise.all([
          subAdminApi.getEmployees(),
          subAdminApi.getAttendance(),
          subAdminApi.getEntries(),
        ]);
        setEmployees(empData);
        setPunches(punchData);
        setEntries(entryData);
      } catch (err) {
        console.error('Failed to load sub-admin report data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const triggerExport = (type: string) => {
    if (type === 'EMPLOYEES') {
      setExportConfig({
        isOpen: true,
        title: 'Assigned Hub Employees Statement',
        filename: 'Hub_Employees_Report',
        data: employees,
        columns: [
          { key: 'employeeCode', label: 'Employee Code' },
          { key: 'name', label: 'Name' },
          { key: 'email', label: 'Email' },
          { key: 'phone', label: 'Phone' },
          { key: 'availableBalance', label: 'Available Balance (INR)' },
          { key: 'totalAllocated', label: 'Total Allocated' },
          { key: 'totalApprovedWithdrawals', label: 'Approved Withdrawals' },
          { key: 'attendanceToday', label: 'Attendance Today' },
        ],
      });
    } else if (type === 'PUNCHES') {
      setExportConfig({
        isOpen: true,
        title: 'Assigned Workforce Punch Telemetry',
        filename: 'Hub_Attendance_Punches',
        data: punches,
        columns: [
          { key: 'employeeName', label: 'Employee Name' },
          { key: 'punchType', label: 'Punch Type' },
          { key: 'date', label: 'Date' },
          { key: 'time', label: 'Time' },
          { key: 'address', label: 'Punch Address' },
          { key: 'isLocationDiscrepancy', label: 'Geofence Breach' },
        ],
      });
    } else if (type === 'ENTRIES') {
      setExportConfig({
        isOpen: true,
        title: 'Hub Entry Claims & Proof History',
        filename: 'Hub_Claims_History',
        data: entries,
        columns: [
          { key: 'referenceId', label: 'UPI Ref ID' },
          { key: 'employeeName', label: 'Employee Name' },
          { key: 'withdrawalAmount', label: 'Withdrawal Amount (INR)' },
          { key: 'bankAccountNumber', label: 'Target Account' },
          { key: 'status', label: 'Approval Status' },
          { key: 'submittedAt', label: 'Submitted Date' },
          { key: 'reviewedByName', label: 'Reviewed By' },
        ],
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Hub Reporting Center</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Generate regional reports and export spreadsheets for your assigned employees.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="p-2.5 rounded-lg bg-teal-50 text-teal-700 w-fit mb-3">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Assigned Workforce Roster</h3>
            <p className="text-xs text-slate-500 mt-1">
              Complete list of employees assigned to your hub including available balances and attendance.
            </p>
          </div>
          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">{employees.length} Personnel</span>
            <button
              onClick={() => triggerExport('EMPLOYEES')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold"
            >
              <Download className="w-3.5 h-3.5" /> Export Excel
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-700 w-fit mb-3">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Team Punch &amp; Attendance Logs</h3>
            <p className="text-xs text-slate-500 mt-1">
              Field punch timestamps, registered GPS locations, and geofence accuracy records.
            </p>
          </div>
          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">{punches.length} Logs</span>
            <button
              onClick={() => triggerExport('PUNCHES')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold"
            >
              <Download className="w-3.5 h-3.5" /> Export Excel
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="p-2.5 rounded-lg bg-amber-50 text-amber-700 w-fit mb-3">
              <DollarSign className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Claims &amp; Entry Submissions</h3>
            <p className="text-xs text-slate-500 mt-1">
              Audit report of all pending, approved, and rejected entries with bank accounts and RRN references.
            </p>
          </div>
          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">{entries.length} Claims</span>
            <button
              onClick={() => triggerExport('ENTRIES')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold"
            >
              <Download className="w-3.5 h-3.5" /> Export Excel
            </button>
          </div>
        </div>
      </div>

      <ExportModal
        isOpen={exportConfig.isOpen}
        onClose={() => setExportConfig((prev) => ({ ...prev, isOpen: false }))}
        title={exportConfig.title}
        filenamePrefix={exportConfig.filename}
        data={exportConfig.data}
        availableColumns={exportConfig.columns}
      />
    </div>
  );
};
