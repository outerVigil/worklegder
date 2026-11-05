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
  const { user, isSuperAdmin, isSubAdmin, logout, switchRoleDemo } = useAuth();
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
    const fetchAlerts = async () => {
      try {
        if (isSuperAdmin) {
          const data = await superAdminApi.getAlerts();
          setAlerts(data);
        } else if (isSubAdmin) {
          const data = await subAdminApi.getAlerts();
          setAlerts(data);
        }
      } catch (err) {
        console.error('Failed to fetch alerts:', err);
      }
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, [isSuperAdmin, isSubAdmin]);

  const unreadAlertsCount = alerts.filter((a) => !a.reviewed).length;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleRoleSwitch = async (roleKey: 'SUPER_ADMIN' | 'SUB_ADMIN_1' | 'SUB_ADMIN_2') => {
    setIsSwitchRoleOpen(false);
    await switchRoleDemo(roleKey);
    if (roleKey === 'SUPER_ADMIN') {
      navigate('/super-admin/overview');
    } else {
      navigate('/admin/overview');
    }
  };

  // Super Admin Navigation Items
  const superAdminNav = [
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
  const subAdminNav = [
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

  const currentNav = isSuperAdmin ? superAdminNav : subAdminNav;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-800 antialiased selection:bg-teal-500/20">
      {/* ========================================================= */}
      {/* DARK NAVY SIDEBAR (Executive Enterprise SaaS Theme) */}
      {/* ========================================================= */}
      <aside
        className={`fixed md:sticky top-0 z-40 h-screen transition-all duration-300 ease-in-out shrink-0 ${
          isSidebarOpen ? 'w-64' : 'w-20'
        } ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} bg-[#0F172A] border-r border-slate-800 flex flex-col shadow-xl`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-lg bg-teal-500 text-slate-950 font-black flex items-center justify-center shrink-0 shadow-sm">
              <ShieldCheck className="w-5 h-5 text-slate-950" />
            </div>
            {isSidebarOpen && (
              <div className="truncate">
                <span className="font-extrabold text-white tracking-tight text-sm block leading-none">
                  WORKFORCE<span className="text-teal-400">·PRO</span>
                </span>
                <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase block mt-1">
                  Enterprise Platform
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
            title="Toggle Sidebar"
          >
            <ArrowRightLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Badge Indicator */}
        {isSidebarOpen && (
          <div className="px-4 py-3 border-b border-slate-800/60 bg-slate-900/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isSuperAdmin ? 'bg-indigo-400 animate-pulse' : 'bg-teal-400 animate-pulse'
                  }`}
                />
                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  {user?.role.replace('_', ' ')}
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                v2.4
              </span>
            </div>
            {user?.region && (
              <p className="text-[11px] text-slate-400 truncate mt-1 flex items-center gap-1">
                <Building2 className="w-3 h-3 text-slate-500 shrink-0" />
                {user.region}
              </p>
            )}
          </div>
        )}

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
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
                      ? 'bg-teal-500/15 text-teal-400 border-l-3 border-teal-400 font-semibold shadow-xs'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-105" />
                {isSidebarOpen && <span className="truncate flex-1">{item.label}</span>}
                {isSidebarOpen && item.badge !== undefined && item.badge > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-rose-500/90 text-white shrink-0">
                    {item.badge}
                  </span>
                )}
                {!isSidebarOpen && (
                  <div className="absolute left-full ml-2 px-2.5 py-1 bg-slate-900 text-white text-xs rounded shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50">
                    {item.label}
                  </div>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User Card & Logout in Sidebar */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-200 border border-slate-700 font-bold flex items-center justify-center text-xs shrink-0">
                {user?.name.charAt(0) || 'U'}
              </div>
              {isSidebarOpen && (
                <div className="truncate">
                  <p className="text-xs font-semibold text-slate-200 truncate leading-tight">{user?.name}</p>
                  <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
                </div>
              )}
            </div>
            {isSidebarOpen && (
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-md text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
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
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-4 md:px-8 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <h1 className="text-sm md:text-base font-bold text-slate-900 tracking-tight capitalize">
                {location.pathname.split('/').pop()?.replace(/-/g, ' ') || 'Dashboard'}
              </h1>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                {isSuperAdmin
                  ? 'Enterprise Global Master Administration'
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
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors"
              >
                <ArrowRightLeft className="w-3.5 h-3.5 text-teal-600" />
                <span className="hidden sm:inline">Role View:</span>
                <span className="font-bold text-teal-700">
                  {isSuperAdmin ? 'Super Admin' : user?.name.split(' ')[0]}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isSwitchRoleOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in">
                  <div className="px-3 py-1.5 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Fast Role Testing Switcher
                  </div>
                  <button
                    onClick={() => handleRoleSwitch('SUPER_ADMIN')}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center justify-between ${
                      isSuperAdmin ? 'bg-teal-50/60 font-bold text-teal-900' : 'text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">Alexander Wright</div>
                      <div className="text-[10px] text-slate-400">Global SUPER_ADMIN</div>
                    </div>
                    {isSuperAdmin && <span className="w-2 h-2 rounded-full bg-teal-500" />}
                  </button>

                  <button
                    onClick={() => handleRoleSwitch('SUB_ADMIN_1')}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center justify-between ${
                      user?.email.includes('north') ? 'bg-teal-50/60 font-bold text-teal-900' : 'text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">Sarah Jenkins</div>
                      <div className="text-[10px] text-slate-400">SUB_ADMIN · North Hub (5 emps)</div>
                    </div>
                    {user?.email.includes('north') && <span className="w-2 h-2 rounded-full bg-teal-500" />}
                  </button>

                  <button
                    onClick={() => handleRoleSwitch('SUB_ADMIN_2')}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center justify-between ${
                      user?.email.includes('south') ? 'bg-teal-50/60 font-bold text-teal-900' : 'text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">Marcus Vance</div>
                      <div className="text-[10px] text-slate-400">SUB_ADMIN · South Region (4 emps)</div>
                    </div>
                    {user?.email.includes('south') && <span className="w-2 h-2 rounded-full bg-teal-500" />}
                  </button>
                </div>
              )}
            </div>

            {/* Notification Bell Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsAlertsOpen(!isAlertsOpen)}
                className="relative p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadAlertsCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
                )}
              </button>

              {isAlertsOpen && (
                <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in fade-in">
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <span className="font-bold text-slate-900 text-xs">
                      Active Operational Alerts ({unreadAlertsCount})
                    </span>
                    <button
                      onClick={() => {
                        setIsAlertsOpen(false);
                        navigate(isSuperAdmin ? '/super-admin/alerts' : '/admin/alerts');
                      }}
                      className="text-[11px] font-semibold text-teal-600 hover:underline"
                    >
                      View All
                    </button>
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {alerts.length === 0 ? (
                      <div className="py-6 text-center text-xs text-slate-400">No active alerts.</div>
                    ) : (
                      alerts.slice(0, 4).map((alt) => (
                        <div key={alt.id} className="p-3 hover:bg-slate-50 transition-colors">
                          <div className="flex items-start gap-2">
                            <AlertTriangle
                              className={`w-4 h-4 mt-0.5 shrink-0 ${
                                alt.severity === 'CRITICAL' || alt.severity === 'HIGH'
                                  ? 'text-rose-500'
                                  : 'text-amber-500'
                              }`}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-xs text-slate-900 truncate">{alt.title}</p>
                              <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                                {alt.description}
                              </p>
                              <span className="text-[10px] text-slate-400 block mt-1">
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

            {/* User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                  {user?.name.charAt(0) || 'U'}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900">{user?.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      navigate(isSuperAdmin ? '/super-admin/profile' : '/admin/profile');
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <UserCircle className="w-4 h-4 text-slate-400" /> Account Settings
                  </button>
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 border-t border-slate-100"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" /> Sign Out
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
