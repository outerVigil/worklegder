import React from 'react';
import { EntryStatus, AttendanceToday, UserStatus, AlertSeverity } from '../../types';

interface StatusBadgeProps {
  status: EntryStatus | AttendanceToday | UserStatus | AlertSeverity | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const s = String(status).toUpperCase();
  const textSize = size === 'sm' ? 'text-[11px]' : 'text-xs';

  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';
  let dotColor = 'bg-slate-400';

  // Active / Deactivated
  if (s === 'ACTIVE') {
    colorClasses = 'bg-emerald-50 text-emerald-800 border-emerald-200';
    dotColor = 'bg-emerald-500';
  } else if (s === 'DEACTIVATED' || s === 'INACTIVE') {
    colorClasses = 'bg-rose-50 text-rose-800 border-rose-200';
    dotColor = 'bg-rose-500';
  }

  // Attendance
  else if (s === 'PRESENT') {
    colorClasses = 'bg-emerald-50 text-emerald-800 border-emerald-200';
    dotColor = 'bg-emerald-500';
  } else if (s === 'CHECKED_IN') {
    colorClasses = 'bg-teal-50 text-teal-800 border-teal-200';
    dotColor = 'bg-teal-500 animate-pulse';
  } else if (s === 'ABSENT') {
    colorClasses = 'bg-rose-50 text-rose-800 border-rose-200';
    dotColor = 'bg-rose-500';
  } else if (s === 'MISSING_CHECKOUT') {
    colorClasses = 'bg-amber-50 text-amber-800 border-amber-200';
    dotColor = 'bg-amber-500';
  }

  // Entries
  else if (s === 'APPROVED') {
    colorClasses = 'bg-emerald-50 text-emerald-800 border-emerald-200';
    dotColor = 'bg-emerald-500';
  } else if (s === 'PENDING') {
    colorClasses = 'bg-amber-50 text-amber-800 border-amber-200';
    dotColor = 'bg-amber-500';
  } else if (s === 'REJECTED') {
    colorClasses = 'bg-rose-50 text-rose-800 border-rose-200';
    dotColor = 'bg-rose-500';
  }

  // Alerts
  else if (s === 'CRITICAL') {
    colorClasses = 'bg-rose-100 text-rose-900 border-rose-300 font-semibold';
    dotColor = 'bg-rose-600 animate-ping';
  } else if (s === 'HIGH') {
    colorClasses = 'bg-rose-50 text-rose-800 border-rose-200';
    dotColor = 'bg-rose-500';
  } else if (s === 'MEDIUM') {
    colorClasses = 'bg-amber-50 text-amber-800 border-amber-200';
    dotColor = 'bg-amber-500';
  } else if (s === 'LOW') {
    colorClasses = 'bg-blue-50 text-blue-800 border-blue-200';
    dotColor = 'bg-blue-500';
  }

  const formattedLabel = s.replace(/_/g, ' ');

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md border font-medium ${textSize} ${colorClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} aria-hidden="true" />
      {formattedLabel}
    </span>
  );
};
