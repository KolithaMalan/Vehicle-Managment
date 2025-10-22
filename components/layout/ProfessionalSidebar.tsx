// components/layout/ProfessionalSidebar.tsx
'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';

interface SidebarItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  badgeColor?: string;
}

interface ProfessionalSidebarProps {
  items: SidebarItem[];
  userRole: string;
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export function ProfessionalSidebar({ 
  items, 
  userRole, 
  isCollapsed = false,
  onToggle 
}: ProfessionalSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const getRoleGradient = (role: string) => {
    switch (role) {
      case 'admin': return 'from-red-600 to-red-700';
      case 'project_manager': return 'from-blue-600 to-blue-700';
      case 'driver': return 'from-green-600 to-green-700';
      case 'user': return 'from-purple-600 to-purple-700';
      default: return 'from-gray-600 to-gray-700';
    }
  };

  return (
    <div className={cn(
      "bg-white border-r border-gray-200 flex flex-col transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Logo/Brand */}
      <div className={cn(
        "p-4 border-b border-gray-200",
        isCollapsed && "px-2"
      )}>
        <div className={cn(
          "flex items-center gap-3",
          isCollapsed && "justify-center"
        )}>
          <div className={cn(
            "w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center",
            getRoleGradient(userRole)
          )}>
            <span className="text-white font-bold text-sm">
              {userRole.charAt(0).toUpperCase()}
            </span>
          </div>
          {!isCollapsed && (
            <div>
              <h2 className="font-bold text-gray-900">RouteMS</h2>
              <p className="text-xs text-gray-500 capitalize">
                {userRole.replace('_', ' ')}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {items.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Button
              key={item.href}
              variant={isActive ? "default" : "ghost"}
              className={cn(
                "w-full justify-start gap-3 h-11",
                isCollapsed && "justify-center px-2",
                isActive && "bg-blue-50 text-blue-700 hover:bg-blue-100",
                !isActive && "text-gray-700 hover:bg-gray-50"
              )}
              onClick={() => router.push(item.href)}
            >
              <Icon className={cn("h-5 w-5", isActive && "text-blue-700")} />
              {!isCollapsed && (
                <>
                  <span className="flex-1 text-left">{item.title}</span>
                  {item.badge && (
                    <Badge 
                      variant="secondary" 
                      className={cn(
                        "ml-auto",
                        item.badgeColor || "bg-gray-100 text-gray-700"
                      )}
                    >
                      {item.badge}
                    </Badge>
                  )}
                </>
              )}
            </Button>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="p-4 border-t border-gray-200">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="w-full"
        >
          {isCollapsed ? '→' : '←'}
        </Button>
      </div>
    </div>
  );
}