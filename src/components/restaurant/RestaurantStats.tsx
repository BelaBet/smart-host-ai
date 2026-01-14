import { Card, CardContent } from "@/components/ui/card";
import { UtensilsCrossed, ShoppingCart, AlertTriangle, DollarSign } from "lucide-react";
import { Order, InventoryItem } from "@/types/restaurant";

interface RestaurantStatsProps {
  orders: Order[];
  inventory: InventoryItem[];
}

export function RestaurantStats({ orders, inventory }: RestaurantStatsProps) {
  const activeOrders = orders.filter(o => !['delivered', 'cancelled'].includes(o.status)).length;
  const todayRevenue = orders
    .filter(o => o.paid && new Date(o.createdAt).toDateString() === new Date().toDateString())
    .reduce((sum, o) => sum + o.total, 0);
  const lowStockItems = inventory.filter(i => i.quantity <= i.minQuantity).length;
  const totalOrders = orders.length;

  const stats = [
    {
      title: "Pedidos Ativos",
      value: activeOrders,
      icon: ShoppingCart,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Total de Pedidos",
      value: totalOrders,
      icon: UtensilsCrossed,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
    {
      title: "Receita do Dia",
      value: `R$ ${todayRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "Estoque Baixo",
      value: lowStockItems,
      icon: AlertTriangle,
      color: lowStockItems > 0 ? "text-destructive" : "text-muted-foreground",
      bgColor: lowStockItems > 0 ? "bg-destructive/10" : "bg-muted/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.title} variant="stat">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold font-display">{stat.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
