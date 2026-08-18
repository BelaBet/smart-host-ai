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
  const db = supabase as any;

  const { data, error } = await db.from('organization_members').select('organization_id, role').eq('user_id', user.id).order('created_at', { ascending: true });
  if (error) throw error;
  if (!data?.length) return null;

  const { data: active } = await db.from('user_active_organization').select('organization_id').eq('user_id', user.id).maybeSingle();
  const selected = active?.organization_id && data.some((m: any) => m.organization_id === active.organization_id) ? active.organization_id : data[0].organization_id;
  const membership = data.find((m: any) => m.organization_id === selected) ?? data[0];
  cached = { organizationId: membership.organization_id, role: membership.role };

  if (!active || active.organization_id !== selected) {
    await db.from('user_active_organization').upsert({ user_id: user.id, organization_id: selected, updated_at: new Date().toISOString() });
  }
  return cached;
}

export async function getMyOrganizations() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const db = supabase as any;
  const { data, error } = await db.from('organization_members').select('organization_id, role, organizations(id, name, slug, status)').eq('user_id', user.id).order('created_at', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function switchOrganization(organizationId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado.');
  const db = supabase as any;
  const { data: membership, error: membershipError } = await db.from('organization_members').select('organization_id, role').eq('user_id', user.id).eq('organization_id', organizationId).maybeSingle();
  if (membershipError) throw membershipError;
  if (!membership) throw new Error('Você não pertence a esta organização.');
  const { error } = await db.from('user_active_organization').upsert({ user_id: user.id, organization_id: organizationId, updated_at: new Date().toISOString() });
  if (error) throw error;
  cached = { organizationId: membership.organization_id, role: membership.role };
  return cached;
}

export function clearTenantContext() { cached = null; }

export async function withTenant<T extends Record<string, unknown>>(payload: T) {
  const tenant = await getTenantContext();
  if (!tenant) throw new Error('Usuário não está vinculado a uma organização.');
  return { ...payload, organization_id: tenant.organizationId };
}
