import React from 'react';
import { X, MapPin, AlertTriangle, ShieldCheck, Navigation } from 'lucide-react';
import { AttendancePunch } from '../../types';

interface MapViewModalProps {
  punch: AttendancePunch | null;
  isOpen: boolean;
  onClose: () => void;
}

export const MapViewModal: React.FC<MapViewModalProps> = ({ punch, isOpen, onClose }) => {
  if (!isOpen || !punch) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-teal-600" />
            <h3 className="font-semibold text-slate-900 text-base">GPS Location Telemetry</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Map Canvas Visual Simulation */}
          <div className="relative w-full h-64 bg-slate-100 rounded-lg border border-slate-200 overflow-hidden flex items-center justify-center">
            {/* Grid background simulation */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  'radial-gradient(#0d9488 1.5px, transparent 1.5px), radial-gradient(#64748b 1.5px, #f8fafc 1.5px)',
                backgroundSize: '30px 30px',
                backgroundPosition: '0 0, 15px 15px',
              }}
            />

            {/* Simulated Road / Land lines */}
            <svg className="absolute inset-0 w-full h-full text-slate-300 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0,80 Q200,60 400,100 T800,90" fill="none" stroke="currentColor" strokeWidth="8" strokeOpacity="0.4" />
              <path d="M120,0 Q180,120 220,300" fill="none" stroke="currentColor" strokeWidth="6" strokeOpacity="0.4" />
              <path d="M380,0 Q340,160 360,300" fill="none" stroke="currentColor" strokeWidth="5" strokeOpacity="0.3" />
            </svg>

            {/* Geofence Perimeter Circle */}
            <div className="absolute w-44 h-44 rounded-full border-2 border-dashed border-teal-500/70 bg-teal-500/10 flex items-center justify-center">
              <span className="text-[10px] font-semibold text-teal-700 bg-teal-50/90 px-2 py-0.5 rounded shadow-xs">
                Allowed Geofence (500m)
              </span>
            </div>

            {/* Center Designated Pin */}
            <div className="absolute flex flex-col items-center">
              <div className="w-3 h-3 bg-teal-600 rounded-full ring-4 ring-teal-200" />
              <span className="mt-1 text-[11px] font-bold text-teal-900 bg-white/90 px-1.5 py-0.5 rounded border border-teal-200 shadow-xs">
                Hub Perimeter
              </span>
            </div>

            {/* Punch Location Marker */}
            <div
              className={`absolute flex flex-col items-center transition-all ${
                punch.isLocationDiscrepancy ? 'translate-x-24 -translate-y-16' : 'translate-x-4 translate-y-3'
              }`}
            >
              <div
                className={`p-2 rounded-full shadow-lg ${
                  punch.isLocationDiscrepancy
                    ? 'bg-rose-600 text-white animate-bounce ring-4 ring-rose-200'
                    : 'bg-emerald-600 text-white ring-4 ring-emerald-200'
                }`}
              >
                <Navigation className="w-4 h-4" />
              </div>
              <span
                className={`mt-1 text-[11px] font-bold px-2 py-0.5 rounded shadow-xs border ${
                  punch.isLocationDiscrepancy
                    ? 'bg-rose-50 text-rose-800 border-rose-300'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                }`}
              >
                {punch.employeeName} ({punch.punchType})
              </span>
            </div>

            <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-xs text-xs px-2.5 py-1 rounded border border-slate-200 text-slate-700 font-mono shadow-xs">
              GPS: {punch.latitude.toFixed(4)}, {punch.longitude.toFixed(4)} (±{punch.accuracyMeters}m)
            </div>
          </div>

          {/* Location Discrepancy Alert Banner */}
          {punch.isLocationDiscrepancy ? (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-rose-900">Geofence Perimeter Discrepancy Detected</p>
                <p className="text-xs text-rose-700 mt-0.5">
                  The employee punched outside the authorized 500m geofence radius. This punch was automatically flagged for Sub-Admin review.
                </p>
                {punch.notes && <p className="text-xs font-mono text-rose-800 mt-1">{punch.notes}</p>}
              </div>
            </div>
          ) : (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-emerald-900">Verified Within Geofence</p>
                <p className="text-xs text-emerald-700 mt-0.5">
                  GPS coordinates verified within the designated work perimeter with high telemetry precision.
                </p>
              </div>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 block mb-0.5">Employee Name</span>
              <span className="font-semibold text-slate-800 text-sm">{punch.employeeName}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 block mb-0.5">Punch Timestamp</span>
              <span className="font-semibold text-slate-800 text-sm">
                {punch.date} at {punch.time}
              </span>
            </div>
            <div className="col-span-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 block mb-0.5">Registered Physical Address</span>
              <span className="font-medium text-slate-800">{punch.address}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-medium rounded-lg transition-colors"
          >
            Close Map Telemetry
          </button>
        </div>
      </div>
    </div>
  );
};
