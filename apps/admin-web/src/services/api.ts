import axios, { AxiosError } from 'axios';
import {
  User,
  EmployeeProfile,
  AttendancePunch,
  EntrySubmission,
  FinancialLedger,
  SystemAlert,
  AuditLog,
  SubAdminEnriched,
  Role,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Bearer Token
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

// Response Interceptor: 401 handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      const originalRequest = error.config;
      const refreshToken = localStorage.getItem('refresh_token');

      // Attempt refresh if not already retrying
      if (refreshToken && originalRequest && !(originalRequest as any)._retry) {
        (originalRequest as any)._retry = true;
        try {
          const res = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
          if (res.data.accessToken) {
            localStorage.setItem('auth_token', res.data.accessToken);
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;
            }
            return apiClient(originalRequest);
          }
        } catch (refreshErr) {
          // Token refresh failed, clear session
          localStorage.removeItem('auth_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('auth_user');
          window.location.href = '/login';
        }
      } else {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('auth_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ==========================================
// API SERVICE METHODS
// ==========================================

export const authApi = {
  login: async (email: string, password: string) => {
    const res = await apiClient.post('/auth/login', { email, password });
    return res.data;
  },
  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('auth_user');
    }
  },
  getCurrentUser: async () => {
    const res = await apiClient.get<User>('/auth/me');
    return res.data;
  },
};

export const superAdminApi = {
  getDashboard: async () => {
    const res = await apiClient.get('/super-admin/dashboard');
    return res.data;
  },
  getUsers: async (params?: { role?: Role; status?: string; search?: string }) => {
    const res = await apiClient.get<{ users: User[] }>('/super-admin/users', { params });
    return res.data.users;
  },
  createUser: async (userData: Partial<User> & { password?: string }) => {
    const res = await apiClient.post<{ user: User }>('/super-admin/users', userData);
    return res.data.user;
  },
  toggleUserStatus: async (userId: string, status: 'ACTIVE' | 'DEACTIVATED') => {
    const res = await apiClient.patch<{ user: User }>(`/super-admin/users/${userId}/status`, { status });
    return res.data.user;
  },
  getSubAdmins: async () => {
    const res = await apiClient.get<{ subAdmins: SubAdminEnriched[] }>('/super-admin/sub-admins');
    return res.data.subAdmins;
  },
  assignEmployee: async (employeeId: string, subAdminId: string) => {
    const res = await apiClient.post('/super-admin/assignments', { employeeId, subAdminId });
    return res.data;
  },
  getAllEmployees: async () => {
    const res = await apiClient.get<{ employees: EmployeeProfile[] }>('/super-admin/employees');
    return res.data.employees;
  },
  createEmployee: async (data: any) => {
    const res = await apiClient.post<{ employee: EmployeeProfile }>('/super-admin/employees', data);
    return res.data.employee;
  },
  getAttendance: async (params?: { date?: string; employeeId?: string; discrepancyOnly?: boolean }) => {
    const res = await apiClient.get<{ attendance: AttendancePunch[] }>('/super-admin/attendance', { params });
    return res.data.attendance;
  },
  getFinance: async () => {
    const res = await apiClient.get('/super-admin/finance');
    return res.data;
  },
  getAuditLogs: async (params?: { entityType?: string; actorRole?: string; search?: string }) => {
    const res = await apiClient.get<{ auditLogs: AuditLog[] }>('/super-admin/audit-logs', { params });
    return res.data.auditLogs;
  },
  getAlerts: async () => {
    const res = await apiClient.get<{ alerts: SystemAlert[] }>('/super-admin/alerts');
    return res.data.alerts;
  },
  reviewAlert: async (alertId: string) => {
    const res = await apiClient.patch(`/super-admin/alerts/${alertId}/review`);
    return res.data.alert;
  },
  getReports: async (type?: string) => {
    const res = await apiClient.get('/super-admin/reports', { params: { type } });
    return res.data;
  },
};

export const subAdminApi = {
  getDashboard: async () => {
    const res = await apiClient.get('/admin/dashboard');
    return res.data;
  },
  getEmployees: async () => {
    const res = await apiClient.get<{ employees: EmployeeProfile[] }>('/admin/employees');
    return res.data.employees;
  },
  getEmployeeDetail: async (id: string) => {
    const res = await apiClient.get(`/admin/employees/${id}`);
    return res.data;
  },
  getAttendance: async (params?: { date?: string; employeeId?: string; discrepancyOnly?: boolean }) => {
    const res = await apiClient.get<{ attendance: AttendancePunch[] }>('/admin/attendance', { params });
    return res.data.attendance;
  },
  getEntries: async (status?: string) => {
    const res = await apiClient.get<{ entries: EntrySubmission[] }>('/admin/entries', { params: { status } });
    return res.data.entries;
  },
  approveEntry: async (id: string, remarks?: string) => {
    const res = await apiClient.post(`/admin/entries/${id}/approve`, { remarks });
    return res.data;
  },
  rejectEntry: async (id: string, reason: string, remarks?: string) => {
    const res = await apiClient.post(`/admin/entries/${id}/reject`, { reason, remarks });
    return res.data;
  },
  allocateFunds: async (data: { employeeId: string; amount: number; reference?: string; remarks?: string }) => {
    const res = await apiClient.post('/admin/allocations', data);
    return res.data;
  },
  getEmployeeFinance: async (employeeId: string) => {
    const res = await apiClient.get(`/admin/finance/${employeeId}`);
    return res.data;
  },
  getAlerts: async () => {
    const res = await apiClient.get<{ alerts: SystemAlert[] }>('/admin/alerts');
    return res.data.alerts;
  },
  reviewAlert: async (id: string) => {
    const res = await apiClient.post(`/admin/alerts/${id}/review`);
    return res.data;
  },
  getEmployeeUpdates: async () => {
    const res = await apiClient.get('/admin/employee-updates');
    return res.data.updates;
  },
  logUnmaskAudit: async (employeeId: string, employeeName: string) => {
    const res = await apiClient.post('/admin/audit/unmask-bank-details', { employeeId, employeeName });
    return res.data;
  },
  reviewEmployeeUpdate: async (id: string, status: 'APPROVED' | 'DISMISSED') => {
    const res = await apiClient.post(`/admin/employee-updates/${id}/review`, { status });
    return res.data;
  },
};
