// components/ui/professional-stats-card.tsx
'use client';

import { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ProfessionalStatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'indigo';
  className?: string;
}

export function ProfessionalStatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  color = 'blue',
  className
}: ProfessionalStatsCardProps) {
  const colorClasses = {
    blue: {
      icon: 'bg-blue-500 text-white',
      trend: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    green: {
      icon: 'bg-green-500 text-white',
      trend: 'text-green-600',
      bg: 'bg-green-50'
    },
    red: {
      icon: 'bg-red-500 text-white',
      trend: 'text-red-600',
      bg: 'bg-red-50'
    },
    yellow: {
      icon: 'bg-yellow-500 text-white',
      trend: 'text-yellow-600',
      bg: 'bg-yellow-50'
    },
    purple: {
      icon: 'bg-purple-500 text-white',
      trend: 'text-purple-600',
      bg: 'bg-purple-50'
    },
    indigo: {
      icon: 'bg-indigo-500 text-white',
      trend: 'text-indigo-600',
      bg: 'bg-indigo-50'
    }
  };

  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
            {trend && (
              <span className={cn(
                "text-xs font-medium",
                trend.isPositive ? "text-green-600" : "text-red-600"
              )}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
            )}
          </div>
          {description && (
            <p className="text-xs text-gray-500">{description}</p>
          )}
        </div>
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center",
          colorClasses[color].icon
        )}>
          <Icon className="w-6 h-6" />
        </div>
      </CardHeader>
      
      {/* Background decoration */}
      <div className={cn(
        "absolute top-0 right-0 w-20 h-20 rounded-full opacity-10 -mr-10 -mt-10",
        colorClasses[color].bg
      )} />
    </Card>
  );
}