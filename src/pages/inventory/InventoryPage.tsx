import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Search, Download, Package, Edit3, Archive, RotateCcw, Trash2, Eye } from 'lucide-react';
import { useItems, useItemCategories, useArchiveItem, useRestoreItem, useDeleteItem, useAdjustStock } from '@/hooks/useItems';
import { useAuth } from '@/store/AuthContext';
import { can } from '@/lib/permissions';
import type { InventoryItem, FilterState, SortState, UserRole } from '@/types';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { StockAdjustModal } from '@/components/modals/StockAdjustModal';
import { formatDate, formatCurrency, getStockStatus } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

export function InventoryPage() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const userRole = (userProfile?.role || 'viewer') as unknown as UserRole;
  const permissions = can(userRole as any);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'active' | 'archived' | 'all'>('active');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [viewingItem, setViewingItem] = useState<InventoryItem | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<InventoryItem | null>(null);
  const [restoreTarget, setRestoreTarget] = useState<InventoryItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<InventoryItem | null>(null);
  const [stockAdjustTarget, setStockAdjustTarget] = useState<InventoryItem | null>(null);

  const filter: FilterState = { search: debouncedSearch, category: categoryFilter || undefined, status: statusFilter };
  const sort: SortState = { field: sortField, direction: sortDirection };
  const { data, isLoading } = useItems({ filter, sort });
  const { data: categories } = useItemCategories();
  const archiveItem = useArchiveItem();
  const restoreItem = useRestoreItem();
  const deleteItem = useDeleteItem();
  const adjustStock = useAdjustStock();

  const items = data?.items || [];

  const handleSearch = (val: string) => {
    setSearch(val);
    setTimeout(() => setDebouncedSearch(val), 300);
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleExportCSV = () => {
    const headers = ['Name', 'SKU', 'Category', 'Quantity', 'Min Stock', 'Unit Price', 'Supplier', 'Location', 'Barcode', 'Status', 'Created'];
    const csvItems = items.map(item => [
      item.name, item.sku, item.category, item.quantity, item.minStock,
      item.unitPrice, item.supplier, item.location, item.barcode || '',
      item.status, formatDate(item.createdAt)
    ]);
    const csv = [headers.join(','), ...csvItems.map(row => row.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inventory-export.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return null;
    return <span className="ml-1">{sortDirection === 'asc' ? '\u25B2' : '\u25BC'}</span>;
  };

  // Empty state
  if (!isLoading && items.length === 0) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="page-container">
        <div className="max-w-lg mx-auto text-center py-16">
          <div className="w-20 h-20 bg-surface-100 dark:bg-surface-700 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Package className="w-10 h-10 text-surface-400" />
          </div>
          <h2 className="text-2xl font-bold text-surface-900 dark:text-surface-100 mb-2">No items yet</h2>
          <p className="text-surface-500 mb-8">Get started by adding your first inventory item.</p>
          {permissions.create('items') && (
            <Button onClick={() => navigate('/inventory/add')} icon={<Plus className="w-4 h-4" />} size="lg">
              Add Your First Item
            </Button>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="page-container">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="page-title">Inventory</h1>
          <p className="page-subtitle">{items.length} item{items.length !== 1 ? 's' : ''} in stock</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={handleExportCSV} icon={<Download className="w-4 h-4" />}>Export</Button>
          {permissions.create('items') && (
            <Button onClick={() => navigate('/inventory/add')} icon={<Plus className="w-4 h-4" />}>Add Item</Button>
          )}
        </div>
      </div>

      <div className="card p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <input type="text" placeholder="Search by name, SKU, supplier, barcode..." value={search} onChange={(e) => handleSearch(e.target.value)} className="input pl-10" />
          </div>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="select w-full md:w-48">
            <option value="">All Categories</option>
            {categories?.map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="select w-full md:w-40">
            <option value="active">Active</option>
            <option value="archived">Archived</option>
            <option value="all">All</option>
          </select>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-surface-50 dark:bg-surface-800/50 border-b border-surface-200 dark:border-surface-700">
                <th className="table-header px-4 py-3 text-left cursor-pointer select-none" onClick={() => handleSort('name')}>Item<SortIcon field="name" /></th>
                <th className="table-header px-4 py-3 text-left cursor-pointer select-none" onClick={() => handleSort('category')}>Category<SortIcon field="category" /></th>
                <th className="table-header px-4 py-3 text-left cursor-pointer select-none" onClick={() => handleSort('quantity')}>Stock<SortIcon field="quantity" /></th>
                <th className="table-header px-4 py-3 text-left cursor-pointer select-none" onClick={() => handleSort('unitPrice')}>Price<SortIcon field="unitPrice" /></th>
                <th className="table-header px-4 py-3 text-left">Supplier</th>
                <th className="table-header px-4 py-3 text-left">Location</th>
                <th className="table-header px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-200 dark:divide-surface-700">
              {isLoading ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-surface-500"><div className="flex items-center justify-center gap-2"><div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />Loading items...</div></td></tr>
              ) : items.map((item) => {
                const stockStatus = getStockStatus(item.quantity, item.minStock);
                return (
                  <tr key={item.id} className="hover:bg-surface-50 dark:hover:bg-surface-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center shrink-0">
                          <Package className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                        </div>
                        <div>
                          <p className="font-medium text-surface-900 dark:text-surface-100">{item.name}</p>
                          <p className="text-xs text-surface-500">SKU: {item.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><span className="badge-gray">{item.category}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-surface-900 dark:text-surface-100">{item.quantity}</span>
                        {stockStatus && <span className={stockStatus.badge}>{stockStatus.label}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-surface-900 dark:text-surface-100">{formatCurrency(item.unitPrice)}</td>
                    <td className="px-4 py-3 text-surface-600 dark:text-surface-400">{item.supplier}</td>
                    <td className="px-4 py-3 text-surface-600 dark:text-surface-400">{item.location}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setViewingItem(item)} className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-400" title="View"><Eye className="w-4 h-4" /></button>
                        {permissions.update('items') && <button onClick={() => setStockAdjustTarget(item)} className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-400" title="Adjust Stock"><Package className="w-4 h-4" /></button>}
                        {permissions.update('items') && <button onClick={() => navigate('/inventory/add', { state: { editItem: item } })} className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-400" title="Edit"><Edit3 className="w-4 h-4" /></button>}
                        {item.status === 'active' && permissions.update('items') && <button onClick={() => setArchiveTarget(item)} className="p-1.5 rounded-lg hover:bg-yellow-50 dark:hover:bg-yellow-900/20 text-yellow-500" title="Archive"><Archive className="w-4 h-4" /></button>}
                        {item.status === 'archived' && permissions.update('items') && <button onClick={() => setRestoreTarget(item)} className="p-1.5 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 text-green-500" title="Restore"><RotateCcw className="w-4 h-4" /></button>}
                        {permissions.delete('items') && <button onClick={() => setDeleteTarget(item)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500" title="Delete"><Trash2 className="w-4 h-4" /></button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {viewingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setViewingItem(null)} />
          <div className="relative bg-white dark:bg-surface-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-surface-900 dark:text-surface-100">{viewingItem.name}</h2>
              <button onClick={() => setViewingItem(null)} className="p-1 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-400">&times;</button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><span className="text-xs text-surface-500 uppercase">SKU</span><p className="font-medium">{viewingItem.sku}</p></div>
              <div><span className="text-xs text-surface-500 uppercase">Category</span><p>{viewingItem.category}</p></div>
              <div><span className="text-xs text-surface-500 uppercase">Quantity</span><p className="font-semibold">{viewingItem.quantity}</p></div>
              <div><span className="text-xs text-surface-500 uppercase">Min Stock</span><p>{viewingItem.minStock}</p></div>
              <div><span className="text-xs text-surface-500 uppercase">Unit Price</span><p>{formatCurrency(viewingItem.unitPrice)}</p></div>
              <div><span className="text-xs text-surface-500 uppercase">Supplier</span><p>{viewingItem.supplier}</p></div>
              <div><span className="text-xs text-surface-500 uppercase">Location</span><p>{viewingItem.location}</p></div>
              {viewingItem.barcode && <div><span className="text-xs text-surface-500 uppercase">Barcode</span><p>{viewingItem.barcode}</p></div>}
              <div><span className="text-xs text-surface-500 uppercase">Status</span><p className="capitalize">{viewingItem.status}</p></div>
              <div><span className="text-xs text-surface-500 uppercase">Created</span><p>{formatDate(viewingItem.createdAt)}</p></div>
            </div>
            {viewingItem.description && (
              <div className="mt-4"><span className="text-xs text-surface-500 uppercase">Description</span><p className="mt-1 text-sm">{viewingItem.description}</p></div>
            )}
            <div className="mt-6 pt-4 border-t border-surface-200 flex justify-end">
              <Button variant="secondary" onClick={() => setViewingItem(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal isOpen={!!archiveTarget} onClose={() => setArchiveTarget(null)} onConfirm={() => { if (archiveTarget) archiveItem.mutate(archiveTarget.id); setArchiveTarget(null); }} title="Archive Item" message={`Archive ${archiveTarget?.name}? It will be hidden from inventory.`} confirmLabel="Archive" variant="warning" loading={archiveItem.isPending} />
      <ConfirmModal isOpen={!!restoreTarget} onClose={() => setRestoreTarget(null)} onConfirm={() => { if (restoreTarget) restoreItem.mutate(restoreTarget.id); setRestoreTarget(null); }} title="Restore Item" message={`Restore ${restoreTarget?.name} to active inventory?`} confirmLabel="Restore" variant="info" loading={restoreItem.isPending} />
      <ConfirmModal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => { if (deleteTarget) deleteItem.mutate(deleteTarget.id); setDeleteTarget(null); }} title="Delete Item" message={`Permanently delete ${deleteTarget?.name}? This cannot be undone.`} confirmLabel="Delete" variant="danger" loading={deleteItem.isPending} />

      <StockAdjustModal isOpen={!!stockAdjustTarget} onClose={() => setStockAdjustTarget(null)} item={stockAdjustTarget} onConfirm={async (newQty, _reason) => { if (stockAdjustTarget) { await adjustStock.mutateAsync({ itemId: stockAdjustTarget.id, newQuantity: newQty }); } }} isLoading={adjustStock.isPending} />
    </motion.div>
  );
}
