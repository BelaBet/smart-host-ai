import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Wallet, Receipt } from "lucide-react";

interface CashierStatsProps {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactionCount: number;
}

export function CashierStats({ totalIncome, totalExpense, balance, transactionCount }: CashierStatsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const stats = [
    {
      label: "Entradas",
      value: formatCurrency(totalIncome),
      icon: TrendingUp,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      label: "Saídas",
      value: formatCurrency(totalExpense),
      icon: TrendingDown,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
    {
      label: "Saldo",
      value: formatCurrency(balance),
      icon: Wallet,
      color: balance >= 0 ? "text-success" : "text-destructive",
      bgColor: balance >= 0 ? "bg-success/10" : "bg-destructive/10",
    },
    {
      label: "Transações",
      value: transactionCount.toString(),
      icon: Receipt,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} variant="stat" className="p-4">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${stat.bgColor}`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
