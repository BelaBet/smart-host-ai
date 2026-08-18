import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function Onboarding() {
  const [name,setName]=useState(''); const [slug,setSlug]=useState(''); const [loading,setLoading]=useState(false); const navigate=useNavigate();
  async function submit(e:React.FormEvent){e.preventDefault();setLoading(true);try{const {data:{user}}=await supabase.auth.getUser();if(!user) throw new Error('Faça login primeiro.');const {data:org,error}=await supabase.from('organizations').insert({name,slug:slug.toLowerCase().replace(/[^a-z0-9-]/g,'-')}).select().single();if(error)throw error;const {error:memberError}=await supabase.from('organization_members').insert({organization_id:org.id,user_id:user.id,role:'admin'});if(memberError)throw memberError;await supabase.from('organization_branding').insert({organization_id:org.id,display_name:name});await supabase.from('organization_settings').insert({organization_id:org.id});toast.success('Hotel criado com sucesso.');navigate('/dashboard');}catch(err:any){toast.error(err.message||'Não foi possível concluir o cadastro.');}finally{setLoading(false);}}
  return <div className="min-h-screen flex items-center justify-center p-6 bg-muted/30"><Card className="w-full max-w-lg"><CardHeader><CardTitle>Configure seu hotel</CardTitle></CardHeader><CardContent><form onSubmit={submit} className="space-y-4"><Input placeholder="Nome do hotel" value={name} onChange={e=>setName(e.target.value)} required/><Input placeholder="slug-do-hotel" value={slug} onChange={e=>setSlug(e.target.value)} required/><Button className="w-full" disabled={loading}>{loading?'Criando...':'Criar minha conta'}</Button></form></CardContent></Card></div>;
}
