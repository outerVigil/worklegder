import React from 'react';
import { EntryStatus, AttendanceToday, UserStatus, AlertSeverity } from '../../types';

interface StatusBadgeProps {
  status: EntryStatus | AttendanceToday | UserStatus | AlertSeverity | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const s = String(status).toUpperCase();
  const textSize = size === 'sm' ? 'text-[11px]' : 'text-xs';

  let colorClasses = 'bg-[#FAF8F5] text-[#5A504E] border-[#E8E2D8]';
  let dotColor = 'bg-[#A89B85]';

  // Active / Deactivated
  if (s === 'ACTIVE') {
    colorClasses = 'bg-emerald-50 text-emerald-800 border-emerald-200';
    dotColor = 'bg-emerald-500';
  } else if (s === 'DEACTIVATED' || s === 'INACTIVE') {
    colorClasses = 'bg-[#FDF2F4] text-[#780E21] border-[#F8CAD1]';
    dotColor = 'bg-[#880E23]';
  }

  // Attendance
  else if (s === 'PRESENT') {
    colorClasses = 'bg-emerald-50 text-emerald-800 border-emerald-200';
    dotColor = 'bg-emerald-500';
  } else if (s === 'CHECKED_IN') {
    colorClasses = 'bg-[#FDF2F4] text-[#780E21] border-[#F8CAD1] font-semibold';
    dotColor = 'bg-[#880E23] animate-pulse';
  } else if (s === 'ABSENT') {
    colorClasses = 'bg-[#FDF2F4] text-[#780E21] border-[#F8CAD1]';
    dotColor = 'bg-[#880E23]';
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
    colorClasses = 'bg-[#FDF2F4] text-[#780E21] border-[#F8CAD1]';
    dotColor = 'bg-[#880E23]';
  }

  // Alerts
  else if (s === 'CRITICAL') {
    colorClasses = 'bg-[#880E23] text-white border-[#6B081A] font-bold shadow-xs';
    dotColor = 'bg-white animate-ping';
  } else if (s === 'HIGH') {
    colorClasses = 'bg-[#FDF2F4] text-[#780E21] border-[#F8CAD1] font-semibold';
    dotColor = 'bg-[#880E23]';
  } else if (s === 'MEDIUM') {
    colorClasses = 'bg-amber-50 text-amber-800 border-amber-200';
    dotColor = 'bg-amber-500';
  } else if (s === 'LOW') {
    colorClasses = 'bg-[#F5F1EB] text-[#5A504E] border-[#EBE5DB]';
    dotColor = 'bg-[#877A65]';
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
