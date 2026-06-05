import { motion } from 'framer-motion';
import {
  Package,
  AlertTriangle,
  Users,
  TrendingUp,
  TrendingDown,
  Boxes,
  Activity,
  BarChart3,
} from 'lucide-react';
import { useDashboardStats, useStockMovementChart, useCategoryDistribution, useTopMovedItems } from '@/hooks/useStats';
import { useRecentMovements } from '@/hooks/useMovements';
import { useAuth } from '@/store/AuthContext';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatNumber, formatCurrency, timeAgo, formatDate, getStockStatus } from '@/lib/utils';
import type { StockMovement } from '@/types';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

function KPICard({ icon: Icon, label, value, trend, color, variant }: any) {
  return (
    <motion.div variants={itemVariants} className="kpi-card">
      <div className="flex items-center justify-between">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {trend && (
          <span className={`flex items-center gap-1 text-xs font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="kpi-value text-surface-900 dark:text-surface-100">
        {typeof value === 'number' ? formatNumber(value) : value}
      </div>
      <div className="kpi-label">{label}</div>
    </motion.div>
  );
}

function RecentActivityFeed({ movements }: { movements: StockMovement[] }) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'in': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'out': return <TrendingDown className="w-4 h-4 text-red-500" />;
      case 'adjustment': return <BarChart3 className="w-4 h-4 text-yellow-500" />;
      default: return <Activity className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="divide-y divide-surface-200 dark:divide-surface-700">
      {movements.length === 0 ? (
        <p className="text-sm text-surface-500 dark:text-surface-400 py-8 text-center">
          No recent activity
        </p>
      ) : (
        movements.slice(0, 8).map((movement, idx) => (
          <motion.div
            key={movement.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="flex items-start gap-3 py-3"
          >
            <div className="p-1.5 rounded-full bg-surface-100 dark:bg-surface-700">
              {getIcon(movement.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-surface-900 dark:text-surface-100 truncate">
                {movement.type === 'in' ? 'Stock In' : movement.type === 'out' ? 'Stock Out' : movement.type === 'adjustment' ? 'Adjustment' : 'Transfer'}
                {' '}
                <span className="font-semibold">{movement.quantity}</span> units
              </p>
              <p className="text-xs text-surface-500 dark:text-surface-400">
                {movement.itemName} • {timeAgo(movement.createdAt)}
              </p>
            </div>
          </motion.div>
        ))
      )}
    </div>
  );
}

export function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: chartData } = useStockMovementChart(30);
  const { data: categories } = useCategoryDistribution();
  const { data: topMoved } = useTopMovedItems(5);
  const { data: movements } = useRecentMovements(10);
  const { userProfile } = useAuth();

  if (statsLoading) {
    return (
      <div className="page-container">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-surface-200 dark:bg-surface-700 rounded" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-surface-200 dark:bg-surface-700 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="page-container"
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome back, {userProfile?.displayName || 'User'}</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPICard
          icon={Boxes}
          label="Total Items"
          value={stats?.totalItems || 0}
          color="bg-blue-500"
        />
        <KPICard
          icon={Package}
          label="Total Stock Qty"
          value={stats?.totalStockQuantity || 0}
          color="bg-green-500"
        />
        <KPICard
          icon={AlertTriangle}
          label="Low Stock Items"
          value={stats?.lowStockItems || 0}
          color="bg-yellow-500"
        />
        <KPICard
          icon={AlertTriangle}
          label="Out of Stock"
          value={stats?.outOfStockItems || 0}
          color="bg-red-500"
        />
        <KPICard
          icon={Users}
          label="Active Users"
          value={stats?.activeUsers || 0}
          color="bg-purple-500"
        />
        <KPICard
          icon={Activity}
          label="Recent Movements"
          value={stats?.recentMovements || 0}
          color="bg-indigo-500"
        />
        <KPICard
          icon={BarChart3}
          label="Categories"
          value={stats?.totalCategories || 0}
          color="bg-pink-500"
        />
        <KPICard
          icon={Package}
          label="Total Value"
          value={formatCurrency((stats?.totalStockQuantity || 0) * 25)}
          color="bg-teal-500"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Stock Movement Chart */}
        <motion.div variants={itemVariants} className="card p-6">
          <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-4">
            Stock Movement (30 Days)
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(val) => val.slice(5)} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar dataKey="stockIn" name="Stock In" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="stockOut" name="Stock Out" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Category Distribution */}
        <motion.div variants={itemVariants} className="card p-6">
          <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-4">
            Category Distribution
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categories || []}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {(categories || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Top Moved Items */}
        <motion.div variants={itemVariants} className="card p-6">
          <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-4">
            Top Moved Items
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={(topMoved || []).map((item) => ({
                  name: item.name,
                  movements: item.totalMovements,
                }))}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="movements" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={itemVariants} className="card p-6">
          <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-4">
            Recent Activity
          </h3>
          <RecentActivityFeed movements={movements || []} />
        </motion.div>
      </div>
    </motion.div>
  );
}