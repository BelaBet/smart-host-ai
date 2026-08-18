import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function OnboardingSecure() {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Faça login primeiro.');
      const db = supabase as any;
      const normalizedSlug = slug.toLowerCase().trim().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '');
      const { error } = await db.rpc('create_organization', { p_name: name.trim(), p_slug: normalizedSlug });
      if (error) throw error;
      toast.success('Hotel criado com sucesso.');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Não foi possível concluir o cadastro.');
    } finally {
      setLoading(false);
    }
  }

  return <div className="min-h-screen flex items-center justify-center p-6 bg-muted/30"><Card className="w-full max-w-lg"><CardHeader><CardTitle>Configure seu hotel</CardTitle></CardHeader><CardContent><form onSubmit={submit} className="space-y-4"><Input placeholder="Nome do hotel" value={name} onChange={e => setName(e.target.value)} required minLength={2} maxLength={120}/><Input placeholder="slug-do-hotel" value={slug} onChange={e => setSlug(e.target.value)} required minLength={3} maxLength={60}/><Button className="w-full" disabled={loading}>{loading ? 'Criando...' : 'Criar minha conta'}</Button></form></CardContent></Card></div>;
}
