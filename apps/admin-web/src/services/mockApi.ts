import { mockHandlers } from '../mocks/mockHandlers';
import { SystemSettingsState } from '../mocks/mockDatabase';
import { Role, User } from '../types';

export const mockAuthApi = {
  login: (email: string, password: string) => mockHandlers.auth.login(email, password),
  logout: () => mockHandlers.auth.logout(),
  getCurrentUser: () => mockHandlers.auth.getCurrentUser(),
  updatePassword: (currentPassword: string, newPassword: string) =>
    mockHandlers.auth.updatePassword(currentPassword, newPassword),
};

export const mockSuperAdminApi = {
  getDashboard: () => mockHandlers.superAdmin.getDashboard(),
  getUsers: (params?: { role?: Role; status?: string; search?: string }) =>
    mockHandlers.superAdmin.getUsers(params),
  createUser: (userData: Partial<User> & { password?: string }) =>
    mockHandlers.superAdmin.createUser(userData),
  updateUser: (userId: string, updates: Partial<User>) =>
    mockHandlers.superAdmin.updateUser(userId, updates),
  toggleUserStatus: (userId: string, status: 'ACTIVE' | 'DEACTIVATED') =>
    mockHandlers.superAdmin.toggleUserStatus(userId, status),
  getSubAdmins: () => mockHandlers.superAdmin.getSubAdmins(),
  assignEmployee: (employeeId: string, subAdminId: string) =>
    mockHandlers.superAdmin.assignEmployee(employeeId, subAdminId),
  getAllEmployees: () => mockHandlers.superAdmin.getAllEmployees(),
  createEmployee: (data: any) => mockHandlers.superAdmin.createEmployee(data),
  getAttendance: (params?: { date?: string; employeeId?: string; discrepancyOnly?: boolean }) =>
    mockHandlers.superAdmin.getAttendance(params),
  getFinance: () => mockHandlers.superAdmin.getFinance(),
  getAuditLogs: (params?: { entityType?: string; actorRole?: string; search?: string }) =>
    mockHandlers.superAdmin.getAuditLogs(params),
  getAlerts: () => mockHandlers.superAdmin.getAlerts(),
  reviewAlert: (alertId: string) => mockHandlers.superAdmin.reviewAlert(alertId),
  getReports: (type?: string) => mockHandlers.superAdmin.getReports(type),
  getSettings: () => mockHandlers.superAdmin.getSettings(),
  updateSettings: (settings: SystemSettingsState) =>
    mockHandlers.superAdmin.updateSettings(settings),
};

export const mockSubAdminApi = {
  getDashboard: () => mockHandlers.subAdmin.getDashboard(),
  getEmployees: () => mockHandlers.subAdmin.getEmployees(),
  getEmployeeDetail: (id: string) => mockHandlers.subAdmin.getEmployeeDetail(id),
  getAttendance: (params?: { date?: string; employeeId?: string; discrepancyOnly?: boolean }) =>
    mockHandlers.subAdmin.getAttendance(params),
  getEntries: (status?: string) => mockHandlers.subAdmin.getEntries(status),
  approveEntry: (id: string, remarks?: string) => mockHandlers.subAdmin.approveEntry(id, remarks),
  rejectEntry: (id: string, reason: string, remarks?: string) =>
    mockHandlers.subAdmin.rejectEntry(id, reason, remarks),
  allocateFunds: (data: {
    employeeId: string;
    amount: number;
    reference?: string;
    remarks?: string;
  }) => mockHandlers.subAdmin.allocateFunds(data),
  getEmployeeFinance: (employeeId: string) =>
    mockHandlers.subAdmin.getEmployeeFinance(employeeId),
  getAlerts: () => mockHandlers.subAdmin.getAlerts(),
  reviewAlert: (id: string) => mockHandlers.subAdmin.reviewAlert(id),
  getEmployeeUpdates: () => mockHandlers.subAdmin.getEmployeeUpdates(),
  logUnmaskAudit: (employeeId: string, employeeName: string) =>
    mockHandlers.subAdmin.logUnmaskAudit(employeeId, employeeName),
  reviewEmployeeUpdate: (id: string, status: 'APPROVED' | 'DISMISSED') =>
    mockHandlers.subAdmin.reviewEmployeeUpdate(id, status),
};

export const mockEmployeeApi = {
  getMyProfile: () => mockHandlers.employee.getMyProfile(),
  getDashboard: () => mockHandlers.employee.getDashboard(),
  getAttendance: () => mockHandlers.employee.getAttendance(),
  punchAttendance: (punchType: 'CHECK_IN' | 'CHECK_OUT', notes?: string) =>
    mockHandlers.employee.punchAttendance(punchType, notes),
  getFinance: () => mockHandlers.employee.getFinance(),
  getEntries: () => mockHandlers.employee.getEntries(),
  submitEntry: (data: {
    websiteUrl: string;
    amount: number;
    withdrawalAmount: number;
    referenceId: string;
    remarks?: string;
  }) => mockHandlers.employee.submitEntry(data),
  updateProfile: (data: {
    phone?: string;
    bankName?: string;
    bankAccountNumber?: string;
    ifscCode?: string;
  }) => mockHandlers.employee.updateProfile(data),
};
