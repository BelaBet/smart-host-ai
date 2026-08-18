export type AppRole = 'super_admin' | 'admin' | 'gerente' | 'recepcao' | 'caixa' | 'governanca';

export const ROLE_LABELS: Record<AppRole, string> = {
  super_admin: 'Super Administrador',
  admin: 'Administrador',
  gerente: 'Gerente',
  recepcao: 'Recepção',
  caixa: 'Caixa',
  governanca: 'Governança',
};

export const ROLE_PERMISSIONS: Record<AppRole, string[]> = {
  super_admin: ['*'],
  admin: ['dashboard', 'hospedes', 'quartos', 'reservas', 'caixa', 'restaurante', 'relatorios', 'auditoria', 'config'],
  gerente: ['dashboard', 'hospedes', 'quartos', 'reservas', 'restaurante', 'relatorios'],
  recepcao: ['dashboard', 'hospedes', 'quartos', 'reservas'],
  caixa: ['dashboard', 'caixa', 'relatorios'],
  governanca: ['dashboard', 'quartos'],
};

export function hasPermission(role: AppRole | null | undefined, permission: string) {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.includes('*') || ROLE_PERMISSIONS[role]?.includes(permission) || false;
}
