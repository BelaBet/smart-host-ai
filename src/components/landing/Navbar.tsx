import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Hotel, Sparkles, Languages } from "lucide-react";
import { getInitialLocale, saveLocale, translations, type Locale } from "@/i18n";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [locale, setLocale] = useState<Locale>("pt-BR");

  useEffect(() => {
    const initial = getInitialLocale();
    setLocale(initial);
    saveLocale(initial);
  }, []);

  const t = translations[locale];
  const changeLocale = (next: Locale) => {
    setLocale(next);
    saveLocale(next);
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50" aria-label="Main navigation">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 min-w-0">
          <Link to="/" className="flex items-center gap-2 min-w-0 shrink" aria-label="Smart Host AI">
            <div className="w-10 h-10 shrink-0 gradient-gold rounded-lg flex items-center justify-center">
              <Hotel className="w-6 h-6 text-primary" aria-hidden="true" />
            </div>
            <span className="text-xl font-bold text-foreground truncate">Smart Host<span className="text-secondary"> AI</span></span>
          </Link>

          <div className="hidden md:flex items-center gap-6 lg:gap-8 shrink-0">
            <a href="#recursos" className="text-muted-foreground hover:text-foreground transition-colors">{t.resources}</a>
            <a href="#precos" className="text-muted-foreground hover:text-foreground transition-colors">{t.pricing}</a>
            <a href="#sobre" className="text-muted-foreground hover:text-foreground transition-colors">{t.about}</a>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <Languages className="w-4 h-4" aria-hidden="true" />
              <span className="sr-only">{t.language}</span>
              <select value={locale} onChange={(e) => changeLocale(e.target.value as Locale)} className="bg-transparent border-0 outline-none cursor-pointer text-foreground">
                <option value="pt-BR">PT</option><option value="en">EN</option><option value="es">ES</option>
              </select>
            </label>
          </div>

          <div className="hidden md:flex items-center gap-3 shrink-0">
            <Link to="/login"><Button variant="ghost">{t.login}</Button></Link>
            <Link to="/login"><Button variant="hero" className="gap-2"><Sparkles className="w-4 h-4" aria-hidden="true" />{t.start}</Button></Link>
          </div>

          <button type="button" aria-label={isOpen ? "Close menu" : "Open menu"} aria-expanded={isOpen} className="md:hidden p-2 shrink-0" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden py-4 border-t border-border/50 animate-slide-up">
            <div className="flex flex-col gap-4">
              <a href="#recursos" onClick={() => setIsOpen(false)} className="text-muted-foreground py-2">{t.resources}</a>
              <a href="#precos" onClick={() => setIsOpen(false)} className="text-muted-foreground py-2">{t.pricing}</a>
              <a href="#sobre" onClick={() => setIsOpen(false)} className="text-muted-foreground py-2">{t.about}</a>
              <label className="flex items-center gap-2 py-2 text-muted-foreground"><Languages className="w-4 h-4" /><span>{t.language}</span><select value={locale} onChange={(e) => changeLocale(e.target.value as Locale)} className="ml-auto bg-transparent border rounded-md px-2 py-1"><option value="pt-BR">Português</option><option value="en">English</option><option value="es">Español</option></select></label>
              <div className="flex flex-col gap-2 pt-4 border-t border-border/50">
                <Link to="/login"><Button variant="ghost" className="w-full">{t.login}</Button></Link>
                <Link to="/login"><Button variant="hero" className="w-full gap-2"><Sparkles className="w-4 h-4" aria-hidden="true" />{t.start}</Button></Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
