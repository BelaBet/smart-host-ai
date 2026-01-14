import { Bed, Users, Sparkles, Wrench, Calendar } from "lucide-react";
import { Room } from "@/types/room";

interface RoomStatsProps {
  rooms: Room[];
}

export function RoomStats({ rooms }: RoomStatsProps) {
  const available = rooms.filter(r => r.status === "available").length;
  const occupied = rooms.filter(r => r.status === "occupied").length;
  const cleaning = rooms.filter(r => r.status === "cleaning").length;
  const maintenance = rooms.filter(r => r.status === "maintenance").length;
  const reserved = rooms.filter(r => r.status === "reserved").length;
  const occupancyRate = rooms.length > 0 ? Math.round((occupied / rooms.length) * 100) : 0;

  const stats = [
    { label: "Disponíveis", value: available, icon: Bed, color: "text-success" },
    { label: "Ocupados", value: occupied, icon: Users, color: "text-primary" },
    { label: "Limpeza", value: cleaning, icon: Sparkles, color: "text-warning" },
    { label: "Manutenção", value: maintenance, icon: Wrench, color: "text-destructive" },
    { label: "Reservados", value: reserved, icon: Calendar, color: "text-secondary-foreground" },
    { label: "Ocupação", value: `${occupancyRate}%`, icon: Users, color: "text-primary" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-card rounded-xl p-4 shadow-sm border border-border/50"
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-muted ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
