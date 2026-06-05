import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, Download, MoreVertical, Package, Edit3, Trash2, Eye } from 'lucide-react';
import { useItems, useCreateItem, useUpdateItem, useDeleteItem } from '@/hooks/useItems';
import { useCategories } from '@/hooks/useCategories';
import { useAuth } from '@/store/AuthContext';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Table } from '@/components/ui/Table';
import { ItemForm } from '@/components/forms/ItemForm';
import { ItemDetailDrawer } from '@/components/drawers/ItemDetailDrawer';
import { formatNumber, formatCurrency, getStockStatus, formatDate, debounce } from '@/lib/utils';
import type { InventoryItem } from '@/types';
import { can } from '@/lib/permissions';
import type { UserRole } from '@/lib/permissions';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

export function InventoryPage() {
  const { userProfile } = useAuth();
  const userRole = (userProfile?.role || 'viewer') as UserRole;
  const permissions = can(userRole);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [viewingItem, setViewingItem] = useState<InventoryItem | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const { data: itemsData, isLoading } = useItems({ search, categoryId: categoryFilter });
  const { data: categories } = useCategories();
  const createItem = useCreateItem();
  const updateItem = useUpdateItem();
  const deleteItem = useDeleteItem();

  const items = itemsData?.items || [];

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedItems = [...items].sort((a: any, b: any) => {
    const aVal = a[sortField];
    const bVal = b[sortField];
    const dir = sortDirection === 'asc' ? 1 : -1;
    if (aVal < bVal) return -1 * dir;
    if (aVal > bVal) return 1 * dir;
    return 0;
  });

  const handleExportCSV = () => {
    const headers = ['Name', 'SKU', 'Category', 'Quantity', 'Min Stock', 'Unit Price', 'Supplier', 'Location'];
    const csvItems = items.map((item: InventoryItem) => [
      item.name,
      item.sku,
      categories?.find((c) => c.id === item.categoryId)?.name || '',
      item.quantity,
      item.minStock,
      item.unitPrice,
      item.supplier,
      item.storageLocation,
    ]);
    const csv = [headers.join(','), ...csvItems.map((row: any) => row.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inventory-export.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const columns = [
    {
      key: 'name',
      header: 'Item',
      sortable: true,
      render: (item: InventoryItem) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center">
            <Package className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <p className="font-medium text-surface-900 dark:text-surface-100">{item.name}</p>
            <p className="text-xs text-surface-500">SKU: {item.sku}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'categoryId',
      header: 'Category',
      sortable: true,
      render: (item: InventoryItem) => {
        const cat = categories?.find((c) => c.id === item.categoryId);
        return (
          <span className="badge-gray">
            {cat?.name || 'Uncategorized'}
          </span>
        );
      },
    },
    {
      key: 'quantity',
      header: 'Qty',
      sortable: true,
      render: (item: InventoryItem) => {
        const status = getStockStatus(item.quantity, item.minStock);
        return (
          <div className="flex items-center gap-2">
            <span className="font-semibold">{formatNumber(item.quantity)}</span>
            <span className={status.badge}>{status.label}</span>
          </div>
        );
      },
    },
    {
      key: 'unitPrice',
      header: 'Price',
      sortable: true,
      render: (item: InventoryItem) => formatCurrency(item.unitPrice),
    },
    {
      key: 'supplier',
      header: 'Supplier',
      sortable: true,
    },
    {
      key: 'storageLocation',
      header: 'Location',
    },
    {
      key: 'actions',
      header: '',
      width: 'w-24',
      render: (item: InventoryItem) => (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); setViewingItem(item); }}
            className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-400"
          >
            <Eye className="w-4 h-4" />
          </button>
          {permissions.update('items') && (
            <button
              onClick={(e) => { e.stopPropagation(); setEditingItem(item); }}
              className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-400"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          )}
          {permissions.delete('items') && (
            <button
              onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(item.id); }}
              className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="page-container"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="page-title">Inventory</h1>
          <p className="page-subtitle">Manage your stock items</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={handleExportCSV} icon={<Download className="w-4 h-4" />}>
            Export
          </Button>
          {permissions.create('items') && (
            <Button onClick={() => setShowCreateModal(true)} icon={<Plus className="w-4 h-4" />}>
              Add Item
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <input
              type="text"
              placeholder="Search by name, SKU, or supplier..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
            />
          </div>
          <div className="w-full md:w-48">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="select"
            >
              <option value="">All Categories</option>
              {categories?.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <Table
          columns={columns}
          data={sortedItems}
          loading={isLoading}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
          onRowClick={(item) => setViewingItem(item)}
          keyExtractor={(item) => item.id}
          emptyMessage="No inventory items found. Create your first item to get started."
        />
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Add New Item"
        size="lg"
      >
        <ItemForm
          onSubmit={async (data) => {
            await createItem.mutateAsync(data as any);
            setShowCreateModal(false);
          }}
          isLoading={createItem.isPending}
          categories={categories || []}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        title="Edit Item"
        size="lg"
      >
        {editingItem && (
          <ItemForm
            defaultValues={editingItem}
            onSubmit={async (data) => {
              await updateItem.mutateAsync({ id: editingItem.id, data: data as any });
              setEditingItem(null);
            }}
            isLoading={updateItem.isPending}
            categories={categories || []}
          />
        )}
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        isOpen={!!showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(null)}
        title="Delete Item"
        size="sm"
      >
        <p className="text-surface-600 dark:text-surface-400 mb-6">
          Are you sure you want to delete this item? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setShowDeleteConfirm(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={async () => {
              if (showDeleteConfirm) {
                await deleteItem.mutateAsync(showDeleteConfirm);
                setShowDeleteConfirm(null);
              }
            }}
            loading={deleteItem.isPending}
          >
            Delete
          </Button>
        </div>
      </Modal>

      {/* Detail Drawer */}
      <ItemDetailDrawer
        item={viewingItem}
        onClose={() => setViewingItem(null)}
        onEdit={(item) => {
          setViewingItem(null);
          setEditingItem(item);
        }}
      />
    </motion.div>
  );
}