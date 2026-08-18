import { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useReservations } from "@/hooks/useReservations";
import { useGuests } from "@/hooks/useGuests";
import { useRooms } from "@/hooks/useRooms";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ShieldCheck, Search, CalendarDays, Users, Bed, Activity } from "lucide-react";

type AuditModule = "reservas" | "hospedes" | "quartos";
type AuditAction = "criado" | "atualizado";

interface AuditEvent {
  id: string;
  module: AuditModule;
  action: AuditAction;
  description: string;
  reference: string;
  timestamp: Date;
}

const moduleLabels: Record<AuditModule, string> = {
  reservas: "Reservas",
  hospedes: "Hóspedes",
  quartos: "Quartos",
};

const moduleIcons: Record<AuditModule, typeof CalendarDays> = {
  reservas: CalendarDays,
  hospedes: Users,
  quartos: Bed,
};

export default function Auditoria() {
  const { data: reservations = [], isLoading: loadingReservations } = useReservations();
  const { data: guests = [], isLoading: loadingGuests } = useGuests();
  const { data: rooms = [], isLoading: loadingRooms } = useRooms();

  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState<"all" | AuditModule>("all");
  const [actionFilter, setActionFilter] = useState<"all" | AuditAction>("all");

  const isLoading = loadingReservations || loadingGuests || loadingRooms;

  const events = useMemo<AuditEvent[]>(() => {
    const list: AuditEvent[] = [];

    reservations.forEach((r) => {
      list.push({
        id: `${r.id}-created`,
        module: "reservas",
        action: "criado",
        description: `Reserva ${r.confirmation_code} criada para ${r.guests?.name ?? "hóspede"} (quarto ${r.rooms?.number ?? "-"})`,
        reference: r.confirmation_code,
        timestamp: new Date(r.created_at),
      });
      if (r.updated_at && r.updated_at !== r.created_at) {
        list.push({
          id: `${r.id}-updated`,
          module: "reservas",
          action: "atualizado",
          description: `Reserva ${r.confirmation_code} atualizada — status atual: ${r.status}`,
          reference: r.confirmation_code,
          timestamp: new Date(r.updated_at),
        });
      }
    });

    guests.forEach((g) => {
      list.push({
        id: `${g.id}-created`,
        module: "hospedes",
        action: "criado",
        description: `Hóspede ${g.name} cadastrado (${g.email})`,
        reference: g.name,
        timestamp: new Date(g.created_at),
      });
      if (g.updated_at && g.updated_at !== g.created_at) {
        list.push({
          id: `${g.id}-updated`,
          module: "hospedes",
          action: "atualizado",
          description: `Cadastro do hóspede ${g.name} atualizado`,
          reference: g.name,
          timestamp: new Date(g.updated_at),
        });
      }
    });

    rooms.forEach((room) => {
      list.push({
        id: `${room.id}-created`,
        module: "quartos",
        action: "criado",
        description: `Quarto ${room.number} cadastrado (${room.type})`,
        reference: room.number,
        timestamp: new Date(room.created_at),
      });
      if (room.updated_at && room.updated_at !== room.created_at) {
        list.push({
          id: `${room.id}-updated`,
          module: "quartos",
          action: "atualizado",
          description: `Quarto ${room.number} atualizado — status atual: ${room.status}`,
          reference: room.number,
          timestamp: new Date(room.updated_at),
        });
      }
    });

    return list.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [reservations, guests, rooms]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return events.filter((e) => {
      if (moduleFilter !== "all" && e.module !== moduleFilter) return false;
      if (actionFilter !== "all" && e.action !== actionFilter) return false;
      if (term && !e.description.toLowerCase().includes(term) && !e.reference.toLowerCase().includes(term))
        return false;
      return true;
    });
  }, [events, search, moduleFilter, actionFilter]);

  const stats = useMemo(
    () => ({
      total: events.length,
      hoje: events.filter(
        (e) => format(e.timestamp, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
      ).length,
      criacoes: events.filter((e) => e.action === "criado").length,
      atualizacoes: events.filter((e) => e.action === "atualizado").length,
    }),
    [events]
  );

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 min-w-0">
        <header className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg gradient-gold flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-display font-bold">Auditoria</h1>
            <p className="text-muted-foreground text-sm">
              Histórico de atividades registradas no sistema
            </p>
          </div>
        </header>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Eventos totais", value: stats.total, icon: Activity },
            { label: "Hoje", value: stats.hoje, icon: CalendarDays },
            { label: "Criações", value: stats.criacoes, icon: Users },
            { label: "Atualizações", value: stats.atualizacoes, icon: Bed },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="p-4 flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  <s.icon className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground truncate">{s.label}</p>
                  <p className="text-xl font-semibold">{s.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Registros</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por descrição ou referência..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={moduleFilter} onValueChange={(v) => setModuleFilter(v as typeof moduleFilter)}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Módulo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os módulos</SelectItem>
                  <SelectItem value="reservas">Reservas</SelectItem>
                  <SelectItem value="hospedes">Hóspedes</SelectItem>
                  <SelectItem value="quartos">Quartos</SelectItem>
                </SelectContent>
              </Select>
              <Select value={actionFilter} onValueChange={(v) => setActionFilter(v as typeof actionFilter)}>
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue placeholder="Ação" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as ações</SelectItem>
                  <SelectItem value="criado">Criação</SelectItem>
                  <SelectItem value="atualizado">Atualização</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">Data/Hora</TableHead>
                    <TableHead>Módulo</TableHead>
                    <TableHead>Ação</TableHead>
                    <TableHead className="min-w-[240px]">Descrição</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        Carregando registros...
                      </TableCell>
                    </TableRow>
                  ) : filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        Nenhum registro encontrado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.slice(0, 200).map((e) => {
                      const Icon = moduleIcons[e.module];
                      return (
                        <TableRow key={e.id}>
                          <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                            {format(e.timestamp, "dd/MM/yyyy HH:mm", { locale: ptBR })}
                          </TableCell>
                          <TableCell>
                            <span className="inline-flex items-center gap-2 text-sm">
                              <Icon className="w-4 h-4 text-muted-foreground" />
                              {moduleLabels[e.module]}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant={e.action === "criado" ? "default" : "secondary"}>
                              {e.action === "criado" ? "Criação" : "Atualização"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">{e.description}</TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
