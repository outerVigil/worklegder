import React, { useState, useEffect } from 'react';
import { UserCircle, Building2, Eye, EyeOff, Save, CheckCircle2 } from 'lucide-react';
import { employeeApi } from '../../services/api';
import { EmployeeProfile as EmployeeProfileType } from '../../types';

export const EmployeeProfile: React.FC = () => {
  const [employee, setEmployee] = useState<EmployeeProfileType | null>(null);
  const [phone, setPhone] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [showAccount, setShowAccount] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const emp = await employeeApi.getMyProfile();
        setEmployee(emp);
        setPhone(emp.phone);
        setBankName(emp.bankName);
        setBankAccountNumber(emp.bankAccountNumber);
        setIfscCode(emp.ifscCode);
      } catch (err) {
        console.error('Failed to load employee profile:', err);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedMsg(null);
    try {
      const updated = await employeeApi.updateProfile({
        phone,
        bankName,
        bankAccountNumber,
        ifscCode,
      });
      setEmployee((prev) => (prev ? { ...prev, ...updated } : updated));
      setSavedMsg('Profile & bank details updated. Changes logged for Sub-Admin verification.');
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !employee) {
    return <div className="p-8 text-center text-xs text-slate-400">Loading profile...</div>;
  }

  const maskedAccount =
    bankAccountNumber.length > 4
      ? `${'•'.repeat(bankAccountNumber.length - 4)}${bankAccountNumber.slice(-4)}`
      : bankAccountNumber;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">My Employee Profile &amp; Bank Details</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          View your assigned hub details and update your contact or settlement bank account.
        </p>
      </div>

      {/* Identity Overview Card */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-4 pb-5 border-b border-slate-100">
          <div className="w-14 h-14 rounded-2xl bg-teal-600 text-white font-extrabold flex items-center justify-center text-xl shadow-xs">
            {employee.name.charAt(0)}
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">{employee.name}</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              <span className="font-mono font-semibold text-teal-700">{employee.employeeCode}</span> ·{' '}
              {employee.email}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-slate-500 block mb-0.5">Assigned Hub Supervisor</span>
            <span className="font-semibold text-slate-800">{employee.subAdminName}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-slate-500 block mb-0.5">Assigned Geofence Location</span>
            <span className="font-semibold text-slate-800">{employee.assignedLocation.name}</span>
          </div>
        </div>
      </div>

      {/* Editable Contact & Bank Form */}
      <form
        onSubmit={handleSave}
        className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs space-y-4 text-xs"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-teal-600" />
            <h3 className="font-bold text-slate-900 text-sm">Contact &amp; Settlement Bank Information</h3>
          </div>
          <button
            type="button"
            onClick={() => setShowAccount(!showAccount)}
            className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 font-semibold"
          >
            {showAccount ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            {showAccount ? 'Mask Account' : 'Unmask Account'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Mobile Phone</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Bank Name</label>
            <input
              type="text"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Bank Account Number</label>
            <input
              type="text"
              value={showAccount ? bankAccountNumber : maskedAccount}
              onChange={(e) => {
                if (showAccount) setBankAccountNumber(e.target.value);
              }}
              readOnly={!showAccount}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">IFSC Code</label>
            <input
              type="text"
              value={ifscCode}
              onChange={(e) => setIfscCode(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
            />
          </div>
        </div>

        {savedMsg && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            {savedMsg}
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg shadow-xs transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};
