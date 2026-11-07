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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2D040A]/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl border border-[#E8E2D8] w-full max-w-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E8E2D8] flex items-center justify-between bg-[#FAF8F5]">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#880E23]" />
            <h3 className="font-semibold text-[#2D2526] text-base">GPS Location Telemetry</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[#A89B85] hover:text-[#2D2526] hover:bg-[#FAF8F5] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Map Canvas Visual Simulation */}
          <div className="relative w-full h-64 bg-[#F5F1EB] rounded-lg border border-[#E8E2D8] overflow-hidden flex items-center justify-center">
            {/* Grid background simulation */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  'radial-gradient(#880E23 1.5px, transparent 1.5px), radial-gradient(#A89B85 1.5px, #FAF8F5 1.5px)',
                backgroundSize: '30px 30px',
                backgroundPosition: '0 0, 15px 15px',
              }}
            />

            {/* Simulated Road / Land lines */}
            <svg className="absolute inset-0 w-full h-full text-[#DDD5C7] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0,80 Q200,60 400,100 T800,90" fill="none" stroke="currentColor" strokeWidth="8" strokeOpacity="0.4" />
              <path d="M120,0 Q180,120 220,300" fill="none" stroke="currentColor" strokeWidth="6" strokeOpacity="0.4" />
              <path d="M380,0 Q340,160 360,300" fill="none" stroke="currentColor" strokeWidth="5" strokeOpacity="0.3" />
            </svg>

            {/* Geofence Perimeter Circle */}
            <div className="absolute w-44 h-44 rounded-full border-2 border-dashed border-[#880E23]/60 bg-[#880E23]/10 flex items-center justify-center">
              <span className="text-[10px] font-semibold text-[#880E23] bg-white/95 px-2 py-0.5 rounded shadow-xs">
                Allowed Geofence (500m)
              </span>
            </div>

            {/* Center Designated Pin */}
            <div className="absolute flex flex-col items-center">
              <div className="w-3 h-3 bg-[#880E23] rounded-full ring-4 ring-[#F8CAD1]" />
              <span className="mt-1 text-[11px] font-bold text-[#880E23] bg-white/90 px-1.5 py-0.5 rounded border border-[#F8CAD1] shadow-xs">
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
                    ? 'bg-[#B71C35] text-white animate-bounce ring-4 ring-[#F8CAD1]'
                    : 'bg-[#880E23] text-white ring-4 ring-[#F8CAD1]'
                }`}
              >
                <Navigation className="w-4 h-4" />
              </div>
              <span
                className={`mt-1 text-[11px] font-bold px-2 py-0.5 rounded shadow-xs border ${
                  punch.isLocationDiscrepancy
                    ? 'bg-[#FDF2F4] text-[#880E23] border-[#F8CAD1]'
                    : 'bg-[#FAF8F5] text-[#2D2526] border-[#DDD5C7]'
                }`}
              >
                {punch.employeeName} ({punch.punchType})
              </span>
            </div>

            <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-xs text-xs px-2.5 py-1 rounded border border-[#E8E2D8] text-[#5A504E] font-mono shadow-xs">
              GPS: {punch.latitude.toFixed(4)}, {punch.longitude.toFixed(4)} (±{punch.accuracyMeters}m)
            </div>
          </div>

          {/* Location Discrepancy Alert Banner */}
          {punch.isLocationDiscrepancy ? (
            <div className="p-3.5 bg-[#FDF2F4] border border-[#F8CAD1] rounded-lg flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-[#880E23] shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-[#880E23]">Geofence Perimeter Discrepancy Detected</p>
                <p className="text-xs text-[#74675B] mt-0.5">
                  The employee punched outside the authorized 500m geofence radius. This punch was automatically flagged for Sub-Admin review.
                </p>
                {punch.notes && <p className="text-xs font-mono text-[#880E23] mt-1">{punch.notes}</p>}
              </div>
            </div>
          ) : (
            <div className="p-3.5 bg-[#FAF8F5] border border-[#E8E2D8] rounded-lg flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-[#880E23] shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-[#2D2526]">Verified Within Geofence</p>
                <p className="text-xs text-[#74675B] mt-0.5">
                  GPS coordinates verified within the designated work perimeter with high telemetry precision.
                </p>
              </div>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-[#FAF8F5] rounded-lg border border-[#E8E2D8]">
              <span className="text-[#74675B] block mb-0.5">Employee Name</span>
              <span className="font-semibold text-[#2D2526] text-sm">{punch.employeeName}</span>
            </div>
            <div className="p-3 bg-[#FAF8F5] rounded-lg border border-[#E8E2D8]">
              <span className="text-[#74675B] block mb-0.5">Punch Timestamp</span>
              <span className="font-semibold text-[#2D2526] text-sm">
                {punch.date} at {punch.time}
              </span>
            </div>
            <div className="col-span-2 p-3 bg-[#FAF8F5] rounded-lg border border-[#E8E2D8]">
              <span className="text-[#74675B] block mb-0.5">Registered Physical Address</span>
              <span className="font-medium text-[#2D2526]">{punch.address}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#FAF8F5] border-t border-[#E8E2D8] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#880E23] hover:bg-[#6B081A] text-white text-xs font-medium rounded-lg shadow-xs transition-colors"
          >
            Close Map Telemetry
          </button>
        </div>
      </div>
    </div>
  );
};
