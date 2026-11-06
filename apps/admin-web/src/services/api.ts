import axios, { AxiosError } from 'axios';
import {
  User,
  EmployeeProfile,
  AttendancePunch,
  EntrySubmission,
  SystemAlert,
  AuditLog,
  SubAdminEnriched,
  Role,
} from '../types';
import {
  mockAuthApi,
  mockSuperAdminApi,
  mockSubAdminApi,
  mockEmployeeApi,
} from './mockApi';
import { SystemSettingsState } from '../mocks/mockDatabase';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';
export const IS_MOCK_DATA_MODE = (import.meta.env.VITE_DATA_MODE || 'mock') !== 'api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Bearer Token when present
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: 401 handling for real API mode
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (IS_MOCK_DATA_MODE) {
      return Promise.reject(error);
    }
    const originalRequest = error.config;
    if (error.response?.status === 401 && originalRequest && !(originalRequest as any)._retry) {
      (originalRequest as any)._retry = true;
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    }
    return Promise.reject(error);
  }
);

// ==========================================
// API SERVICE METHODS (Mock / Real API Switch)
// ==========================================

export const authApi = {
  login: async (email: string, password: string) => {
    if (IS_MOCK_DATA_MODE) return mockAuthApi.login(email, password);
    const res = await apiClient.post('/auth/login', { email, password });
    return res.data;
  },
  logout: async () => {
    try {
      if (IS_MOCK_DATA_MODE) {
        await mockAuthApi.logout();
      } else {
        await apiClient.post('/auth/logout');
      }
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('auth_user');
    }
  },
  getCurrentUser: async () => {
    if (IS_MOCK_DATA_MODE) return mockAuthApi.getCurrentUser();
    const res = await apiClient.get<User>('/auth/me');
    return res.data;
  },
  updatePassword: async (currentPassword: string, newPassword: string) => {
    if (IS_MOCK_DATA_MODE) return mockAuthApi.updatePassword(currentPassword, newPassword);
    const res = await apiClient.post('/auth/password', { currentPassword, newPassword });
    return res.data;
  },
};

export const superAdminApi = {
  getDashboard: async () => {
    if (IS_MOCK_DATA_MODE) return mockSuperAdminApi.getDashboard();
    const res = await apiClient.get('/super-admin/dashboard');
    return res.data;
  },
  getUsers: async (params?: { role?: Role; status?: string; search?: string }) => {
    if (IS_MOCK_DATA_MODE) return mockSuperAdminApi.getUsers(params);
    const res = await apiClient.get<{ users: User[] }>('/super-admin/users', { params });
    return res.data.users;
  },
  createUser: async (userData: Partial<User> & { password?: string }) => {
    if (IS_MOCK_DATA_MODE) return mockSuperAdminApi.createUser(userData);
    const res = await apiClient.post<{ user: User }>('/super-admin/users', userData);
    return res.data.user;
  },
  updateUser: async (userId: string, updates: Partial<User>) => {
    if (IS_MOCK_DATA_MODE) return mockSuperAdminApi.updateUser(userId, updates);
    const res = await apiClient.patch<{ user: User }>(`/super-admin/users/${userId}`, updates);
    return res.data.user;
  },
  toggleUserStatus: async (userId: string, status: 'ACTIVE' | 'DEACTIVATED') => {
    if (IS_MOCK_DATA_MODE) return mockSuperAdminApi.toggleUserStatus(userId, status);
    const res = await apiClient.patch<{ user: User }>(`/super-admin/users/${userId}/status`, { status });
    return res.data.user;
  },
  getSubAdmins: async () => {
    if (IS_MOCK_DATA_MODE) return mockSuperAdminApi.getSubAdmins();
    const res = await apiClient.get<{ subAdmins: SubAdminEnriched[] }>('/super-admin/sub-admins');
    return res.data.subAdmins;
  },
  assignEmployee: async (employeeId: string, subAdminId: string) => {
    if (IS_MOCK_DATA_MODE) return mockSuperAdminApi.assignEmployee(employeeId, subAdminId);
    const res = await apiClient.post('/super-admin/assignments', { employeeId, subAdminId });
    return res.data;
  },
  getAllEmployees: async () => {
    if (IS_MOCK_DATA_MODE) return mockSuperAdminApi.getAllEmployees();
    const res = await apiClient.get<{ employees: EmployeeProfile[] }>('/super-admin/employees');
    return res.data.employees;
  },
  createEmployee: async (data: any) => {
    if (IS_MOCK_DATA_MODE) return mockSuperAdminApi.createEmployee(data);
    const res = await apiClient.post<{ employee: EmployeeProfile }>('/super-admin/employees', data);
    return res.data.employee;
  },
  getAttendance: async (params?: { date?: string; employeeId?: string; discrepancyOnly?: boolean }) => {
    if (IS_MOCK_DATA_MODE) return mockSuperAdminApi.getAttendance(params);
    const res = await apiClient.get<{ attendance: AttendancePunch[] }>('/super-admin/attendance', { params });
    return res.data.attendance;
  },
  getFinance: async () => {
    if (IS_MOCK_DATA_MODE) return mockSuperAdminApi.getFinance();
    const res = await apiClient.get('/super-admin/finance');
    return res.data;
  },
  getAuditLogs: async (params?: { entityType?: string; actorRole?: string; search?: string }) => {
    if (IS_MOCK_DATA_MODE) return mockSuperAdminApi.getAuditLogs(params);
    const res = await apiClient.get<{ auditLogs: AuditLog[] }>('/super-admin/audit-logs', { params });
    return res.data.auditLogs;
  },
  getAlerts: async () => {
    if (IS_MOCK_DATA_MODE) return mockSuperAdminApi.getAlerts();
    const res = await apiClient.get<{ alerts: SystemAlert[] }>('/super-admin/alerts');
    return res.data.alerts;
  },
  reviewAlert: async (alertId: string) => {
    if (IS_MOCK_DATA_MODE) return mockSuperAdminApi.reviewAlert(alertId);
    const res = await apiClient.patch(`/super-admin/alerts/${alertId}/review`);
    return res.data.alert;
  },
  getReports: async (type?: string) => {
    if (IS_MOCK_DATA_MODE) return mockSuperAdminApi.getReports(type);
    const res = await apiClient.get('/super-admin/reports', { params: { type } });
    return res.data;
  },
  getSettings: async (): Promise<SystemSettingsState> => {
    if (IS_MOCK_DATA_MODE) return mockSuperAdminApi.getSettings();
    const res = await apiClient.get('/super-admin/settings');
    return res.data;
  },
  updateSettings: async (settings: SystemSettingsState): Promise<SystemSettingsState> => {
    if (IS_MOCK_DATA_MODE) return mockSuperAdminApi.updateSettings(settings);
    const res = await apiClient.put('/super-admin/settings', settings);
    return res.data;
  },
};

export const subAdminApi = {
  getDashboard: async () => {
    if (IS_MOCK_DATA_MODE) return mockSubAdminApi.getDashboard();
    const res = await apiClient.get('/admin/dashboard');
    return res.data;
  },
  getEmployees: async () => {
    if (IS_MOCK_DATA_MODE) return mockSubAdminApi.getEmployees();
    const res = await apiClient.get<{ employees: EmployeeProfile[] }>('/admin/employees');
    return res.data.employees;
  },
  getEmployeeDetail: async (id: string) => {
    if (IS_MOCK_DATA_MODE) return mockSubAdminApi.getEmployeeDetail(id);
    const res = await apiClient.get(`/admin/employees/${id}`);
    return res.data;
  },
  getAttendance: async (params?: { date?: string; employeeId?: string; discrepancyOnly?: boolean }) => {
    if (IS_MOCK_DATA_MODE) return mockSubAdminApi.getAttendance(params);
    const res = await apiClient.get<{ attendance: AttendancePunch[] }>('/admin/attendance', { params });
    return res.data.attendance;
  },
  getEntries: async (status?: string) => {
    if (IS_MOCK_DATA_MODE) return mockSubAdminApi.getEntries(status);
    const res = await apiClient.get<{ entries: EntrySubmission[] }>('/admin/entries', { params: { status } });
    return res.data.entries;
  },
  approveEntry: async (id: string, remarks?: string) => {
    if (IS_MOCK_DATA_MODE) return mockSubAdminApi.approveEntry(id, remarks);
    const res = await apiClient.post(`/admin/entries/${id}/approve`, { remarks });
    return res.data;
  },
  rejectEntry: async (id: string, reason: string, remarks?: string) => {
    if (IS_MOCK_DATA_MODE) return mockSubAdminApi.rejectEntry(id, reason, remarks);
    const res = await apiClient.post(`/admin/entries/${id}/reject`, { reason, remarks });
    return res.data;
  },
  allocateFunds: async (data: { employeeId: string; amount: number; reference?: string; remarks?: string }) => {
    if (IS_MOCK_DATA_MODE) return mockSubAdminApi.allocateFunds(data);
    const res = await apiClient.post('/admin/allocations', data);
    return res.data;
  },
  getEmployeeFinance: async (employeeId: string) => {
    if (IS_MOCK_DATA_MODE) return mockSubAdminApi.getEmployeeFinance(employeeId);
    const res = await apiClient.get(`/admin/finance/${employeeId}`);
    return res.data;
  },
  getAlerts: async () => {
    if (IS_MOCK_DATA_MODE) return mockSubAdminApi.getAlerts();
    const res = await apiClient.get<{ alerts: SystemAlert[] }>('/admin/alerts');
    return res.data.alerts;
  },
  reviewAlert: async (id: string) => {
    if (IS_MOCK_DATA_MODE) return mockSubAdminApi.reviewAlert(id);
    const res = await apiClient.post(`/admin/alerts/${id}/review`);
    return res.data;
  },
  getEmployeeUpdates: async () => {
    if (IS_MOCK_DATA_MODE) return mockSubAdminApi.getEmployeeUpdates();
    const res = await apiClient.get('/admin/employee-updates');
    return res.data.updates;
  },
  logUnmaskAudit: async (employeeId: string, employeeName: string) => {
    if (IS_MOCK_DATA_MODE) return mockSubAdminApi.logUnmaskAudit(employeeId, employeeName);
    const res = await apiClient.post('/admin/audit/unmask-bank-details', { employeeId, employeeName });
    return res.data;
  },
  reviewEmployeeUpdate: async (id: string, status: 'APPROVED' | 'DISMISSED') => {
    if (IS_MOCK_DATA_MODE) return mockSubAdminApi.reviewEmployeeUpdate(id, status);
    const res = await apiClient.post(`/admin/employee-updates/${id}/review`, { status });
    return res.data;
  },
};

export const employeeApi = {
  getMyProfile: async () => {
    if (IS_MOCK_DATA_MODE) return mockEmployeeApi.getMyProfile();
    const res = await apiClient.get<EmployeeProfile>('/employee/profile');
    return res.data;
  },
  getDashboard: async () => {
    if (IS_MOCK_DATA_MODE) return mockEmployeeApi.getDashboard();
    const res = await apiClient.get('/employee/dashboard');
    return res.data;
  },
  getAttendance: async () => {
    if (IS_MOCK_DATA_MODE) return mockEmployeeApi.getAttendance();
    const res = await apiClient.get<{ attendance: AttendancePunch[] }>('/employee/attendance');
    return res.data.attendance;
  },
  punchAttendance: async (punchType: 'CHECK_IN' | 'CHECK_OUT', notes?: string) => {
    if (IS_MOCK_DATA_MODE) return mockEmployeeApi.punchAttendance(punchType, notes);
    const res = await apiClient.post('/employee/attendance/punch', { punchType, notes });
    return res.data;
  },
  getFinance: async () => {
    if (IS_MOCK_DATA_MODE) return mockEmployeeApi.getFinance();
    const res = await apiClient.get('/employee/finance');
    return res.data;
  },
  getEntries: async () => {
    if (IS_MOCK_DATA_MODE) return mockEmployeeApi.getEntries();
    const res = await apiClient.get<{ entries: EntrySubmission[] }>('/employee/entries');
    return res.data.entries;
  },
  submitEntry: async (data: {
    websiteUrl: string;
    amount: number;
    withdrawalAmount: number;
    referenceId: string;
    remarks?: string;
  }) => {
    if (IS_MOCK_DATA_MODE) return mockEmployeeApi.submitEntry(data);
    const res = await apiClient.post<EntrySubmission>('/employee/entries', data);
    return res.data;
  },
  updateProfile: async (data: {
    phone?: string;
    bankName?: string;
    bankAccountNumber?: string;
    ifscCode?: string;
  }) => {
    if (IS_MOCK_DATA_MODE) return mockEmployeeApi.updateProfile(data);
    const res = await apiClient.patch<EmployeeProfile>('/employee/profile', data);
    return res.data;
  },
};
