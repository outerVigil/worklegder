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
    <div className="min-h-screen bg-[#F5F1EB] flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-[#880E23]/20 selection:text-[#540A17] relative">
      {/* Background visual styling: subtle warm beige texture with matte crimson radial accents */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#880E23 1px, transparent 1px), radial-gradient(#C8BDAA 1px, transparent 1px)',
          backgroundSize: '36px 36px',
          backgroundPosition: '0 0, 18px 18px',
        }}
      />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#880E23] text-white font-black text-xl mb-3 shadow-md border border-[#6B081A]">
          W
        </div>
        <h2 className="text-2xl font-extrabold tracking-tight text-[#3B030B]">
          Workforce &amp; Financial Management
        </h2>
        <p className="mt-1.5 text-center text-xs text-[#74675B] font-medium">
          Executive Super Admin, Sub-Admin &amp; Employee Operations
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-[#E8E2D8] sm:px-10">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-[#FDF2F4] border border-[#F8CAD1] text-[#780E21] text-xs flex items-start gap-3 animate-in fade-in">
              <AlertCircle className="w-5 h-5 text-[#880E23] shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Authentication Failure</p>
                <p className="mt-0.5 leading-relaxed">{error}</p>
              </div>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold text-[#4E463A] uppercase tracking-wider">
                Account Email Address
              </label>
              <div className="mt-1.5 relative rounded-lg shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#A89B85]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@enterprise.com"
                  className="block w-full pl-10 pr-3 py-2.5 text-xs text-[#2D2526] bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#880E23] focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#4E463A] uppercase tracking-wider">
                Security Password
              </label>
              <div className="mt-1.5 relative rounded-lg shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#A89B85]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="block w-full pl-10 pr-3 py-2.5 text-xs text-[#2D2526] bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#880E23] focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center text-[#685E4E] cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded text-[#880E23] focus:ring-[#880E23] border-[#DDD5C7] w-3.5 h-3.5"
                />
                <span className="ml-2 font-medium">Remember authorized device</span>
              </label>
              <a
                href="#reset"
                onClick={(e) => {
                  e.preventDefault();
                  alert('Please contact the IT Security Officer or Super Administrator to initiate a cryptographic password reset.');
                }}
                className="text-[#880E23] hover:text-[#6B081A] font-semibold"
              >
                Forgot password?
              </a>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-xs font-bold text-white bg-[#880E23] hover:bg-[#6B081A] active:bg-[#4E0512] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#880E23] transition-colors disabled:opacity-50"
              >
                {loading ? 'Authenticating Credentials...' : 'Sign In to Operations Portal'}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </form>

          {/* Quick Demo Credentials Selection Box */}
          <div className="mt-6 pt-6 border-t border-[#EBE5DB]">
            <p className="text-[11px] font-bold text-[#877A65] uppercase tracking-wider text-center mb-3">
              One-Click Role Demonstration
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDemoCredentials('SUPER_ADMIN')}
                className="p-2 text-left bg-[#FAF8F5] hover:bg-[#F5F1EB] border border-[#EBE5DB] rounded-lg transition-colors group"
              >
                <div className="text-[11px] font-bold text-[#880E23] group-hover:text-[#6B081A]">Super Admin</div>
                <div className="text-[10px] text-[#74675B] truncate">Alexander Wright</div>
              </button>

              <button
                type="button"
                onClick={() => setDemoCredentials('SUB_ADMIN_1')}
                className="p-2 text-left bg-[#FAF8F5] hover:bg-[#F5F1EB] border border-[#EBE5DB] rounded-lg transition-colors group"
              >
                <div className="text-[11px] font-bold text-[#880E23] group-hover:text-[#6B081A]">Sub-Admin North</div>
                <div className="text-[10px] text-[#74675B] truncate">Sarah Jenkins (5 emps)</div>
              </button>

              <button
                type="button"
                onClick={() => setDemoCredentials('SUB_ADMIN_2')}
                className="p-2 text-left bg-[#FAF8F5] hover:bg-[#F5F1EB] border border-[#EBE5DB] rounded-lg transition-colors group"
              >
                <div className="text-[11px] font-bold text-[#880E23] group-hover:text-[#6B081A]">Sub-Admin South</div>
                <div className="text-[10px] text-[#74675B] truncate">Marcus Vance (4 emps)</div>
              </button>

              <button
                type="button"
                onClick={() => setDemoCredentials('EMPLOYEE')}
                className="p-2 text-left bg-[#FAF8F5] hover:bg-[#F5F1EB] border border-[#EBE5DB] rounded-lg transition-colors group"
              >
                <div className="text-[11px] font-bold text-[#880E23] group-hover:text-[#6B081A] flex items-center gap-1">
                  <Smartphone className="w-3 h-3 text-[#880E23]" /> Field Employee
                </div>
                <div className="text-[10px] text-[#74675B] truncate">Rajesh Kumar (North)</div>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-[#877A65]">
            Protected under Role-Based Access Control (RBAC) &amp; ISO 27001 Security Standard
          </p>
        </div>
      </div>
    </div>
  );
};
