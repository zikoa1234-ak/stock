import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { InventoryItem } from '@/types';

interface StockAdjustModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItem | null;
  onConfirm: (newQuantity: number, reason: string) => Promise<void>;
  isLoading?: boolean;
}

export function StockAdjustModal({ isOpen, onClose, item, onConfirm, isLoading = false }: StockAdjustModalProps) {
  const [newQuantity, setNewQuantity] = useState<number>(item?.quantity || 0);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (item) {
      setNewQuantity(item.quantity);
      setReason('');
      setError('');
    }
  }, [item]);

  const handleSubmit = async () => {
    if (newQuantity < 0) {
      setError('Quantity cannot be negative');
      return;
    }
    if (!reason.trim()) {
      setError('Please provide a reason for the adjustment');
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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-white dark:bg-surface-800 rounded-2xl shadow-2xl w-full max-w-md p-6"
          >
            <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-400">
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/20 rounded-xl flex items-center justify-center">
                <Package className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100">Adjust Stock</h3>
                <p className="text-sm text-surface-500">{item.name} ({item.sku})</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-surface-50 dark:bg-surface-700/50 rounded-lg p-3 flex items-center justify-between">
                <span className="text-sm text-surface-600 dark:text-surface-400">Current Stock</span>
                <span className="font-semibold text-surface-900 dark:text-surface-100">{item.quantity}</span>
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">New Quantity</label>
                <input
                  type="number"
                  min="0"
                  value={newQuantity}
                  onChange={(e) => setNewQuantity(parseInt(e.target.value) || 0)}
                  className="input"
                />
              </div>

              {difference !== 0 && (
                <div className={"text-sm font-medium " + (difference > 0 ? 'text-green-600' : 'text-red-600')}>
                  {difference > 0 ? '+' : ''}{difference} units {difference > 0 ? 'added' : 'removed'}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Reason *</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="input min-h-[80px] resize-none"
                  placeholder="e.g. Inventory count correction, damaged goods, restock..."
                />
              </div>

              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-surface-200 dark:border-surface-700">
              <Button variant="secondary" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} loading={isLoading}>
                Save Adjustment
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
