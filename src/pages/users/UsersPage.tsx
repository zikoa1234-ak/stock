import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Shield, UserCheck, UserX, MoreVertical } from 'lucide-react';
import { useUsers, useUpdateUser, useCreateUser } from '@/hooks/useUsers';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { formatDate, getInitials } from '@/lib/utils';
import type { AppUser, UserRole, UserStatus } from '@/types';

const userFormSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  displayName: z.string().min(2, 'Name is required'),
  role: z.enum(['admin', 'manager', 'staff', 'viewer']),
});

type UserFormData = z.infer<typeof userFormSchema>;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const roleColors: Record<UserRole, string> = {
  admin: 'badge-red',
  manager: 'badge-blue',
  staff: 'badge-green',
  viewer: 'badge-gray',
};

const statusColors: Record<UserStatus, string> = {
  active: 'badge-green',
  inactive: 'badge-gray',
  suspended: 'badge-red',
};

export function UsersPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);

  const { data: users, isLoading } = useUsers();
  const updateUser = useUpdateUser();
  const createUser = useCreateUser();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      email: '',
      password: '',
      displayName: '',
      role: 'staff',
    },
  });

  const handleCreate = async (data: UserFormData) => {
    await createUser.mutateAsync(data);
    setShowCreateModal(false);
    reset();
  };

  const toggleUserStatus = async (user: AppUser) => {
    const newStatus: UserStatus = user.status === 'active' ? 'inactive' : 'active';
    await updateUser.mutateAsync({ uid: user.uid, data: { status: newStatus } });
  };

  const changeUserRole = async (user: AppUser, newRole: UserRole) => {
    await updateUser.mutateAsync({ uid: user.uid, data: { role: newRole } });
    setEditingUser(null);
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="page-container"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">Manage users and roles</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} icon={<Plus className="w-4 h-4" />}>
          Add User
        </Button>
      </div>

      <div className="card divide-y divide-surface-200 dark:divide-surface-700">
        {isLoading ? (
          <div className="p-8 text-center text-surface-500">Loading users...</div>
        ) : !users || users.length === 0 ? (
          <div className="p-8 text-center text-surface-500">No users found</div>
        ) : (
          users.map((user) => (
            <motion.div
              key={user.uid}
              variants={containerVariants}
              className="p-4 flex items-center gap-4 hover:bg-surface-50 dark:hover:bg-surface-700/30 transition-colors"
            >
              <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                  {getInitials(user.displayName)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-surface-900 dark:text-surface-100 truncate">
                  {user.displayName}
                </p>
                <p className="text-xs text-surface-500 truncate">{user.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={roleColors[user.role]}>
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </span>
                <span className={statusColors[user.status]}>
                  {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <select
                  value={user.role}
                  onChange={(e) => changeUserRole(user, e.target.value as UserRole)}
                  className="select text-xs py-1 px-2 w-auto"
                >
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="staff">Staff</option>
                  <option value="viewer">Viewer</option>
                </select>
                <button
                  onClick={() => toggleUserStatus(user)}
                  className={`p-1.5 rounded-lg ${
                    user.status === 'active'
                      ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                      : 'text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20'
                  }`}
                >
                  {user.status === 'active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <Modal
        isOpen={showCreateModal}
        onClose={() => { setShowCreateModal(false); reset(); }}
        title="Create User"
      >
        <form onSubmit={handleSubmit(handleCreate)} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input {...register('displayName')} className="input" placeholder="John Doe" />
            {errors.displayName && <p className="text-sm text-red-500 mt-1">{errors.displayName.message}</p>}
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" {...register('email')} className="input" placeholder="user@company.com" />
            {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="label">Password</label>
            <input type="password" {...register('password')} className="input" placeholder="Temporary password" />
            {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>}
          </div>
          <div>
            <label className="label">Role</label>
            <select {...register('role')} className="select">
              <option value="staff">Staff</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => { setShowCreateModal(false); reset(); }}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting}>
              Create User
            </Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}