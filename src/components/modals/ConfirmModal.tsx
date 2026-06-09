import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info' | 'default';
  loading?: boolean;
}

const variantColors = {
  danger: { icon: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/20', button: 'danger' as const },
  warning: { icon: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900/20', button: 'primary' as const },
  info: { icon: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/20', button: 'primary' as const },
  default: { icon: 'text-surface-500', bg: 'bg-surface-100 dark:bg-surface-700', button: 'primary' as const },
};

export function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', variant = 'default', loading = false }: ConfirmModalProps) {
  const colors = variantColors[variant];

  return (
    <AnimatePresence>
      {isOpen && (
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

            <div className="flex items-start gap-4">
              <div className={"w-10 h-10 rounded-xl flex items-center justify-center shrink-0 " + colors.bg}>
                <AlertTriangle className={"w-5 h-5 " + colors.icon} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100">{title}</h3>
                <p className="mt-1 text-sm text-surface-600 dark:text-surface-400">{message}</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-surface-200 dark:border-surface-700">
              <Button variant="secondary" onClick={onClose} disabled={loading}>
                {cancelLabel}
              </Button>
              <Button variant={colors.button} onClick={onConfirm} loading={loading}>
                {confirmLabel}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
