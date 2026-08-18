import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { RoomStatusGrid } from "@/components/dashboard/RoomStatusGrid";
import { RecentGuests } from "@/components/dashboard/RecentGuests";
import { AIAssistant } from "@/components/dashboard/AIAssistant";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { UsersRound, BedDouble, WalletCards, Utensils, WifiOff } from "lucide-react";

const stats = [
  {
    title: "Hóspedes Ativos",
    value: 42,
    change: "+8% vs. semana passada",
    changeType: "positive" as const,
    icon: <UsersRound className="w-6 h-6 text-primary" strokeWidth={1.8} aria-hidden="true" />,
  },
  {
    title: "Ocupação",
    value: "78%",
    change: "+12% vs. mês passado",
    changeType: "positive" as const,
    icon: <BedDouble className="w-6 h-6 text-primary" strokeWidth={1.8} aria-hidden="true" />,
  },
  {
    title: "Receita Hoje",
    value: "R$ 8.450",
    change: "+R$ 1.200 vs. ontem",
    changeType: "positive" as const,
    icon: <WalletCards className="w-6 h-6 text-primary" strokeWidth={1.8} aria-hidden="true" />,
  },
  {
    title: "Pedidos Restaurante",
    value: 24,
    change: "5 pendentes",
    changeType: "neutral" as const,
    icon: <Utensils className="w-6 h-6 text-primary" strokeWidth={1.8} aria-hidden="true" />,
  },
];

const rooms = Array.from({ length: 30 }, (_, i) => ({
  id: `room-${i + 1}`,
  number: String(100 + i + 1),
  status: (i < 15 ? "occupied" : i < 22 ? "available" : i < 27 ? "cleaning" : "maintenance") as
    | "occupied"
    | "available"
    | "cleaning"
    | "maintenance",
  guest: i < 15 ? `Hóspede ${i + 1}` : undefined,
}));

const guests = [
  { id: "1", name: "João Silva", room: "101", checkIn: "10/01", checkOut: "15/01", status: "checked-in" as const },
  { id: "2", name: "Maria Santos", room: "205", checkIn: "12/01", checkOut: "14/01", status: "checking-out" as const },
  { id: "3", name: "Pedro Oliveira", room: "302", checkIn: "14/01", checkOut: "18/01", status: "reserved" as const },
  { id: "4", name: "Ana Costa", room: "108", checkIn: "08/01", checkOut: "16/01", status: "checked-in" as const },
];

export default function Dashboard() {
  const { online, pending } = useOfflineSync();

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8 min-w-0">
        {!online && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-foreground">
            <WifiOff className="h-4 w-4 shrink-0" aria-hidden="true" />
            Você está offline. Alterações compatíveis serão guardadas e sincronizadas quando a conexão voltar.
          </div>
        )}
        {online && pending > 0 && (
          <div className="mb-4 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm">
            {pending} alteração(ões) aguardando sincronização.
          </div>
        )}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground font-display">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Bem-vindo de volta! Aqui está o resumo do seu hotel.</p>
        </div>
        <div className="mb-8"><QuickActions /></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => <StatCard key={stat.title} {...stat} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RoomStatusGrid rooms={rooms} />
          <RecentGuests guests={guests} />
        </div>
      </div>
      <AIAssistant />
    </DashboardLayout>
  );
}
