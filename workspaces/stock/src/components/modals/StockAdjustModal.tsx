"import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { InventoryItem } from '@/types';

interface StockAdjustModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItem | null;
  onConfirm: (newQuantity: number, reason: string) => Promise<void>;
  isLoading?: boolean;
}

export function StockAdjustModal({ isOpen, onClose, item, onConfirm, isLoading }: StockAdjustModalProps) {
  const [newQuantity, setNewQuantity] = useState<number>(item?.quantity || 0);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  // Reset when item changes
  useState(() => {
    if (item) setNewQuantity(item.quantity);
  });

  const handleSubmit = async () => {
    if (newQuantity < 0) {
      setError('Quantity cannot be negative.');
      return;
    }
    if (!reason.trim()) {
      setError('Please provide a reason for the adjustment.');
      return;
    }
    setError('');
    await onConfirm(newQuantity, reason);
    onClose();
  };

  const difference = item ? newQuantity - item.quantity : 0;

  return (
    <AnimatePresence>
      {isOpen && item && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white dark:bg-surface-800 rounded-2xl shadow-2xl w-full max-w-md p-6"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-400"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-primary-100 dark:bg-primary-900/30 rounded-full">
                <Package className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
                  Adjust Stock
                </h3>
                <p className="text-sm text-surface-500">{item.name} ({item.sku})</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Current Quantity */}
              <div className="bg-surface-50 dark:bg-surface-700/50 rounded-lg p-3 flex items-center justify-between">
                <span className="text-sm text-surface-600 dark:text-surface-400">Current Quantity</span>
                <span className="text-lg font-bold text-surface-900 dark:text-surface-100">{item.quantity}</span>
              </div>

              {/* New Quantity Input */}
              <div>
                <label className="label">New Quantity *</label>
                <input
                  type="number"
                  value={newQuantity}
                  onChange={(e) => setNewQuantity(parseInt(e.target.value) || 0)}
                  className="input text-lg font-bold"
                  min={0}
                />
              </div>

              {/* Difference Indicator */}
              {difference !== 0 && (
                <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
                  difference > 0
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                    : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                }`}>
                  <AlertTriangle className="w-4 h-4" />
                  <span>
                    {difference > 0
                      ? `Adding ${difference} units (stock increase)`
                      : `Removing ${Math.abs(difference)} units (stock decrease)`
                    }
                  </span>
                </div>
              )}

              {/* Reason */}
              <div>
                <label className="label">Reason for Adjustment *</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="input resize-none"
                  rows={2}
                  placeholder="e.g., Physical count correction, damaged goods, new shipment..."
                />
              </div>

              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                loading={isLoading}
              >
                Confirm Adjustment
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
"