// app/components/RoleNavigation.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Car, 
  MapPin, 
  LogOut,
  Menu,
  X,
  FileText,
  Clock,
  CheckCircle,
  Calendar,
  Moon,
  Sun,
  Shield,
  UserCheck,
  Users
} from 'lucide-react';
import { useTheme } from './ThemeProvider';

interface NavItem {
  label: string;
  href: string;
  icon: any;
}

interface RoleConfig {
  name: string;
  gradient: string;
  darkGradient: string;
  navItems: NavItem[];
  accentColor: string;
  darkAccent: string;
}

const roleConfigs: Record<string, RoleConfig> = {
  admin: {
    name: 'Admin',
    gradient: 'from-indigo-600 to-purple-600',
    darkGradient: 'dark:from-indigo-800 dark:to-purple-900',
    accentColor: 'bg-indigo-500',
    darkAccent: 'dark:bg-indigo-600',
    navItems: [
      { label: 'Dashboard', href: '/dashboard/admin', icon: LayoutDashboard },
      { label: 'Live Map', href: '/map', icon: MapPin },
    ]
  },
  driver: {
    name: 'Driver',
    gradient: 'from-green-600 to-teal-600',
    darkGradient: 'dark:from-green-800 dark:to-teal-900',
    accentColor: 'bg-green-500',
    darkAccent: 'dark:bg-green-600',
    navItems: [
      { label: 'Dashboard', href: '/dashboard/driver', icon: LayoutDashboard },
      { label: 'Daily Rides', href: '/dashboard/driver/daily-rides', icon: Calendar },
    ]
  },
  project_manager: {
    name: 'Project Manager',
    gradient: 'from-orange-600 to-amber-600',
    darkGradient: 'dark:from-orange-800 dark:to-amber-900',
    accentColor: 'bg-orange-500',
    darkAccent: 'dark:bg-orange-600',
    navItems: [
      { label: 'Dashboard', href: '/dashboard/project_manager', icon: LayoutDashboard },
      { label: 'Approvals', href: '/dashboard/project_manager', icon: Clock },
      { label: 'Live Map', href: '/map', icon: MapPin },
    ]
  },
  user: {
    name: 'User',
    gradient: 'from-blue-600 to-cyan-600',
    darkGradient: 'dark:from-blue-800 dark:to-cyan-900',
    accentColor: 'bg-blue-500',
    darkAccent: 'dark:bg-blue-600',
    navItems: [
      { label: 'Dashboard', href: '/dashboard/user', icon: LayoutDashboard },
      { label: 'My Bookings', href: '/dashboard/user', icon: FileText },
    ]
  }
};

export default function RoleNavigation({ 
  role, 
  userName, 
  userEmail,
  onLogout 
}: { 
  role: string;
  userName: string;
  userEmail: string;
  onLogout: () => void;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  
  const config = roleConfigs[role] || roleConfigs.user;

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 z-50">
        <div className={`flex flex-col flex-1 bg-gradient-to-b ${config.gradient} ${config.darkGradient}`}>
          {/* Logo & Role */}
          <div className="flex items-center justify-center h-16 px-4 bg-black/20">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${config.accentColor} ${config.darkAccent} flex items-center justify-center shadow-lg`}>
                <Car className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-white font-bold text-lg">RMS</h1>
                <p className="text-xs text-white/80">{config.name}</p>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="px-4 py-4 bg-black/10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-lg">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">{userName}</p>
                <p className="text-xs text-white/70 truncate">{userEmail}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {config.navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive 
                      ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-lg' 
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Theme Toggle & Logout */}
{/* Theme Toggle & Logout */}
<div className="p-4 space-y-2 border-t border-white/10">
  {/* ✅ IMPROVED: More prominent dark mode button */}
  <button
    onClick={toggleTheme}
    className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all group"
  >
    <div className="flex items-center gap-3">
      {theme === 'light' ? (
        <>
          <Moon className="w-5 h-5" />
          <span className="font-medium">Dark Mode</span>
        </>
      ) : (
        <>
          <Sun className="w-5 h-5" />
          <span className="font-medium">Light Mode</span>
        </>
      )}
    </div>
    {/* ✅ ADDED: Visual indicator */}
    <div className={`w-10 h-5 rounded-full transition-all ${
      theme === 'dark' ? 'bg-yellow-400' : 'bg-gray-600'
    } relative`}>
      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
        theme === 'dark' ? 'right-0.5' : 'left-0.5'
      }`}></div>
    </div>
  </button>
  
  <button
    onClick={onLogout}
    className="w-full flex items-center gap-3 px-4 py-3 text-white/80 hover:bg-red-500/20 hover:text-white rounded-lg transition-all"
  >
    <LogOut className="w-5 h-5" />
    <span className="font-medium">Logout</span>
  </button>
</div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between px-4 h-16">
          <div className="flex items-center gap-2">
            <div className={`w-10 h-10 rounded-lg ${config.accentColor} ${config.darkAccent} flex items-center justify-center`}>
              <Car className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 dark:text-white">RMS</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">{config.name}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              ) : (
                <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              )}
            </button>
            
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              ) : (
                <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="absolute top-16 inset-x-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-lg">
            <nav className="px-4 py-4 space-y-1">
              {config.navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg ${
                      isActive 
                        ? `${config.accentColor} ${config.darkAccent} text-white` 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </nav>
          </div>
        )}
      </div>
    </>
  );
}