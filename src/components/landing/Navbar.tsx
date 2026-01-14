import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Hotel, Sparkles } from "lucide-react";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 gradient-gold rounded-lg flex items-center justify-center">
              <Hotel className="w-6 h-6 text-primary" />
            </div>
            <span className="text-xl font-display font-bold text-foreground">
              Hospeda<span className="text-secondary">IA</span>
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#recursos" className="text-muted-foreground hover:text-foreground transition-colors">
              Recursos
            </a>
            <a href="#precos" className="text-muted-foreground hover:text-foreground transition-colors">
              Preços
            </a>
            <a href="#sobre" className="text-muted-foreground hover:text-foreground transition-colors">
              Sobre
            </a>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost">Entrar</Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="hero" className="gap-2">
                <Sparkles className="w-4 h-4" />
                Começar Grátis
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border/50 animate-slide-up">
            <div className="flex flex-col gap-4">
              <a href="#recursos" className="text-muted-foreground hover:text-foreground transition-colors py-2">
                Recursos
              </a>
              <a href="#precos" className="text-muted-foreground hover:text-foreground transition-colors py-2">
                Preços
              </a>
              <a href="#sobre" className="text-muted-foreground hover:text-foreground transition-colors py-2">
                Sobre
              </a>
              <div className="flex flex-col gap-2 pt-4 border-t border-border/50">
                <Link to="/login">
                  <Button variant="ghost" className="w-full">Entrar</Button>
                </Link>
                <Link to="/dashboard">
                  <Button variant="hero" className="w-full gap-2">
                    <Sparkles className="w-4 h-4" />
                    Começar Grátis
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
