import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export function CTA() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 gradient-hero" />
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-secondary rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/20 border border-secondary/30 mb-6">
            <Sparkles className="w-4 h-4 text-secondary" />
            <span className="text-sm text-secondary font-medium">
              Comece hoje mesmo
            </span>
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-primary-foreground mb-6">
            Pronto para transformar
            <span className="block text-secondary">a gestão do seu hotel?</span>
          </h2>

          <p className="text-lg text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Junte-se a centenas de hoteleiros que já estão economizando tempo, 
            reduzindo erros e encantando seus hóspedes com o HospedaIA.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/dashboard">
              <Button variant="hero" size="xl" className="gap-2">
                Começar Teste Gratuito
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Button variant="heroOutline" size="xl">
              Falar com Especialista
            </Button>
          </div>

          <p className="text-primary-foreground/60 text-sm mt-6">
            14 dias grátis • Sem cartão de crédito • Cancele quando quiser
          </p>
        </div>
      </div>
    </section>
  );
}
