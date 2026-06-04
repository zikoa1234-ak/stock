import React from 'react'
import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  Layers, 
  Activity,
  User,
  Settings,
  LogOut,
  Menu
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth()

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', permission: 'view_dashboard' },
    { to: '/users', icon: Users, label: 'Users', permission: 'manage_users', adminOnly: true },
    { to: '/inventory', icon: Package, label: 'Inventory', permission: 'view_all_items' },
    { to: '/categories', icon: Layers, label: 'Categories', permission: 'manage_categories', adminOnly: true },
    { to: '/movements', icon: Activity, label: 'Movements', permission: 'view_all_movements' },
  ]

  if (!isOpen) return null

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Package className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-800">Stock Manager</span>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          if (item.adminOnly && user?.role !== 'ADMIN') return null
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          )
        })}
      </nav>

      {/* User profile & settings */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.fullName}</p>
            <p className="text-xs text-gray-500 truncate">
              {user?.role === 'ADMIN' ? 'Administrator' : 'User'}
            </p>
          </div>
        </div>

        <div className="space-y-1">
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <Settings className="h-5 w-5" />
            <span className="text-sm font-medium">Settings</span>
          </NavLink>

          <button
            onClick={logout}
            className="flex items-center space-x-3 w-full px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar