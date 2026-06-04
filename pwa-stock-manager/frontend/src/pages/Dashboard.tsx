import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { 
  Package, 
  AlertTriangle, 
  Layers, 
  Users,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { api } from '@/services/api'
import { useAuth } from '@/contexts/AuthContext'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import DashboardCard from '@/components/dashboard/DashboardCard'
import RecentMovementsTable from '@/components/dashboard/RecentMovementsTable'
import LowStockItems from '@/components/dashboard/LowStockItems'
import StatsChart from '@/components/dashboard/StatsChart'

const Dashboard: React.FC = () => {
  const { user } = useAuth()

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => api.getDashboardStats(),
  })

  const { data: userStats } = useQuery({
    queryKey: ['dashboard', 'user-stats'],
    queryFn: () => api.getUserStats(),
    enabled: user?.role === 'NORMAL_USER',
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome back, {user?.fullName}! Here's what's happening with your inventory.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Total Items"
          value={stats?.totalItems || 0}
          icon={Package}
          iconColor="text-blue-600"
          bgColor="bg-blue-50"
          trend={userStats?.userItems ? `You manage ${userStats.userItems} items` : undefined}
        />
        
        <DashboardCard
          title="Low Stock Items"
          value={stats?.lowStockItems || 0}
          icon={AlertTriangle}
          iconColor="text-amber-600"
          bgColor="bg-amber-50"
          trend={stats?.lowStockItems > 0 ? "Needs attention" : "All good"}
          trendType={stats?.lowStockItems > 0 ? "negative" : "positive"}
        />
        
        <DashboardCard
          title="Categories"
          value={stats?.totalCategories || 0}
          icon={Layers}
          iconColor="text-emerald-600"
          bgColor="bg-emerald-50"
        />
        
        <DashboardCard
          title="Active Users"
          value={stats?.totalUsers || 0}
          icon={Users}
          iconColor="text-purple-600"
          bgColor="bg-purple-50"
        />
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stats Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Inventory Overview</h2>
            <select className="text-sm border border-gray-300 rounded-lg px-3 py-2 outline-none">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
            </select>
          </div>
          <StatsChart />
        </div>

        {/* Recent Movements */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recent Stock Movements</h2>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View All →
            </button>
          </div>
          <RecentMovementsTable movements={stats?.recentMovements || []} />
        </div>
      </div>

      {/* Low Stock Items */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Low Stock Items</h2>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            View All →
          </button>
        </div>
        <LowStockItems items={stats?.lowStockList || []} />
      </div>

      {/* Quick Actions - Only for Admin */}
      {user?.role === 'ADMIN' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors">
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <span className="font-medium text-gray-900">Add New Item</span>
            </button>
            
            <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors">
              <div className="h-12 w-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-3">
                <Users className="h-6 w-6 text-emerald-600" />
              </div>
              <span className="font-medium text-gray-900">Add User</span>
            </button>
            
            <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors">
              <div className="h-12 w-12 bg-amber-100 rounded-lg flex items-center justify-center mb-3">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
              <span className="font-medium text-gray-900">Stock Alert</span>
            </button>
            
            <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors">
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <span className="font-medium text-gray-900">Generate Report</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard