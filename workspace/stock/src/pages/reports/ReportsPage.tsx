import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, Printer, Calendar } from 'lucide-react';
import { useDashboardStats, useStockMovementChart, useCategoryDistribution, useTopMovedItems } from '@/hooks/useStats';
import { useItems } from '@/hooks/useItems';
import { useMovements } from '@/hooks/useMovements';
import { Button } from '@/components/ui/Button';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatNumber, formatCurrency } from '@/lib/utils';

export function ReportsPage() {
  const [dateRange, setDateRange] = useState('30');
  const { data: stats } = useDashboardStats();
  const { data: chartData } = useStockMovementChart(Number(dateRange));
  const { data: topMoved } = useTopMovedItems(10);
  const { data: itemsData } = useItems();
  const { data: movements } = useMovements({ limitCount: 100 });

  const items = itemsData?.items || [];

  const totalValue = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  const handlePrint = () => window.print();

  const handleExportPDF = () => {
    // In a production app, use jsPDF or a service
    alert('PDF export would be implemented with a library like jsPDF.');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="page-container"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="page-subtitle">Analytics and exportable reports</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="select w-auto"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
          <Button variant="secondary" onClick={handlePrint} icon={<Printer className="w-4 h-4" />}>
            Print
          </Button>
          <Button variant="secondary" onClick={handleExportPDF} icon={<Download className="w-4 h-4" />}>
            Export PDF
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="card p-5">
          <p className="text-sm text-surface-500">Total Items</p>
          <p className="text-2xl font-bold text-surface-900 dark:text-surface-100 mt-1">
            {formatNumber(stats?.totalItems || 0)}
          </p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-surface-500">Total Stock Value</p>
          <p className="text-2xl font-bold text-surface-900 dark:text-surface-100 mt-1">
            {formatCurrency(totalValue)}
          </p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-surface-500">Total Movements</p>
          <p className="text-2xl font-bold text-surface-900 dark:text-surface-100 mt-1">
            {formatNumber(stats?.recentMovements || 0)}
          </p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-surface-500">Low Stock Items</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">
            {formatNumber(stats?.lowStockItems || 0)}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-4">
            Stock Movement Overview
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="stockIn" stroke="#10b981" strokeWidth={2} name="Stock In" />
                <Line type="monotone" dataKey="stockOut" stroke="#ef4444" strokeWidth={2} name="Stock Out" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-4">
            Top Moved Items
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={(topMoved || []).slice(0, 8).map((i) => ({
                  name: i.name.length > 15 ? i.name.slice(0, 15) + '...' : i.name,
                  movements: i.totalMovements,
                }))}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="movements" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Low Stock Report */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-4">
          Low Stock Items Report
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-200 dark:border-surface-700">
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase text-surface-500">Item</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase text-surface-500">SKU</th>
                <th className="text-right px-4 py-3 text-xs font-semibold uppercase text-surface-500">Quantity</th>
                <th className="text-right px-4 py-3 text-xs font-semibold uppercase text-surface-500">Min Stock</th>
                <th className="text-right px-4 py-3 text-xs font-semibold uppercase text-surface-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-200 dark:divide-surface-700">
              {items
                .filter((item) => item.quantity <= item.minStock)
                .sort((a, b) => a.quantity - b.quantity)
                .slice(0, 20)
                .map((item) => (
                  <tr key={item.id} className="hover:bg-surface-50 dark:hover:bg-surface-800/50">
                    <td className="px-4 py-3 text-sm font-medium text-surface-900 dark:text-surface-100">
                      {item.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-surface-500">{item.sku}</td>
                    <td className="px-4 py-3 text-sm text-right font-semibold">{formatNumber(item.quantity)}</td>
                    <td className="px-4 py-3 text-sm text-right">{item.minStock}</td>
                    <td className="px-4 py-3 text-sm text-right">
                      <span className={item.quantity <= 0 ? 'badge-red' : 'badge-yellow'}>
                        {item.quantity <= 0 ? 'Out of Stock' : 'Low Stock'}
                      </span>
                    </td>
                  </tr>
                ))}
              {items.filter((item) => item.quantity <= item.minStock).length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-surface-500">
                    No items are currently low in stock.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}