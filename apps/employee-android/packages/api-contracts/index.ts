export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    ME: '/auth/me'
  },
  EMPLOYEE: {
    DASHBOARD: '/employee/dashboard',
    PROFILE: '/employee/profile',
    ATTENDANCE_HISTORY: '/employee/attendance/history',
    CHECK_IN: '/employee/attendance/check-in',
    CHECK_OUT: '/employee/attendance/check-out',
    PRESIGN_UPLOAD: '/employee/uploads/presign',
    ENTRIES: '/employee/entries',
    ENTRY_BY_ID: (id: string) => `/employee/entries/${id}`,
    CANCEL_ENTRY: (id: string) => `/employee/entries/${id}/cancel`,
    FINANCE_BALANCE: '/employee/finance/balance',
    FINANCE_HISTORY: '/employee/finance/history'
  },
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    EMPLOYEES: '/admin/employees',
    ATTENDANCE: '/admin/attendance',
    ENTRIES: '/admin/entries',
    APPROVE_ENTRY: (id: string) => `/admin/entries/${id}/approve`,
    REJECT_ENTRY: (id: string) => `/admin/entries/${id}/reject`,
    ALLOCATIONS: '/admin/allocations',
    FINANCE: (empId: string) => `/admin/finance/${empId}`,
    REPORTS_EXPORT: '/admin/reports/export'
  },
  SUPER_ADMIN: {
    SUB_ADMINS: '/super-admin/sub-admins',
    EMPLOYEES: '/super-admin/employees',
    ASSIGNMENTS: '/super-admin/assignments'
  }
} as const;
