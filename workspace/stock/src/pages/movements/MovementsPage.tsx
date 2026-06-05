import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Filter, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { useMovements, useCreateMovement } from '@/hooks/useMovements';
import { useItems } from '@/hooks/useItems';
import { useAuth } from '@/store/AuthContext';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Table } from '@/components/ui/Table';
import { MovementForm } from '@/components/forms/MovementForm';
import { formatDate, formatNumber, timeAgo } from '@/lib/utils';
import type { StockMovement, MovementType } from '@/types';
import type { UserRole } from '@/lib/permissions';
import { can } from '@/lib/permissions';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

export function MovementsPage() {
  const { userProfile } = useAuth();
  const userRole = (userProfile?.role || 'viewer') as UserRole;
  const permissions = can(userRole);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>('');

  const { data: movements, isLoading } = useMovements({ 
    type: typeFilter as MovementType || undefined,
  });
  const { data: itemsData } = useItems();
  const createMovement = useCreateMovement();

  const items = itemsData?.items || [];

  const columns = [
    {
      key: 'type',
      header: 'Type',
      render: (movement: StockMovement) => {
        const icons = {
          in: <TrendingUp className="w-4 h-4 text-green-500" />,
          out: <TrendingDown className="w-4 h-4 text-red-500" />,
          adjustment: <BarChart3 className="w-4 h-4 text-yellow-500" />,
          transfer: <BarChart3 className="w-4 h-4 text-blue-500" />,
        };
        const labels = {
          in: 'Stock In',
          out: 'Stock Out',
          adjustment: 'Adjustment',
          transfer: 'Transfer',
        };
        return (
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-full ${
              movement.type === 'in' ? 'bg-green-100 dark:bg-green-900/20' :
              movement.type === 'out' ? 'bg-red-100 dark:bg-red-900/20' :
              'bg-yellow-100 dark:bg-yellow-900/20'
            }`}>
              {icons[movement.type]}
            </div>
            <span className={movement.type === 'in' ? 'text-green-600 dark:text-green-400' :
              movement.type === 'out' ? 'text-red-600 dark:text-red-400' :
              'text-yellow-600 dark:text-yellow-400'}>
              {labels[movement.type]}
            </span>
          </div>
        );
      },
    },
    {
      key: 'itemName',
      header: 'Item',
      render: (movement: StockMovement) => (
        <div>
          <p className="font-medium text-surface-900 dark:text-surface-100">{movement.itemName}</p>
          <p className="text-xs text-surface-500">{movement.sku}</p>
        </div>
      ),
    },
    {
      key: 'quantity',
      header: 'Quantity',
      render: (movement: StockMovement) => (
        <span className="font-semibold">{formatNumber(movement.quantity)}</span>
      ),
    },
    {
      key: 'previousQuantity',
      header: 'Before',
      render: (movement: StockMovement) => movement.previousQuantity,
    },
    {
      key: 'newQuantity',
      header: 'After',
      render: (movement: StockMovement) => (
        <span className="font-semibold">{formatNumber(movement.newQuantity)}</span>
      ),
    },
    {
      key: 'reason',
      header: 'Reason',
    },
    {
      key: 'performedByName',
      header: 'By',
      render: (movement: StockMovement) => (
        <span className="text-sm text-surface-600 dark:text-surface-400">
          {movement.performedByName}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Date',
      render: (movement: StockMovement) => (
        <span className="text-sm text-surface-500">{formatDate(movement.createdAt)}</span>
      ),
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="page-container"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="page-title">Stock Movements</h1>
          <p className="page-subtitle">Track all stock changes</p>
        </div>
        {permissions.create('movements') && (
          <Button onClick={() => setShowCreateModal(true)} icon={<Plus className="w-4 h-4" />}>
            New Movement
          </Button>
        )}
      </div>

      <div className="card p-4 mb-6">
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-surface-400" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="select w-auto"
          >
            <option value="">All Types</option>
            <option value="in">Stock In</option>
            <option value="out">Stock Out</option>
            <option value="adjustment">Adjustment</option>
          </select>
        </div>
      </div>

      <div className="card">
        <Table
          columns={columns}
          data={movements || []}
          loading={isLoading}
          keyExtractor={(item) => item.id}
          emptyMessage="No stock movements recorded yet."
        />
      </div>

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Record Stock Movement"
        size="lg"
      >
        <MovementForm
          items={items}
          onSubmit={async (data) => {
            const item = items.find((i) => i.id === data.itemId);
            await createMovement.mutateAsync({
              data: {
                itemId: data.itemId,
                type: data.type,
                quantity: data.quantity,
                reason: data.reason,
                reference: data.reference,
                notes: data.notes,
              },
              currentQuantity: item?.quantity || 0,
            });
            setShowCreateModal(false);
          }}
          isLoading={createMovement.isPending}
        />
      </Modal>
    </motion.div>
  );
}