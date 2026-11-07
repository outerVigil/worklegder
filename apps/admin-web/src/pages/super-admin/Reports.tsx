import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Download,
  Users,
  CalendarCheck,
  BadgeDollarSign,
  FileCheck,
  CheckCircle2,
  Building,
} from 'lucide-react';
import { superAdminApi } from '../../services/api';
import { ExportModal } from '../../components/common/ExportModal';

export const Reports: React.FC = () => {
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Export Modal state
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
    const fetchReportData = async () => {
      setLoading(true);
      try {
        const data = await superAdminApi.getReports();
        setReportData(data.data);
      } catch (err) {
        console.error('Failed to load reports:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, []);

  const triggerExport = (reportType: string) => {
    if (!reportData) return;

    if (reportType === 'EMPLOYEE') {
      setExportConfig({
        isOpen: true,
        title: 'Master Employee Database Report',
        filename: 'Employee_Master_Report',
        data: reportData.employees || [],
        columns: [
          { key: 'employeeCode', label: 'Employee ID' },
          { key: 'name', label: 'Employee Name' },
          { key: 'email', label: 'Email' },
          { key: 'phone', label: 'Phone' },
          { key: 'status', label: 'Status' },
          { key: 'availableBalance', label: 'Available Balance (INR)' },
          { key: 'totalAllocated', label: 'Total Allocated (INR)' },
          { key: 'totalApprovedWithdrawals', label: 'Approved Withdrawals (INR)' },
          { key: 'attendanceToday', label: 'Today Attendance' },
        ],
      });
    } else if (reportType === 'ATTENDANCE') {
      setExportConfig({
        isOpen: true,
        title: 'Workforce Attendance & Telemetry Report',
        filename: 'Workforce_Attendance_Report',
        data: reportData.attendance || [],
        columns: [
          { key: 'employeeName', label: 'Employee Name' },
          { key: 'punchType', label: 'Punch Type' },
          { key: 'date', label: 'Date' },
          { key: 'time', label: 'Time' },
          { key: 'address', label: 'Address' },
          { key: 'latitude', label: 'Latitude' },
          { key: 'longitude', label: 'Longitude' },
          { key: 'isLocationDiscrepancy', label: 'Geofence Discrepancy' },
        ],
      });
    } else if (reportType === 'FINANCIAL_ALLOCATION') {
      const allocations = (reportData.ledger || []).filter((l: any) => l.type === 'ALLOCATION');
      setExportConfig({
        isOpen: true,
        title: 'Financial Working Float Allocation Report',
        filename: 'Financial_Allocation_Report',
        data: allocations,
        columns: [
          { key: 'createdAt', label: 'Date & Time' },
          { key: 'employeeName', label: 'Employee Name' },
          { key: 'amount', label: 'Allocated Amount (INR)' },
          { key: 'balanceAfter', label: 'Balance After Allocation' },
          { key: 'reference', label: 'Allocation Reference' },
          { key: 'createdByName', label: 'Authorized Sub-Admin' },
          { key: 'notes', label: 'Allocation Purpose' },
        ],
      });
    } else if (reportType === 'WITHDRAWAL') {
      const withdrawals = (reportData.ledger || []).filter((l: any) => l.type === 'WITHDRAWAL_APPROVAL');
      setExportConfig({
        isOpen: true,
        title: 'Settled Withdrawal Disbursements Report',
        filename: 'Withdrawal_Disbursements_Report',
        data: withdrawals,
        columns: [
          { key: 'createdAt', label: 'Settlement Date' },
          { key: 'employeeName', label: 'Beneficiary Employee' },
          { key: 'amount', label: 'Disbursed Amount (INR)' },
          { key: 'reference', label: 'Settlement Voucher' },
          { key: 'createdByName', label: 'Approving Supervisor' },
          { key: 'notes', label: 'Ledger Audit Notes' },
        ],
      });
    } else if (reportType === 'ENTRIES') {
      setExportConfig({
        isOpen: true,
        title: 'Task Entry Submissions & Claims Report',
        filename: 'Entry_Submissions_Report',
        data: reportData.entries || [],
        columns: [
          { key: 'referenceId', label: 'UPI Reference ID' },
          { key: 'employeeName', label: 'Employee Name' },
          { key: 'amount', label: 'Gross Amount' },
          { key: 'withdrawalAmount', label: 'Withdrawal Claim (INR)' },
          { key: 'bankAccountNumber', label: 'Target Account' },
          { key: 'bankName', label: 'Bank Name' },
          { key: 'status', label: 'Submission Status' },
          { key: 'submittedAt', label: 'Submitted Date' },
          { key: 'reviewedByName', label: 'Reviewed By' },
        ],
      });
    } else if (reportType === 'SUB_ADMIN') {
      setExportConfig({
        isOpen: true,
        title: 'Sub-Admin Hub Activity & Allocation Report',
        filename: 'SubAdmin_Performance_Report',
        data: reportData.ledger || [],
        columns: [
          { key: 'createdByName', label: 'Sub-Admin Name' },
          { key: 'type', label: 'Operation' },
          { key: 'employeeName', label: 'Target Employee' },
          { key: 'amount', label: 'Amount' },
          { key: 'createdAt', label: 'Timestamp' },
        ],
      });
    }
  };

  const reportCards = [
    {
      type: 'EMPLOYEE',
      title: 'Employee Master Report',
      description: 'Comprehensive roster containing bank accounts, supervisors, current balances, and status.',
      icon: Users,
      badge: `${reportData?.employees?.length || 0} Records`,
      color: 'teal',
    },
    {
      type: 'ATTENDANCE',
      title: 'Attendance & GPS Telemetry Report',
      description: 'Full punch times, GPS coordinates, geofence discrepancy violations, and daily presence.',
      icon: CalendarCheck,
      badge: `${reportData?.attendance?.length || 0} Records`,
      color: 'emerald',
    },
    {
      type: 'FINANCIAL_ALLOCATION',
      title: 'Financial Allocation Report',
      description: 'Audit of all working float injections approved by regional sub-admins into employee balances.',
      icon: BadgeDollarSign,
      badge: `${(reportData?.ledger || []).filter((l: any) => l.type === 'ALLOCATION').length} Records`,
      color: 'indigo',
    },
    {
      type: 'WITHDRAWAL',
      title: 'Withdrawal Settlement Report',
      description: 'Approved claims, payment receipt vouchers, and disbursement ledger history.',
      icon: FileCheck,
      badge: `${(reportData?.ledger || []).filter((l: any) => l.type === 'WITHDRAWAL_APPROVAL').length} Records`,
      color: 'blue',
    },
    {
      type: 'ENTRIES',
      title: 'Entry Submissions & Claims Report',
      description: 'Full audit of all employee submissions across Pending, Approved, and Rejected states.',
      icon: CheckCircle2,
      badge: `${reportData?.entries?.length || 0} Records`,
      color: 'amber',
    },
    {
      type: 'SUB_ADMIN',
      title: 'Sub-Admin Operational Activity Report',
      description: 'Hub-level supervisory metrics, worker assignments, and approval activity summaries.',
      icon: Building,
      badge: 'Hub Summary',
      color: 'slate',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Reports &amp; Data Exports</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Generate compliant Excel (.xlsx) and CSV spreadsheets for audit committees, payroll, and regional hub review.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {reportCards.map((rc) => {
          const Icon = rc.icon;
          return (
            <div
              key={rc.type}
              className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-teal-700">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {rc.badge}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm mt-3.5">{rc.title}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{rc.description}</p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Format: .XLSX &amp; .CSV</span>
                <button
                  onClick={() => triggerExport(rc.type)}
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#880E23] hover:bg-[#6B081A] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export Report
                </button>
              </div>
            </div>
          );
        })}
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
