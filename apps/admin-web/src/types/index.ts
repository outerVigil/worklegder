export type Role = 'SUPER_ADMIN' | 'SUB_ADMIN' | 'EMPLOYEE';
export type UserStatus = 'ACTIVE' | 'DEACTIVATED';
export type EntryStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type PunchType = 'CHECK_IN' | 'CHECK_OUT';
export type AttendanceToday = 'PRESENT' | 'ABSENT' | 'CHECKED_IN' | 'MISSING_CHECKOUT';
export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type AlertType = 'IDLE_ACTIVITY' | 'LOCATION_DISCREPANCY' | 'MISSING_CHECKOUT' | 'MISSING_ENTRY' | 'FINANCIAL_VALIDATION';

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: Role;
  status: UserStatus;
  subAdminId?: string;
  region?: string;
  createdAt: string;
}

export interface EmployeeProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  employeeCode: string;
  subAdminId: string;
  subAdminName?: string;
  subAdminRegion?: string;
  status: UserStatus;
  availableBalance: number;
  totalAllocated: number;
  totalApprovedWithdrawals: number;
  pendingWithdrawalsCount: number;
  bankName: string;
  bankAccountNumber: string;
  ifscCode: string;
  assignedLocation: {
    name: string;
    latitude: number;
    longitude: number;
    allowedRadiusMeters: number;
  };
  attendanceToday: AttendanceToday;
  lastPunch?: string;
  createdAt: string;
}

export interface AttendancePunch {
  id: string;
  employeeId: string;
  employeeName: string;
  subAdminId: string;
  punchType: PunchType;
  timestamp: string;
  date: string;
  time: string;
  latitude: number;
  longitude: number;
  address: string;
  isLocationDiscrepancy: boolean;
  accuracyMeters: number;
  workDurationMinutes?: number;
  notes?: string;
}

export interface EntrySubmission {
  id: string;
  employeeId: string;
  employeeName: string;
  subAdminId: string;
  websiteUrl: string;
  bankAccountNumber: string;
  bankName: string;
  ifscCode: string;
  referenceId: string;
  amount: number;
  withdrawalAmount: number;
  screenshotUrl: string;
  status: EntryStatus;
  rejectionReason?: string;
  remarks?: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewedByName?: string;
}

export interface FinancialLedger {
  id: string;
  employeeId: string;
  employeeName: string;
  subAdminId: string;
  type: 'ALLOCATION' | 'WITHDRAWAL_APPROVAL' | 'REVERSAL';
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  reference: string;
  notes?: string;
  createdAt: string;
  createdBy: string;
  createdByName: string;
}

export interface EmployeeUpdateLog {
  id: string;
  employeeId: string;
  employeeName: string;
  subAdminId: string;
  fieldName: string;
  oldValue: string;
  newValue: string;
  updatedBy: string;
  updatedByName: string;
  updatedAt: string;
  isMasked: boolean;
  reviewStatus: 'PENDING' | 'APPROVED' | 'DISMISSED';
}

export interface SystemAlert {
  id: string;
  employeeId?: string;
  employeeName?: string;
  subAdminId?: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  description: string;
  timestamp: string;
  reviewed: boolean;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: Role;
  action: string;
  entityType: 'USER' | 'ENTRY' | 'ALLOCATION' | 'ATTENDANCE' | 'ALERT' | 'ASSIGNMENT';
  entityId: string;
  previousValue?: string;
  newValue?: string;
  timestamp: string;
  ipAddress: string;
}

export interface SubAdminEnriched extends User {
  assignedCount: number;
  assignedEmployees: Array<{
    id: string;
    name: string;
    code: string;
    balance: number;
    status: UserStatus;
  }>;
  totalAllocated: number;
  totalApprovedWithdrawals: number;
  pendingRequests: number;
}
