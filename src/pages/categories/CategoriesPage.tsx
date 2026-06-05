import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit3, Trash2, Palette } from 'lucide-react';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/hooks/useCategories';
import { useAuth } from '@/store/AuthContext';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { formatDate } from '@/lib/utils';
import type { Category } from '@/types';
import type { UserRole } from '@/lib/permissions';
import { can } from '@/lib/permissions';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const categorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  color: z.string().optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

const presetColors = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16',
];

export function CategoriesPage() {
  const { userProfile } = useAuth();
  const userRole = (userProfile?.role || 'viewer') as UserRole;
  const permissions = can(userRole);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: categories, isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: '', description: '', color: '#3b82f6' },
  });

  const openEdit = (cat: Category) => {
    setEditingCategory(cat);
    form.reset({ name: cat.name, description: cat.description || '', color: cat.color || '#3b82f6' });
  };

  const handleSubmit = async (data: CategoryFormData) => {
    if (editingCategory) {
      await updateCategory.mutateAsync({ id: editingCategory.id, data });
      setEditingCategory(null);
    } else {
      await createCategory.mutateAsync(data as any);
      setShowCreateModal(false);
    }
    form.reset();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="page-container"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="page-title">Categories</h1>
          <p className="page-subtitle">Organize your inventory items</p>
        </div>
        {permissions.create('categories') && (
          <Button onClick={() => { setShowCreateModal(true); form.reset(); }} icon={<Plus className="w-4 h-4" />}>
            Add Category
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full text-center py-12 text-surface-500">Loading categories...</div>
        ) : !categories || categories.length === 0 ? (
          <div className="col-span-full text-center py-12 text-surface-500">
            No categories created yet.
          </div>
        ) : (
          categories.filter(c => c.isActive !== false).map((cat) => (
            <motion.div
              key={cat.id}
              whileHover={{ y: -2 }}
              className="card-hover p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: cat.color || '#3b82f6' + '20' }}
                  >
                    <Palette className="w-5 h-5" style={{ color: cat.color || '#3b82f6' }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-surface-900 dark:text-surface-100">
                      {cat.name}
                    </h3>
                    {cat.description && (
                      <p className="text-xs text-surface-500">{cat.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {permissions.update('categories') && (
                    <button
                      onClick={() => openEdit(cat)}
                      className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-400"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  )}
                  {permissions.delete('categories') && (
                    <button
                      onClick={() => setDeleteId(cat.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-xs text-surface-400">Created {formatDate(cat.createdAt)}</p>
            </motion.div>
          ))
        )}
      </div>

      <Modal
        isOpen={showCreateModal || !!editingCategory}
        onClose={() => { setShowCreateModal(false); setEditingCategory(null); form.reset(); }}
        title={editingCategory ? 'Edit Category' : 'New Category'}
      >
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <Input label="Category Name" {...form.register('name')} error={form.formState.errors.name?.message} />
          <div>
            <label className="label">Description (Optional)</label>
            <textarea {...form.register('description')} rows={2} className="input" />
          </div>
          <div>
            <label className="label">Color</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {presetColors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => form.setValue('color', c)}
                  className={`w-8 h-8 rounded-lg border-2 transition-all ${
                    form.watch('color') === c ? 'border-surface-900 dark:border-surface-100 scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => { setShowCreateModal(false); setEditingCategory(null); }}>
              Cancel
            </Button>
            <Button type="submit" loading={createCategory.isPending || updateCategory.isPending}>
              {editingCategory ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Category" size="sm">
        <p className="text-surface-600 dark:text-surface-400 mb-6">
          Are you sure? Items in this category will not be deleted but will become uncategorized.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="danger" onClick={async () => {
            if (deleteId) await deleteCategory.mutateAsync(deleteId);
            setDeleteId(null);
          }} loading={deleteCategory.isPending}>Delete</Button>
        </div>
      </Modal>
    </motion.div>
  );
}