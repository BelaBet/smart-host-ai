import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, Bed, UtensilsCrossed, TrendingUp, Users, Calendar } from "lucide-react";
import { RevenueData, OccupancyData, RestaurantSalesData, DailySummary } from "@/types/report";

interface SummaryCardsProps {
  revenueData: RevenueData[];
  occupancyData: OccupancyData[];
  restaurantData: RestaurantSalesData[];
  dailySummary: DailySummary[];
}

export function SummaryCards({ revenueData, occupancyData, restaurantData, dailySummary }: SummaryCardsProps) {
  const totalRevenue = revenueData.reduce((sum, d) => sum + d.total, 0);
  const avgOccupancy = occupancyData.length > 0 
    ? occupancyData.reduce((sum, d) => sum + d.taxa, 0) / occupancyData.length 
    : 0;
  const totalRestaurantSales = restaurantData.reduce((sum, d) => sum + d.vendas, 0);
  const totalCheckIns = dailySummary.reduce((sum, d) => sum + d.checkIns, 0);
  const totalCheckOuts = dailySummary.reduce((sum, d) => sum + d.checkOuts, 0);
  const avgDailyRevenue = dailySummary.length > 0
    ? dailySummary.reduce((sum, d) => sum + d.receita, 0) / dailySummary.length
    : 0;

  const cards = [
    {
      title: "Receita Total",
      value: `R$ ${totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: "text-primary",
      bgColor: "bg-primary/10",
      description: "No período selecionado",
    },
    {
      title: "Ocupação Média",
      value: `${avgOccupancy.toFixed(1)}%`,
      icon: Bed,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
      description: "Taxa média de ocupação",
    },
    {
      title: "Vendas Restaurante",
      value: `R$ ${totalRestaurantSales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: UtensilsCrossed,
      color: "text-accent",
      bgColor: "bg-accent/10",
      description: "Total de vendas",
    },
    {
      title: "Receita Média/Dia",
      value: `R$ ${avgDailyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: TrendingUp,
      color: "text-success",
      bgColor: "bg-success/10",
      description: "Média diária",
    },
    {
      title: "Check-ins",
      value: totalCheckIns.toString(),
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
      description: "Total no período",
    },
    {
      title: "Check-outs",
      value: totalCheckOuts.toString(),
      icon: Calendar,
      color: "text-muted-foreground",
      bgColor: "bg-muted/30",
      description: "Total no período",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardContent className="p-4">
            <div className="flex flex-col gap-2">
              <div className={`p-2 rounded-lg ${card.bgColor} w-fit`}>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{card.title}</p>
                <p className="text-lg font-bold font-display">{card.value}</p>
                <p className="text-xs text-muted-foreground">{card.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
