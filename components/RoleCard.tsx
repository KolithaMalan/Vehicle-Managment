// app/components/RoleCard.tsx
'use client';

import { LucideIcon } from 'lucide-react';

interface RoleCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  role: 'admin' | 'driver' | 'project_manager' | 'user';
  subtitle?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

const roleColors = {
  admin: {
    gradient: 'from-indigo-500 to-purple-600',
    light: 'bg-indigo-50 dark:bg-indigo-900/20',
    text: 'text-indigo-600 dark:text-indigo-400',
    border: 'border-indigo-200 dark:border-indigo-800'
  },
  driver: {
    gradient: 'from-green-500 to-teal-600',
    light: 'bg-green-50 dark:bg-green-900/20',
    text: 'text-green-600 dark:text-green-400',
    border: 'border-green-200 dark:border-green-800'
  },
  project_manager: {
    gradient: 'from-orange-500 to-amber-600',
    light: 'bg-orange-50 dark:bg-orange-900/20',
    text: 'text-orange-600 dark:text-orange-400',
    border: 'border-orange-200 dark:border-orange-800'
  },
  user: {
    gradient: 'from-blue-500 to-cyan-600',
    light: 'bg-blue-50 dark:bg-blue-900/20',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800'
  }
};

export default function RoleCard({ 
  title, 
  value, 
  icon: Icon, 
  role, 
  subtitle, 
  trend 
}: RoleCardProps) {
  const colors = roleColors[role];

  return (
    <div className={`rounded-xl border ${colors.border} ${colors.light} p-6 hover:shadow-lg transition-all duration-300 dark:bg-gray-800/50`}>
      {/* ✅ INCREASED GAP: Changed to gap-6 for more space */}
      <div className="flex items-start justify-between gap-6">
        {/* ✅ INCREASED PADDING: Changed to pr-4 */}
        <div className="flex-1 min-w-0 pr-4">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2 break-words">{value}</p>
          
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
          )}
          
          {trend && (
            <div className={`inline-flex items-center text-sm font-medium mt-2 ${
              trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
              <span>{trend.value}</span>
            </div>
          )}
        </div>
        
        {/* ✅ Icon stays on the right, won't shrink */}
        <div className={`bg-gradient-to-br ${colors.gradient} p-3 rounded-lg shadow-lg flex-shrink-0`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}