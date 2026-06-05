import { useState } from 'react';
import { Menu, Bell, Sun, Moon, Search, ChevronDown, User as UserIcon, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/store/AuthContext';
import { useTheme } from '@/store/ThemeContext';
import { logOut } from '@/services/auth';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { getInitials } from '@/lib/utils';

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { user, userProfile } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const initials = getInitials(userProfile?.displayName || user?.displayName || user?.email || 'U');

  const handleLogout = async () => {
    await logOut();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white dark:bg-surface-900 border-b border-surface-200 dark:border-surface-700 sticky top-0 z-30">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-600 dark:text-surface-400"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          {/* Search bar */}
          <div className="hidden md:flex items-center gap-2 bg-surface-100 dark:bg-surface-800 rounded-lg px-3 py-2 w-64 lg:w-80">
            <Search className="w-4 h-4 text-surface-400" />
            <input
              type="text"
              placeholder="Search items, SKUs..."
              className="bg-transparent border-none outline-none text-sm text-surface-700 dark:text-surface-300 placeholder-surface-400 w-full"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-600 dark:text-surface-400"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-600 dark:text-surface-400 relative"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
          </div>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700"
            >
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {initials}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-surface-900 dark:text-surface-100">
                  {userProfile?.displayName || user?.displayName || 'User'}
                </p>
                <p className="text-xs text-surface-500 dark:text-surface-400 capitalize">
                  {userProfile?.role || 'Staff'}
                </p>
              </div>
              <ChevronDown className="w-4 h-4 text-surface-400 hidden md:block" />
            </button>

            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-50"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-surface-800 rounded-xl shadow-xl border border-surface-200 dark:border-surface-700 z-50 py-1">
                  <button
                    onClick={() => { navigate('/settings'); setShowUserMenu(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700"
                  >
                    <UserIcon className="w-4 h-4" />
                    Profile
                  </button>
                  <button
                    onClick={() => { navigate('/settings'); setShowUserMenu(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700"
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>
                  <hr className="my-1 border-surface-200 dark:border-surface-700" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}