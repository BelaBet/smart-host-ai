import { supabase } from '@/integrations/supabase/client';

export type WhiteLabelBrand = {
  display_name: string;
  logo_url?: string | null;
  favicon_url?: string | null;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  font_family: string;
  login_title?: string | null;
  login_subtitle?: string | null;
};

export async function loadWhiteLabelBrand(hostname = window.location.hostname) {
  const { data, error } = await supabase
    .from('public_branding')
    .select('*')
    .eq('hostname', hostname)
    .maybeSingle();

  if (error) throw error;
  return data as WhiteLabelBrand | null;
}

export function applyWhiteLabelBrand(brand: WhiteLabelBrand | null) {
  if (!brand) return;
  const root = document.documentElement;
  root.style.setProperty('--brand-primary', brand.primary_color);
  root.style.setProperty('--brand-secondary', brand.secondary_color);
  root.style.setProperty('--brand-accent', brand.accent_color);
  root.style.setProperty('--brand-font', brand.font_family);
  document.title = brand.display_name;

  if (brand.favicon_url) {
    let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = brand.favicon_url;
  }
}
