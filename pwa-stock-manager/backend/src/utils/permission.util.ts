import { Role } from '@prisma/client';
import { JWTPayload } from '../types';

export class PermissionUtil {
  static hasRole(user: JWTPayload, requiredRole: Role): boolean {
    const roleHierarchy: Record<Role, number> = {
      ADMIN: 100,
      NORMAL_USER: 10,
    };

    return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
  }

  static isAdmin(user: JWTPayload): boolean {
    return this.hasRole(user, Role.ADMIN);
  }

  static canManageUsers(user: JWTPayload): boolean {
    return this.isAdmin(user);
  }

  static canManageItems(user: JWTPayload): boolean {
    return this.isAdmin(user);
  }

  static canManageCategories(user: JWTPayload): boolean {
    return this.isAdmin(user);
  }

  static canViewAllItems(user: JWTPayload): boolean {
    return this.isAdmin(user);
  }

  static canCreateMovements(user: JWTPayload): boolean {
    return true; // Both admin and normal users can create movements
  }

  static canViewAllMovements(user: JWTPayload): boolean {
    return this.isAdmin(user);
  }

  static canViewDashboard(user: JWTPayload): boolean {
    return true; // Both admin and normal users can view dashboard
  }

  static canAccessResource(user: JWTPayload, resourceUserId?: string): boolean {
    if (this.isAdmin(user)) return true;
    return user.userId === resourceUserId;
  }

  static validatePermission(user: JWTPayload, permission: keyof typeof PermissionUtil): boolean {
    const method = this[permission];
    if (typeof method === 'function') {
      return method.call(this, user);
    }
    return false;
  }
}