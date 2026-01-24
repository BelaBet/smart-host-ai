import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Building2, Loader2, CreditCard, Check, Shield, Clock } from "lucide-react";

export default function Checkout() {
  const navigate = useNavigate();
  const { user, session, subscription, subscriptionLoading, loading, signOut } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
      return;
    }

    if (!subscriptionLoading && subscription?.subscribed) {
      navigate("/dashboard");
    }
  }, [user, subscription, subscriptionLoading, loading, navigate]);

  const handleCheckout = async () => {
    if (!session?.access_token) {
      toast.error("Sessão expirada. Por favor, faça login novamente.");
      navigate("/login");
      return;
    }

    setIsProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        throw error;
      }

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("URL de checkout não recebida");
      }
    } catch (error) {
      console.error("Error creating checkout:", error);
      toast.error("Erro ao iniciar checkout. Tente novamente.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  if (loading || subscriptionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const features = [
    "Gestão completa de reservas",
    "Controle de quartos em tempo real",
    "Assistente de IA integrado",
    "Relatórios e análises detalhados",
    "Gestão de hóspedes",
    "Controle financeiro (Caixa)",
    "Módulo de restaurante",
    "Suporte prioritário",
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="gradient-gold p-3 rounded-xl">
              <Building2 className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl font-display">HospedaIA Pro</CardTitle>
            <CardDescription className="mt-2">
              Comece seu período de teste gratuito
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Pricing */}
          <div className="text-center p-6 rounded-xl bg-muted/50">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-secondary" />
              <span className="text-lg font-semibold text-secondary">7 dias grátis</span>
            </div>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-4xl font-bold font-display">R$1.200</span>
              <span className="text-muted-foreground">/mês</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Após o período de teste
            </p>
          </div>

          {/* Features */}
          <div className="space-y-3">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-secondary/20 flex items-center justify-center">
                  <Check className="h-3 w-3 text-secondary" />
                </div>
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>

          {/* Security note */}
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 text-sm text-muted-foreground">
            <Shield className="h-4 w-4 flex-shrink-0" />
            <span>Pagamento seguro processado pelo Stripe. Cancele quando quiser.</span>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Button 
            onClick={handleCheckout} 
            className="w-full gradient-gold" 
            size="lg"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Adicionar Cartão e Iniciar Trial
              </>
            )}
          </Button>
          
          <Button 
            variant="ghost" 
            onClick={handleLogout}
            className="w-full text-muted-foreground"
          >
            Sair
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Logado como: {user?.email}
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
