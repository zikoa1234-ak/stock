import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import type { Category } from '@/types';
import { generateSKU } from '@/lib/utils';
import { useState } from 'react';

const itemSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  sku: z.string().min(3, 'SKU is required'),
  categoryId: z.string().min(1, 'Category is required'),
  quantity: z.coerce.number().min(0, 'Quantity cannot be negative'),
  minStock: z.coerce.number().min(0, 'Min stock cannot be negative'),
  unitPrice: z.coerce.number().min(0, 'Price cannot be negative'),
  supplier: z.string().min(1, 'Supplier is required'),
  storageLocation: z.string().min(1, 'Location is required'),
  barcode: z.string().optional(),
  notes: z.string().optional(),
});

type ItemFormData = z.infer<typeof itemSchema>;

interface ItemFormProps {
  defaultValues?: Partial<ItemFormData>;
  onSubmit: (data: ItemFormData) => Promise<void>;
  isLoading?: boolean;
  categories: Category[];
}

export function ItemForm({ defaultValues, onSubmit, isLoading, categories }: ItemFormProps) {
  const [autoGenerateSKU, setAutoGenerateSKU] = useState(!defaultValues?.sku);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      name: '',
      sku: '',
      categoryId: '',
      quantity: 0,
      minStock: 5,
      unitPrice: 0,
      supplier: '',
      storageLocation: '',
      barcode: '',
      notes: '',
      ...defaultValues,
    },
  });

  const name = watch('name');
  const categoryId = watch('categoryId');

  const generateSKUAutomatically = () => {
    if (autoGenerateSKU && categoryId && name) {
      const cat = categories.find((c) => c.id === categoryId);
      const sku = generateSKU(cat?.name || '', name);
      setValue('sku', sku);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Item Name"
          {...register('name')}
          error={errors.name?.message}
          placeholder="Enter item name"
          onBlur={() => generateSKUAutomatically()}
        />

        <div>
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Input
                label="SKU"
                {...register('sku')}
                error={errors.sku?.message}
                placeholder="Auto-generated or manual"
                disabled={autoGenerateSKU && !!name && !!categoryId}
              />
            </div>
            <label className="flex items-center gap-2 pb-2">
              <input
                type="checkbox"
                checked={autoGenerateSKU}
                onChange={(e) => setAutoGenerateSKU(e.target.checked)}
                className="rounded border-surface-300 text-primary-600"
              />
              <span className="text-xs text-surface-500">Auto</span>
            </label>
          </div>
        </div>

        <Select
          label="Category"
          {...register('categoryId')}
          error={errors.categoryId?.message}
          options={[
            ...categories.map((cat) => ({ value: cat.id, label: cat.name })),
          ]}
          placeholder="Select category"
        />

        <Input
          label="Supplier"
          {...register('supplier')}
          error={errors.supplier?.message}
          placeholder="Supplier name"
        />

        <Input
          label="Quantity"
          type="number"
          {...register('quantity', { valueAsNumber: true })}
          error={errors.quantity?.message}
        />

        <Input
          label="Minimum Stock"
          type="number"
          {...register('minStock', { valueAsNumber: true })}
          error={errors.minStock?.message}
        />

        <Input
          label="Unit Price ($)"
          type="number"
          step="0.01"
          {...register('unitPrice', { valueAsNumber: true })}
          error={errors.unitPrice?.message}
        />

        <Input
          label="Storage Location"
          {...register('storageLocation')}
          error={errors.storageLocation?.message}
          placeholder="e.g., Aisle 1, Shelf B"
        />

        <Input
          label="Barcode / QR"
          {...register('barcode')}
          error={errors.barcode?.message}
          placeholder="Optional"
        />
      </div>

      <div>
        <label className="label">Notes</label>
        <textarea
          {...register('notes')}
          rows={3}
          className="input"
          placeholder="Additional notes..."
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="submit" loading={isLoading}>
          {defaultValues ? 'Update Item' : 'Create Item'}
        </Button>
      </div>
    </form>
  );
}