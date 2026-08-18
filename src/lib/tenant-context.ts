import { supabase } from '@/integrations/supabase/client';

export type TenantContext = {
  organizationId: string;
  role: string;
};

let cached: TenantContext | null = null;

export async function getTenantContext(force = false): Promise<TenantContext | null> {
  if (cached && !force) return cached;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('organization_members')
    .select('organization_id, role')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  cached = data ? { organizationId: data.organization_id, role: data.role } : null;
  return cached;
}

export function clearTenantContext() {
  cached = null;
}

export async function withTenant<T extends Record<string, unknown>>(payload: T) {
  const tenant = await getTenantContext();
  if (!tenant) throw new Error('Usuário não está vinculado a uma organização.');
  return { ...payload, organization_id: tenant.organizationId };
}
