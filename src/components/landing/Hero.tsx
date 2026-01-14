import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, Play, ArrowRight, CheckCircle2 } from "lucide-react";
import heroImage from "@/assets/hero-hotel.jpg";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Lobby de hotel luxuoso"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 gradient-hero opacity-85" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 pt-24 pb-16 relative z-10">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/20 border border-secondary/30 mb-6 animate-fade-in">
            <Sparkles className="w-4 h-4 text-secondary" />
            <span className="text-sm text-secondary font-medium">
              IA integrada para gestão inteligente
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-primary-foreground mb-6 animate-slide-up">
            Gestão Hoteleira
            <span className="block text-gradient-gold mt-2">
              Simplificada com IA
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 max-w-2xl animate-slide-up stagger-1">
            Transforme a gestão da sua pousada ou hotel com nossa plataforma inteligente. 
            Controle hóspedes, caixa e restaurante em um só lugar, com IA que reduz erros e aumenta eficiência.
          </p>

          {/* Features List */}
          <div className="flex flex-wrap gap-4 mb-8 animate-slide-up stagger-2">
            {["Check-in automatizado", "Gestão financeira", "Restaurante integrado"].map((feature) => (
              <div key={feature} className="flex items-center gap-2 text-primary-foreground/90">
                <CheckCircle2 className="w-5 h-5 text-secondary" />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap gap-4 animate-slide-up stagger-3">
            <Link to="/dashboard">
              <Button variant="hero" size="xl" className="gap-2">
                Começar Agora
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Button variant="heroOutline" size="xl" className="gap-2">
              <Play className="w-5 h-5" />
              Ver Demonstração
            </Button>
          </div>

          {/* Social Proof */}
          <div className="mt-12 pt-8 border-t border-primary-foreground/20 animate-slide-up stagger-4">
            <p className="text-primary-foreground/60 text-sm mb-4">
              Mais de 500+ hotéis e pousadas já confiam no HospedaIA
            </p>
            <div className="flex items-center gap-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary">98%</div>
                <div className="text-xs text-primary-foreground/60">Satisfação</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary">40%</div>
                <div className="text-xs text-primary-foreground/60">Menos erros</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary">2x</div>
                <div className="text-xs text-primary-foreground/60">Mais eficiente</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-10" />
    </section>
  );
}
