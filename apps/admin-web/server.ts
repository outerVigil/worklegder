import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// CORS middleware: allow all origins, credentials, and preflight OPTIONS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ==========================================
// TYPES & DATA STRUCTURES (Part 1 Contract)
// ==========================================

export type Role = 'SUPER_ADMIN' | 'SUB_ADMIN' | 'EMPLOYEE';
export type UserStatus = 'ACTIVE' | 'DEACTIVATED';
export type EntryStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type PunchType = 'CHECK_IN' | 'CHECK_OUT';
export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type AlertType = 'IDLE_ACTIVITY' | 'LOCATION_DISCREPANCY' | 'MISSING_CHECKOUT' | 'MISSING_ENTRY' | 'FINANCIAL_VALIDATION';

export interface User {
  id: string;
  email: string;
  password: string; // hashed or demo
  name: string;
  phone: string;
  role: Role;
  status: UserStatus;
  subAdminId?: string; // if EMPLOYEE, who is their assigned sub-admin
  region?: string;
  avatar?: string;
  createdAt: string;
}

export interface AttendancePunch {
  id: string;
  employeeId: string;
  employeeName: string;
  subAdminId: string;
  punchType: PunchType;
  timestamp: string; // ISO
  date: string; // YYYY-MM-DD
  time: string; // HH:mm:ss
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

// Generate realistic SVG mock UPI payment screenshot
function generateReceiptSvg(refId: string, amount: number, employee: string) {
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600">
    <rect width="400" height="600" fill="%23f8fafc"/>
    <rect x="20" y="20" width="360" height="560" rx="16" fill="%23ffffff" stroke="%23e2e8f0" stroke-width="2"/>
    <rect x="20" y="20" width="360" height="90" rx="16" fill="%230f172a"/>
    <text x="200" y="60" font-family="Arial" font-size="16" font-weight="bold" fill="%23ffffff" text-anchor="middle">UPI TRANSFER VERIFICATION</text>
    <text x="200" y="85" font-family="Arial" font-size="12" fill="%2338bdf8" text-anchor="middle">SUCCESSFUL PAYMENT RECEIPT</text>
    
    <circle cx="200" cy="160" r="32" fill="%23ecfdf5"/>
    <path d="M188 160l8 8 16-16" stroke="%23059669" stroke-width="4" fill="none" stroke-linecap="round"/>
    
    <text x="200" y="225" font-family="Arial" font-size="28" font-weight="bold" fill="%230f172a" text-anchor="middle">₹${amount.toLocaleString()}</text>
    <text x="200" y="250" font-family="Arial" font-size="13" fill="%2364748b" text-anchor="middle">Transfer to Authorized Account</text>
    
    <line x1="50" y1="280" x2="350" y2="280" stroke="%23e2e8f0" stroke-dasharray="4"/>
    
    <text x="50" y="315" font-family="Arial" font-size="12" fill="%2364748b">Employee Name</text>
    <text x="350" y="315" font-family="Arial" font-size="13" font-weight="bold" fill="%230f172a" text-anchor="end">${employee}</text>
    
    <text x="50" y="355" font-family="Arial" font-size="12" fill="%2364748b">UPI Ref ID</text>
    <text x="350" y="355" font-family="Courier" font-size="12" font-weight="bold" fill="%230284c7" text-anchor="end">${refId}</text>
    
    <text x="50" y="395" font-family="Arial" font-size="12" fill="%2364748b">Payment Mode</text>
    <text x="350" y="395" font-family="Arial" font-size="12" fill="%230f172a" text-anchor="end">Instant IMPS / UPI 2.0</text>
    
    <text x="50" y="435" font-family="Arial" font-size="12" fill="%2364748b">Timestamp</text>
    <text x="350" y="435" font-family="Arial" font-size="12" fill="%230f172a" text-anchor="end">Today, 10:42 AM</text>
    
    <rect x="45" y="470" width="310" height="70" rx="8" fill="%23f1f5f9"/>
    <text x="60" y="495" font-family="Arial" font-size="11" font-weight="bold" fill="%23334155">Bank RRN Code: 93847291048</text>
    <text x="60" y="515" font-family="Arial" font-size="10" fill="%2364748b">Verified by National Payments Corporation Gateway</text>
    <text x="60" y="530" font-family="Arial" font-size="10" fill="%23059669">Status: SETTLED &amp; CONFIRMED</text>
  </svg>`;
}

// ==========================================
// SEED IN-MEMORY DATABASE (Part 1 Backend)
// ==========================================

const users: User[] = [
  {
    id: 'usr_super_1',
    email: 'superadmin@enterprise.com',
    password: 'password123',
    name: 'Alexander Wright',
    phone: '+1 (555) 019-2831',
    role: 'SUPER_ADMIN',
    status: 'ACTIVE',
    createdAt: '2026-01-10T08:00:00Z',
  },
  {
    id: 'usr_sub_1',
    email: 'subadmin.north@enterprise.com',
    password: 'password123',
    name: 'Sarah Jenkins',
    phone: '+1 (555) 014-9923',
    role: 'SUB_ADMIN',
    status: 'ACTIVE',
    region: 'North Hub (Metro Tech Park)',
    createdAt: '2026-01-15T09:30:00Z',
  },
  {
    id: 'usr_sub_2',
    email: 'subadmin.south@enterprise.com',
    password: 'password123',
    name: 'Marcus Vance',
    phone: '+1 (555) 018-7712',
    role: 'SUB_ADMIN',
    status: 'ACTIVE',
    region: 'South Region (Logistics Center)',
    createdAt: '2026-01-20T11:00:00Z',
  },
  {
    id: 'usr_sub_3',
    email: 'subadmin.west@enterprise.com',
    password: 'password123',
    name: 'Elena Rostova',
    phone: '+1 (555) 016-4431',
    role: 'SUB_ADMIN',
    status: 'ACTIVE',
    region: 'West District Operations',
    createdAt: '2026-02-01T10:15:00Z',
  },
  {
    id: 'usr_emp_reject',
    email: 'employee@enterprise.com',
    password: 'password123',
    name: 'David Miller (Field Agent)',
    phone: '+1 (555) 012-3456',
    role: 'EMPLOYEE',
    status: 'ACTIVE',
    subAdminId: 'usr_sub_1',
    createdAt: '2026-02-05T08:00:00Z',
  },
];

// Employee database records
interface EmployeeProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  employeeCode: string;
  subAdminId: string;
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
  attendanceToday: 'PRESENT' | 'ABSENT' | 'CHECKED_IN' | 'MISSING_CHECKOUT';
  lastPunch?: string;
  createdAt: string;
}

const employees: EmployeeProfile[] = [
  {
    id: 'emp_101',
    name: 'Rahul Sharma',
    email: 'rahul.sharma@enterprise.com',
    phone: '+91 98765 43210',
    employeeCode: 'EMP-9021',
    subAdminId: 'usr_sub_1',
    status: 'ACTIVE',
    availableBalance: 12500,
    totalAllocated: 45000,
    totalApprovedWithdrawals: 32500,
    pendingWithdrawalsCount: 1,
    bankName: 'HDFC Bank',
    bankAccountNumber: '50100492817264',
    ifscCode: 'HDFC0001248',
    assignedLocation: {
      name: 'North Metro Tech Hub',
      latitude: 28.6139,
      longitude: 77.2090,
      allowedRadiusMeters: 500,
    },
    attendanceToday: 'CHECKED_IN',
    lastPunch: '09:05 AM (Check-In)',
    createdAt: '2026-01-15T09:00:00Z',
  },
  {
    id: 'emp_102',
    name: 'Priya Patel',
    email: 'priya.patel@enterprise.com',
    phone: '+91 98765 88921',
    employeeCode: 'EMP-9022',
    subAdminId: 'usr_sub_1',
    status: 'ACTIVE',
    availableBalance: 8200,
    totalAllocated: 30000,
    totalApprovedWithdrawals: 21800,
    pendingWithdrawalsCount: 0,
    bankName: 'ICICI Bank',
    bankAccountNumber: '002105008912',
    ifscCode: 'ICIC0000021',
    assignedLocation: {
      name: 'North Metro Tech Hub',
      latitude: 28.6139,
      longitude: 77.2090,
      allowedRadiusMeters: 500,
    },
    attendanceToday: 'PRESENT',
    lastPunch: '05:30 PM (Check-Out)',
    createdAt: '2026-01-16T10:00:00Z',
  },
  {
    id: 'emp_103',
    name: 'Amit Verma',
    email: 'amit.verma@enterprise.com',
    phone: '+91 98765 11234',
    employeeCode: 'EMP-9023',
    subAdminId: 'usr_sub_1',
    status: 'ACTIVE',
    availableBalance: 4500,
    totalAllocated: 20000,
    totalApprovedWithdrawals: 15500,
    pendingWithdrawalsCount: 1,
    bankName: 'State Bank of India',
    bankAccountNumber: '38192049182',
    ifscCode: 'SBIN0004920',
    assignedLocation: {
      name: 'North Metro Tech Hub',
      latitude: 28.6139,
      longitude: 77.2090,
      allowedRadiusMeters: 500,
    },
    attendanceToday: 'MISSING_CHECKOUT',
    lastPunch: '09:12 AM (Check-In)',
    createdAt: '2026-01-18T11:00:00Z',
  },
  {
    id: 'emp_104',
    name: 'Sneha Roy',
    email: 'sneha.roy@enterprise.com',
    phone: '+91 98765 77654',
    employeeCode: 'EMP-9024',
    subAdminId: 'usr_sub_1',
    status: 'ACTIVE',
    availableBalance: 19400,
    totalAllocated: 50000,
    totalApprovedWithdrawals: 30600,
    pendingWithdrawalsCount: 0,
    bankName: 'Axis Bank',
    bankAccountNumber: '918020048192841',
    ifscCode: 'UTIB0001082',
    assignedLocation: {
      name: 'North Metro Tech Hub',
      latitude: 28.6139,
      longitude: 77.2090,
      allowedRadiusMeters: 500,
    },
    attendanceToday: 'PRESENT',
    lastPunch: '05:45 PM (Check-Out)',
    createdAt: '2026-01-20T08:30:00Z',
  },
  {
    id: 'emp_105',
    name: 'Vikas Deshmukh',
    email: 'vikas.deshmukh@enterprise.com',
    phone: '+91 98765 33445',
    employeeCode: 'EMP-9025',
    subAdminId: 'usr_sub_1',
    status: 'ACTIVE',
    availableBalance: 1500,
    totalAllocated: 15000,
    totalApprovedWithdrawals: 13500,
    pendingWithdrawalsCount: 1,
    bankName: 'Kotak Mahindra Bank',
    bankAccountNumber: '4920192841',
    ifscCode: 'KKBK0000921',
    assignedLocation: {
      name: 'North Metro Tech Hub',
      latitude: 28.6139,
      longitude: 77.2090,
      allowedRadiusMeters: 500,
    },
    attendanceToday: 'ABSENT',
    createdAt: '2026-01-22T09:00:00Z',
  },
  // Sub-admin 2 Employees (South)
  {
    id: 'emp_201',
    name: 'Karthik Raman',
    email: 'karthik.raman@enterprise.com',
    phone: '+91 98765 22314',
    employeeCode: 'EMP-8041',
    subAdminId: 'usr_sub_2',
    status: 'ACTIVE',
    availableBalance: 14200,
    totalAllocated: 40000,
    totalApprovedWithdrawals: 25800,
    pendingWithdrawalsCount: 1,
    bankName: 'HDFC Bank',
    bankAccountNumber: '50100882194821',
    ifscCode: 'HDFC0000492',
    assignedLocation: {
      name: 'South Logistics Terminal',
      latitude: 12.9716,
      longitude: 77.5946,
      allowedRadiusMeters: 600,
    },
    attendanceToday: 'CHECKED_IN',
    lastPunch: '08:45 AM (Check-In)',
    createdAt: '2026-01-25T10:00:00Z',
  },
  {
    id: 'emp_202',
    name: 'Ananya Iyer',
    email: 'ananya.iyer@enterprise.com',
    phone: '+91 98765 55678',
    employeeCode: 'EMP-8042',
    subAdminId: 'usr_sub_2',
    status: 'ACTIVE',
    availableBalance: 6500,
    totalAllocated: 25000,
    totalApprovedWithdrawals: 18500,
    pendingWithdrawalsCount: 0,
    bankName: 'Canara Bank',
    bankAccountNumber: '194820194829',
    ifscCode: 'CNRB0002849',
    assignedLocation: {
      name: 'South Logistics Terminal',
      latitude: 12.9716,
      longitude: 77.5946,
      allowedRadiusMeters: 600,
    },
    attendanceToday: 'PRESENT',
    lastPunch: '06:00 PM (Check-Out)',
    createdAt: '2026-01-26T11:00:00Z',
  },
  {
    id: 'emp_203',
    name: 'Suresh Kumar',
    email: 'suresh.kumar@enterprise.com',
    phone: '+91 98765 99887',
    employeeCode: 'EMP-8043',
    subAdminId: 'usr_sub_2',
    status: 'ACTIVE',
    availableBalance: 3100,
    totalAllocated: 18000,
    totalApprovedWithdrawals: 14900,
    pendingWithdrawalsCount: 1,
    bankName: 'Bank of Baroda',
    bankAccountNumber: '984729104829',
    ifscCode: 'BARB0DELHI',
    assignedLocation: {
      name: 'South Logistics Terminal',
      latitude: 12.9716,
      longitude: 77.5946,
      allowedRadiusMeters: 600,
    },
    attendanceToday: 'CHECKED_IN',
    lastPunch: '09:20 AM (Check-In - GPS Discrepancy!)',
    createdAt: '2026-01-28T09:00:00Z',
  },
  {
    id: 'emp_204',
    name: 'Meenakshi Sundaram',
    email: 'meenakshi.s@enterprise.com',
    phone: '+91 98765 66778',
    employeeCode: 'EMP-8044',
    subAdminId: 'usr_sub_2',
    status: 'DEACTIVATED',
    availableBalance: 0,
    totalAllocated: 10000,
    totalApprovedWithdrawals: 10000,
    pendingWithdrawalsCount: 0,
    bankName: 'Punjab National Bank',
    bankAccountNumber: '204918294019',
    ifscCode: 'PUNB0192800',
    assignedLocation: {
      name: 'South Logistics Terminal',
      latitude: 12.9716,
      longitude: 77.5946,
      allowedRadiusMeters: 600,
    },
    attendanceToday: 'ABSENT',
    createdAt: '2026-01-30T09:00:00Z',
  },
  // Sub-admin 3 Employees (West)
  {
    id: 'emp_301',
    name: 'Rohan Joshi',
    email: 'rohan.joshi@enterprise.com',
    phone: '+91 98765 44112',
    employeeCode: 'EMP-7011',
    subAdminId: 'usr_sub_3',
    status: 'ACTIVE',
    availableBalance: 21500,
    totalAllocated: 60000,
    totalApprovedWithdrawals: 38500,
    pendingWithdrawalsCount: 0,
    bankName: 'HDFC Bank',
    bankAccountNumber: '50100918204918',
    ifscCode: 'HDFC0000812',
    assignedLocation: {
      name: 'West District Hub',
      latitude: 19.0760,
      longitude: 72.8777,
      allowedRadiusMeters: 500,
    },
    attendanceToday: 'CHECKED_IN',
    lastPunch: '09:00 AM (Check-In)',
    createdAt: '2026-02-02T09:30:00Z',
  },
  {
    id: 'emp_302',
    name: 'Neha Kulkarni',
    email: 'neha.kulkarni@enterprise.com',
    phone: '+91 98765 88223',
    employeeCode: 'EMP-7012',
    subAdminId: 'usr_sub_3',
    status: 'ACTIVE',
    availableBalance: 9800,
    totalAllocated: 35000,
    totalApprovedWithdrawals: 25200,
    pendingWithdrawalsCount: 1,
    bankName: 'State Bank of India',
    bankAccountNumber: '20391820491',
    ifscCode: 'SBIN0008192',
    assignedLocation: {
      name: 'West District Hub',
      latitude: 19.0760,
      longitude: 72.8777,
      allowedRadiusMeters: 500,
    },
    attendanceToday: 'PRESENT',
    lastPunch: '06:15 PM (Check-Out)',
    createdAt: '2026-02-03T10:00:00Z',
  },
];

// Attendance Punches
const punches: AttendancePunch[] = [
  {
    id: 'punch_1',
    employeeId: 'emp_101',
    employeeName: 'Rahul Sharma',
    subAdminId: 'usr_sub_1',
    punchType: 'CHECK_IN',
    timestamp: '2026-11-02T09:05:00Z',
    date: '2026-11-02',
    time: '09:05:00',
    latitude: 28.6142,
    longitude: 77.2093,
    address: 'North Metro Tech Hub, Gate 2, New Delhi',
    isLocationDiscrepancy: false,
    accuracyMeters: 8,
  },
  {
    id: 'punch_2',
    employeeId: 'emp_102',
    employeeName: 'Priya Patel',
    subAdminId: 'usr_sub_1',
    punchType: 'CHECK_IN',
    timestamp: '2026-11-02T08:55:00Z',
    date: '2026-11-02',
    time: '08:55:00',
    latitude: 28.6138,
    longitude: 77.2089,
    address: 'North Metro Tech Hub, Main Entrance',
    isLocationDiscrepancy: false,
    accuracyMeters: 6,
  },
  {
    id: 'punch_3',
    employeeId: 'emp_102',
    employeeName: 'Priya Patel',
    subAdminId: 'usr_sub_1',
    punchType: 'CHECK_OUT',
    timestamp: '2026-11-02T17:30:00Z',
    date: '2026-11-02',
    time: '17:30:00',
    latitude: 28.6140,
    longitude: 77.2091,
    address: 'North Metro Tech Hub, Main Entrance',
    isLocationDiscrepancy: false,
    accuracyMeters: 7,
    workDurationMinutes: 515,
  },
  {
    id: 'punch_4',
    employeeId: 'emp_103',
    employeeName: 'Amit Verma',
    subAdminId: 'usr_sub_1',
    punchType: 'CHECK_IN',
    timestamp: '2026-11-02T09:12:00Z',
    date: '2026-11-02',
    time: '09:12:00',
    latitude: 28.6145,
    longitude: 77.2095,
    address: 'North Metro Tech Hub, South Annex',
    isLocationDiscrepancy: false,
    accuracyMeters: 12,
  },
  {
    id: 'punch_5',
    employeeId: 'emp_104',
    employeeName: 'Sneha Roy',
    subAdminId: 'usr_sub_1',
    punchType: 'CHECK_IN',
    timestamp: '2026-11-02T08:50:00Z',
    date: '2026-11-02',
    time: '08:50:00',
    latitude: 28.6139,
    longitude: 77.2090,
    address: 'North Metro Tech Hub, Desk Block C',
    isLocationDiscrepancy: false,
    accuracyMeters: 5,
  },
  {
    id: 'punch_6',
    employeeId: 'emp_104',
    employeeName: 'Sneha Roy',
    subAdminId: 'usr_sub_1',
    punchType: 'CHECK_OUT',
    timestamp: '2026-11-02T17:45:00Z',
    date: '2026-11-02',
    time: '17:45:00',
    latitude: 28.6139,
    longitude: 77.2090,
    address: 'North Metro Tech Hub, Desk Block C',
    isLocationDiscrepancy: false,
    accuracyMeters: 5,
    workDurationMinutes: 535,
  },
  {
    id: 'punch_7',
    employeeId: 'emp_201',
    employeeName: 'Karthik Raman',
    subAdminId: 'usr_sub_2',
    punchType: 'CHECK_IN',
    timestamp: '2026-11-02T08:45:00Z',
    date: '2026-11-02',
    time: '08:45:00',
    latitude: 12.9719,
    longitude: 77.5948,
    address: 'South Logistics Terminal, Warehouse Bay 4',
    isLocationDiscrepancy: false,
    accuracyMeters: 10,
  },
  {
    id: 'punch_8',
    employeeId: 'emp_203',
    employeeName: 'Suresh Kumar',
    subAdminId: 'usr_sub_2',
    punchType: 'CHECK_IN',
    timestamp: '2026-11-02T09:20:00Z',
    date: '2026-11-02',
    time: '09:20:00',
    latitude: 12.9980, // Far outside!
    longitude: 77.6250,
    address: 'Indiranagar Commercial Plaza (3.2 km away from geofence)',
    isLocationDiscrepancy: true,
    accuracyMeters: 18,
    notes: 'GPS geofence violation detected: 3,210m outside perimeter.',
  },
  {
    id: 'punch_9',
    employeeId: 'emp_301',
    employeeName: 'Rohan Joshi',
    subAdminId: 'usr_sub_3',
    punchType: 'CHECK_IN',
    timestamp: '2026-11-02T09:00:00Z',
    date: '2026-11-02',
    time: '09:00:00',
    latitude: 19.0762,
    longitude: 72.8779,
    address: 'West District Hub, Operations Room 2',
    isLocationDiscrepancy: false,
    accuracyMeters: 8,
  },
];

// Entry Submissions
const entries: EntrySubmission[] = [
  {
    id: 'ent_001',
    employeeId: 'emp_101',
    employeeName: 'Rahul Sharma',
    subAdminId: 'usr_sub_1',
    websiteUrl: 'https://client-portal.partner-enterprise.com/order/ORD-9821',
    bankAccountNumber: '50100492817264',
    bankName: 'HDFC Bank',
    ifscCode: 'HDFC0001248',
    referenceId: 'UPI-REF-89472910482',
    amount: 3500,
    withdrawalAmount: 3500,
    screenshotUrl: generateReceiptSvg('UPI-REF-89472910482', 3500, 'Rahul Sharma'),
    status: 'PENDING',
    remarks: 'Field client travel allowance and client demonstration reimbursement.',
    submittedAt: '2026-11-02T10:30:00Z',
  },
  {
    id: 'ent_002',
    employeeId: 'emp_103',
    employeeName: 'Amit Verma',
    subAdminId: 'usr_sub_1',
    websiteUrl: 'https://payments.supplier-portal.org/invoice/INV-2026-88',
    bankAccountNumber: '38192049182',
    bankName: 'State Bank of India',
    ifscCode: 'SBIN0004920',
    referenceId: 'UPI-REF-38291048192',
    amount: 2200,
    withdrawalAmount: 2200,
    screenshotUrl: generateReceiptSvg('UPI-REF-38291048192', 2200, 'Amit Verma'),
    status: 'PENDING',
    remarks: 'Hardware procurement and urgent onsite cable kit.',
    submittedAt: '2026-11-02T11:15:00Z',
  },
  {
    id: 'ent_003',
    employeeId: 'emp_105',
    employeeName: 'Vikas Deshmukh',
    subAdminId: 'usr_sub_1',
    websiteUrl: 'https://gateway.vendorpay.com/txn/TXN-102948',
    bankAccountNumber: '4920192841',
    bankName: 'Kotak Mahindra Bank',
    ifscCode: 'KKBK0000921',
    referenceId: 'UPI-REF-10294819204',
    amount: 1200,
    withdrawalAmount: 1200,
    screenshotUrl: generateReceiptSvg('UPI-REF-10294819204', 1200, 'Vikas Deshmukh'),
    status: 'PENDING',
    remarks: 'Mobile recharge and field diagnostic sim connectivity.',
    submittedAt: '2026-11-02T11:45:00Z',
  },
  {
    id: 'ent_004',
    employeeId: 'emp_201',
    employeeName: 'Karthik Raman',
    subAdminId: 'usr_sub_2',
    websiteUrl: 'https://logistics-vendor.com/proof/PR-88192',
    bankAccountNumber: '50100882194821',
    bankName: 'HDFC Bank',
    ifscCode: 'HDFC0000492',
    referenceId: 'UPI-REF-99482019482',
    amount: 4800,
    withdrawalAmount: 4800,
    screenshotUrl: generateReceiptSvg('UPI-REF-99482019482', 4800, 'Karthik Raman'),
    status: 'PENDING',
    remarks: 'Emergency parcel freight forwarding payment receipt.',
    submittedAt: '2026-11-02T09:50:00Z',
  },
  {
    id: 'ent_005',
    employeeId: 'emp_203',
    employeeName: 'Suresh Kumar',
    subAdminId: 'usr_sub_2',
    websiteUrl: 'https://fuel-partner.in/receipts/F-99218',
    bankAccountNumber: '984729104829',
    bankName: 'Bank of Baroda',
    ifscCode: 'BARB0DELHI',
    referenceId: 'UPI-REF-48291048291',
    amount: 2500,
    withdrawalAmount: 2500,
    screenshotUrl: generateReceiptSvg('UPI-REF-48291048291', 2500, 'Suresh Kumar'),
    status: 'PENDING',
    remarks: 'Fuel diesel refueling for delivery van #DL-4C-9921.',
    submittedAt: '2026-11-02T10:10:00Z',
  },
  // Approved entries
  {
    id: 'ent_006',
    employeeId: 'emp_101',
    employeeName: 'Rahul Sharma',
    subAdminId: 'usr_sub_1',
    websiteUrl: 'https://client-portal.partner-enterprise.com/order/ORD-9112',
    bankAccountNumber: '50100492817264',
    bankName: 'HDFC Bank',
    ifscCode: 'HDFC0001248',
    referenceId: 'UPI-REF-77291048291',
    amount: 5000,
    withdrawalAmount: 5000,
    screenshotUrl: generateReceiptSvg('UPI-REF-77291048291', 5000, 'Rahul Sharma'),
    status: 'APPROVED',
    remarks: 'Quarterly internet stipend and workstation ergonomics.',
    submittedAt: '2026-11-01T14:20:00Z',
    reviewedAt: '2026-11-01T16:00:00Z',
    reviewedBy: 'usr_sub_1',
    reviewedByName: 'Sarah Jenkins',
  },
  {
    id: 'ent_007',
    employeeId: 'emp_102',
    employeeName: 'Priya Patel',
    subAdminId: 'usr_sub_1',
    websiteUrl: 'https://metro-transit.gov/ticketing/pass-88',
    bankAccountNumber: '002105008912',
    bankName: 'ICICI Bank',
    ifscCode: 'ICIC0000021',
    referenceId: 'UPI-REF-66291048291',
    amount: 3200,
    withdrawalAmount: 3200,
    screenshotUrl: generateReceiptSvg('UPI-REF-66291048291', 3200, 'Priya Patel'),
    status: 'APPROVED',
    remarks: 'Metro transit monthly pass reimbursement.',
    submittedAt: '2026-11-01T11:10:00Z',
    reviewedAt: '2026-11-01T12:30:00Z',
    reviewedBy: 'usr_sub_1',
    reviewedByName: 'Sarah Jenkins',
  },
  // Rejected entries
  {
    id: 'ent_008',
    employeeId: 'emp_104',
    employeeName: 'Sneha Roy',
    subAdminId: 'usr_sub_1',
    websiteUrl: 'https://misc-vendor.com/invoice/998',
    bankAccountNumber: '918020048192841',
    bankName: 'Axis Bank',
    ifscCode: 'UTIB0001082',
    referenceId: 'UPI-REF-11291048291',
    amount: 8500,
    withdrawalAmount: 8500,
    screenshotUrl: generateReceiptSvg('UPI-REF-11291048291', 8500, 'Sneha Roy'),
    status: 'REJECTED',
    rejectionReason: 'Invalid transaction receipt. RRN code does not correspond with verified vendor invoice.',
    remarks: 'Duplicate submission from prior billing cycle.',
    submittedAt: '2026-10-30T09:40:00Z',
    reviewedAt: '2026-10-30T14:10:00Z',
    reviewedBy: 'usr_sub_1',
    reviewedByName: 'Sarah Jenkins',
  },
];

// Financial Ledger
const ledger: FinancialLedger[] = [
  {
    id: 'led_1',
    employeeId: 'emp_101',
    employeeName: 'Rahul Sharma',
    subAdminId: 'usr_sub_1',
    type: 'ALLOCATION',
    amount: 45000,
    balanceBefore: 0,
    balanceAfter: 45000,
    reference: 'ALLOC-2026-Q4-INIT',
    notes: 'Q4 Field operations working capital allocation.',
    createdAt: '2026-10-01T09:00:00Z',
    createdBy: 'usr_sub_1',
    createdByName: 'Sarah Jenkins',
  },
  {
    id: 'led_2',
    employeeId: 'emp_101',
    employeeName: 'Rahul Sharma',
    subAdminId: 'usr_sub_1',
    type: 'WITHDRAWAL_APPROVAL',
    amount: 5000,
    balanceBefore: 45000,
    balanceAfter: 40000,
    reference: 'ENT-APP-ent_006',
    notes: 'Approved withdrawal for UPI-REF-77291048291',
    createdAt: '2026-11-01T16:00:00Z',
    createdBy: 'usr_sub_1',
    createdByName: 'Sarah Jenkins',
  },
  {
    id: 'led_3',
    employeeId: 'emp_102',
    employeeName: 'Priya Patel',
    subAdminId: 'usr_sub_1',
    type: 'ALLOCATION',
    amount: 30000,
    balanceBefore: 0,
    balanceAfter: 30000,
    reference: 'ALLOC-2026-Q4-PRIYA',
    notes: 'Field support allocation.',
    createdAt: '2026-10-05T10:00:00Z',
    createdBy: 'usr_sub_1',
    createdByName: 'Sarah Jenkins',
  },
  {
    id: 'led_4',
    employeeId: 'emp_102',
    employeeName: 'Priya Patel',
    subAdminId: 'usr_sub_1',
    type: 'WITHDRAWAL_APPROVAL',
    amount: 3200,
    balanceBefore: 30000,
    balanceAfter: 26800,
    reference: 'ENT-APP-ent_007',
    notes: 'Approved withdrawal for UPI-REF-66291048291',
    createdAt: '2026-11-01T12:30:00Z',
    createdBy: 'usr_sub_1',
    createdByName: 'Sarah Jenkins',
  },
  {
    id: 'led_5',
    employeeId: 'emp_201',
    employeeName: 'Karthik Raman',
    subAdminId: 'usr_sub_2',
    type: 'ALLOCATION',
    amount: 40000,
    balanceBefore: 0,
    balanceAfter: 40000,
    reference: 'ALLOC-SOUTH-KARTHIK',
    notes: 'Logistics fuel and route float allocation.',
    createdAt: '2026-10-10T08:00:00Z',
    createdBy: 'usr_sub_2',
    createdByName: 'Marcus Vance',
  },
];

// Employee Update Logs
const updateLogs: EmployeeUpdateLog[] = [
  {
    id: 'upd_1',
    employeeId: 'emp_101',
    employeeName: 'Rahul Sharma',
    subAdminId: 'usr_sub_1',
    fieldName: 'bankAccountNumber',
    oldValue: '50100281920192',
    newValue: '50100492817264',
    updatedBy: 'emp_101',
    updatedByName: 'Rahul Sharma (Mobile App)',
    updatedAt: '2026-11-01T15:20:00Z',
    isMasked: true,
    reviewStatus: 'APPROVED',
  },
  {
    id: 'upd_2',
    employeeId: 'emp_103',
    employeeName: 'Amit Verma',
    subAdminId: 'usr_sub_1',
    fieldName: 'phone',
    oldValue: '+91 98765 00000',
    newValue: '+91 98765 11234',
    updatedBy: 'emp_103',
    updatedByName: 'Amit Verma (Mobile App)',
    updatedAt: '2026-11-02T08:10:00Z',
    isMasked: false,
    reviewStatus: 'PENDING',
  },
  {
    id: 'upd_3',
    employeeId: 'emp_203',
    employeeName: 'Suresh Kumar',
    subAdminId: 'usr_sub_2',
    fieldName: 'bankAccountNumber',
    oldValue: '984729100000',
    newValue: '984729104829',
    updatedBy: 'emp_203',
    updatedByName: 'Suresh Kumar (Mobile App)',
    updatedAt: '2026-11-02T09:05:00Z',
    isMasked: true,
    reviewStatus: 'PENDING',
  },
];

// System Alerts
const alerts: SystemAlert[] = [
  {
    id: 'alt_1',
    employeeId: 'emp_203',
    employeeName: 'Suresh Kumar',
    subAdminId: 'usr_sub_2',
    type: 'LOCATION_DISCREPANCY',
    severity: 'HIGH',
    title: 'Geofence Breach on Check-In',
    description: 'Suresh Kumar checked in 3.2 km away from authorized South Terminal perimeter.',
    timestamp: '2026-11-02T09:20:00Z',
    reviewed: false,
  },
  {
    id: 'alt_2',
    employeeId: 'emp_103',
    employeeName: 'Amit Verma',
    subAdminId: 'usr_sub_1',
    type: 'MISSING_CHECKOUT',
    severity: 'MEDIUM',
    title: 'Missing Punch-Out on Previous Shift',
    description: 'Amit Verma did not register a punch-out record on yesterday evening shift.',
    timestamp: '2026-11-02T07:00:00Z',
    reviewed: false,
  },
  {
    id: 'alt_3',
    employeeId: 'emp_105',
    employeeName: 'Vikas Deshmukh',
    subAdminId: 'usr_sub_1',
    type: 'IDLE_ACTIVITY',
    severity: 'LOW',
    title: 'Inactivity Notice',
    description: 'No telemetry or location updates received for over 4 hours during active work hours.',
    timestamp: '2026-11-02T13:00:00Z',
    reviewed: false,
  },
  {
    id: 'alt_4',
    employeeId: 'emp_101',
    employeeName: 'Rahul Sharma',
    subAdminId: 'usr_sub_1',
    type: 'FINANCIAL_VALIDATION',
    severity: 'MEDIUM',
    title: 'Pending Withdrawal Reaches 28% of Available Balance',
    description: 'Withdrawal request of ₹3,500 submitted against available balance of ₹12,500.',
    timestamp: '2026-11-02T10:30:00Z',
    reviewed: false,
  },
];

// Audit Logs
const auditLogs: AuditLog[] = [
  {
    id: 'aud_1',
    actorId: 'usr_super_1',
    actorName: 'Alexander Wright',
    actorRole: 'SUPER_ADMIN',
    action: 'CREATE_SUB_ADMIN',
    entityType: 'USER',
    entityId: 'usr_sub_3',
    newValue: 'Elena Rostova (West District Operations)',
    timestamp: '2026-02-01T10:15:00Z',
    ipAddress: '192.168.1.101',
  },
  {
    id: 'aud_2',
    actorId: 'usr_super_1',
    actorName: 'Alexander Wright',
    actorRole: 'SUPER_ADMIN',
    action: 'ASSIGN_EMPLOYEE',
    entityType: 'ASSIGNMENT',
    entityId: 'emp_301',
    previousValue: 'Unassigned',
    newValue: 'Assigned to Elena Rostova (usr_sub_3)',
    timestamp: '2026-02-02T09:30:00Z',
    ipAddress: '192.168.1.101',
  },
  {
    id: 'aud_3',
    actorId: 'usr_sub_1',
    actorName: 'Sarah Jenkins',
    actorRole: 'SUB_ADMIN',
    action: 'ALLOCATE_FUNDS',
    entityType: 'ALLOCATION',
    entityId: 'emp_101',
    previousValue: 'Balance: ₹0',
    newValue: 'Allocated ₹45,000. Balance: ₹45,000',
    timestamp: '2026-10-01T09:00:00Z',
    ipAddress: '10.0.4.15',
  },
  {
    id: 'aud_4',
    actorId: 'usr_sub_1',
    actorName: 'Sarah Jenkins',
    actorRole: 'SUB_ADMIN',
    action: 'APPROVE_ENTRY',
    entityType: 'ENTRY',
    entityId: 'ent_006',
    previousValue: 'PENDING (₹5,000)',
    newValue: 'APPROVED. Ledger entry led_2 created.',
    timestamp: '2026-11-01T16:00:00Z',
    ipAddress: '10.0.4.15',
  },
  {
    id: 'aud_5',
    actorId: 'usr_sub_1',
    actorName: 'Sarah Jenkins',
    actorRole: 'SUB_ADMIN',
    action: 'REJECT_ENTRY',
    entityType: 'ENTRY',
    entityId: 'ent_008',
    previousValue: 'PENDING (₹8,500)',
    newValue: 'REJECTED: Invalid transaction receipt.',
    timestamp: '2026-10-30T14:10:00Z',
    ipAddress: '10.0.4.15',
  },
];

// ==========================================
// AUTHENTICATION MIDDLEWARE & HELPERS
// ==========================================

function getAuthUser(req: Request): User | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Default to Super Admin in dev preview so no unauthenticated crash occurs
    return users[0];
  }
  const token = authHeader.substring(7);
  // Parse mock token format: "token_{userId}_{role}"
  const parts = token.split('_');
  if (parts.length >= 2) {
    const userId = parts.slice(1, -1).join('_') || parts[1];
    const user = users.find((u) => u.id === userId || token.includes(u.id));
    if (user) return user;
  }
  // Fallback to finding by token contents
  const matched = users.find((u) => token.includes(u.id));
  return matched || users[0];
}

function requireAuth(req: Request, res: Response, next: NextFunction) {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Authentication required' });
  }
  (req as any).user = user;
  next();
}

function requireSuperAdmin(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user as User;
  if (user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'FORBIDDEN', message: 'Super Admin access required' });
  }
  next();
}

function requireSubAdminOrSuper(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user as User;
  if (user.role !== 'SUB_ADMIN' && user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'FORBIDDEN', message: 'Admin access required' });
  }
  next();
}

// ==========================================
// REST API ROUTES (/api/v1)
// ==========================================

// 1. Auth routes
app.post('/api/v1/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'BAD_REQUEST', message: 'Email and password required' });
  }

  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'INVALID_CREDENTIALS', message: 'Invalid email or password' });
  }

  // Strict enforcement: EMPLOYEE role MUST NOT access the Web Admin Portal
  if (user.role === 'EMPLOYEE') {
    return res.status(403).json({
      error: 'EMPLOYEE_ACCESS_DENIED',
      message: 'Access Denied: The web admin portal is restricted to Super Admins and Sub-Admins. Employees must use the mobile application.',
    });
  }

  if (user.status === 'DEACTIVATED') {
    return res.status(403).json({
      error: 'ACCOUNT_DEACTIVATED',
      message: 'Your administrator account has been deactivated. Please contact the Super Admin.',
    });
  }

  const accessToken = `token_${user.id}_${user.role}_${Date.now()}`;
  const refreshToken = `ref_${user.id}_${Date.now()}`;

  // Log successful login
  auditLogs.unshift({
    id: `aud_${Date.now()}`,
    actorId: user.id,
    actorName: user.name,
    actorRole: user.role,
    action: 'ADMIN_LOGIN',
    entityType: 'USER',
    entityId: user.id,
    timestamp: new Date().toISOString(),
    ipAddress: req.ip || '127.0.0.1',
  });

  return res.json({
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
      region: user.region,
      status: user.status,
    },
  });
});

app.post('/api/v1/auth/refresh', (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ error: 'BAD_REQUEST', message: 'Refresh token required' });
  }
  const matched = users.find((u) => refreshToken.includes(u.id));
  if (!matched) {
    return res.status(401).json({ error: 'INVALID_TOKEN', message: 'Invalid refresh token' });
  }
  return res.json({
    accessToken: `token_${matched.id}_${matched.role}_${Date.now()}`,
    refreshToken: `ref_${matched.id}_${Date.now()}`,
  });
});

app.post('/api/v1/auth/logout', requireAuth, (req, res) => {
  return res.json({ success: true, message: 'Logged out successfully' });
});

app.get('/api/v1/auth/me', requireAuth, (req, res) => {
  const user = (req as any).user as User;
  return res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    role: user.role,
    region: user.region,
    status: user.status,
  });
});

// ==========================================
// 2. SUPER ADMIN ROUTES
// ==========================================

// Global Dashboard statistics
app.get('/api/v1/super-admin/dashboard', requireAuth, requireSuperAdmin, (req, res) => {
  const totalEmployees = employees.length;
  const totalSubAdmins = users.filter((u) => u.role === 'SUB_ADMIN').length;
  const presentToday = employees.filter((e) => e.attendanceToday === 'PRESENT' || e.attendanceToday === 'CHECKED_IN').length;
  const absentToday = employees.filter((e) => e.attendanceToday === 'ABSENT').length;
  const checkedInNow = employees.filter((e) => e.attendanceToday === 'CHECKED_IN').length;
  const missingCheckout = employees.filter((e) => e.attendanceToday === 'MISSING_CHECKOUT').length;

  const pendingEntries = entries.filter((e) => e.status === 'PENDING').length;
  const approvedEntries = entries.filter((e) => e.status === 'APPROVED').length;

  const totalAllocated = ledger
    .filter((l) => l.type === 'ALLOCATION')
    .reduce((sum, l) => sum + l.amount, 0);

  const totalApprovedWithdrawals = ledger
    .filter((l) => l.type === 'WITHDRAWAL_APPROVAL')
    .reduce((sum, l) => sum + l.amount, 0);

  const pendingWithdrawalsAmount = entries
    .filter((e) => e.status === 'PENDING')
    .reduce((sum, e) => sum + e.withdrawalAmount, 0);

  const remainingAllocation = totalAllocated - totalApprovedWithdrawals;
  const activeAlerts = alerts.filter((a) => !a.reviewed).length;

  // Real-time chart telemetry
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

  return res.json({
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
    recentPunches: punches.slice(0, 5),
    recentAudit: auditLogs.slice(0, 5),
  });
});

// Users & Roles Management
app.get('/api/v1/super-admin/users', requireAuth, requireSuperAdmin, (req, res) => {
  const { role, status, search } = req.query;
  let result = [...users];

  if (role) {
    result = result.filter((u) => u.role === role);
  }
  if (status) {
    result = result.filter((u) => u.status === status);
  }
  if (search) {
    const q = String(search).toLowerCase();
    result = result.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }

  return res.json({ users: result });
});

app.post('/api/v1/super-admin/users', requireAuth, requireSuperAdmin, (req, res) => {
  const { name, email, password, role, phone, region } = req.body;
  if (!name || !email || !role) {
    return res.status(400).json({ error: 'BAD_REQUEST', message: 'Name, email, and role are required' });
  }

  const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: 'CONFLICT', message: 'Email already exists' });
  }

  const newUser: User = {
    id: `usr_${Date.now()}`,
    name,
    email,
    password: password || 'Welcome@2026',
    role,
    phone: phone || '',
    region: region || '',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);

  const actor = (req as any).user as User;
  auditLogs.unshift({
    id: `aud_${Date.now()}`,
    actorId: actor.id,
    actorName: actor.name,
    actorRole: actor.role,
    action: 'CREATE_USER',
    entityType: 'USER',
    entityId: newUser.id,
    newValue: `${newUser.name} (${newUser.role})`,
    timestamp: new Date().toISOString(),
    ipAddress: req.ip || '127.0.0.1',
  });

  return res.status(201).json({ user: newUser });
});

app.patch('/api/v1/super-admin/users/:id/status', requireAuth, requireSuperAdmin, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const target = users.find((u) => u.id === id);
  if (!target) {
    return res.status(404).json({ error: 'NOT_FOUND', message: 'User not found' });
  }

  const prev = target.status;
  target.status = status;

  const actor = (req as any).user as User;
  auditLogs.unshift({
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
    ipAddress: req.ip || '127.0.0.1',
  });

  return res.json({ user: target });
});

// Sub-Admins
app.get('/api/v1/super-admin/sub-admins', requireAuth, requireSuperAdmin, (req, res) => {
  const subAdmins = users.filter((u) => u.role === 'SUB_ADMIN');
  const enriched = subAdmins.map((sa) => {
    const assignedEmps = employees.filter((e) => e.subAdminId === sa.id);
    const totalAlloc = assignedEmps.reduce((sum, e) => sum + e.totalAllocated, 0);
    const totalWithdrawn = assignedEmps.reduce((sum, e) => sum + e.totalApprovedWithdrawals, 0);
    const pendingRequests = assignedEmps.reduce((sum, e) => sum + e.pendingWithdrawalsCount, 0);

    return {
      ...sa,
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

  return res.json({ subAdmins: enriched });
});

// Assignments
app.post('/api/v1/super-admin/assignments', requireAuth, requireSuperAdmin, (req, res) => {
  const { employeeId, subAdminId } = req.body;
  if (!employeeId || !subAdminId) {
    return res.status(400).json({ error: 'BAD_REQUEST', message: 'Employee ID and Sub-Admin ID required' });
  }

  const emp = employees.find((e) => e.id === employeeId);
  if (!emp) {
    return res.status(404).json({ error: 'NOT_FOUND', message: 'Employee not found' });
  }

  const subAdmin = users.find((u) => u.id === subAdminId && u.role === 'SUB_ADMIN');
  if (!subAdmin) {
    return res.status(404).json({ error: 'NOT_FOUND', message: 'Target Sub-Admin not found' });
  }

  const prevSubAdmin = emp.subAdminId;
  emp.subAdminId = subAdminId;

  const actor = (req as any).user as User;
  auditLogs.unshift({
    id: `aud_${Date.now()}`,
    actorId: actor.id,
    actorName: actor.name,
    actorRole: actor.role,
    action: 'REASSIGN_EMPLOYEE',
    entityType: 'ASSIGNMENT',
    entityId: emp.id,
    previousValue: prevSubAdmin,
    newValue: subAdminId,
    timestamp: new Date().toISOString(),
    ipAddress: req.ip || '127.0.0.1',
  });

  return res.json({ success: true, employee: emp });
});

// Global Employee List
app.get('/api/v1/super-admin/employees', requireAuth, requireSuperAdmin, (req, res) => {
  const enriched = employees.map((emp) => {
    const subAdmin = users.find((u) => u.id === emp.subAdminId);
    return {
      ...emp,
      subAdminName: subAdmin ? subAdmin.name : 'Unassigned',
      subAdminRegion: subAdmin ? subAdmin.region : '',
    };
  });

  return res.json({ employees: enriched });
});

// Create Employee
app.post('/api/v1/super-admin/employees', requireAuth, requireSuperAdmin, (req, res) => {
  const { name, email, phone, employeeCode, subAdminId, bankName, bankAccountNumber, ifscCode, locationName, latitude, longitude } = req.body;

  if (!name || !email || !subAdminId) {
    return res.status(400).json({ error: 'BAD_REQUEST', message: 'Name, email, and Sub-Admin are required' });
  }

  const newEmp: EmployeeProfile = {
    id: `emp_${Date.now()}`,
    name,
    email,
    phone: phone || '',
    employeeCode: employeeCode || `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
    subAdminId,
    status: 'ACTIVE',
    availableBalance: 0,
    totalAllocated: 0,
    totalApprovedWithdrawals: 0,
    pendingWithdrawalsCount: 0,
    bankName: bankName || 'Standard Bank',
    bankAccountNumber: bankAccountNumber || '123456789012',
    ifscCode: ifscCode || 'STDN0001001',
    assignedLocation: {
      name: locationName || 'Central Hub',
      latitude: latitude ? parseFloat(latitude) : 28.6139,
      longitude: longitude ? parseFloat(longitude) : 77.2090,
      allowedRadiusMeters: 500,
    },
    attendanceToday: 'ABSENT',
    createdAt: new Date().toISOString(),
  };

  employees.push(newEmp);

  const actor = (req as any).user as User;
  auditLogs.unshift({
    id: `aud_${Date.now()}`,
    actorId: actor.id,
    actorName: actor.name,
    actorRole: actor.role,
    action: 'CREATE_EMPLOYEE',
    entityType: 'USER',
    entityId: newEmp.id,
    newValue: `${newEmp.name} (${newEmp.employeeCode})`,
    timestamp: new Date().toISOString(),
    ipAddress: req.ip || '127.0.0.1',
  });

  return res.status(201).json({ employee: newEmp });
});

// Global Attendance
app.get('/api/v1/super-admin/attendance', requireAuth, requireSuperAdmin, (req, res) => {
  const { date, employeeId, discrepancyOnly } = req.query;
  let records = [...punches];

  if (date) {
    records = records.filter((p) => p.date === date);
  }
  if (employeeId) {
    records = records.filter((p) => p.employeeId === employeeId);
  }
  if (discrepancyOnly === 'true') {
    records = records.filter((p) => p.isLocationDiscrepancy);
  }

  return res.json({ attendance: records });
});

// Global Financial Ledger & Analytics
app.get('/api/v1/super-admin/finance', requireAuth, requireSuperAdmin, (req, res) => {
  const totalAllocated = ledger
    .filter((l) => l.type === 'ALLOCATION')
    .reduce((sum, l) => sum + l.amount, 0);

  const totalApprovedWithdrawals = ledger
    .filter((l) => l.type === 'WITHDRAWAL_APPROVAL')
    .reduce((sum, l) => sum + l.amount, 0);

  const pendingWithdrawals = entries
    .filter((e) => e.status === 'PENDING')
    .reduce((sum, e) => sum + e.withdrawalAmount, 0);

  // Grouped by Sub-Admin
  const subAdminSummary = users
    .filter((u) => u.role === 'SUB_ADMIN')
    .map((sa) => {
      const saEmployees = employees.filter((e) => e.subAdminId === sa.id);
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

  return res.json({
    metrics: {
      totalAllocated,
      totalApprovedWithdrawals,
      pendingWithdrawals,
      availableBalance: totalAllocated - totalApprovedWithdrawals,
    },
    subAdminSummary,
    transactions: ledger,
  });
});

// Audit Logs
app.get('/api/v1/super-admin/audit-logs', requireAuth, requireSuperAdmin, (req, res) => {
  const { entityType, actorRole, search } = req.query;
  let logs = [...auditLogs];

  if (entityType) {
    logs = logs.filter((l) => l.entityType === entityType);
  }
  if (actorRole) {
    logs = logs.filter((l) => l.actorRole === actorRole);
  }
  if (search) {
    const q = String(search).toLowerCase();
    logs = logs.filter(
      (l) =>
        l.actorName.toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q) ||
        (l.newValue && l.newValue.toLowerCase().includes(q))
    );
  }

  return res.json({ auditLogs: logs });
});

// Alerts
app.get('/api/v1/super-admin/alerts', requireAuth, requireSuperAdmin, (req, res) => {
  return res.json({ alerts });
});

app.patch('/api/v1/super-admin/alerts/:id/review', requireAuth, requireSuperAdmin, (req, res) => {
  const { id } = req.params;
  const target = alerts.find((a) => a.id === id);
  if (!target) {
    return res.status(404).json({ error: 'NOT_FOUND', message: 'Alert not found' });
  }

  target.reviewed = true;
  target.reviewedAt = new Date().toISOString();
  target.reviewedBy = (req as any).user.name;

  return res.json({ alert: target });
});

// Reports Generation
app.get('/api/v1/super-admin/reports', requireAuth, requireSuperAdmin, (req, res) => {
  const { type } = req.query;
  // Type: 'EMPLOYEE' | 'ATTENDANCE' | 'FINANCE' | 'WITHDRAWAL' | 'ENTRIES' | 'SUB_ADMIN'
  return res.json({
    generatedAt: new Date().toISOString(),
    reportType: type || 'ALL',
    data: {
      employees,
      attendance: punches,
      ledger,
      entries,
      alerts,
    },
  });
});

// ==========================================
// 3. SUB-ADMIN ROUTES (Strict Scoping)
// ==========================================

// Sub-Admin Dashboard (Strictly Scoped to req.user.id)
app.get('/api/v1/admin/dashboard', requireAuth, requireSubAdminOrSuper, (req, res) => {
  const user = (req as any).user as User;
  const isSuper = user.role === 'SUPER_ADMIN';

  // Sub-Admin only sees assigned employees
  const assigned = isSuper ? employees : employees.filter((e) => e.subAdminId === user.id);
  const assignedIds = new Set(assigned.map((e) => e.id));

  const totalEmployees = assigned.length;
  const presentToday = assigned.filter((e) => e.attendanceToday === 'PRESENT' || e.attendanceToday === 'CHECKED_IN').length;
  const absentToday = assigned.filter((e) => e.attendanceToday === 'ABSENT').length;
  const checkedInNow = assigned.filter((e) => e.attendanceToday === 'CHECKED_IN').length;
  const missingCheckout = assigned.filter((e) => e.attendanceToday === 'MISSING_CHECKOUT').length;

  const relevantEntries = isSuper ? entries : entries.filter((e) => e.subAdminId === user.id || assignedIds.has(e.employeeId));
  const pendingEntries = relevantEntries.filter((e) => e.status === 'PENDING').length;
  const approvedEntries = relevantEntries.filter((e) => e.status === 'APPROVED').length;

  const totalAllocated = assigned.reduce((sum, e) => sum + e.totalAllocated, 0);
  const totalApprovedWithdrawals = assigned.reduce((sum, e) => sum + e.totalApprovedWithdrawals, 0);
  const remainingAllocation = totalAllocated - totalApprovedWithdrawals;

  const relevantAlerts = isSuper ? alerts : alerts.filter((a) => a.subAdminId === user.id || (a.employeeId && assignedIds.has(a.employeeId)));
  const activeAlerts = relevantAlerts.filter((a) => !a.reviewed).length;

  const recentPunches = punches
    .filter((p) => isSuper || assignedIds.has(p.employeeId))
    .slice(0, 5);

  return res.json({
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
  });
});

// Sub-Admin Assigned Employees
app.get('/api/v1/admin/employees', requireAuth, requireSubAdminOrSuper, (req, res) => {
  const user = (req as any).user as User;
  const isSuper = user.role === 'SUPER_ADMIN';

  const assigned = isSuper ? employees : employees.filter((e) => e.subAdminId === user.id);
  return res.json({ employees: assigned });
});

// Explicit Security Enforcement: Sub-Admins cannot create employees
app.post('/api/v1/admin/employees', requireAuth, (req, res) => {
  const user = (req as any).user as User;
  if (user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({
      error: 'SUPER_ADMIN_EXCLUSIVE',
      message: 'Access Denied: Only the Super Admin has authority to create and onboard new employees. Sub-Admins cannot register employees.',
    });
  }
  // If Super Admin accidentally calls this endpoint, route to employee creation
  return res.status(400).json({
    error: 'USE_SUPER_ADMIN_ENDPOINT',
    message: 'Please use POST /api/v1/super-admin/employees for employee onboarding.',
  });
});

// Single Employee Detail (With Security Check!)
app.get('/api/v1/admin/employees/:id', requireAuth, requireSubAdminOrSuper, (req, res) => {
  const { id } = req.params;
  const user = (req as any).user as User;

  const emp = employees.find((e) => e.id === id);
  if (!emp) {
    return res.status(404).json({ error: 'NOT_FOUND', message: 'Employee not found' });
  }

  // Security check: Sub-Admin cannot view another Sub-Admin's employee
  if (user.role === 'SUB_ADMIN' && emp.subAdminId !== user.id) {
    return res.status(403).json({
      error: 'UNAUTHORIZED_ACCESS',
      message: 'Access Denied: You do not have permission to view employees assigned to another Sub-Admin.',
    });
  }

  const empPunches = punches.filter((p) => p.employeeId === emp.id);
  const empEntries = entries.filter((e) => e.employeeId === emp.id);
  const empLedger = ledger.filter((l) => l.employeeId === emp.id);
  const empUpdates = updateLogs.filter((u) => u.employeeId === emp.id);
  const empAlerts = alerts.filter((a) => a.employeeId === emp.id);

  return res.json({
    employee: emp,
    punches: empPunches,
    entries: empEntries,
    ledger: empLedger,
    updates: empUpdates,
    alerts: empAlerts,
  });
});

// Sub-Admin Attendance History
app.get('/api/v1/admin/attendance', requireAuth, requireSubAdminOrSuper, (req, res) => {
  const user = (req as any).user as User;
  const isSuper = user.role === 'SUPER_ADMIN';
  const assigned = isSuper ? employees : employees.filter((e) => e.subAdminId === user.id);
  const assignedIds = new Set(assigned.map((e) => e.id));

  const { date, employeeId, discrepancyOnly } = req.query;
  let records = punches.filter((p) => isSuper || assignedIds.has(p.employeeId));

  if (date) {
    records = records.filter((p) => p.date === date);
  }
  if (employeeId) {
    records = records.filter((p) => p.employeeId === employeeId);
  }
  if (discrepancyOnly === 'true') {
    records = records.filter((p) => p.isLocationDiscrepancy);
  }

  return res.json({ attendance: records });
});

// Sub-Admin Entry Management (Pending, Approved, Rejected)
app.get('/api/v1/admin/entries', requireAuth, requireSubAdminOrSuper, (req, res) => {
  const user = (req as any).user as User;
  const isSuper = user.role === 'SUPER_ADMIN';
  const assigned = isSuper ? employees : employees.filter((e) => e.subAdminId === user.id);
  const assignedIds = new Set(assigned.map((e) => e.id));

  const { status } = req.query;
  let list = entries.filter((e) => isSuper || e.subAdminId === user.id || assignedIds.has(e.employeeId));

  if (status) {
    list = list.filter((e) => e.status === status);
  }

  return res.json({ entries: list });
});

// APPROVAL WORKFLOW (Backend Authority)
app.post('/api/v1/admin/entries/:id/approve', requireAuth, requireSubAdminOrSuper, (req, res) => {
  const { id } = req.params;
  const { remarks } = req.body;
  const user = (req as any).user as User;

  const entry = entries.find((e) => e.id === id);
  if (!entry) {
    return res.status(404).json({ error: 'NOT_FOUND', message: 'Entry submission not found' });
  }

  if (entry.status !== 'PENDING') {
    return res.status(400).json({ error: 'INVALID_STATE', message: `Entry is already ${entry.status}` });
  }

  const emp = employees.find((e) => e.id === entry.employeeId);
  if (!emp) {
    return res.status(404).json({ error: 'NOT_FOUND', message: 'Associated employee not found' });
  }

  // Security authorization: Verify employee assignment
  if (user.role === 'SUB_ADMIN' && emp.subAdminId !== user.id) {
    return res.status(403).json({
      error: 'UNAUTHORIZED_SUB_ADMIN',
      message: 'Security Violation: You are not authorized to approve entries for employees assigned to other Sub-Admins.',
    });
  }

  // Financial engine verification: Check employee available balance
  if (emp.availableBalance < entry.withdrawalAmount) {
    return res.status(422).json({
      error: 'INSUFFICIENT_FUNDS',
      message: `Cannot approve entry: Employee available balance (₹${emp.availableBalance.toLocaleString()}) is insufficient for withdrawal amount (₹${entry.withdrawalAmount.toLocaleString()}). Please allocate funds first.`,
    });
  }

  // Process financial ledger deduction
  const balanceBefore = emp.availableBalance;
  emp.availableBalance -= entry.withdrawalAmount;
  emp.totalApprovedWithdrawals += entry.withdrawalAmount;
  emp.pendingWithdrawalsCount = Math.max(0, emp.pendingWithdrawalsCount - 1);

  // Update entry status
  entry.status = 'APPROVED';
  entry.reviewedAt = new Date().toISOString();
  entry.reviewedBy = user.id;
  entry.reviewedByName = user.name;
  if (remarks) {
    entry.remarks = remarks;
  }

  // Create immutable ledger entry
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
  ledger.unshift(newLedgerItem);

  // Log in Audit Trail
  auditLogs.unshift({
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
    ipAddress: req.ip || '127.0.0.1',
  });

  return res.json({
    success: true,
    message: 'Entry approved successfully and funds settled.',
    entry,
    employee: emp,
    ledger: newLedgerItem,
  });
});

// REJECTION WORKFLOW (Backend Authority)
app.post('/api/v1/admin/entries/:id/reject', requireAuth, requireSubAdminOrSuper, (req, res) => {
  const { id } = req.params;
  const { reason, remarks } = req.body;
  const user = (req as any).user as User;

  if (!reason) {
    return res.status(400).json({ error: 'BAD_REQUEST', message: 'Rejection reason is required' });
  }

  const entry = entries.find((e) => e.id === id);
  if (!entry) {
    return res.status(404).json({ error: 'NOT_FOUND', message: 'Entry submission not found' });
  }

  if (entry.status !== 'PENDING') {
    return res.status(400).json({ error: 'INVALID_STATE', message: `Entry is already ${entry.status}` });
  }

  const emp = employees.find((e) => e.id === entry.employeeId);
  if (!emp) {
    return res.status(404).json({ error: 'NOT_FOUND', message: 'Associated employee not found' });
  }

  if (user.role === 'SUB_ADMIN' && emp.subAdminId !== user.id) {
    return res.status(403).json({
      error: 'UNAUTHORIZED_SUB_ADMIN',
      message: 'Security Violation: You are not authorized to reject entries for other Sub-Admins.',
    });
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

  auditLogs.unshift({
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
    ipAddress: req.ip || '127.0.0.1',
  });

  return res.json({
    success: true,
    message: 'Entry rejected successfully.',
    entry,
    employee: emp,
  });
});

// FINANCIAL ALLOCATION (Sub-Admin Allocating Funds to Employee)
app.post('/api/v1/admin/allocations', requireAuth, requireSubAdminOrSuper, (req, res) => {
  const { employeeId, amount, reference, remarks } = req.body;
  const user = (req as any).user as User;

  if (!employeeId || !amount || amount <= 0) {
    return res.status(400).json({ error: 'BAD_REQUEST', message: 'Valid employee ID and positive amount required' });
  }

  const emp = employees.find((e) => e.id === employeeId);
  if (!emp) {
    return res.status(404).json({ error: 'NOT_FOUND', message: 'Employee not found' });
  }

  if (user.role === 'SUB_ADMIN' && emp.subAdminId !== user.id) {
    return res.status(403).json({
      error: 'UNAUTHORIZED_SUB_ADMIN',
      message: 'You can only allocate money to employees assigned directly to your hub.',
    });
  }

  const allocAmount = parseFloat(amount);
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
    reference: reference || `ALLOC-${Date.now().toString().slice(-6)}`,
    notes: remarks || 'Sub-Admin manual working capital allocation',
    createdAt: new Date().toISOString(),
    createdBy: user.id,
    createdByName: user.name,
  };
  ledger.unshift(newLedgerItem);

  auditLogs.unshift({
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
    ipAddress: req.ip || '127.0.0.1',
  });

  return res.status(201).json({
    success: true,
    message: `Allocated ₹${allocAmount.toLocaleString()} to ${emp.name}`,
    ledger: newLedgerItem,
    employee: emp,
  });
});

// Employee Financial Statement
app.get('/api/v1/admin/finance/:employeeId', requireAuth, requireSubAdminOrSuper, (req, res) => {
  const { employeeId } = req.params;
  const user = (req as any).user as User;

  const emp = employees.find((e) => e.id === employeeId);
  if (!emp) {
    return res.status(404).json({ error: 'NOT_FOUND', message: 'Employee not found' });
  }

  if (user.role === 'SUB_ADMIN' && emp.subAdminId !== user.id) {
    return res.status(403).json({ error: 'UNAUTHORIZED_SUB_ADMIN', message: 'Employee not assigned to you' });
  }

  const history = ledger.filter((l) => l.employeeId === employeeId);
  return res.json({
    employee: {
      id: emp.id,
      name: emp.name,
      availableBalance: emp.availableBalance,
      totalAllocated: emp.totalAllocated,
      totalApprovedWithdrawals: emp.totalApprovedWithdrawals,
      pendingRequests: emp.pendingWithdrawalsCount,
    },
    ledger: history,
  });
});

// Sub-Admin Alerts
app.get('/api/v1/admin/alerts', requireAuth, requireSubAdminOrSuper, (req, res) => {
  const user = (req as any).user as User;
  const isSuper = user.role === 'SUPER_ADMIN';
  const assigned = isSuper ? employees : employees.filter((e) => e.subAdminId === user.id);
  const assignedIds = new Set(assigned.map((e) => e.id));

  const filtered = alerts.filter((a) => isSuper || a.subAdminId === user.id || (a.employeeId && assignedIds.has(a.employeeId)));
  return res.json({ alerts: filtered });
});

app.post('/api/v1/admin/alerts/:id/review', requireAuth, requireSubAdminOrSuper, (req, res) => {
  const { id } = req.params;
  const target = alerts.find((a) => a.id === id);
  if (!target) {
    return res.status(404).json({ error: 'NOT_FOUND', message: 'Alert not found' });
  }

  target.reviewed = true;
  target.reviewedAt = new Date().toISOString();
  target.reviewedBy = (req as any).user.name;

  return res.json({ success: true, alert: target });
});

// Employee Update History
app.get('/api/v1/admin/employee-updates', requireAuth, requireSubAdminOrSuper, (req, res) => {
  const user = (req as any).user as User;
  const isSuper = user.role === 'SUPER_ADMIN';
  const assigned = isSuper ? employees : employees.filter((e) => e.subAdminId === user.id);
  const assignedIds = new Set(assigned.map((e) => e.id));

  const list = updateLogs.filter((u) => isSuper || assignedIds.has(u.employeeId));
  return res.json({ updates: list });
});

// Audit log for unmasking sensitive bank details
app.post('/api/v1/admin/audit/unmask-bank-details', requireAuth, requireSubAdminOrSuper, (req, res) => {
  const { employeeId, employeeName } = req.body;
  const user = (req as any).user as User;

  auditLogs.unshift({
    id: `aud_${Date.now()}`,
    actorId: user.id,
    actorName: user.name,
    actorRole: user.role,
    action: 'UNMASK_BANK_DETAILS',
    entityType: 'USER',
    entityId: employeeId,
    newValue: `Explicitly unmasked account details for review`,
    timestamp: new Date().toISOString(),
    ipAddress: req.ip || '127.0.0.1',
  });

  return res.json({ success: true, logged: true });
});

// Review update logs (Approve / Dismiss)
app.post('/api/v1/admin/employee-updates/:id/review', requireAuth, requireSubAdminOrSuper, (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'APPROVED' | 'DISMISSED'
  const log = updateLogs.find((u) => u.id === id);
  if (!log) {
    return res.status(404).json({ error: 'NOT_FOUND', message: 'Update record not found' });
  }

  log.reviewStatus = status === 'APPROVED' ? 'APPROVED' : 'DISMISSED';

  const user = (req as any).user as User;
  auditLogs.unshift({
    id: `aud_${Date.now()}`,
    actorId: user.id,
    actorName: user.name,
    actorRole: user.role,
    action: `REVIEW_PROFILE_UPDATE_${status}`,
    entityType: 'USER',
    entityId: log.employeeId,
    newValue: `${log.fieldName} update marked ${status}`,
    timestamp: new Date().toISOString(),
    ipAddress: req.ip || '127.0.0.1',
  });

  return res.json({ update: log });
});

// ==========================================
// VITE DEV SERVER / PRODUCTION STATIC
// ==========================================

async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Enterprise Backend & Web Portal] Running at http://0.0.0.0:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Fatal startup error in server.ts:', err);
  process.exit(1);
});
