import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    positive?: boolean;
    neutral?: boolean;
  };
  accentColor?: 'teal' | 'emerald' | 'blue' | 'amber' | 'rose' | 'slate';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  accentColor = 'teal',
  onClick,
}) => {
  const colorMap = {
    teal: 'text-[#880E23] bg-[#FDF2F4] border-[#F8CAD1]',
    emerald: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    blue: 'text-[#4A0713] bg-[#F5F1EB] border-[#EBE5DB]',
    amber: 'text-amber-700 bg-amber-50 border-amber-200',
    rose: 'text-[#880E23] bg-[#FDF2F4] border-[#F8CAD1]',
    slate: 'text-[#5A504E] bg-[#F5F1EB] border-[#EBE5DB]',
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-[#E8E2D8] p-5 shadow-xs transition-all duration-150 ${
        onClick ? 'cursor-pointer hover:border-[#C8BDAA] hover:shadow-sm' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-[#74675B] uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-[#2D2526] mt-1.5 tracking-tight">{value}</p>
        </div>
        <div className={`p-2.5 rounded-lg border ${colorMap[accentColor]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="mt-3.5 pt-3 border-t border-[#EBE5DB] flex items-center justify-between text-xs text-[#74675B]">
          {subtitle && <span>{subtitle}</span>}
          {trend && (
            <span
              className={`font-semibold ${
                trend.neutral
                  ? 'text-[#74675B]'
                  : trend.positive
                  ? 'text-emerald-700'
                  : 'text-[#880E23]'
              }`}
            >
              {trend.value}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
