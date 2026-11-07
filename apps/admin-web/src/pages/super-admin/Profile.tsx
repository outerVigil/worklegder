import React, { useState } from 'react';
import { UserCircle, Shield, Key, Mail, Phone, Building, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../services/api';

export const Profile: React.FC = () => {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }
    try {
      await authApi.updatePassword(currentPassword, newPassword);
      setPasswordSaved(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSaved(false), 2500);
    } catch (err: any) {
      setPasswordError(err?.response?.data?.message || 'Failed to update password.');
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Administrator Account &amp; Security Profile</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          View your session credentials and cryptographic authentication settings.
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-[#E8E2D8]">
          <div className="w-16 h-16 rounded-2xl bg-[#880E23] text-white font-extrabold flex items-center justify-center text-2xl shadow-sm">
            {user?.name.charAt(0)}
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#2D2526]">{user?.name}</h3>
            <p className="text-xs text-[#74675B] flex items-center gap-1.5 mt-0.5">
              <span className="font-semibold text-[#880E23] bg-[#FDF2F4] px-2 py-0.5 rounded border border-[#F8CAD1]">
                {user?.role.replace('_', ' ')}
              </span>
              <span>·</span>
              <span>{user?.region || 'Global Headquarters'}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-slate-500 block mb-0.5">Work Email</span>
            <span className="font-semibold text-slate-800">{user?.email}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-slate-500 block mb-0.5">Phone Contact</span>
            <span className="font-semibold text-slate-800">{user?.phone || 'Configured via SSO'}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-slate-500 block mb-0.5">Security Clearance</span>
            <span className="font-semibold text-slate-800">Level 4 Full Root Authority</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-slate-500 block mb-0.5">Multi-Factor Authentication</span>
            <span className="font-semibold text-emerald-700">Enforced &amp; Active</span>
          </div>
        </div>
      </div>

      {/* Password Change Card */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <Key className="w-5 h-5 text-teal-600" />
          <h3 className="font-bold text-slate-900 text-sm">Update Access Credentials</h3>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Current Password</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            {passwordSaved ? (
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <Check className="w-4 h-4" /> Password successfully updated!
              </span>
            ) : passwordError ? (
              <span className="text-rose-600 font-semibold">{passwordError}</span>
            ) : (
              <span />
            )}

            <button
              type="submit"
              className="px-5 py-2 bg-[#880E23] hover:bg-[#6B081A] text-white font-semibold rounded-lg shadow-xs transition-colors"
            >
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
