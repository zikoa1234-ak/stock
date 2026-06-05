import { ReactNode } from 'react';
import { Loader2, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
  sortable?: boolean;
  width?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (field: string) => void;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  keyExtractor: (item: T) => string;
}

export function Table<T>({
  columns,
  data,
  loading,
  sortField,
  sortDirection,
  onSort,
  onRowClick,
  emptyMessage = 'No data found',
  keyExtractor,
}: TableProps<T>) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-surface-500 dark:text-surface-400">{emptyMessage}</p>
      </div>
    );
  }

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return <ChevronsUpDown className="w-4 h-4" />;
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-surface-200 dark:border-surface-700">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-500 dark:text-surface-400',
                  col.sortable && 'cursor-pointer hover:text-surface-700 dark:hover:text-surface-200 select-none',
                  col.width
                )}
                onClick={() => col.sortable && onSort?.(col.key)}
              >
                <div className="flex items-center gap-1">
                  {col.header}
                  {col.sortable && <SortIcon field={col.key} />}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-200 dark:divide-surface-700">
          {data.map((item) => (
            <tr
              key={keyExtractor(item)}
              className={cn(
                'transition-colors',
                onRowClick && 'cursor-pointer hover:bg-surface-50 dark:hover:bg-surface-800/50'
              )}
              onClick={() => onRowClick?.(item)}
            >
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 text-sm text-surface-700 dark:text-surface-300">
                  {col.render ? col.render(item) : (item as any)[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}