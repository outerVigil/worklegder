import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, AlertCircle, ArrowRight, Smartphone } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('superadmin@enterprise.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'SUPER_ADMIN') {
        navigate('/super-admin/overview');
      } else if (user.role === 'SUB_ADMIN') {
        navigate('/admin/overview');
      } else if (user.role === 'EMPLOYEE') {
        navigate('/employee/dashboard');
      }
    } catch (err: any) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Login failed. Please verify your credentials and network connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  const setDemoCredentials = (role: 'SUPER_ADMIN' | 'SUB_ADMIN_1' | 'SUB_ADMIN_2' | 'EMPLOYEE') => {
    setError(null);
    if (role === 'SUPER_ADMIN') {
      setEmail('superadmin@enterprise.com');
      setPassword('password123');
    } else if (role === 'SUB_ADMIN_1') {
      setEmail('subadmin.north@enterprise.com');
      setPassword('password123');
    } else if (role === 'SUB_ADMIN_2') {
      setEmail('subadmin.south@enterprise.com');
      setPassword('password123');
    } else if (role === 'EMPLOYEE') {
      setEmail('employee@enterprise.com');
      setPassword('password123');
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-teal-500/20">
      {/* Background visual styling */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#0d9488 1.5px, transparent 1.5px), radial-gradient(#38bdf8 1.5px, transparent 1.5px)',
          backgroundSize: '40px 40px',
          backgroundPosition: '0 0, 20px 20px',
        }}
      />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <h2 className="text-2xl font-extrabold tracking-tight text-white">
          Workforce &amp; Financial Management
        </h2>
        <p className="mt-2 text-center text-xs text-slate-400">
          Executive Super Admin &amp; Sub-Admin Operational Web Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-white py-8 px-6 shadow-2xl rounded-2xl border border-slate-100 sm:px-10">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3 animate-in fade-in">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Authentication Failure</p>
                <p className="mt-0.5 leading-relaxed">{error}</p>
              </div>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Administrator Email Address
              </label>
              <div className="mt-1.5 relative rounded-lg shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@enterprise.com"
                  className="block w-full pl-10 pr-3 py-2.5 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Security Password
              </label>
              <div className="mt-1.5 relative rounded-lg shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="block w-full pl-10 pr-3 py-2.5 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center text-slate-600">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded text-teal-600 focus:ring-teal-500 border-slate-300 w-3.5 h-3.5"
                />
                <span className="ml-2">Remember authorized device</span>
              </label>
              <a href="#reset" onClick={(e) => { e.preventDefault(); alert('Please contact the IT Security Officer or Super Administrator to initiate a cryptographic password reset.'); }} className="text-teal-600 hover:text-teal-700 font-semibold">
                Forgot password?
              </a>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors disabled:opacity-50"
              >
                {loading ? 'Authenticating Credentials...' : 'Sign In to Admin Portal'}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </form>

          {/* Quick Demo Credentials Selection Box */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center mb-3">
              One-Click Role Demonstration
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDemoCredentials('SUPER_ADMIN')}
                className="p-2 text-left bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
              >
                <div className="text-[11px] font-bold text-indigo-900">Super Admin</div>
                <div className="text-[10px] text-slate-500 truncate">Alexander Wright</div>
              </button>

              <button
                type="button"
                onClick={() => setDemoCredentials('SUB_ADMIN_1')}
                className="p-2 text-left bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
              >
                <div className="text-[11px] font-bold text-teal-900">Sub-Admin North</div>
                <div className="text-[10px] text-slate-500 truncate">Sarah Jenkins (5 emps)</div>
              </button>

              <button
                type="button"
                onClick={() => setDemoCredentials('SUB_ADMIN_2')}
                className="p-2 text-left bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
              >
                <div className="text-[11px] font-bold text-teal-900">Sub-Admin South</div>
                <div className="text-[10px] text-slate-500 truncate">Marcus Vance (4 emps)</div>
              </button>

              <button
                type="button"
                onClick={() => setDemoCredentials('EMPLOYEE')}
                className="p-2 text-left bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
              >
                <div className="text-[11px] font-bold text-sky-900 flex items-center gap-1">
                  <Smartphone className="w-3 h-3" /> Field Employee
                </div>
                <div className="text-[10px] text-slate-500 truncate">Rajesh Kumar (North)</div>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-slate-500">
            Protected under Role-Based Access Control (RBAC) &amp; ISO 27001 Security Standard
          </p>
        </div>
      </div>
    </div>
  );
};
