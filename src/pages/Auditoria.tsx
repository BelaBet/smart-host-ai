import { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ClipboardList, Download, Eye, Filter, RefreshCw, ShieldCheck, UserRound } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AuditEntry {
  id: string;
  actor_id: string | null;
  action: "INSERT" | "UPDATE" | "DELETE";
  table_name: string;
  record_id: string;
  occurred_at: string;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  metadata: Record<string, unknown>;
}

const tableLabels: Record<string, string> = {
  rooms: "Quartos",
  reservations: "Reservas",
  guests: "Hóspedes",
  room_maintenance: "Manutenção",
  cashier_sessions: "Caixa",
  cashier_transactions: "Transações",
  restaurant_products: "Produtos",
  restaurant_orders: "Pedidos",
  restaurant_order_items: "Itens de pedido",
};

const actionLabels = {
  INSERT: "Criou",
  UPDATE: "Alterou",
  DELETE: "Excluiu",
};

function getEntityName(entry: AuditEntry) {
  const data = entry.new_data ?? entry.old_data ?? {};
  if (entry.table_name === "rooms") return `Quarto ${data.number ?? entry.record_id.slice(0, 8)}`;
  if (entry.table_name === "reservations") return `Reserva ${data.confirmation_code ?? entry.record_id.slice(0, 8)}`;
  if (entry.table_name === "guests") return String(data.name ?? `Hóspede ${entry.record_id.slice(0, 8)}`);
  return `${tableLabels[entry.table_name] ?? entry.table_name} ${entry.record_id.slice(0, 8)}`;
}

function formatValue(value: unknown) {
  if (value === null || value === undefined) return "—";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") return JSON.stringify(value, null, 2);
  return String(value);
}

function changedFields(entry: AuditEntry) {
  if (entry.action !== "UPDATE" || !entry.old_data || !entry.new_data) return [];
  const keys = new Set([...Object.keys(entry.old_data), ...Object.keys(entry.new_data)]);
  return [...keys]
    .filter((key) => JSON.stringify(entry.old_data?.[key]) !== JSON.stringify(entry.new_data?.[key]))
    .filter((key) => !["updated_at"].includes(key));
}

export default function Auditoria() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tableFilter, setTableFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");
  const [selected, setSelected] = useState<AuditEntry | null>(null);

  const loadAudit = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("audit_log")
      .select("id, actor_id, action, table_name, record_id, occurred_at, old_data, new_data, metadata")
      .order("occurred_at", { ascending: false })
      .limit(1000);

    if (!error) setEntries((data ?? []) as AuditEntry[]);
    else console.error("Erro ao carregar auditoria:", error);
    setLoading(false);
  };

  useEffect(() => {
    loadAudit();
  }, []);

  const filtered = useMemo(() => entries.filter((entry) => {
    const actor = String(entry.metadata?.actor_email ?? entry.actor_id ?? "").toLowerCase();
    const entity = getEntityName(entry).toLowerCase();
    const matchesSearch = !search || actor.includes(search.toLowerCase()) || entity.includes(search.toLowerCase()) || entry.record_id.includes(search);
    const matchesTable = tableFilter === "all" || entry.table_name === tableFilter;
    const matchesAction = actionFilter === "all" || entry.action === actionFilter;
    return matchesSearch && matchesTable && matchesAction;
  }), [entries, search, tableFilter, actionFilter]);

  const stats = useMemo(() => ({
    total: filtered.length,
    changes: filtered.filter((e) => e.action === "UPDATE").length,
    creates: filtered.filter((e) => e.action === "INSERT").length,
    deletes: filtered.filter((e) => e.action === "DELETE").length,
  }), [filtered]);

  const exportCsv = () => {
    const header = ["Data/Hora", "Usuário", "Ação", "Módulo", "Registro", "Campos alterados"];
    const rows = filtered.map((entry) => [
      new Date(entry.occurred_at).toISOString(),
      String(entry.metadata?.actor_email ?? entry.actor_id ?? "system"),
      actionLabels[entry.action],
      tableLabels[entry.table_name] ?? entry.table_name,
      getEntityName(entry),
      changedFields(entry).join(" | "),
    ]);
    const csv = [header, ...rows].map((row) => row.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `auditoria-${format(new Date(), "yyyy-MM-dd-HHmm")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center">
                <ShieldCheck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold font-display">Auditoria</h1>
                <p className="text-muted-foreground">Histórico completo das alterações feitas no sistema</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadAudit} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Atualizar
            </Button>
            <Button onClick={exportCsv} disabled={!filtered.length}>
              <Download className="h-4 w-4 mr-2" /> Exportar CSV
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Eventos</p><p className="text-2xl font-bold mt-1">{stats.total}</p></CardContent></Card>
          <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Alterações</p><p className="text-2xl font-bold mt-1">{stats.changes}</p></CardContent></Card>
          <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Criações</p><p className="text-2xl font-bold mt-1">{stats.creates}</p></CardContent></Card>
          <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Exclusões</p><p className="text-2xl font-bold mt-1">{stats.deletes}</p></CardContent></Card>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_190px_170px_auto] gap-3">
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por usuário, registro ou entidade..." />
              <Select value={tableFilter} onValueChange={setTableFilter}>
                <SelectTrigger><SelectValue placeholder="Módulo" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os módulos</SelectItem>
                  {Object.entries(tableLabels).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger><SelectValue placeholder="Ação" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as ações</SelectItem>
                  <SelectItem value="INSERT">Criações</SelectItem>
                  <SelectItem value="UPDATE">Alterações</SelectItem>
                  <SelectItem value="DELETE">Exclusões</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="ghost" onClick={() => { setSearch(""); setTableFilter("all"); setActionFilter("all"); }}>
                <Filter className="h-4 w-4 mr-2" /> Limpar
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><ClipboardList className="h-5 w-5" /> Linha do tempo de auditoria</CardTitle></CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">Carregando histórico...</div>
            ) : filtered.length === 0 ? (
              <div className="p-10 text-center text-muted-foreground">Nenhum evento encontrado com esses filtros.</div>
            ) : (
              <div className="divide-y">
                {filtered.map((entry) => {
                  const fields = changedFields(entry);
                  const actor = String(entry.metadata?.actor_email ?? "Usuário do sistema");
                  return (
                    <div key={entry.id} className="p-4 hover:bg-muted/30 transition-colors">
                      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center shrink-0"><UserRound className="h-4 w-4" /></div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold">{actor}</span>
                            <Badge variant={entry.action === "DELETE" ? "destructive" : entry.action === "INSERT" ? "default" : "secondary"}>{actionLabels[entry.action]}</Badge>
                            <Badge variant="outline">{tableLabels[entry.table_name] ?? entry.table_name}</Badge>
                          </div>
                          <p className="text-sm mt-1 text-foreground">{getEntityName(entry)}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(entry.occurred_at), "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR })}
                            {fields.length > 0 && ` · ${fields.length} campo(s) alterado(s): ${fields.slice(0, 4).join(", ")}${fields.length > 4 ? "..." : ""}`}
                          </p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setSelected(entry)}><Eye className="h-4 w-4 mr-2" /> Detalhes</Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader><DialogTitle>Detalhes da auditoria</DialogTitle></DialogHeader>
          {selected && (
            <ScrollArea className="max-h-[70vh] pr-4">
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div><span className="text-muted-foreground">Usuário</span><p className="font-medium">{String(selected.metadata?.actor_email ?? selected.actor_id ?? "system")}</p></div>
                  <div><span className="text-muted-foreground">Data</span><p className="font-medium">{format(new Date(selected.occurred_at), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}</p></div>
                  <div><span className="text-muted-foreground">Ação</span><p className="font-medium">{actionLabels[selected.action]}</p></div>
                  <div><span className="text-muted-foreground">Registro</span><p className="font-medium break-all">{selected.record_id}</p></div>
                </div>

                {selected.action === "UPDATE" ? (
                  <div className="border rounded-lg overflow-hidden">
                    <div className="grid grid-cols-3 bg-muted px-4 py-2 text-sm font-semibold"><span>Campo</span><span>Antes</span><span>Depois</span></div>
                    {changedFields(selected).map((field) => (
                      <div key={field} className="grid grid-cols-3 gap-3 px-4 py-3 border-t text-sm">
                        <span className="font-medium break-words">{field}</span>
                        <pre className="whitespace-pre-wrap break-words text-muted-foreground">{formatValue(selected.old_data?.[field])}</pre>
                        <pre className="whitespace-pre-wrap break-words">{formatValue(selected.new_data?.[field])}</pre>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border rounded-lg p-4"><p className="font-semibold mb-2">{selected.action === "INSERT" ? "Dados criados" : "Dados excluídos"}</p><pre className="text-xs whitespace-pre-wrap break-words">{JSON.stringify(selected.action === "INSERT" ? selected.new_data : selected.old_data, null, 2)}</pre></div>
                )}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
