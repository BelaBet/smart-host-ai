import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, CalendarCheck, CalendarClock, Users, TrendingUp } from "lucide-react";
import { Reservation } from "@/types/reservation";

interface ReservationStatsProps {
  reservations: Reservation[];
}

export function ReservationStats({ reservations }: ReservationStatsProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayCheckIns = reservations.filter(r => {
    const checkIn = new Date(r.checkIn);
    checkIn.setHours(0, 0, 0, 0);
    return checkIn.getTime() === today.getTime() && r.status !== "cancelled";
  }).length;

  const todayCheckOuts = reservations.filter(r => {
    const checkOut = new Date(r.checkOut);
    checkOut.setHours(0, 0, 0, 0);
    return checkOut.getTime() === today.getTime() && r.status !== "cancelled";
  }).length;

  const pendingReservations = reservations.filter(r => r.status === "pending").length;
  const confirmedReservations = reservations.filter(r => r.status === "confirmed").length;

  const thisMonthRevenue = reservations
    .filter(r => {
      const checkIn = new Date(r.checkIn);
      return checkIn.getMonth() === today.getMonth() && 
             checkIn.getFullYear() === today.getFullYear() &&
             r.status !== "cancelled";
    })
    .reduce((sum, r) => sum + r.totalValue, 0);

  const stats = [
    {
      title: "Check-ins Hoje",
      value: todayCheckIns,
      icon: CalendarCheck,
      gradient: "from-success/20 to-success/5",
      iconColor: "text-success",
    },
    {
      title: "Check-outs Hoje",
      value: todayCheckOuts,
      icon: CalendarClock,
      gradient: "from-warning/20 to-warning/5",
      iconColor: "text-warning",
    },
    {
      title: "Pendentes",
      value: pendingReservations,
      icon: CalendarDays,
      gradient: "from-destructive/20 to-destructive/5",
      iconColor: "text-destructive",
    },
    {
      title: "Confirmadas",
      value: confirmedReservations,
      icon: Users,
      gradient: "from-primary/20 to-primary/5",
      iconColor: "text-primary",
    },
    {
      title: "Receita do Mês",
      value: `R$ ${thisMonthRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      icon: TrendingUp,
      gradient: "from-accent/20 to-accent/5",
      iconColor: "text-accent-foreground",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="overflow-hidden">
          <CardContent className={`p-4 bg-gradient-to-br ${stat.gradient}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full bg-background/50 ${stat.iconColor}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
