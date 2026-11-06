import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './pages/auth/Login';
import { AppLayout } from './layouts/AppLayout';

// Super Admin Pages
import { SuperAdminOverview } from './pages/super-admin/Overview';
import { UsersRoles } from './pages/super-admin/UsersRoles';
import { SubAdminManagement } from './pages/super-admin/SubAdminManagement';
import { GlobalEmployeeManagement } from './pages/super-admin/EmployeeManagement';
import { AttendanceManagement } from './pages/super-admin/AttendanceManagement';
import { FinancialOverview } from './pages/super-admin/FinancialOverview';
import { AuditLogs } from './pages/super-admin/AuditLogs';
import { Reports } from './pages/super-admin/Reports';
import { AlertsCenter } from './pages/super-admin/Alerts';
import { SystemSettings } from './pages/super-admin/Settings';
import { Profile } from './pages/super-admin/Profile';

// Sub-Admin Pages
import { SubAdminOverview } from './pages/sub-admin/SubAdminOverview';
import { SubAdminEmployees } from './pages/sub-admin/SubAdminEmployees';
import { SubAdminPunchHistory } from './pages/sub-admin/PunchHistory';
import { SubAdminEntryManagement } from './pages/sub-admin/EntryManagement';
import { SubAdminMoneyAndBalance } from './pages/sub-admin/MoneyAndBalance';
import { SubAdminEmployeeUpdateHistory } from './pages/sub-admin/EmployeeUpdateHistory';
import { SubAdminAlerts } from './pages/sub-admin/SubAdminAlerts';
import { SubAdminReports } from './pages/sub-admin/SubAdminReports';

// Employee Pages
import { EmployeeDashboard } from './pages/employee/EmployeeDashboard';
import { EmployeeAttendance } from './pages/employee/EmployeeAttendance';
import { EmployeeFinance } from './pages/employee/EmployeeFinance';
import { EmployeeEntries } from './pages/employee/EmployeeEntries';
import { EmployeeProfile } from './pages/employee/EmployeeProfile';

// Route Guards
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-teal-400 text-xs font-mono">
        Verifying Security Token &amp; Session Privileges...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const SuperAdminOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isSuperAdmin, isEmployee, isLoading } = useAuth();

  if (isLoading) return null;

  if (isEmployee) {
    return <Navigate to="/employee/dashboard" replace />;
  }

  if (!isSuperAdmin) {
    return <Navigate to="/admin/overview" replace />;
  }

  return <>{children}</>;
};

const AdminOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isEmployee, isLoading } = useAuth();

  if (isLoading) return null;

  if (isEmployee) {
    return <Navigate to="/employee/dashboard" replace />;
  }

  return <>{children}</>;
};

const EmployeeOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isEmployee, isSuperAdmin, isLoading } = useAuth();

  if (isLoading) return null;

  if (!isEmployee) {
    return <Navigate to={isSuperAdmin ? '/super-admin/overview' : '/admin/overview'} replace />;
  }

  return <>{children}</>;
};

const RootRedirect: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-teal-400 text-xs font-mono">
        Routing to Authorized Operations Portal...
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'SUPER_ADMIN') {
    return <Navigate to="/super-admin/overview" replace />;
  }

  if (user.role === 'SUB_ADMIN') {
    return <Navigate to="/admin/overview" replace />;
  }

  if (user.role === 'EMPLOYEE') {
    return <Navigate to="/employee/dashboard" replace />;
  }

  return <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth */}
          <Route path="/login" element={<Login />} />

          {/* Root Redirect */}
          <Route path="/" element={<RootRedirect />} />

          {/* Super Admin Protected Applet Routes */}
          <Route
            path="/super-admin"
            element={
              <ProtectedRoute>
                <SuperAdminOnlyRoute>
                  <AppLayout />
                </SuperAdminOnlyRoute>
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/super-admin/overview" replace />} />
            <Route path="overview" element={<SuperAdminOverview />} />
            <Route path="users" element={<UsersRoles />} />
            <Route path="sub-admins" element={<SubAdminManagement />} />
            <Route path="employees" element={<GlobalEmployeeManagement />} />
            <Route path="attendance" element={<AttendanceManagement />} />
            <Route path="finance" element={<FinancialOverview />} />
            <Route path="reports" element={<Reports />} />
            <Route path="audit-logs" element={<AuditLogs />} />
            <Route path="alerts" element={<AlertsCenter />} />
            <Route path="settings" element={<SystemSettings />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* Sub-Admin Protected Applet Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminOnlyRoute>
                  <AppLayout />
                </AdminOnlyRoute>
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/overview" replace />} />
            <Route path="overview" element={<SubAdminOverview />} />
            <Route path="employees" element={<SubAdminEmployees />} />
            <Route path="punches" element={<SubAdminPunchHistory />} />
            <Route path="entries" element={<SubAdminEntryManagement />} />
            <Route path="money" element={<SubAdminMoneyAndBalance />} />
            <Route path="updates" element={<SubAdminEmployeeUpdateHistory />} />
            <Route path="alerts" element={<SubAdminAlerts />} />
            <Route path="reports" element={<SubAdminReports />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* Employee Self-Service Protected Applet Routes */}
          <Route
            path="/employee"
            element={
              <ProtectedRoute>
                <EmployeeOnlyRoute>
                  <AppLayout />
                </EmployeeOnlyRoute>
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/employee/dashboard" replace />} />
            <Route path="dashboard" element={<EmployeeDashboard />} />
            <Route path="attendance" element={<EmployeeAttendance />} />
            <Route path="finance" element={<EmployeeFinance />} />
            <Route path="entries" element={<EmployeeEntries />} />
            <Route path="profile" element={<EmployeeProfile />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
