import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { useCreateItem, useUpdateItem, useItemCategories } from '@/hooks/useItems';
import { useToast } from '@/store/ToastContext';
import { Button } from '@/components/ui/Button';
import type { InventoryItem } from '@/types';

export function AddItemPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();

  const editItem = (location.state as { editItem?: InventoryItem })?.editItem;
  const isEditing = !!editItem;

  const createItem = useCreateItem();
  const updateItem = useUpdateItem();
  const { data: categories = [] } = useItemCategories();

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    categoryId: '',
    quantity: 0,
    minStock: 0,
    unitPrice: 0,
    supplier: '',
    storageLocation: '',
    barcode: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editItem) {
      setFormData({
        name: editItem.name,
        sku: editItem.sku,
        categoryId: editItem.categoryId,
        quantity: editItem.quantity,
        minStock: editItem.minStock,
        unitPrice: editItem.unitPrice,
        supplier: editItem.supplier,
        storageLocation: editItem.location,
        barcode: editItem.barcode || '',
        notes: editItem.notes || '',
      });
    }
  }, [editItem]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.sku.trim()) newErrors.sku = 'SKU is required';
    if (!formData.categoryId) newErrors.categoryId = 'Category is required';
    if (formData.quantity < 0) newErrors.quantity = 'Quantity must be 0 or more';
    if (formData.minStock < 0) newErrors.minStock = 'Min stock must be 0 or more';
    if (formData.unitPrice < 0) newErrors.unitPrice = 'Price must be 0 or more';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      if (isEditing && editItem) {
        const updateData: Partial<InventoryItem> = {
          name: formData.name,
          sku: formData.sku,
          categoryId: formData.categoryId,
          quantity: formData.quantity,
          minStock: formData.minStock,
          unitPrice: formData.unitPrice,
          supplier: formData.supplier,
          location: formData.storageLocation,
          storageLocation: formData.storageLocation,
          barcode: formData.barcode || undefined,
          notes: formData.notes || undefined,
        };
        await updateItem.mutateAsync({ id: editItem.id, data: updateData });
        addToast({ title: 'Item Updated', message: 'Item has been updated successfully.', type: 'success' });
      } else {
        await createItem.mutateAsync(formData);
        addToast({ title: 'Item Created', message: 'Item has been added successfully.', type: 'success' });
      }
      navigate('/inventory');
    } catch (err: any) {
      addToast({ title: 'Error', message: err?.message || 'Failed to save item', type: 'error' });
    }
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const isPending = createItem.isPending || updateItem.isPending;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="page-container max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/inventory')} className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-500 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="page-title">{isEditing ? 'Edit Item' : 'Add Item'}</h1>
          <p className="page-subtitle">{isEditing ? 'Editing ' + (editItem?.name || '') : 'Create a new inventory item'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-6">
        {/* Basic Information */}
        <div>
          <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Name *</label>
              <input type="text" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} className={'input' + (errors.name ? ' border-red-500' : '')} placeholder="Item name" />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">SKU *</label>
              <input type="text" value={formData.sku} onChange={(e) => handleChange('sku', e.target.value)} className={'input' + (errors.sku ? ' border-red-500' : '')} placeholder="Stock keeping unit" />
              {errors.sku && <p className="text-red-500 text-xs mt-1">{errors.sku}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Category *</label>
              <select value={formData.categoryId} onChange={(e) => handleChange('categoryId', e.target.value)} className={'select' + (errors.categoryId ? ' border-red-500' : '')}>
                <option value="">Select category</option>
                {categories.map((cat: string) => (<option key={cat} value={cat}>{cat}</option>))}
              </select>
              {errors.categoryId && <p className="text-red-500 text-xs mt-1">{errors.categoryId}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Barcode</label>
              <input type="text" value={formData.barcode} onChange={(e) => handleChange('barcode', e.target.value)} className="input" placeholder="Optional barcode" />
            </div>
          </div>
        </div>

        {/* Stock & Pricing */}
        <div>
          <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-4">Stock & Pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Quantity *</label>
              <input type="number" min="0" value={formData.quantity} onChange={(e) => handleChange('quantity', parseInt(e.target.value) || 0)} className={'input' + (errors.quantity ? ' border-red-500' : '')} />
              {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Min Stock *</label>
              <input type="number" min="0" value={formData.minStock} onChange={(e) => handleChange('minStock', parseInt(e.target.value) || 0)} className={'input' + (errors.minStock ? ' border-red-500' : '')} />
              {errors.minStock && <p className="text-red-500 text-xs mt-1">{errors.minStock}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Unit Price *</label>
              <input type="number" min="0" step="0.01" value={formData.unitPrice} onChange={(e) => handleChange('unitPrice', parseFloat(e.target.value) || 0)} className={'input' + (errors.unitPrice ? ' border-red-500' : '')} />
              {errors.unitPrice && <p className="text-red-500 text-xs mt-1">{errors.unitPrice}</p>}
            </div>
          </div>
        </div>

        {/* Supplier & Location */}
        <div>
          <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-4">Supplier & Location</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Supplier</label>
              <input type="text" value={formData.supplier} onChange={(e) => handleChange('supplier', e.target.value)} className="input" placeholder="Supplier name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Storage Location</label>
              <input type="text" value={formData.storageLocation} onChange={(e) => handleChange('storageLocation', e.target.value)} className="input" placeholder="e.g. Warehouse A, Shelf 12" />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-4">Additional</h2>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Notes</label>
            <textarea value={formData.notes} onChange={(e) => handleChange('notes', e.target.value)} className="input min-h-[100px] resize-y" placeholder="Optional notes" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-200 dark:border-surface-700">
          <Button variant="secondary" onClick={() => navigate('/inventory')} disabled={isPending}>Cancel</Button>
          <Button type="submit" icon={isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} disabled={isPending}>
            {isPending ? 'Saving...' : isEditing ? 'Update Item' : 'Create Item'}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
