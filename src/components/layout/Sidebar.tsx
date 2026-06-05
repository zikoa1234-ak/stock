import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
  Users,
  ArrowLeftRight,
  Tags,
  FileBarChart,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Boxes,
  X,
} from 'lucide-react';
import { useAuth } from '@/store/AuthContext';
import { logOut } from '@/services/auth';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin', 'manager', 'staff', 'viewer'] },
  { to: '/inventory', icon: Package, label: 'Inventory', roles: ['admin', 'manager', 'staff', 'viewer'] },
  { to: '/movements', icon: ArrowLeftRight, label: 'Movements', roles: ['admin', 'manager', 'staff', 'viewer'] },
  { to: '/categories', icon: Tags, label: 'Categories', roles: ['admin', 'manager'] },
  { to: '/users', icon: Users, label: 'Users', roles: ['admin'] },
  { to: '/reports', icon: FileBarChart, label: 'Reports', roles: ['admin', 'manager'] },
  { to: '/settings', icon: Settings, label: 'Settings', roles: ['admin', 'manager'] },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { userProfile } = useAuth();
  const location = useLocation();

  const userRole = userProfile?.role || 'viewer';

  const filteredItems = navItems.filter((item) =>
    item.roles.includes(userRole)
  );

  const handleLogout = async () => {
    await logOut();
  };

  const sidebarContent = (
    <div
      className={cn(
        'h-full flex flex-col bg-white dark:bg-surface-900 border-r border-surface-200 dark:border-surface-700 transition-all duration-300',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-surface-200 dark:border-surface-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <Boxes className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <span className="font-bold text-lg text-surface-900 dark:text-surface-100">
              StockFlow
            </span>
          )}
        </div>
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-400"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-400"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {filteredItems.map((item) => {
          const isActive = location.pathname.startsWith(item.to);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={cn(
                'sidebar-link group',
                isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-surface-200 dark:border-surface-700">
        <button
          onClick={handleLogout}
          className={cn(
            'sidebar-link w-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20',
            collapsed && 'justify-center'
          )}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
              className="fixed left-0 top-0 h-full z-50"
            >
              <div className="flex h-full">
                {sidebarContent}
                <button
                  onClick={onClose}
                  className="p-2 m-2 text-white hover:bg-white/10 rounded-lg"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <div className="hidden lg:block h-screen sticky top-0">
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ width: collapsed ? 64 : 256 }}
            animate={{ width: collapsed ? 80 : 256 }}
            transition={{ duration: 0.3 }}
            className="h-screen"
          >
            {sidebarContent}
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}