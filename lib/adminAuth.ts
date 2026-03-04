import type { AdminRole } from '@/types';

/**
 * Check if user has admin access
 * In a real app, this would check against session/database
 */
export function isAdminUser(role?: AdminRole): boolean {
  if (!role) return false;
  return role === 'ADMIN' || role === 'SUPER_ADMIN';
}

/**
 * Check if user is super admin
 */
export function isSuperAdmin(role?: AdminRole): boolean {
  return role === 'SUPER_ADMIN';
}

/**
 * Check if user has permission for an action
 */
export function hasPermission(
  role: AdminRole | undefined,
  action: 'read' | 'write' | 'delete' | 'manage'
): boolean {
  if (!role) return false;

  if (role === 'SUPER_ADMIN') return true;

  if (role === 'ADMIN') {
    return action !== 'manage'; // ADMINs can't manage other admins
  }

  return false;
}

/**
 * Get admin permissions for current role
 */
export function getAdminPermissions(role: AdminRole | undefined) {
  const permissions = {
    canReadUsers: false,
    canEditUsers: false,
    canDeleteUsers: false,
    canReadProjects: false,
    canEditProjects: false,
    canDeleteProjects: false,
    canManageComponents: false,
    canManageTemplates: false,
    canManagePricing: false,
    canViewAnalytics: false,
    canManageSettings: false,
    canManageAdmins: false,
  };

  if (!role) return permissions;

  // All admins can read
  if (isAdminUser(role)) {
    permissions.canReadUsers = true;
    permissions.canReadProjects = true;
    permissions.canViewAnalytics = true;
  }

  // All admins can edit and delete (except users)
  if (isAdminUser(role)) {
    permissions.canEditProjects = true;
    permissions.canDeleteProjects = true;
    permissions.canManageComponents = true;
    permissions.canManageTemplates = true;
    permissions.canManagePricing = true;
  }

  // Only super admins can manage users and other admins
  if (isSuperAdmin(role)) {
    permissions.canEditUsers = true;
    permissions.canDeleteUsers = true;
    permissions.canManageAdmins = true;
    permissions.canManageSettings = true;
  }

  return permissions;
}

/**
 * Mock function to get current admin from session
 * In a real app, this would come from auth library (NextAuth, Auth0, etc)
 */
export async function getCurrentAdmin(): Promise<{ role: AdminRole } | null> {
  // This is a mock - replace with actual session retrieval
  try {
    // In a real app:
    // const session = await getSession();
    // return session?.user;
    return null;
  } catch (error) {
    console.error('Failed to get current admin:', error);
    return null;
  }
}

/**
 * Redirect to login if not authenticated
 */
export function requireAdmin() {
  // This would be used in middleware or server components
  // to check admin access and redirect if needed
}
