export type Role = 'customer' | 'staff' | 'admin' | 'super_admin';

export const PERMISSIONS = {
  'products.read': ['customer', 'staff', 'admin', 'super_admin'],
  'products.write': ['staff', 'admin', 'super_admin'],
  'inventory.read': ['staff', 'admin', 'super_admin'],
  'inventory.adjust': ['staff', 'admin', 'super_admin'],
  'orders.read': ['customer', 'staff', 'admin', 'super_admin'],
  'orders.update': ['staff', 'admin', 'super_admin'],
  'customers.read': ['staff', 'admin', 'super_admin'],
  'users.read': ['admin', 'super_admin'],
  'users.manage': ['super_admin'],
  'settings.manage': ['admin', 'super_admin'],
} as const;

export type Permission = keyof typeof PERMISSIONS;

export function hasPermission(role: string | undefined, permission: Permission): boolean {
  if (!role) return false;
  const allowedRoles = PERMISSIONS[permission] as readonly string[];
  return allowedRoles.includes(role);
}
