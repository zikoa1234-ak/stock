import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import type { InventoryItem, MovementType } from '@/types';

const movementSchema = z.object({
  itemId: z.string().min(1, 'Item is required'),
  type: z.enum(['in', 'out', 'adjustment']),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
  reason: z.string().min(2, 'Reason is required'),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

type MovementFormData = z.infer<typeof movementSchema>;

interface MovementFormProps {
  items: InventoryItem[];
  onSubmit: (data: MovementFormData) => Promise<void>;
  isLoading?: boolean;
  selectedItemId?: string;
}

export function MovementForm({ items, onSubmit, isLoading, selectedItemId }: MovementFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<MovementFormData>({
    resolver: zodResolver(movementSchema),
    defaultValues: {
      itemId: selectedItemId || '',
      type: 'in',
      quantity: 1,
      reason: '',
      reference: '',
      notes: '',
    },
  });

  const type = watch('type');
  const itemId = watch('itemId');
  const selectedItem = items.find((i) => i.id === itemId);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Select
        label="Item"
        {...register('itemId')}
        error={errors.itemId?.message}
        options={items.map((item) => ({
          value: item.id,
          label: `${item.name} (${item.sku}) - Qty: ${item.quantity}`,
        }))}
        placeholder="Select an item"
      />

      {selectedItem && (
        <div className="bg-surface-50 dark:bg-surface-700/50 rounded-lg p-3">
          <p className="text-sm text-surface-600 dark:text-surface-400">
            Current quantity: <span className="font-semibold text-surface-900 dark:text-surface-100">{selectedItem.quantity}</span>
          </p>
        </div>
      )}

      <Select
        label="Movement Type"
        {...register('type')}
        error={errors.type?.message}
        options={[
          { value: 'in', label: 'Stock In (Add)' },
          { value: 'out', label: 'Stock Out (Remove)' },
          { value: 'adjustment', label: 'Adjustment (Set exact quantity)' },
        ]}
      />

      <Input
        label={type === 'adjustment' ? 'New Quantity' : 'Quantity'}
        type="number"
        {...register('quantity', { valueAsNumber: true })}
        error={errors.quantity?.message}
      />

      <Input
        label="Reason"
        {...register('reason')}
        error={errors.reason?.message}
        placeholder="e.g., Supplier delivery, Damaged goods"
      />

      <Input
        label="Reference (Optional)"
        {...register('reference')}
        placeholder="PO number, invoice, etc."
      />

      <div>
        <label className="label">Notes (Optional)</label>
        <textarea
          {...register('notes')}
          rows={2}
          className="input"
          placeholder="Additional notes..."
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="submit" loading={isLoading}>
          Record Movement
        </Button>
      </div>
    </form>
  );
}