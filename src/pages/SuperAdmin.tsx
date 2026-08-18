import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Users, CreditCard, Activity } from 'lucide-react';

export default function SuperAdmin() {
  const [stats, setStats] = useState({ orgs: 0, users: 0, active: 0, subscriptions: 0 });
  const [organizations, setOrganizations] = useState<any[]>([]);
  useEffect(() => { (async () => {
    const [{ count: orgs }, { count: users }, { count: active }, { count: subscriptions }, { data }] = await Promise.all([
      supabase.from('organizations').select('*', { count: 'exact', head: true }),
      supabase.from('organization_members').select('*', { count: 'exact', head: true }),
      supabase.from('organizations').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('organization_subscriptions').select('*', { count: 'exact', head: true }).in('status', ['trial','active']),
      supabase.from('organizations').select('id,name,slug,status,created_at').order('created_at', { ascending: false }).limit(50),
    ]);
    setStats({ orgs: orgs ?? 0, users: users ?? 0, active: active ?? 0, subscriptions: subscriptions ?? 0 });
    setOrganizations(data ?? []);
  })(); }, []);
  const cards = [['Organizações',stats.orgs,Building2],['Usuários',stats.users,Users],['Hotéis ativos',stats.active,Activity],['Assinaturas ativas',stats.subscriptions,CreditCard]];
  return <div className="p-6 space-y-6"><div><h1 className="text-3xl font-bold">Super Admin</h1><p className="text-muted-foreground">Gestão global da plataforma SaaS.</p></div><div className="grid gap-4 md:grid-cols-4">{cards.map(([label,value,Icon]:any)=><Card key={label}><CardContent className="p-5 flex items-center gap-4"><Icon className="w-8 h-8 text-primary"/><div><p className="text-sm text-muted-foreground">{label}</p><p className="text-2xl font-bold">{value}</p></div></CardContent></Card>)}</div><Card><CardHeader><CardTitle>Clientes</CardTitle></CardHeader><CardContent className="space-y-3">{organizations.map(o=><div key={o.id} className="flex items-center justify-between border rounded-lg p-4"><div><p className="font-semibold">{o.name}</p><p className="text-sm text-muted-foreground">{o.slug}</p></div><Badge>{o.status}</Badge></div>)}</CardContent></Card></div>;
}
