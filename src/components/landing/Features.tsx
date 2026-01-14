import { Card, CardContent } from "@/components/ui/card";
import { 
  Users, 
  Bed, 
  DollarSign, 
  UtensilsCrossed, 
  Bot, 
  BarChart3,
  Calendar,
  Shield
} from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Gestão de Hóspedes",
    description: "Controle completo de reservas, check-in/out automatizado e histórico de clientes com IA.",
  },
  {
    icon: Bed,
    title: "Controle de Quartos",
    description: "Visualização em tempo real da ocupação, status de limpeza e manutenção.",
  },
  {
    icon: DollarSign,
    title: "Caixa e Financeiro",
    description: "Gestão de pagamentos, faturamento automático e relatórios financeiros detalhados.",
  },
  {
    icon: UtensilsCrossed,
    title: "Restaurante Integrado",
    description: "Pedidos do restaurante vinculados ao quarto, cardápio digital e controle de estoque.",
  },
  {
    icon: Bot,
    title: "Assistente IA",
    description: "IA que ajuda em todas as tarefas, sugere ações e reduz drasticamente erros operacionais.",
  },
  {
    icon: BarChart3,
    title: "Relatórios Inteligentes",
    description: "Analytics avançados com insights gerados por IA para melhorar sua operação.",
  },
  {
    icon: Calendar,
    title: "Reservas Online",
    description: "Motor de reservas integrado, sincronização com OTAs e calendário unificado.",
  },
  {
    icon: Shield,
    title: "Segurança Total",
    description: "Dados criptografados, backups automáticos e conformidade com LGPD.",
  },
];

export function Features() {
  return (
    <section id="recursos" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-secondary font-medium text-sm uppercase tracking-wider">
            Recursos
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mt-4 mb-6">
            Tudo que você precisa para
            <span className="text-gradient-gold block">gerenciar seu hotel</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Uma plataforma completa com IA integrada em cada funcionalidade, 
            projetada para simplificar sua operação e encantar seus hóspedes.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={feature.title} 
              variant="feature"
              className="opacity-0 animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg gradient-gold flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2 font-display">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
