import React, { useState, useEffect } from 'react';
import { Settings, Shield, MapPin, Clock, DollarSign, Bell, Save, Check } from 'lucide-react';
import { superAdminApi } from '../../services/api';

export const SystemSettings: React.FC = () => {
  const [geofenceRadius, setGeofenceRadius] = useState(500);
  const [autoCheckoutHours, setAutoCheckoutHours] = useState(10);
  const [maxWithdrawalLimit, setMaxWithdrawalLimit] = useState(25000);
  const [telemetryIntervalMinutes, setTelemetryIntervalMinutes] = useState(15);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    superAdminApi
      .getSettings()
      .then((s) => {
        if (s) {
          setGeofenceRadius(s.geofenceRadius);
          setAutoCheckoutHours(s.autoCheckoutHours);
          setMaxWithdrawalLimit(s.maxWithdrawalLimit);
          setTelemetryIntervalMinutes(s.telemetryIntervalMinutes);
        }
      })
      .catch(() => {});
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await superAdminApi.updateSettings({
        geofenceRadius,
        autoCheckoutHours,
        maxWithdrawalLimit,
        telemetryIntervalMinutes,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Failed to save settings:', err);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">System &amp; Security Settings</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure enterprise platform policies, geofence radius tolerances, and financial validation triggers.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Geofence Configuration Card */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="p-2 bg-teal-50 text-teal-700 rounded-lg">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">GPS Geofencing Tolerances</h3>
              <p className="text-xs text-slate-500">
                Punches registered beyond this radius from the assigned hub perimeter will raise security alerts.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Authorized Geofence Radius (Meters)
              </label>
              <input
                type="number"
                value={geofenceRadius}
                onChange={(e) => setGeofenceRadius(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Default standard: 500 meters</span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Telemetry Background Location Interval
              </label>
              <select
                value={telemetryIntervalMinutes}
                onChange={(e) => setTelemetryIntervalMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
              >
                <option value={5}>Every 5 minutes (High accuracy)</option>
                <option value={15}>Every 15 minutes (Standard balance)</option>
                <option value={30}>Every 30 minutes (Battery saving)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Shift & Attendance Policies */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="p-2 bg-amber-50 text-amber-700 rounded-lg">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Shift Auto-Checkout Policy</h3>
              <p className="text-xs text-slate-500">
                Prevent stale active shifts when field employees forget to punch out.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Maximum Shift Duration Before Auto-Checkout Flag (Hours)
              </label>
              <input
                type="number"
                value={autoCheckoutHours}
                onChange={(e) => setAutoCheckoutHours(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Flagged as MISSING_CHECKOUT after {autoCheckoutHours} hours
              </span>
            </div>
          </div>
        </div>

        {/* Financial Rules */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Financial Verification Limits</h3>
              <p className="text-xs text-slate-500">
                Single-transaction limits requiring multi-tier Sub-Admin authorization.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Single Claim Maximum Withdrawal Limit (INR)
              </label>
              <input
                type="number"
                value={maxWithdrawalLimit}
                onChange={(e) => setMaxWithdrawalLimit(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Entries above ₹{maxWithdrawalLimit.toLocaleString()} trigger high-severity alert
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-lg shadow-sm transition-colors"
          >
            {saved ? (
              <>
                <Check className="w-4 h-4 text-white" /> Settings Saved!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save System Policies
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
