import {
  EmployeeProfile,
  AttendancePunch,
  EntrySubmission,
  FinancialLedger,
  EmployeeUpdateLog,
  SystemAlert,
  AuditLog,
} from '../types';
import { INITIAL_USERS, MockUserRecord } from './data/users';
import { INITIAL_EMPLOYEES } from './data/employees';
import { INITIAL_PUNCHES } from './data/attendance';
import { INITIAL_ENTRIES } from './data/entries';
import { INITIAL_LEDGER } from './data/finance';
import { INITIAL_ALERTS } from './data/alerts';
import { INITIAL_AUDIT_LOGS, INITIAL_UPDATE_LOGS } from './data/auditLogs';

export interface SystemSettingsState {
  geofenceRadius: number;
  autoCheckoutHours: number;
  maxWithdrawalLimit: number;
  telemetryIntervalMinutes: number;
}

export interface MockDatabaseState {
  users: MockUserRecord[];
  employees: EmployeeProfile[];
  punches: AttendancePunch[];
  entries: EntrySubmission[];
  ledger: FinancialLedger[];
  updateLogs: EmployeeUpdateLog[];
  alerts: SystemAlert[];
  auditLogs: AuditLog[];
  settings: SystemSettingsState;
}

const STORAGE_KEY = 'workforce_mock_db_v1';

function createInitialState(): MockDatabaseState {
  return {
    users: JSON.parse(JSON.stringify(INITIAL_USERS)),
    employees: JSON.parse(JSON.stringify(INITIAL_EMPLOYEES)),
    punches: JSON.parse(JSON.stringify(INITIAL_PUNCHES)),
    entries: JSON.parse(JSON.stringify(INITIAL_ENTRIES)),
    ledger: JSON.parse(JSON.stringify(INITIAL_LEDGER)),
    updateLogs: JSON.parse(JSON.stringify(INITIAL_UPDATE_LOGS)),
    alerts: JSON.parse(JSON.stringify(INITIAL_ALERTS)),
    auditLogs: JSON.parse(JSON.stringify(INITIAL_AUDIT_LOGS)),
    settings: {
      geofenceRadius: 500,
      autoCheckoutHours: 10,
      maxWithdrawalLimit: 25000,
      telemetryIntervalMinutes: 15,
    },
  };
}

let cachedDb: MockDatabaseState | null = null;

export function getMockDb(): MockDatabaseState {
  if (cachedDb) return cachedDb;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as MockDatabaseState;
      if (parsed && Array.isArray(parsed.users) && Array.isArray(parsed.employees)) {
        cachedDb = parsed;
        return cachedDb;
      }
    }
  } catch (err) {
    console.warn('Failed to parse mock database from localStorage, resetting to seed:', err);
  }

  cachedDb = createInitialState();
  saveMockDb(cachedDb);
  return cachedDb;
}

export function saveMockDb(db?: MockDatabaseState): void {
  const target = db || cachedDb;
  if (!target) return;
  cachedDb = target;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(target));
  } catch (err) {
    console.warn('Failed to persist mock database to localStorage:', err);
  }
}

export function resetMockDb(): MockDatabaseState {
  const fresh = createInitialState();
  cachedDb = fresh;
  saveMockDb(fresh);
  return fresh;
}

export function getActiveMockUser(): MockUserRecord | null {
  const db = getMockDb();
  const savedUserRaw = localStorage.getItem('auth_user');
  if (!savedUserRaw) return null;
  try {
    const parsed = JSON.parse(savedUserRaw);
    const found = db.users.find((u) => u.id === parsed.id || u.email === parsed.email);
    return found || null;
  } catch {
    return null;
  }
}
