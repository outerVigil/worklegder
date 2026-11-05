export type RoleType = 'SUPER_ADMIN' | 'SUB_ADMIN' | 'EMPLOYEE';

export type AttendanceStatus = 'ACTIVE' | 'COMPLETED' | 'DISCREPANCY_FLAGGED';

export type EntryStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export type TransactionType =
  | 'ALLOCATION_CREDIT'
  | 'WITHDRAWAL_APPROVED'
  | 'PENDING_RESERVATION'
  | 'RESERVATION_RELEASED'
  | 'ADJUSTMENT';

export interface UserDTO {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  role: RoleType;
  phone?: string;
  assignedSubAdmin?: string;
  status: string;
}

export interface AttendanceDTO {
  id: string;
  employeeId: string;
  checkInTime: string;
  checkInLatitude: number;
  checkInLongitude: number;
  checkInAccuracy: number;
  checkOutTime?: string;
  checkOutLatitude?: number;
  checkOutLongitude?: number;
  checkOutAccuracy?: number;
  durationMinutes: number;
  status: AttendanceStatus;
}

export interface DailyWorkEntryDTO {
  id: string;
  employeeId: string;
  websiteUrl: string;
  bankAccountNumberMasked: string;
  referenceId: string;
  amount: number;
  withdrawalAmount: number;
  screenshotUrl: string;
  status: EntryStatus;
  adminRemarks?: string;
  rejectionReason?: string;
  createdAt: string;
}

export interface FinancialSummaryDTO {
  totalAllocated: number;
  approvedWithdrawals: number;
  pendingWithdrawals: number;
  availableBalance: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}
