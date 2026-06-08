"import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Package } from 'lucide-react';
import { ItemForm } from '@/components/forms/ItemForm';
import { useCreateItem } from '@/hooks/useItems';
import { useAuth } from '@/store/AuthContext';
import { can } from '@/lib/permissions';
import type { UserRole } from '@/lib/permissions';

export function AddItemPage() {
  const navigate = useNavigate();
  const createItem = useCreateItem();
  const { userProfile } = useAuth();
  const userRole = (userProfile?.role || 'viewer') as UserRole;
  const permissions = can(userRole);

  // Permission check
  if (!permissions.create('items')) {
    return (
      <div className="page-container">
        <div className="text-center py-16">
          <Package className="w-16 h-16 text-surface-300 dark:text-surface-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-surface-900 dark:text-surface-100">Access Denied</h2>
          <p className="text-surface-500 mt-2">You don't have permission to create items.</p>
          <button
            onClick={() => navigate('/inventory')}
            className="btn-primary mt-4"
          >
            Back to Inventory
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="page-container max-w-3xl"
    >
      <button
        onClick={() => navigate('/inventory')}
        className="flex items-center gap-2 text-sm text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Inventory
      </button>

      <div className="card p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-2xl flex items-center justify-center">
            <Package className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">Add New Item</h1>
            <p className="text-sm text-surface-500">Fill in the details below to add a new item to inventory.</p>
          </div>
        </div>

        <ItemForm
          onSubmit={async (data) => {
            await createItem.mutateAsync(data);
            navigate('/inventory');
          }}
          isLoading={createItem.isPending}
          submitLabel="Create Item"
        />
      </div>
    </motion.div>
  );
}
"