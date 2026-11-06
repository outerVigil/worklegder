import {
  User,
  Role,
  EmployeeProfile,
  AttendancePunch,
  EntrySubmission,
  FinancialLedger,
  SystemAlert,
  AuditLog,
  SubAdminEnriched,
} from '../types';
import {
  getMockDb,
  saveMockDb,
  getActiveMockUser,
  SystemSettingsState,
} from './mockDatabase';
import { generateReceiptSvg } from './data/entries';

const SIMULATED_DELAY_MS = 120;

function delay(ms: number = SIMULATED_DELAY_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function createApiError(status: number, error: string, message: string) {
  const err: any = new Error(message);
  err.response = {
    status,
    data: { error, message },
  };
  return err;
}

function requireSessionUser() {
  const user = getActiveMockUser();
  if (!user) {
    throw createApiError(401, 'UNAUTHORIZED', 'Authentication required');
  }
  if (user.status === 'DEACTIVATED') {
    throw createApiError(403, 'ACCOUNT_DEACTIVATED', 'Your account has been deactivated.');
  }
  return user;
}

function requireSuperAdminUser() {
  const user = requireSessionUser();
  if (user.role !== 'SUPER_ADMIN') {
    throw createApiError(403, 'FORBIDDEN', 'Super Admin access required.');
  }
  return user;
}

function requireAdminUser() {
  const user = requireSessionUser();
  if (user.role !== 'SUPER_ADMIN' && user.role !== 'SUB_ADMIN') {
    throw createApiError(403, 'FORBIDDEN', 'Administrator access required. Employees cannot access admin data.');
  }
  return user;
}

function sanitizeUser(u: any): User {
  const { password: _p, employeeProfileId: _e, ...rest } = u;
  return rest;
}

export const mockHandlers = {
  // ==========================================
  // AUTHENTICATION HANDLERS
  // ==========================================
  auth: {
    login: async (email: string, password: string) => {
      await delay();
      if (!email || !password) {
        throw createApiError(400, 'BAD_REQUEST', 'Email and password are required.');
      }

      const db = getMockDb();
      const user = db.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());

      if (!user || user.password !== password) {
        throw createApiError(401, 'INVALID_CREDENTIALS', 'Invalid email or password.');
      }

      if (user.status === 'DEACTIVATED') {
        throw createApiError(
          403,
          'ACCOUNT_DEACTIVATED',
          'Your account has been deactivated. Please contact the Super Admin.'
        );
      }

      const accessToken = `demo_session_${user.id}_${user.role}_${Date.now()}`;
      const refreshToken = `demo_refresh_${user.id}_${Date.now()}`;

      db.auditLogs.unshift({
        id: `aud_${Date.now()}`,
        actorId: user.id,
        actorName: user.name,
        actorRole: user.role,
        action: `${user.role}_LOGIN`,
        entityType: 'USER',
        entityId: user.id,
        timestamp: new Date().toISOString(),
        ipAddress: '127.0.0.1',
      });
      saveMockDb(db);

      return {
        accessToken,
        refreshToken,
        user: sanitizeUser(user),
      };
    },

    logout: async () => {
      await delay(60);
      return { success: true, message: 'Logged out successfully' };
    },

    getCurrentUser: async (): Promise<User> => {
      await delay(60);
      const user = requireSessionUser();
      return sanitizeUser(user);
    },

    updatePassword: async (currentPassword: string, newPassword: string) => {
      await delay();
      const user = requireSessionUser();
      const db = getMockDb();
      const target = db.users.find((u) => u.id === user.id);
      if (!target) {
        throw createApiError(404, 'NOT_FOUND', 'User not found');
      }
      if (target.password !== currentPassword) {
        throw createApiError(400, 'INVALID_PASSWORD', 'Current password is incorrect.');
      }
      target.password = newPassword;
      saveMockDb(db);
      return { success: true };
    },
  },

  // ==========================================
  // SUPER ADMIN HANDLERS
  // ==========================================
  superAdmin: {
    getDashboard: async () => {
      await delay();
      requireSuperAdminUser();
      const db = getMockDb();

      const totalEmployees = db.employees.length;
      const totalSubAdmins = db.users.filter((u) => u.role === 'SUB_ADMIN').length;
      const presentToday = db.employees.filter(
        (e) => e.attendanceToday === 'PRESENT' || e.attendanceToday === 'CHECKED_IN'
      ).length;
      const absentToday = db.employees.filter((e) => e.attendanceToday === 'ABSENT').length;
      const checkedInNow = db.employees.filter((e) => e.attendanceToday === 'CHECKED_IN').length;
      const missingCheckout = db.employees.filter((e) => e.attendanceToday === 'MISSING_CHECKOUT').length;

      const pendingEntries = db.entries.filter((e) => e.status === 'PENDING').length;
      const approvedEntries = db.entries.filter((e) => e.status === 'APPROVED').length;

      const totalAllocated = db.ledger
        .filter((l) => l.type === 'ALLOCATION')
        .reduce((sum, l) => sum + l.amount, 0);

      const totalApprovedWithdrawals = db.ledger
        .filter((l) => l.type === 'WITHDRAWAL_APPROVAL')
        .reduce((sum, l) => sum + l.amount, 0);

      const pendingWithdrawalsAmount = db.entries
        .filter((e) => e.status === 'PENDING')
        .reduce((sum, e) => sum + e.withdrawalAmount, 0);

      const remainingAllocation = totalAllocated - totalApprovedWithdrawals;
      const activeAlerts = db.alerts.filter((a) => !a.reviewed).length;

      const attendanceTrends = [
        { day: 'Mon', present: 10, absent: 1, missing: 0 },
        { day: 'Tue', present: 11, absent: 0, missing: 0 },
        { day: 'Wed', present: 9, absent: 2, missing: 1 },
        { day: 'Thu', present: 11, absent: 0, missing: 0 },
        { day: 'Fri', present: 10, absent: 1, missing: 1 },
        { day: 'Sat', present: 8, absent: 3, missing: 0 },
        { day: 'Today', present: presentToday, absent: absentToday, missing: missingCheckout },
      ];

      const financialFlowTrends = [
        { month: 'Jun', allocated: 120000, withdrawals: 95000 },
        { month: 'Jul', allocated: 140000, withdrawals: 110000 },
        { month: 'Aug', allocated: 155000, withdrawals: 128000 },
        { month: 'Sep', allocated: 170000, withdrawals: 142000 },
        { month: 'Oct', allocated: 185000, withdrawals: 151000 },
        { month: 'Nov (Current)', allocated: totalAllocated, withdrawals: totalApprovedWithdrawals },
      ];

      return {
        metrics: {
          totalEmployees,
          totalSubAdmins,
          presentToday,
          absentToday,
          checkedInNow,
          missingCheckout,
          pendingEntries,
          approvedEntries,
          totalAllocated,
          totalApprovedWithdrawals,
          pendingWithdrawalsAmount,
          remainingAllocation,
          activeAlerts,
        },
        attendanceTrends,
        financialFlowTrends,
        recentPunches: db.punches.slice(0, 5),
        recentAudit: db.auditLogs.slice(0, 5),
      };
    },

    getUsers: async (params?: { role?: Role; status?: string; search?: string }): Promise<User[]> => {
      await delay();
      requireSuperAdminUser();
      const db = getMockDb();
      let result = db.users.map(sanitizeUser);

      if (params?.role) {
        result = result.filter((u) => u.role === params.role);
      }
      if (params?.status) {
        result = result.filter((u) => u.status === params.status);
      }
      if (params?.search) {
        const q = params.search.toLowerCase();
        result = result.filter(
          (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
        );
      }
      return result;
    },

    createUser: async (userData: Partial<User> & { password?: string }): Promise<User> => {
      await delay();
      const actor = requireSuperAdminUser();
      const db = getMockDb();

      if (!userData.name || !userData.email || !userData.role) {
        throw createApiError(400, 'BAD_REQUEST', 'Name, email, and role are required.');
      }

      const existing = db.users.find(
        (u) => u.email.toLowerCase() === userData.email!.trim().toLowerCase()
      );
      if (existing) {
        throw createApiError(409, 'CONFLICT', 'Email already exists.');
      }

      const newUser = {
        id: `usr_${Date.now()}`,
        name: userData.name.trim(),
        email: userData.email.trim(),
        password: userData.password || 'password123',
        role: userData.role,
        phone: userData.phone || '',
        region: userData.region || '',
        status: 'ACTIVE' as const,
        createdAt: new Date().toISOString(),
      };

      db.users.push(newUser);

      db.auditLogs.unshift({
        id: `aud_${Date.now()}`,
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
        action: 'CREATE_USER',
        entityType: 'USER',
        entityId: newUser.id,
        newValue: `${newUser.name} (${newUser.role})`,
        timestamp: new Date().toISOString(),
        ipAddress: '127.0.0.1',
      });

      saveMockDb(db);
      return sanitizeUser(newUser);
    },

    updateUser: async (userId: string, updates: Partial<User>): Promise<User> => {
      await delay();
      const actor = requireSuperAdminUser();
      const db = getMockDb();

      const target = db.users.find((u) => u.id === userId);
      if (!target) {
        throw createApiError(404, 'NOT_FOUND', 'User not found.');
      }

      if (updates.name) target.name = updates.name;
      if (updates.phone !== undefined) target.phone = updates.phone;
      if (updates.region !== undefined) target.region = updates.region;
      if (updates.role) target.role = updates.role;

      db.auditLogs.unshift({
        id: `aud_${Date.now()}`,
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
        action: 'UPDATE_USER',
        entityType: 'USER',
        entityId: target.id,
        newValue: `Updated profile for ${target.name}`,
        timestamp: new Date().toISOString(),
        ipAddress: '127.0.0.1',
      });

      saveMockDb(db);
      return sanitizeUser(target);
    },

    toggleUserStatus: async (userId: string, status: 'ACTIVE' | 'DEACTIVATED'): Promise<User> => {
      await delay();
      const actor = requireSuperAdminUser();
      const db = getMockDb();

      const target = db.users.find((u) => u.id === userId);
      if (!target) {
        throw createApiError(404, 'NOT_FOUND', 'User not found.');
      }

      const prev = target.status;
      target.status = status;

      db.auditLogs.unshift({
        id: `aud_${Date.now()}`,
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
        action: status === 'ACTIVE' ? 'REACTIVATE_USER' : 'DEACTIVATE_USER',
        entityType: 'USER',
        entityId: target.id,
        previousValue: prev,
        newValue: status,
        timestamp: new Date().toISOString(),
        ipAddress: '127.0.0.1',
      });

      saveMockDb(db);
      return sanitizeUser(target);
    },

    getSubAdmins: async (): Promise<SubAdminEnriched[]> => {
      await delay();
      requireSuperAdminUser();
      const db = getMockDb();

      const subAdmins = db.users.filter((u) => u.role === 'SUB_ADMIN');
      return subAdmins.map((sa) => {
        const assignedEmps = db.employees.filter((e) => e.subAdminId === sa.id);
        const totalAlloc = assignedEmps.reduce((sum, e) => sum + e.totalAllocated, 0);
        const totalWithdrawn = assignedEmps.reduce((sum, e) => sum + e.totalApprovedWithdrawals, 0);
        const pendingRequests = assignedEmps.reduce((sum, e) => sum + e.pendingWithdrawalsCount, 0);

        return {
          ...sanitizeUser(sa),
          assignedCount: assignedEmps.length,
          assignedEmployees: assignedEmps.map((e) => ({
            id: e.id,
            name: e.name,
            code: e.employeeCode,
            balance: e.availableBalance,
            status: e.status,
          })),
          totalAllocated: totalAlloc,
          totalApprovedWithdrawals: totalWithdrawn,
          pendingRequests,
        };
      });
    },

    assignEmployee: async (employeeId: string, subAdminId: string) => {
      await delay();
      const actor = requireSuperAdminUser();
      const db = getMockDb();

      const emp = db.employees.find((e) => e.id === employeeId);
      if (!emp) {
        throw createApiError(404, 'NOT_FOUND', 'Employee not found.');
      }

      const subAdmin = db.users.find((u) => u.id === subAdminId && u.role === 'SUB_ADMIN');
      if (!subAdmin) {
        throw createApiError(404, 'NOT_FOUND', 'Target Sub-Admin not found.');
      }

      const prevSubAdmin = emp.subAdminId;
      emp.subAdminId = subAdminId;

      db.auditLogs.unshift({
        id: `aud_${Date.now()}`,
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
        action: 'REASSIGN_EMPLOYEE',
        entityType: 'ASSIGNMENT',
        entityId: emp.id,
        previousValue: prevSubAdmin,
        newValue: `Assigned to ${subAdmin.name} (${subAdminId})`,
        timestamp: new Date().toISOString(),
        ipAddress: '127.0.0.1',
      });

      saveMockDb(db);
      return { success: true, employee: emp };
    },

    getAllEmployees: async (): Promise<EmployeeProfile[]> => {
      await delay();
      requireSuperAdminUser();
      const db = getMockDb();

      return db.employees.map((emp) => {
        const subAdmin = db.users.find((u) => u.id === emp.subAdminId);
        return {
          ...emp,
          subAdminName: subAdmin ? subAdmin.name : 'Unassigned',
          subAdminRegion: subAdmin ? subAdmin.region : '',
        };
      });
    },

    createEmployee: async (data: any): Promise<EmployeeProfile> => {
      await delay();
      const actor = requireSuperAdminUser();
      const db = getMockDb();

      if (!data.name || !data.email || !data.subAdminId) {
        throw createApiError(400, 'BAD_REQUEST', 'Name, email, and Sub-Admin are required.');
      }

      const newEmp: EmployeeProfile = {
        id: `emp_${Date.now()}`,
        name: data.name.trim(),
        email: data.email.trim(),
        phone: data.phone || '',
        employeeCode: data.employeeCode || `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
        subAdminId: data.subAdminId,
        status: 'ACTIVE',
        availableBalance: 0,
        totalAllocated: 0,
        totalApprovedWithdrawals: 0,
        pendingWithdrawalsCount: 0,
        bankName: data.bankName || 'Standard Bank',
        bankAccountNumber: data.bankAccountNumber || '123456789012',
        ifscCode: data.ifscCode || 'STDN0001001',
        assignedLocation: {
          name: data.locationName || 'Central Hub',
          latitude: data.latitude ? parseFloat(data.latitude) : 28.6139,
          longitude: data.longitude ? parseFloat(data.longitude) : 77.2090,
          allowedRadiusMeters: 500,
        },
        attendanceToday: 'ABSENT',
        createdAt: new Date().toISOString(),
      };

      db.employees.push(newEmp);

      db.auditLogs.unshift({
        id: `aud_${Date.now()}`,
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
        action: 'CREATE_EMPLOYEE',
        entityType: 'USER',
        entityId: newEmp.id,
        newValue: `${newEmp.name} (${newEmp.employeeCode})`,
        timestamp: new Date().toISOString(),
        ipAddress: '127.0.0.1',
      });

      saveMockDb(db);
      return newEmp;
    },

    getAttendance: async (params?: {
      date?: string;
      employeeId?: string;
      discrepancyOnly?: boolean;
    }): Promise<AttendancePunch[]> => {
      await delay();
      requireSuperAdminUser();
      const db = getMockDb();
      let records = [...db.punches];

      if (params?.date) {
        records = records.filter((p) => p.date === params.date);
      }
      if (params?.employeeId) {
        records = records.filter((p) => p.employeeId === params.employeeId);
      }
      if (params?.discrepancyOnly) {
        records = records.filter((p) => p.isLocationDiscrepancy);
      }
      return records;
    },

    getFinance: async () => {
      await delay();
      requireSuperAdminUser();
      const db = getMockDb();

      const totalAllocated = db.ledger
        .filter((l) => l.type === 'ALLOCATION')
        .reduce((sum, l) => sum + l.amount, 0);

      const totalApprovedWithdrawals = db.ledger
        .filter((l) => l.type === 'WITHDRAWAL_APPROVAL')
        .reduce((sum, l) => sum + l.amount, 0);

      const pendingWithdrawals = db.entries
        .filter((e) => e.status === 'PENDING')
        .reduce((sum, e) => sum + e.withdrawalAmount, 0);

      const subAdminSummary = db.users
        .filter((u) => u.role === 'SUB_ADMIN')
        .map((sa) => {
          const saEmployees = db.employees.filter((e) => e.subAdminId === sa.id);
          const allocated = saEmployees.reduce((sum, e) => sum + e.totalAllocated, 0);
          const withdrawn = saEmployees.reduce((sum, e) => sum + e.totalApprovedWithdrawals, 0);
          const balance = saEmployees.reduce((sum, e) => sum + e.availableBalance, 0);

          return {
            subAdminId: sa.id,
            subAdminName: sa.name,
            region: sa.region,
            employeeCount: saEmployees.length,
            allocated,
            withdrawn,
            availableBalance: balance,
          };
        });

      return {
        metrics: {
          totalAllocated,
          totalApprovedWithdrawals,
          pendingWithdrawals,
          availableBalance: totalAllocated - totalApprovedWithdrawals,
        },
        subAdminSummary,
        transactions: db.ledger,
      };
    },

    getAuditLogs: async (params?: {
      entityType?: string;
      actorRole?: string;
      search?: string;
    }): Promise<AuditLog[]> => {
      await delay();
      requireSuperAdminUser();
      const db = getMockDb();
      let logs = [...db.auditLogs];

      if (params?.entityType) {
        logs = logs.filter((l) => l.entityType === params.entityType);
      }
      if (params?.actorRole) {
        logs = logs.filter((l) => l.actorRole === params.actorRole);
      }
      if (params?.search) {
        const q = params.search.toLowerCase();
        logs = logs.filter(
          (l) =>
            l.actorName.toLowerCase().includes(q) ||
            l.action.toLowerCase().includes(q) ||
            (l.newValue && l.newValue.toLowerCase().includes(q))
        );
      }
      return logs;
    },

    getAlerts: async (): Promise<SystemAlert[]> => {
      await delay();
      requireSuperAdminUser();
      const db = getMockDb();
      return [...db.alerts];
    },

    reviewAlert: async (alertId: string): Promise<SystemAlert> => {
      await delay();
      const actor = requireSuperAdminUser();
      const db = getMockDb();

      const target = db.alerts.find((a) => a.id === alertId);
      if (!target) {
        throw createApiError(404, 'NOT_FOUND', 'Alert not found.');
      }

      target.reviewed = true;
      target.reviewedAt = new Date().toISOString();
      target.reviewedBy = actor.name;

      saveMockDb(db);
      return target;
    },

    getReports: async (type?: string) => {
      await delay();
      requireSuperAdminUser();
      const db = getMockDb();

      return {
        generatedAt: new Date().toISOString(),
        reportType: type || 'ALL',
        data: {
          employees: db.employees,
          attendance: db.punches,
          ledger: db.ledger,
          entries: db.entries,
          alerts: db.alerts,
        },
      };
    },

    getSettings: async (): Promise<SystemSettingsState> => {
      await delay(60);
      requireSuperAdminUser();
      return getMockDb().settings;
    },

    updateSettings: async (settings: SystemSettingsState): Promise<SystemSettingsState> => {
      await delay();
      const actor = requireSuperAdminUser();
      const db = getMockDb();
      db.settings = { ...settings };
      db.auditLogs.unshift({
        id: `aud_${Date.now()}`,
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
        action: 'UPDATE_SYSTEM_SETTINGS',
        entityType: 'USER',
        entityId: 'system_settings',
        newValue: `Geofence: ${settings.geofenceRadius}m, Max Withdrawal: ₹${settings.maxWithdrawalLimit}`,
        timestamp: new Date().toISOString(),
        ipAddress: '127.0.0.1',
      });
      saveMockDb(db);
      return db.settings;
    },
  },

  // ==========================================
  // SUB-ADMIN HANDLERS (Strictly Scoped)
  // ==========================================
  subAdmin: {
    getDashboard: async () => {
      await delay();
      const user = requireAdminUser();
      const db = getMockDb();
      const isSuper = user.role === 'SUPER_ADMIN';

      const assigned = isSuper
        ? db.employees
        : db.employees.filter((e) => e.subAdminId === user.id);
      const assignedIds = new Set(assigned.map((e) => e.id));

      const totalEmployees = assigned.length;
      const presentToday = assigned.filter(
        (e) => e.attendanceToday === 'PRESENT' || e.attendanceToday === 'CHECKED_IN'
      ).length;
      const absentToday = assigned.filter((e) => e.attendanceToday === 'ABSENT').length;
      const checkedInNow = assigned.filter((e) => e.attendanceToday === 'CHECKED_IN').length;
      const missingCheckout = assigned.filter((e) => e.attendanceToday === 'MISSING_CHECKOUT').length;

      const relevantEntries = isSuper
        ? db.entries
        : db.entries.filter((e) => e.subAdminId === user.id || assignedIds.has(e.employeeId));
      const pendingEntries = relevantEntries.filter((e) => e.status === 'PENDING').length;
      const approvedEntries = relevantEntries.filter((e) => e.status === 'APPROVED').length;

      const totalAllocated = assigned.reduce((sum, e) => sum + e.totalAllocated, 0);
      const totalApprovedWithdrawals = assigned.reduce(
        (sum, e) => sum + e.totalApprovedWithdrawals,
        0
      );
      const remainingAllocation = totalAllocated - totalApprovedWithdrawals;

      const relevantAlerts = isSuper
        ? db.alerts
        : db.alerts.filter(
            (a) => a.subAdminId === user.id || (a.employeeId && assignedIds.has(a.employeeId))
          );
      const activeAlerts = relevantAlerts.filter((a) => !a.reviewed).length;

      const recentPunches = db.punches
        .filter((p) => isSuper || assignedIds.has(p.employeeId))
        .slice(0, 5);

      return {
        metrics: {
          totalEmployees,
          presentToday,
          absentToday,
          checkedInNow,
          missingCheckout,
          pendingEntries,
          approvedEntries,
          totalAllocated,
          totalApprovedWithdrawals,
          remainingAllocation,
          activeAlerts,
        },
        recentPunches,
        pendingEntriesList: relevantEntries.filter((e) => e.status === 'PENDING').slice(0, 4),
      };
    },

    getEmployees: async (): Promise<EmployeeProfile[]> => {
      await delay();
      const user = requireAdminUser();
      const db = getMockDb();
      const isSuper = user.role === 'SUPER_ADMIN';

      return isSuper ? db.employees : db.employees.filter((e) => e.subAdminId === user.id);
    },

    getEmployeeDetail: async (id: string) => {
      await delay();
      const user = requireAdminUser();
      const db = getMockDb();

      const emp = db.employees.find((e) => e.id === id);
      if (!emp) {
        throw createApiError(404, 'NOT_FOUND', 'Employee not found.');
      }

      if (user.role === 'SUB_ADMIN' && emp.subAdminId !== user.id) {
        throw createApiError(
          403,
          'UNAUTHORIZED_ACCESS',
          'Access Denied: You do not have permission to view employees assigned to another Sub-Admin.'
        );
      }

      const subAdmin = db.users.find((u) => u.id === emp.subAdminId);

      return {
        employee: {
          ...emp,
          subAdminName: subAdmin ? subAdmin.name : 'Assigned Regional Sub-Admin',
        },
        punches: db.punches.filter((p) => p.employeeId === emp.id),
        entries: db.entries.filter((e) => e.employeeId === emp.id),
        ledger: db.ledger.filter((l) => l.employeeId === emp.id),
        updates: db.updateLogs.filter((u) => u.employeeId === emp.id),
        alerts: db.alerts.filter((a) => a.employeeId === emp.id),
      };
    },

    getAttendance: async (params?: {
      date?: string;
      employeeId?: string;
      discrepancyOnly?: boolean;
    }): Promise<AttendancePunch[]> => {
      await delay();
      const user = requireAdminUser();
      const db = getMockDb();
      const isSuper = user.role === 'SUPER_ADMIN';

      const assigned = isSuper
        ? db.employees
        : db.employees.filter((e) => e.subAdminId === user.id);
      const assignedIds = new Set(assigned.map((e) => e.id));

      let records = db.punches.filter((p) => isSuper || assignedIds.has(p.employeeId));

      if (params?.date) {
        records = records.filter((p) => p.date === params.date);
      }
      if (params?.employeeId) {
        records = records.filter((p) => p.employeeId === params.employeeId);
      }
      if (params?.discrepancyOnly) {
        records = records.filter((p) => p.isLocationDiscrepancy);
      }

      return records;
    },

    getEntries: async (status?: string): Promise<EntrySubmission[]> => {
      await delay();
      const user = requireAdminUser();
      const db = getMockDb();
      const isSuper = user.role === 'SUPER_ADMIN';

      const assigned = isSuper
        ? db.employees
        : db.employees.filter((e) => e.subAdminId === user.id);
      const assignedIds = new Set(assigned.map((e) => e.id));

      let list = db.entries.filter(
        (e) => isSuper || e.subAdminId === user.id || assignedIds.has(e.employeeId)
      );

      if (status) {
        list = list.filter((e) => e.status === status);
      }

      return list;
    },

    approveEntry: async (id: string, remarks?: string) => {
      await delay();
      const user = requireAdminUser();
      const db = getMockDb();

      const entry = db.entries.find((e) => e.id === id);
      if (!entry) {
        throw createApiError(404, 'NOT_FOUND', 'Entry submission not found.');
      }

      if (entry.status !== 'PENDING') {
        throw createApiError(400, 'INVALID_STATE', `Entry is already ${entry.status}.`);
      }

      const emp = db.employees.find((e) => e.id === entry.employeeId);
      if (!emp) {
        throw createApiError(404, 'NOT_FOUND', 'Associated employee not found.');
      }

      if (user.role === 'SUB_ADMIN' && emp.subAdminId !== user.id) {
        throw createApiError(
          403,
          'UNAUTHORIZED_SUB_ADMIN',
          'Security Violation: You are not authorized to approve entries for employees assigned to other Sub-Admins.'
        );
      }

      if (emp.availableBalance < entry.withdrawalAmount) {
        throw createApiError(
          422,
          'INSUFFICIENT_FUNDS',
          `Cannot approve entry: Employee available balance (₹${emp.availableBalance.toLocaleString()}) is insufficient for withdrawal amount (₹${entry.withdrawalAmount.toLocaleString()}). Please allocate funds first.`
        );
      }

      const balanceBefore = emp.availableBalance;
      emp.availableBalance -= entry.withdrawalAmount;
      emp.totalApprovedWithdrawals += entry.withdrawalAmount;
      emp.pendingWithdrawalsCount = Math.max(0, emp.pendingWithdrawalsCount - 1);

      entry.status = 'APPROVED';
      entry.reviewedAt = new Date().toISOString();
      entry.reviewedBy = user.id;
      entry.reviewedByName = user.name;
      if (remarks) {
        entry.remarks = remarks;
      }

      const newLedgerItem: FinancialLedger = {
        id: `led_${Date.now()}`,
        employeeId: emp.id,
        employeeName: emp.name,
        subAdminId: emp.subAdminId,
        type: 'WITHDRAWAL_APPROVAL',
        amount: entry.withdrawalAmount,
        balanceBefore,
        balanceAfter: emp.availableBalance,
        reference: `ENT-APP-${entry.id}`,
        notes: remarks || `Approved withdrawal for ref ${entry.referenceId}`,
        createdAt: new Date().toISOString(),
        createdBy: user.id,
        createdByName: user.name,
      };
      db.ledger.unshift(newLedgerItem);

      db.auditLogs.unshift({
        id: `aud_${Date.now()}`,
        actorId: user.id,
        actorName: user.name,
        actorRole: user.role,
        action: 'APPROVE_ENTRY',
        entityType: 'ENTRY',
        entityId: entry.id,
        previousValue: 'PENDING',
        newValue: `APPROVED - Deducted ₹${entry.withdrawalAmount}. New Balance: ₹${emp.availableBalance}`,
        timestamp: new Date().toISOString(),
        ipAddress: '127.0.0.1',
      });

      saveMockDb(db);

      return {
        success: true,
        message: 'Entry approved successfully and funds settled.',
        entry,
        employee: emp,
        ledger: newLedgerItem,
      };
    },

    rejectEntry: async (id: string, reason: string, remarks?: string) => {
      await delay();
      const user = requireAdminUser();
      const db = getMockDb();

      if (!reason) {
        throw createApiError(400, 'BAD_REQUEST', 'Rejection reason is required.');
      }

      const entry = db.entries.find((e) => e.id === id);
      if (!entry) {
        throw createApiError(404, 'NOT_FOUND', 'Entry submission not found.');
      }

      if (entry.status !== 'PENDING') {
        throw createApiError(400, 'INVALID_STATE', `Entry is already ${entry.status}.`);
      }

      const emp = db.employees.find((e) => e.id === entry.employeeId);
      if (!emp) {
        throw createApiError(404, 'NOT_FOUND', 'Associated employee not found.');
      }

      if (user.role === 'SUB_ADMIN' && emp.subAdminId !== user.id) {
        throw createApiError(
          403,
          'UNAUTHORIZED_SUB_ADMIN',
          'Security Violation: You are not authorized to reject entries for other Sub-Admins.'
        );
      }

      emp.pendingWithdrawalsCount = Math.max(0, emp.pendingWithdrawalsCount - 1);
      entry.status = 'REJECTED';
      entry.rejectionReason = reason;
      entry.reviewedAt = new Date().toISOString();
      entry.reviewedBy = user.id;
      entry.reviewedByName = user.name;
      if (remarks) {
        entry.remarks = remarks;
      }

      db.auditLogs.unshift({
        id: `aud_${Date.now()}`,
        actorId: user.id,
        actorName: user.name,
        actorRole: user.role,
        action: 'REJECT_ENTRY',
        entityType: 'ENTRY',
        entityId: entry.id,
        previousValue: 'PENDING',
        newValue: `REJECTED: ${reason}`,
        timestamp: new Date().toISOString(),
        ipAddress: '127.0.0.1',
      });

      saveMockDb(db);

      return {
        success: true,
        message: 'Entry rejected successfully.',
        entry,
        employee: emp,
      };
    },

    allocateFunds: async (data: {
      employeeId: string;
      amount: number;
      reference?: string;
      remarks?: string;
    }) => {
      await delay();
      const user = requireAdminUser();
      const db = getMockDb();

      if (!data.employeeId || !data.amount || data.amount <= 0) {
        throw createApiError(
          400,
          'BAD_REQUEST',
          'Valid employee ID and positive amount required.'
        );
      }

      const emp = db.employees.find((e) => e.id === data.employeeId);
      if (!emp) {
        throw createApiError(404, 'NOT_FOUND', 'Employee not found.');
      }

      if (user.role === 'SUB_ADMIN' && emp.subAdminId !== user.id) {
        throw createApiError(
          403,
          'UNAUTHORIZED_SUB_ADMIN',
          'You can only allocate money to employees assigned directly to your hub.'
        );
      }

      const allocAmount = Number(data.amount);
      const balanceBefore = emp.availableBalance;
      emp.availableBalance += allocAmount;
      emp.totalAllocated += allocAmount;

      const newLedgerItem: FinancialLedger = {
        id: `led_${Date.now()}`,
        employeeId: emp.id,
        employeeName: emp.name,
        subAdminId: emp.subAdminId,
        type: 'ALLOCATION',
        amount: allocAmount,
        balanceBefore,
        balanceAfter: emp.availableBalance,
        reference: data.reference || `ALLOC-${Date.now().toString().slice(-6)}`,
        notes: data.remarks || 'Sub-Admin manual working capital allocation',
        createdAt: new Date().toISOString(),
        createdBy: user.id,
        createdByName: user.name,
      };
      db.ledger.unshift(newLedgerItem);

      db.auditLogs.unshift({
        id: `aud_${Date.now()}`,
        actorId: user.id,
        actorName: user.name,
        actorRole: user.role,
        action: 'ALLOCATE_FUNDS',
        entityType: 'ALLOCATION',
        entityId: emp.id,
        previousValue: `₹${balanceBefore}`,
        newValue: `Allocated ₹${allocAmount}. New Balance: ₹${emp.availableBalance}`,
        timestamp: new Date().toISOString(),
        ipAddress: '127.0.0.1',
      });

      saveMockDb(db);

      return {
        success: true,
        message: `Allocated ₹${allocAmount.toLocaleString()} to ${emp.name}`,
        ledger: newLedgerItem,
        employee: emp,
      };
    },

    getEmployeeFinance: async (employeeId: string) => {
      await delay();
      const user = requireAdminUser();
      const db = getMockDb();

      const emp = db.employees.find((e) => e.id === employeeId);
      if (!emp) {
        throw createApiError(404, 'NOT_FOUND', 'Employee not found.');
      }

      if (user.role === 'SUB_ADMIN' && emp.subAdminId !== user.id) {
        throw createApiError(403, 'UNAUTHORIZED_SUB_ADMIN', 'Employee not assigned to you.');
      }

      const history = db.ledger.filter((l) => l.employeeId === employeeId);
      return {
        employee: {
          id: emp.id,
          name: emp.name,
          availableBalance: emp.availableBalance,
          totalAllocated: emp.totalAllocated,
          totalApprovedWithdrawals: emp.totalApprovedWithdrawals,
          pendingRequests: emp.pendingWithdrawalsCount,
        },
        ledger: history,
      };
    },

    getAlerts: async (): Promise<SystemAlert[]> => {
      await delay();
      const user = requireAdminUser();
      const db = getMockDb();
      const isSuper = user.role === 'SUPER_ADMIN';

      const assigned = isSuper
        ? db.employees
        : db.employees.filter((e) => e.subAdminId === user.id);
      const assignedIds = new Set(assigned.map((e) => e.id));

      return db.alerts.filter(
        (a) => isSuper || a.subAdminId === user.id || (a.employeeId && assignedIds.has(a.employeeId))
      );
    },

    reviewAlert: async (id: string) => {
      await delay();
      const user = requireAdminUser();
      const db = getMockDb();

      const target = db.alerts.find((a) => a.id === id);
      if (!target) {
        throw createApiError(404, 'NOT_FOUND', 'Alert not found.');
      }

      target.reviewed = true;
      target.reviewedAt = new Date().toISOString();
      target.reviewedBy = user.name;

      saveMockDb(db);
      return { success: true, alert: target };
    },

    getEmployeeUpdates: async () => {
      await delay();
      const user = requireAdminUser();
      const db = getMockDb();
      const isSuper = user.role === 'SUPER_ADMIN';

      const assigned = isSuper
        ? db.employees
        : db.employees.filter((e) => e.subAdminId === user.id);
      const assignedIds = new Set(assigned.map((e) => e.id));

      return db.updateLogs.filter((u) => isSuper || assignedIds.has(u.employeeId));
    },

    logUnmaskAudit: async (employeeId: string, employeeName: string) => {
      await delay(60);
      const user = requireAdminUser();
      const db = getMockDb();

      db.auditLogs.unshift({
        id: `aud_${Date.now()}`,
        actorId: user.id,
        actorName: user.name,
        actorRole: user.role,
        action: 'UNMASK_BANK_DETAILS',
        entityType: 'USER',
        entityId: employeeId,
        newValue: `Explicitly unmasked account details for ${employeeName}`,
        timestamp: new Date().toISOString(),
        ipAddress: '127.0.0.1',
      });

      saveMockDb(db);
      return { success: true, logged: true };
    },

    reviewEmployeeUpdate: async (id: string, status: 'APPROVED' | 'DISMISSED') => {
      await delay();
      const user = requireAdminUser();
      const db = getMockDb();

      const log = db.updateLogs.find((u) => u.id === id);
      if (!log) {
        throw createApiError(404, 'NOT_FOUND', 'Update record not found.');
      }

      log.reviewStatus = status === 'APPROVED' ? 'APPROVED' : 'DISMISSED';

      db.auditLogs.unshift({
        id: `aud_${Date.now()}`,
        actorId: user.id,
        actorName: user.name,
        actorRole: user.role,
        action: `REVIEW_PROFILE_UPDATE_${status}`,
        entityType: 'USER',
        entityId: log.employeeId,
        newValue: `${log.fieldName} update marked ${status}`,
        timestamp: new Date().toISOString(),
        ipAddress: '127.0.0.1',
      });

      saveMockDb(db);
      return { update: log };
    },
  },

  // ==========================================
  // EMPLOYEE SELF-SERVICE HANDLERS
  // ==========================================
  employee: {
    getMyProfile: async (): Promise<EmployeeProfile> => {
      await delay();
      const user = requireSessionUser();
      const db = getMockDb();

      const emp = db.employees.find(
        (e) =>
          (user.employeeProfileId && e.id === user.employeeProfileId) ||
          e.email.toLowerCase() === user.email.toLowerCase()
      );

      if (!emp) {
        throw createApiError(404, 'NOT_FOUND', 'Employee profile not found.');
      }

      const subAdmin = db.users.find((u) => u.id === emp.subAdminId);
      return {
        ...emp,
        subAdminName: subAdmin ? subAdmin.name : 'Assigned Hub Supervisor',
        subAdminRegion: subAdmin ? subAdmin.region : '',
      };
    },

    getDashboard: async () => {
      await delay();
      const emp = await mockHandlers.employee.getMyProfile();
      const db = getMockDb();

      const myPunches = db.punches.filter((p) => p.employeeId === emp.id);
      const myEntries = db.entries.filter((e) => e.employeeId === emp.id);
      const myLedger = db.ledger.filter((l) => l.employeeId === emp.id);

      return {
        employee: emp,
        recentPunches: myPunches.slice(0, 5),
        recentEntries: myEntries.slice(0, 5),
        recentLedger: myLedger.slice(0, 5),
      };
    },

    getAttendance: async (): Promise<AttendancePunch[]> => {
      await delay();
      const emp = await mockHandlers.employee.getMyProfile();
      const db = getMockDb();
      return db.punches.filter((p) => p.employeeId === emp.id);
    },

    punchAttendance: async (punchType: 'CHECK_IN' | 'CHECK_OUT', notes?: string) => {
      await delay();
      const user = requireSessionUser();
      const db = getMockDb();

      const emp = db.employees.find(
        (e) =>
          (user.employeeProfileId && e.id === user.employeeProfileId) ||
          e.email.toLowerCase() === user.email.toLowerCase()
      );
      if (!emp) {
        throw createApiError(404, 'NOT_FOUND', 'Employee profile not found.');
      }

      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const timeStr = now.toTimeString().split(' ')[0];

      const newPunch: AttendancePunch = {
        id: `punch_${Date.now()}`,
        employeeId: emp.id,
        employeeName: emp.name,
        subAdminId: emp.subAdminId,
        punchType,
        timestamp: now.toISOString(),
        date: dateStr,
        time: timeStr,
        latitude: emp.assignedLocation.latitude + (Math.random() - 0.5) * 0.001,
        longitude: emp.assignedLocation.longitude + (Math.random() - 0.5) * 0.001,
        address: `${emp.assignedLocation.name} (Verified Mobile GPS)`,
        isLocationDiscrepancy: false,
        accuracyMeters: 7,
        workDurationMinutes: punchType === 'CHECK_OUT' ? 510 : undefined,
        notes,
      };

      db.punches.unshift(newPunch);
      emp.attendanceToday = punchType === 'CHECK_IN' ? 'CHECKED_IN' : 'PRESENT';
      emp.lastPunch = `${timeStr.slice(0, 5)} (${punchType === 'CHECK_IN' ? 'Check-In' : 'Check-Out'})`;

      db.auditLogs.unshift({
        id: `aud_${Date.now()}`,
        actorId: user.id,
        actorName: emp.name,
        actorRole: 'EMPLOYEE',
        action: `EMPLOYEE_${punchType}`,
        entityType: 'ATTENDANCE',
        entityId: newPunch.id,
        newValue: `${punchType} at ${emp.assignedLocation.name}`,
        timestamp: now.toISOString(),
        ipAddress: '127.0.0.1',
      });

      saveMockDb(db);
      return { punch: newPunch, employee: emp };
    },

    getFinance: async () => {
      await delay();
      const emp = await mockHandlers.employee.getMyProfile();
      const db = getMockDb();
      const ledger = db.ledger.filter((l) => l.employeeId === emp.id);
      const pendingAmount = db.entries
        .filter((e) => e.employeeId === emp.id && e.status === 'PENDING')
        .reduce((sum, e) => sum + e.withdrawalAmount, 0);

      return {
        employee: emp,
        pendingAmount,
        ledger,
      };
    },

    getEntries: async (): Promise<EntrySubmission[]> => {
      await delay();
      const emp = await mockHandlers.employee.getMyProfile();
      const db = getMockDb();
      return db.entries.filter((e) => e.employeeId === emp.id);
    },

    submitEntry: async (data: {
      websiteUrl: string;
      amount: number;
      withdrawalAmount: number;
      referenceId: string;
      remarks?: string;
    }): Promise<EntrySubmission> => {
      await delay();
      const user = requireSessionUser();
      const db = getMockDb();

      const emp = db.employees.find(
        (e) =>
          (user.employeeProfileId && e.id === user.employeeProfileId) ||
          e.email.toLowerCase() === user.email.toLowerCase()
      );
      if (!emp) {
        throw createApiError(404, 'NOT_FOUND', 'Employee profile not found.');
      }

      if (!data.websiteUrl || !data.referenceId || !data.withdrawalAmount || data.withdrawalAmount <= 0) {
        throw createApiError(400, 'BAD_REQUEST', 'Website URL, Reference ID, and valid withdrawal amount are required.');
      }

      const newEntry: EntrySubmission = {
        id: `ent_${Date.now()}`,
        employeeId: emp.id,
        employeeName: emp.name,
        subAdminId: emp.subAdminId,
        websiteUrl: data.websiteUrl.trim(),
        bankAccountNumber: emp.bankAccountNumber,
        bankName: emp.bankName,
        ifscCode: emp.ifscCode,
        referenceId: data.referenceId.trim(),
        amount: Number(data.amount || data.withdrawalAmount),
        withdrawalAmount: Number(data.withdrawalAmount),
        screenshotUrl: generateReceiptSvg(data.referenceId.trim(), Number(data.withdrawalAmount), emp.name),
        status: 'PENDING',
        remarks: data.remarks?.trim() || 'Submitted via Employee Portal',
        submittedAt: new Date().toISOString(),
      };

      db.entries.unshift(newEntry);
      emp.pendingWithdrawalsCount += 1;

      db.auditLogs.unshift({
        id: `aud_${Date.now()}`,
        actorId: user.id,
        actorName: emp.name,
        actorRole: 'EMPLOYEE',
        action: 'SUBMIT_ENTRY',
        entityType: 'ENTRY',
        entityId: newEntry.id,
        newValue: `Submitted ₹${newEntry.withdrawalAmount} (${newEntry.referenceId})`,
        timestamp: new Date().toISOString(),
        ipAddress: '127.0.0.1',
      });

      saveMockDb(db);
      return newEntry;
    },

    updateProfile: async (data: {
      phone?: string;
      bankName?: string;
      bankAccountNumber?: string;
      ifscCode?: string;
    }) => {
      await delay();
      const user = requireSessionUser();
      const db = getMockDb();

      const emp = db.employees.find(
        (e) =>
          (user.employeeProfileId && e.id === user.employeeProfileId) ||
          e.email.toLowerCase() === user.email.toLowerCase()
      );
      if (!emp) {
        throw createApiError(404, 'NOT_FOUND', 'Employee profile not found.');
      }

      if (data.phone && data.phone !== emp.phone) {
        db.updateLogs.unshift({
          id: `upd_${Date.now()}_phone`,
          employeeId: emp.id,
          employeeName: emp.name,
          subAdminId: emp.subAdminId,
          fieldName: 'phone',
          oldValue: emp.phone,
          newValue: data.phone,
          updatedBy: emp.id,
          updatedByName: `${emp.name} (Employee Portal)`,
          updatedAt: new Date().toISOString(),
          isMasked: false,
          reviewStatus: 'PENDING',
        });
        emp.phone = data.phone;
        const usr = db.users.find((u) => u.id === user.id);
        if (usr) usr.phone = data.phone;
      }

      if (data.bankAccountNumber && data.bankAccountNumber !== emp.bankAccountNumber) {
        db.updateLogs.unshift({
          id: `upd_${Date.now()}_bank`,
          employeeId: emp.id,
          employeeName: emp.name,
          subAdminId: emp.subAdminId,
          fieldName: 'bankAccountNumber',
          oldValue: emp.bankAccountNumber,
          newValue: data.bankAccountNumber,
          updatedBy: emp.id,
          updatedByName: `${emp.name} (Employee Portal)`,
          updatedAt: new Date().toISOString(),
          isMasked: true,
          reviewStatus: 'PENDING',
        });
        emp.bankAccountNumber = data.bankAccountNumber;
      }

      if (data.bankName) emp.bankName = data.bankName;
      if (data.ifscCode) emp.ifscCode = data.ifscCode;

      saveMockDb(db);
      return emp;
    },
  },
};
