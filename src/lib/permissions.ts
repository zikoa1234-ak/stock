export type UserRole = 'admin' | 'manager' | 'staff' | 'viewer';

export const rolePermissions = {
  admin: {
    items: { create: true, read: true, update: true, delete: true },
    categories: { create: true, read: true, update: true, delete: true },
    users: { create: true, read: true, update: true, delete: true },
    movements: { create: true, read: true, update: true, delete: true },
    reports: { read: true, export: true },
    settings: { read: true, update: true },
    dashboard: { read: true },
  },
  manager: {
    items: { create: true, read: true, update: true, delete: false },
    categories: { create: true, read: true, update: true, delete: false },
    users: { create: false, read: true, update: false, delete: false },
    movements: { create: true, read: true, update: false, delete: false },
    reports: { read: true, export: true },
    settings: { read: true, update: false },
    dashboard: { read: true },
  },
  staff: {
    items: { create: true, read: true, update: true, delete: false },
    categories: { create: false, read: true, update: false, delete: false },
    users: { create: false, read: false, update: false, delete: false },
    movements: { create: true, read: true, update: false, delete: false },
    reports: { read: true, export: false },
    settings: { read: false, update: false },
    dashboard: { read: true },
  },
  viewer: {
    items: { create: false, read: true, update: false, delete: false },
    categories: { create: false, read: true, update: false, delete: false },
    users: { create: false, read: false, update: false, delete: false },
    movements: { create: false, read: true, update: false, delete: false },
    reports: { read: true, export: false },
    settings: { read: false, update: false },
    dashboard: { read: true },
  },
} as const;

export type RolePermissions = typeof rolePermissions;
export type AppRole = keyof RolePermissions;

export function hasPermission(
  role: AppRole,
  module: keyof RolePermissions[AppRole],
  action: keyof RolePermissions[AppRole][keyof RolePermissions[AppRole]]
): boolean {
  const permissions = rolePermissions[role];
  if (!permissions) return false;
  const modulePerms = permissions[module];
  if (!modulePerms) return false;
  return modulePerms[action as keyof typeof modulePerms] === true;
}

export function can(
  role: AppRole
): {
  create: (module: keyof RolePermissions[AppRole]) => boolean;
  read: (module: keyof RolePermissions[AppRole]) => boolean;
  update: (module: keyof RolePermissions[AppRole]) => boolean;
  delete: (module: keyof RolePermissions[AppRole]) => boolean;
} {
  const permissions = rolePermissions[role] || rolePermissions.viewer;
  return {
    create: (module) => (permissions[module] as Record<string, boolean>)?.create === true,
    read: (module) => (permissions[module] as Record<string, boolean>)?.read === true,
    update: (module) => (permissions[module] as Record<string, boolean>)?.update === true,
    delete: (module) => (permissions[module] as Record<string, boolean>)?.delete === true,
  };
}