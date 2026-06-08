"import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { ItemFormData } from '@/types';
import { generateSKU } from '@/lib/utils';
import { useItemCategories } from '@/hooks/useItems';

const itemSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  sku: z.string().min(2, 'SKU is required'),
  category: z.string().min(1, 'Category is required'),
  quantity: z.coerce.number().min(0, 'Cannot be negative'),
  minStock: z.coerce.number().min(1, 'Minimum stock must be at least 1'),
  unitPrice: z.coerce.number().min(0, 'Cannot be negative'),
  supplier: z.string().min(1, 'Supplier is required'),
  location: z.string().min(1, 'Location is required'),
  barcode: z.string().optional().default(''),
  description: z.string().optional().default(''),
  imageUrl: z.string().optional().default(''),
});

type FormValues = z.infer<typeof itemSchema>;

interface ItemFormProps {
  defaultValues?: Partial<ItemFormData>;
  onSubmit: (data: ItemFormData) => Promise<void>;
  isLoading?: boolean;
  submitLabel?: string;
}

const commonCategories = [
  'Electronics',
  'Clothing',
  'Food & Beverages',
  'Office Supplies',
  'Furniture',
  'Medical',
  'Automotive',
  'Raw Materials',
  'Packaging',
  'Other',
];

export function ItemForm({ defaultValues, onSubmit, isLoading, submitLabel = 'Save Item' }: ItemFormProps) {
  const [autoSku, setAutoSku] = useState(!defaultValues?.sku);
  const { data: existingCategories } = useItemCategories();

  const allCategoryOptions = [...new Set([...commonCategories, ...(existingCategories || [])])].sort();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      name: '',
      sku: '',
      category: '',
      quantity: 0,
      minStock: 5,
      unitPrice: 0,
      supplier: '',
      location: '',
      barcode: '',
      description: '',
      imageUrl: '',
      ...defaultValues,
    },
  });

  const name = watch('name');
  const category = watch('category');

  const handleAutoSku = () => {
    if (autoSku && name && category) {
      const prefix = category.slice(0, 3).toUpperCase();
      const namePart = name.slice(0, 3).toUpperCase();
      const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
      setValue('sku', `${prefix}-${namePart}-${rand}`);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information */}
      <div>
        <h3 className="text-base font-semibold text-surface-900 dark:text-surface-100 mb-4 pb-2 border-b border-surface-200 dark:border-surface-700">
          Basic Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Item Name *"
            {...register('name')}
            error={errors.name?.message}
            placeholder="e.g., Wireless Mouse"
            onBlur={() => handleAutoSku()}
          />

          <div>
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Input
                  label="SKU *"
                  {...register('sku')}
                  error={errors.sku?.message}
                  placeholder="e.g., ELE-MOU-A1B2"
                  disabled={autoSku ? true : false}
                />
              </div>
              <label className="flex items-center gap-1.5 pb-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoSku}
                  onChange={(e) => setAutoSku(e.target.checked)}
                  className="rounded border-surface-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-xs text-surface-500 whitespace-nowrap">Auto</span>
              </label>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="label">Category *</label>
            <div className="flex gap-2">
              <input
                list="category-list"
                {...register('category')}
                className="input flex-1"
                placeholder="Type or select a category"
              />
              <datalist id="category-list">
                {allCategoryOptions.map((cat) => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
            </div>
            {errors.category && (
              <p className="mt-1 text-sm text-red-500">{errors.category.message}</p>
            )}
          </div>

          <Input
            label="Supplier *"
            {...register('supplier')}
            error={errors.supplier?.message}
            placeholder="e.g., Tech Distributors Inc."
          />

          <Input
            label="Location *"
            {...register('location')}
            error={errors.location?.message}
            placeholder="e.g., Aisle 3, Shelf B"
          />

          <Input
            label="Barcode / Item Code"
            {...register('barcode')}
            placeholder="Optional"
          />
        </div>
      </div>

      {/* Stock & Pricing */}
      <div>
        <h3 className="text-base font-semibold text-surface-900 dark:text-surface-100 mb-4 pb-2 border-b border-surface-200 dark:border-surface-700">
          Stock &amp; Pricing
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Quantity *"
            type="number"
            {...register('quantity', { valueAsNumber: true })}
            error={errors.quantity?.message}
            min={0}
          />

          <Input
            label="Minimum Stock *"
            type="number"
            {...register('minStock', { valueAsNumber: true })}
            error={errors.minStock?.message}
            min={1}
            helperText="Triggers low stock warning"
          />

          <Input
            label="Unit Price ($) *"
            type="number"
            step="0.01"
            {...register('unitPrice', { valueAsNumber: true })}
            error={errors.unitPrice?.message}
            min={0}
          />
        </div>
      </div>

      {/* Additional Info */}
      <div>
        <h3 className="text-base font-semibold text-surface-900 dark:text-surface-100 mb-4 pb-2 border-b border-surface-200 dark:border-surface-700">
          Additional Information
        </h3>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="label">Description / Notes</label>
            <textarea
              {...register('description')}
              rows={3}
              className="input resize-none"
              placeholder="Optional notes, description, or specifications..."
            />
          </div>

          <Input
            label="Image URL"
            {...register('imageUrl')}
            placeholder="Optional - link to product image"
          />
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-3 pt-4 border-t border-surface-200 dark:border-surface-700">
        <Button
          type="button"
          variant="secondary"
          onClick={() => window.history.back()}
        >
          Cancel
        </Button>
        <Button type="submit" loading={isLoading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
"