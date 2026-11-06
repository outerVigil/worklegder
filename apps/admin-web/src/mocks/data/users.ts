import { User } from '../../types';

export interface MockUserRecord extends User {
  password: string;
  employeeProfileId?: string;
}

export const INITIAL_USERS: MockUserRecord[] = [
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
    id: 'usr_emp_1',
    email: 'employee@enterprise.com',
    password: 'password123',
    name: 'Rahul Sharma',
    phone: '+91 98765 43210',
    role: 'EMPLOYEE',
    status: 'ACTIVE',
    subAdminId: 'usr_sub_1',
    region: 'North Hub (Metro Tech Park)',
    employeeProfileId: 'emp_101',
    createdAt: '2026-01-15T09:00:00Z',
  },
];
