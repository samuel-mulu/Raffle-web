import { Role, User } from '@/types/api';

export const ROLE_LABELS: Record<Role, string> = {
  [Role.USER]: 'Buyer',
  [Role.CREATOR]: 'Creator',
  [Role.ADMIN]: 'Admin',
};

export const ROLE_LANDING_PATHS: Record<Role, string> = {
  [Role.USER]: '/buyer/campaigns',
  [Role.CREATOR]: '/creator/overview',
  [Role.ADMIN]: '/admin/overview',
};

export function getRoleLabel(role: Role) {
  return ROLE_LABELS[role];
}

export function getLandingPath(input?: Pick<User, 'role' | 'landingPath'> | null) {
  if (!input) {
    return ROLE_LANDING_PATHS[Role.USER];
  }

  return input.landingPath || ROLE_LANDING_PATHS[input.role];
}

export function getRequiredWorkspaceRole(pathname: string) {
  if (pathname.startsWith('/admin')) {
    return Role.ADMIN;
  }

  if (pathname.startsWith('/creator')) {
    return Role.CREATOR;
  }

  return null;
}

export function isAuthScreen(pathname: string) {
  return pathname === '/login';
}

export function isWorkspacePath(pathname: string) {
  return pathname.startsWith('/admin') || pathname.startsWith('/creator');
}
