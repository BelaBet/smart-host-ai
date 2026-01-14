import { Link } from "react-router-dom";
import { Hotel } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-primary py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 gradient-gold rounded-lg flex items-center justify-center">
                <Hotel className="w-6 h-6 text-primary" />
              </div>
              <span className="text-xl font-display font-bold text-primary-foreground">
                Hospeda<span className="text-secondary">IA</span>
              </span>
            </Link>
            <p className="text-primary-foreground/60 text-sm">
              A plataforma mais inteligente para gestão hoteleira com IA integrada.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-primary-foreground mb-4">Produto</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-primary-foreground/60 hover:text-secondary transition-colors text-sm">Recursos</a></li>
              <li><a href="#" className="text-primary-foreground/60 hover:text-secondary transition-colors text-sm">Preços</a></li>
              <li><a href="#" className="text-primary-foreground/60 hover:text-secondary transition-colors text-sm">Integrações</a></li>
              <li><a href="#" className="text-primary-foreground/60 hover:text-secondary transition-colors text-sm">API</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-primary-foreground mb-4">Empresa</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-primary-foreground/60 hover:text-secondary transition-colors text-sm">Sobre nós</a></li>
              <li><a href="#" className="text-primary-foreground/60 hover:text-secondary transition-colors text-sm">Carreiras</a></li>
              <li><a href="#" className="text-primary-foreground/60 hover:text-secondary transition-colors text-sm">Blog</a></li>
              <li><a href="#" className="text-primary-foreground/60 hover:text-secondary transition-colors text-sm">Contato</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-primary-foreground mb-4">Suporte</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-primary-foreground/60 hover:text-secondary transition-colors text-sm">Central de Ajuda</a></li>
              <li><a href="#" className="text-primary-foreground/60 hover:text-secondary transition-colors text-sm">Documentação</a></li>
              <li><a href="#" className="text-primary-foreground/60 hover:text-secondary transition-colors text-sm">Status</a></li>
              <li><a href="#" className="text-primary-foreground/60 hover:text-secondary transition-colors text-sm">Comunidade</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-primary-foreground/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-primary-foreground/40 text-sm">
            © 2025 HospedaIA. Todos os direitos reservados.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-primary-foreground/40 hover:text-secondary transition-colors text-sm">
              Termos de Uso
            </a>
            <a href="#" className="text-primary-foreground/40 hover:text-secondary transition-colors text-sm">
              Privacidade
            </a>
            <a href="#" className="text-primary-foreground/40 hover:text-secondary transition-colors text-sm">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
