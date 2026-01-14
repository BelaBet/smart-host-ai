import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DailyReport, transactionCategoryConfig, paymentMethodConfig } from "@/types/cashier";
import { BarChart3, CreditCard, Banknote, Smartphone, ArrowRightLeft } from "lucide-react";

interface DailyReportCardProps {
  report: DailyReport;
}

export function DailyReportCard({ report }: DailyReportCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const totalByCategory = Object.entries(report.transactionsByCategory)
    .filter(([_, value]) => value > 0)
    .sort((a, b) => b[1] - a[1]);

  const totalByPayment = Object.entries(report.transactionsByPaymentMethod)
    .filter(([_, value]) => value > 0)
    .sort((a, b) => b[1] - a[1]);

  const maxCategoryValue = Math.max(...Object.values(report.transactionsByCategory), 1);
  const maxPaymentValue = Math.max(...Object.values(report.transactionsByPaymentMethod), 1);

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case "cash":
        return Banknote;
      case "pix":
        return Smartphone;
      case "transfer":
        return ArrowRightLeft;
      default:
        return CreditCard;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Por Categoria
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {totalByCategory.length > 0 ? (
            totalByCategory.map(([category, value]) => (
              <div key={category} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {transactionCategoryConfig[category as keyof typeof transactionCategoryConfig]?.label || category}
                  </span>
                  <span className="font-medium">{formatCurrency(value)}</span>
                </div>
                <Progress value={(value / maxCategoryValue) * 100} className="h-2" />
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-sm text-center py-4">
              Nenhuma transação registrada.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-secondary" />
            Por Forma de Pagamento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {totalByPayment.length > 0 ? (
            totalByPayment.map(([method, value]) => {
              const Icon = getPaymentIcon(method);
              return (
                <div key={method} className="space-y-1">
                  <div className="flex justify-between text-sm items-center">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {paymentMethodConfig[method as keyof typeof paymentMethodConfig]?.label || method}
                      </span>
                    </div>
                    <span className="font-medium">{formatCurrency(value)}</span>
                  </div>
                  <Progress value={(value / maxPaymentValue) * 100} className="h-2" />
                </div>
              );
            })
          ) : (
            <p className="text-muted-foreground text-sm text-center py-4">
              Nenhuma transação registrada.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
