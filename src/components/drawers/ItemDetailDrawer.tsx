import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, Edit3, Barcode, MapPin, DollarSign, Building2, FileText, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { useMovements } from '@/hooks/useMovements';
import { useCategories } from '@/hooks/useCategories';
import { Button } from '@/components/ui/Button';
import { formatNumber, formatCurrency, formatDate, getStockStatus } from '@/lib/utils';
import type { InventoryItem } from '@/types';
import { useAuth } from '@/store/AuthContext';
import { can } from '@/lib/permissions';
import type { UserRole } from '@/lib/permissions';

interface ItemDetailDrawerProps {
  item: InventoryItem | null;
  onClose: () => void;
  onEdit: (item: InventoryItem) => void;
}

export function ItemDetailDrawer({ item, onClose, onEdit }: ItemDetailDrawerProps) {
  const { data: movements } = useMovements({
    itemId: item?.id,
    limitCount: 10,
  });
  const { data: categories } = useCategories();
  const { userProfile } = useAuth();
  const userRole = (userProfile?.role || 'viewer') as UserRole;
  const permissions = can(userRole);

  const category = categories?.find((c) => c.id === item?.categoryId);
  const stockStatus = item ? getStockStatus(item.quantity, item.minStock) : null;

  return (
    <AnimatePresence>
      {item && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="drawer-overlay"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="drawer-content"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-surface-900 dark:text-surface-100">
                  Item Details
                </h2>
                <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700">
                  <X className="w-5 h-5 text-surface-400" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/20 rounded-2xl flex items-center justify-center">
                    <Package className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-surface-900 dark:text-surface-100">{item.name}</h3>
                    <p className="text-sm text-surface-500">SKU: {item.sku}</p>
                    {stockStatus && (
                      <span className={`inline-block mt-1 ${stockStatus.badge}`}>{stockStatus.label}</span>
                    )}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="card p-3">
                    <div className="flex items-center gap-2 text-surface-500 text-sm">
                      <Package className="w-4 h-4" />
                      <span>Quantity</span>
                    </div>
                    <p className="text-xl font-bold mt-1 text-surface-900 dark:text-surface-100">{formatNumber(item.quantity)}</p>
                  </div>
                  <div className="card p-3">
                    <div className="flex items-center gap-2 text-surface-500 text-sm">
                      <DollarSign className="w-4 h-4" />
                      <span>Unit Price</span>
                    </div>
                    <p className="text-xl font-bold mt-1 text-surface-900 dark:text-surface-100">{formatCurrency(item.unitPrice)}</p>
                  </div>
                  <div className="card p-3">
                    <div className="flex items-center gap-2 text-surface-500 text-sm">
                      <MapPin className="w-4 h-4" />
                      <span>Location</span>
                    </div>
                    <p className="text-sm font-medium mt-1 text-surface-900 dark:text-surface-100">{item.storageLocation}</p>
                  </div>
                  <div className="card p-3">
                    <div className="flex items-center gap-2 text-surface-500 text-sm">
                      <Building2 className="w-4 h-4" />
                      <span>Category</span>
                    </div>
                    <p className="text-sm font-medium mt-1 text-surface-900 dark:text-surface-100">{category?.name || 'N/A'}</p>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="card p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-surface-500">Supplier</span>
                    <span className="text-sm font-medium text-surface-900 dark:text-surface-100">{item.supplier}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-surface-500">Min Stock Level</span>
                    <span className="text-sm font-medium text-surface-900 dark:text-surface-100">{item.minStock}</span>
                  </div>
                  {item.barcode && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-surface-500">Barcode</span>
                      <span className="text-sm font-medium text-surface-900 dark:text-surface-100">{item.barcode}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-surface-500">Created</span>
                    <span className="text-sm text-surface-600 dark:text-surface-400">{formatDate(item.createdAt)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-surface-500">Updated</span>
                    <span className="text-sm text-surface-600 dark:text-surface-400">{formatDate(item.updatedAt)}</span>
                  </div>
                </div>

                {/* Notes */}
                {item.notes && (
                  <div className="card p-4">
                    <div className="flex items-center gap-2 text-surface-500 text-sm mb-2">
                      <FileText className="w-4 h-4" />
                      <span>Notes</span>
                    </div>
                    <p className="text-sm text-surface-700 dark:text-surface-300">{item.notes}</p>
                  </div>
                )}

                {/* Recent Movements */}
                <div>
                  <h4 className="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-3">Recent Movements</h4>
                  <div className="space-y-2">
                    {(movements || []).slice(0, 5).map((movement) => (
                      <div key={movement.id} className="flex items-center gap-3 p-3 bg-surface-50 dark:bg-surface-800/50 rounded-lg">
                        <div className={`p-1.5 rounded-full ${
                          movement.type === 'in' ? 'bg-green-100 dark:bg-green-900/20' :
                          movement.type === 'out' ? 'bg-red-100 dark:bg-red-900/20' :
                          'bg-yellow-100 dark:bg-yellow-900/20'
                        }`}>
                          {movement.type === 'in' ? (
                            <TrendingUp className="w-3 h-3 text-green-600 dark:text-green-400" />
                          ) : (
                            <TrendingDown className="w-3 h-3 text-red-600 dark:text-red-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-medium text-surface-700 dark:text-surface-300">
                            {movement.type.toUpperCase()} - {movement.quantity} units
                          </p>
                          <p className="text-xs text-surface-500">{movement.reason} • {formatDate(movement.createdAt)}</p>
                        </div>
                      </div>
                    ))}
                    {(!movements || movements.length === 0) && (
                      <p className="text-sm text-surface-500 text-center py-4">No movements recorded</p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {permissions.update('items') && (
                  <Button
                    className="w-full"
                    icon={<Edit3 className="w-4 h-4" />}
                    onClick={() => onEdit(item)}
                  >
                    Edit Item
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}