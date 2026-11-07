import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Briefcase,
  CalendarCheck,
  BadgeDollarSign,
  FileSpreadsheet,
  ScrollText,
  Bell,
  Settings,
  UserCircle,
  LogOut,
  ChevronDown,
  Clock,
  ArrowRightLeft,
  Menu,
  X,
  ShieldCheck,
  Building2,
  DollarSign,
  History,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { superAdminApi, subAdminApi } from '../services/api';
import { SystemAlert } from '../types';

export const AppLayout: React.FC = () => {
  const { user, isSuperAdmin, isSubAdmin, isEmployee, logout, switchRoleDemo } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSwitchRoleOpen, setIsSwitchRoleOpen] = useState(false);

  // Poll alerts every 30 seconds
  useEffect(() => {
    let isMounted = true;

    const fetchAlerts = async () => {
      if (!user) return;
      try {
        if (isSuperAdmin) {
          const data = await superAdminApi.getAlerts();
          if (isMounted) setAlerts(data || []);
        } else if (isSubAdmin) {
          const data = await subAdminApi.getAlerts();
          if (isMounted) setAlerts(data || []);
        }
      } catch (err) {
        console.warn('Alert polling status check:', err);
      }
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [user, isSuperAdmin, isSubAdmin]);

  const unreadAlertsCount = alerts.filter((a) => !a.reviewed).length;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleRoleSwitch = async (
    roleKey: 'SUPER_ADMIN' | 'SUB_ADMIN_1' | 'SUB_ADMIN_2' | 'EMPLOYEE'
  ) => {
    setIsSwitchRoleOpen(false);
    await switchRoleDemo(roleKey);
    if (roleKey === 'SUPER_ADMIN') {
      navigate('/super-admin/overview');
    } else if (roleKey === 'EMPLOYEE') {
      navigate('/employee/dashboard');
    } else {
      navigate('/admin/overview');
    }
  };

  interface NavItem {
    label: string;
    path: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  }

  // Super Admin Navigation Items
  const superAdminNav: NavItem[] = [
    { label: 'Overview', path: '/super-admin/overview', icon: LayoutDashboard },
    { label: 'Users & Roles', path: '/super-admin/users', icon: Users },
    { label: 'Sub-Admin Management', path: '/super-admin/sub-admins', icon: UserCheck },
    { label: 'Employee Management', path: '/super-admin/employees', icon: Briefcase },
    { label: 'Attendance', path: '/super-admin/attendance', icon: CalendarCheck },
    { label: 'Financial Overview', path: '/super-admin/finance', icon: BadgeDollarSign },
    { label: 'Reports & Exports', path: '/super-admin/reports', icon: FileSpreadsheet },
    { label: 'Audit Logs', path: '/super-admin/audit-logs', icon: ScrollText },
    { label: 'Alerts', path: '/super-admin/alerts', icon: Bell, badge: unreadAlertsCount },
    { label: 'System Settings', path: '/super-admin/settings', icon: Settings },
    { label: 'Profile', path: '/super-admin/profile', icon: UserCircle },
  ];

  // Sub-Admin Navigation Items
  const subAdminNav: NavItem[] = [
    { label: 'Overview', path: '/admin/overview', icon: LayoutDashboard },
    { label: 'Employees', path: '/admin/employees', icon: Briefcase },
    { label: 'Punch History', path: '/admin/punches', icon: Clock },
    { label: 'Entry Management', path: '/admin/entries', icon: CheckCircle2 },
    { label: 'Money & Balance', path: '/admin/money', icon: DollarSign },
    { label: 'Employee Update History', path: '/admin/updates', icon: History },
    { label: 'Alerts', path: '/admin/alerts', icon: Bell, badge: unreadAlertsCount },
    { label: 'Reports', path: '/admin/reports', icon: FileSpreadsheet },
    { label: 'Profile', path: '/admin/profile', icon: UserCircle },
  ];

  // Employee Self-Service Navigation Items
  const employeeNav: NavItem[] = [
    { label: 'Dashboard', path: '/employee/dashboard', icon: LayoutDashboard },
    { label: 'My Attendance', path: '/employee/attendance', icon: CalendarCheck },
    { label: 'Financial Info', path: '/employee/finance', icon: BadgeDollarSign },
    { label: 'Entry Submissions', path: '/employee/entries', icon: CheckCircle2 },
    { label: 'My Profile', path: '/employee/profile', icon: UserCircle },
  ];

  const currentNav: NavItem[] = isSuperAdmin ? superAdminNav : isEmployee ? employeeNav : subAdminNav;

  return (
    <div className="min-h-screen bg-[#F5F1EB] flex flex-col md:flex-row font-sans text-[#2D2526] antialiased selection:bg-[#880E23]/20 selection:text-[#540A17]">
      {/* ========================================================= */}
      {/* DEEP MATTE CRIMSON & WINE SIDEBAR (Matching Exact Color Combo) */}
      {/* ========================================================= */}
      <aside
        className={`fixed md:sticky top-0 z-40 h-screen transition-all duration-300 ease-in-out shrink-0 ${
          isSidebarOpen ? 'w-64' : 'w-20'
        } ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} bg-[#2D040A] border-r border-[#440712] flex flex-col shadow-xl`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#440712]">
          <div className="flex items-center gap-3 overflow-hidden">
            {isSidebarOpen ? (
              <div className="truncate">
                <span className="font-extrabold text-white tracking-tight text-sm block leading-none">
                  WORKFORCE<span className="text-[#E66176]">·PRO</span>
                </span>
                <span className="text-[10px] text-[#C8BDAA] font-medium tracking-wider uppercase block mt-1">
                  Enterprise Platform
                </span>
              </div>
            ) : (
              <span className="font-black text-[#E66176] tracking-wider text-xs">WP</span>
            )}
          </div>

          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="hidden md:flex p-1.5 rounded-lg text-[#C8BDAA] hover:text-white hover:bg-[#440712] transition-colors"
            title="Toggle Sidebar"
          >
            <ArrowRightLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-[#C8BDAA] hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Badge Indicator */}
        {isSidebarOpen && (
          <div className="px-4 py-3 border-b border-[#440712] bg-[#220206]/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isSuperAdmin ? 'bg-[#E66176] animate-pulse' : 'bg-[#F29CA9] animate-pulse'
                  }`}
                />
                <span className="text-[11px] font-bold text-[#EBE5DB] uppercase tracking-wider">
                  {user?.role.replace('_', ' ')}
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#D5CDBD] bg-[#440712] px-1.5 py-0.5 rounded">
                v2.4
              </span>
            </div>
            {user?.region && (
              <p className="text-[11px] text-[#C8BDAA] truncate mt-1 flex items-center gap-1">
                <Building2 className="w-3 h-3 text-[#A89B85] shrink-0" />
                {user.region}
              </p>
            )}
          </div>
        )}

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1 scrollbar-thin scrollbar-thumb-[#440712]">
          {currentNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all group relative ${
                    isActive
                      ? 'bg-[#540A17] text-[#FDF2F4] border-l-3 border-[#E66176] font-semibold shadow-xs'
                      : 'text-[#D5CDBD] hover:text-white hover:bg-[#3D060F]'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-105" />
                {isSidebarOpen && <span className="truncate flex-1">{item.label}</span>}
                {isSidebarOpen && item.badge !== undefined && item.badge > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-[#880E23] text-white shrink-0 border border-[#A81730]">
                    {item.badge}
                  </span>
                )}
                {!isSidebarOpen && (
                  <div className="absolute left-full ml-2 px-2.5 py-1 bg-[#2D040A] border border-[#440712] text-white text-xs rounded shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50">
                    {item.label}
                  </div>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User Card & Logout in Sidebar */}
        <div className="p-3 border-t border-[#440712] bg-[#220206]/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-[#540A17] text-[#FDF2F4] border border-[#6B081A] font-bold flex items-center justify-center text-xs shrink-0">
                {user?.name.charAt(0) || 'U'}
              </div>
              {isSidebarOpen && (
                <div className="truncate">
                  <p className="text-xs font-semibold text-[#FDF2F4] truncate leading-tight">{user?.name}</p>
                  <p className="text-[10px] text-[#C8BDAA] truncate">{user?.email}</p>
                </div>
              )}
            </div>
            {isSidebarOpen && (
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-md text-[#C8BDAA] hover:text-[#F8CAD1] hover:bg-[#3D060F] transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* MAIN CONTENT AREA */}
      {/* ========================================================= */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen bg-[#F5F1EB]">
        {/* Top Header Bar */}
        <header className="h-16 bg-[#FAF8F5] border-b border-[#E8E2D8] px-4 md:px-8 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-lg text-[#5A504E] hover:bg-[#EBE5DB]"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <h1 className="text-sm md:text-base font-bold text-[#2D2526] tracking-tight capitalize">
                {location.pathname.split('/').pop()?.replace(/-/g, ' ') || 'Dashboard'}
              </h1>
              <p className="text-[11px] text-[#74675B] hidden sm:block">
                {isSuperAdmin
                  ? 'Enterprise Global Master Administration'
                  : isEmployee
                  ? 'Employee Self-Service Portal'
                  : `Regional Hub Operations · ${user?.region || 'Assigned Zone'}`}
              </p>
            </div>
          </div>

          {/* Action Center: Role Switcher Demo, Alerts, Profile */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Quick Role Switcher Button for Instant Evaluation */}
            <div className="relative">
              <button
                onClick={() => setIsSwitchRoleOpen(!isSwitchRoleOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#E8E2D8] bg-[#FAF8F5] hover:bg-[#F5F1EB] text-xs font-semibold text-[#4E463A] transition-colors"
              >
                <ArrowRightLeft className="w-3.5 h-3.5 text-[#880E23]" />
                <span className="hidden sm:inline text-[#685E4E]">Role View:</span>
                <span className="font-bold text-[#880E23]">
                  {isSuperAdmin ? 'Super Admin' : user?.name.split(' ')[0]}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-[#A89B85]" />
              </button>

              {isSwitchRoleOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-[#FAF8F5] rounded-xl shadow-xl border border-[#E8E2D8] py-2 z-50 animate-in fade-in">
                  <div className="px-3 py-1.5 border-b border-[#EBE5DB] text-[10px] font-bold text-[#877A65] uppercase tracking-wider">
                    Fast Role Testing Switcher
                  </div>
                  <button
                    onClick={() => handleRoleSwitch('SUPER_ADMIN')}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-[#F5F1EB] flex items-center justify-between ${
                      isSuperAdmin ? 'bg-[#FDF2F4] font-bold text-[#780E21]' : 'text-[#4E463A]'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">Alexander Wright</div>
                      <div className="text-[10px] text-[#74675B]">Global SUPER_ADMIN</div>
                    </div>
                    {isSuperAdmin && <span className="w-2 h-2 rounded-full bg-[#880E23]" />}
                  </button>

                  <button
                    onClick={() => handleRoleSwitch('SUB_ADMIN_1')}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-[#F5F1EB] flex items-center justify-between ${
                      user?.email.includes('north') ? 'bg-[#FDF2F4] font-bold text-[#780E21]' : 'text-[#4E463A]'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">Sarah Jenkins</div>
                      <div className="text-[10px] text-[#74675B]">SUB_ADMIN · North Hub (5 emps)</div>
                    </div>
                    {user?.email.includes('north') && <span className="w-2 h-2 rounded-full bg-[#880E23]" />}
                  </button>

                  <button
                    onClick={() => handleRoleSwitch('SUB_ADMIN_2')}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-[#F5F1EB] flex items-center justify-between ${
                      user?.email.includes('south') ? 'bg-[#FDF2F4] font-bold text-[#780E21]' : 'text-[#4E463A]'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">Marcus Vance</div>
                      <div className="text-[10px] text-[#74675B]">SUB_ADMIN · South Region (4 emps)</div>
                    </div>
                    {user?.email.includes('south') && <span className="w-2 h-2 rounded-full bg-[#880E23]" />}
                  </button>

                  <button
                    onClick={() => handleRoleSwitch('EMPLOYEE')}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-[#F5F1EB] flex items-center justify-between border-t border-[#EBE5DB] ${
                      isEmployee ? 'bg-[#FDF2F4] font-bold text-[#780E21]' : 'text-[#4E463A]'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">Rajesh Kumar</div>
                      <div className="text-[10px] text-[#74675B]">EMPLOYEE · Self-Service Portal</div>
                    </div>
                    {isEmployee && <span className="w-2 h-2 rounded-full bg-[#880E23]" />}
                  </button>
                </div>
              )}
            </div>

            {/* Notification Bell Dropdown (Admin Only) */}
            {!isEmployee && (
            <div className="relative">
              <button
                onClick={() => setIsAlertsOpen(!isAlertsOpen)}
                className="relative p-2 rounded-lg text-[#685E4E] hover:text-[#2D2526] hover:bg-[#EBE5DB] transition-colors"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadAlertsCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#880E23] ring-2 ring-white" />
                )}
              </button>

              {isAlertsOpen && (
                <div className="absolute right-0 mt-2 w-80 md:w-96 bg-[#FAF8F5] rounded-xl shadow-xl border border-[#E8E2D8] overflow-hidden z-50 animate-in fade-in">
                  <div className="px-4 py-3 border-b border-[#EBE5DB] flex items-center justify-between bg-[#F5F1EB]">
                    <span className="font-bold text-[#2D2526] text-xs">
                      Active Operational Alerts ({unreadAlertsCount})
                    </span>
                    <button
                      onClick={() => {
                        setIsAlertsOpen(false);
                        navigate(isSuperAdmin ? '/super-admin/alerts' : '/admin/alerts');
                      }}
                      className="text-[11px] font-semibold text-[#880E23] hover:underline"
                    >
                      View All
                    </button>
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-[#EBE5DB]">
                    {alerts.length === 0 ? (
                      <div className="py-6 text-center text-xs text-[#877A65]">No active alerts.</div>
                    ) : (
                      alerts.slice(0, 4).map((alt) => (
                        <div key={alt.id} className="p-3 hover:bg-[#F5F1EB] transition-colors">
                          <div className="flex items-start gap-2">
                            <AlertTriangle
                              className={`w-4 h-4 mt-0.5 shrink-0 ${
                                alt.severity === 'CRITICAL' || alt.severity === 'HIGH'
                                  ? 'text-[#880E23]'
                                  : 'text-amber-600'
                              }`}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-xs text-[#2D2526] truncate">{alt.title}</p>
                              <p className="text-[11px] text-[#74675B] line-clamp-2 mt-0.5">
                                {alt.description}
                              </p>
                              <span className="text-[10px] text-[#877A65] block mt-1">
                                {new Date(alt.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            )}

            {/* User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[#EBE5DB] transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-[#880E23] text-white font-bold flex items-center justify-center text-xs shadow-xs">
                  {user?.name.charAt(0) || 'U'}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[#A89B85]" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-[#FAF8F5] rounded-xl shadow-xl border border-[#E8E2D8] py-1.5 z-50 animate-in fade-in">
                  <div className="px-3 py-2 border-b border-[#EBE5DB]">
                    <p className="text-xs font-bold text-[#2D2526]">{user?.name}</p>
                    <p className="text-[11px] text-[#74675B] truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      navigate(
                        isSuperAdmin
                          ? '/super-admin/profile'
                          : isEmployee
                          ? '/employee/profile'
                          : '/admin/profile'
                      );
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-[#4E463A] hover:bg-[#F5F1EB] flex items-center gap-2"
                  >
                    <UserCircle className="w-4 h-4 text-[#880E23]" /> Account Settings
                  </button>
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-[#880E23] hover:bg-[#FDF2F4] flex items-center gap-2 border-t border-[#EBE5DB]"
                  >
                    <LogOut className="w-4 h-4 text-[#880E23]" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page View Outlet */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
