import { useState, useMemo, useRef } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { AIAssistant } from "@/components/dashboard/AIAssistant";
import { GuestTable } from "@/components/guests/GuestTable";
import { GuestFilters } from "@/components/guests/GuestFilters";
import { GuestFormDialog } from "@/components/guests/GuestFormDialog";
import { GuestDetailsDialog } from "@/components/guests/GuestDetailsDialog";
import { Button } from "@/components/ui/button";
import { UserPlus, Download, Upload, Loader2 } from "lucide-react";
import { Guest, GuestStatus } from "@/types/guest";
import { useGuests, useCreateGuest, useUpdateGuest, useDeleteGuest, DbGuest } from "@/hooks/useGuests";
import { useReservations, ReservationWithDetails, useUpdateReservationStatus } from "@/hooks/useReservations";
import { toast } from "sonner";

const ITEMS_PER_PAGE = 10;

const mapDbGuestToUi = (dbGuest: DbGuest, reservations: ReservationWithDetails[]): Guest => {
  const activeReservation = reservations.find(
    r => r.guest_id === dbGuest.id &&
      (r.status === "checked_in" || r.status === "confirmed" || r.status === "pending")
  );

  let status: GuestStatus = "checked-out";
  let room = "";
  let checkIn = "";
  let checkOut = "";
  let totalValue = 0;

  if (activeReservation) {
    room = activeReservation.rooms?.number || "";
    checkIn = activeReservation.check_in;
    checkOut = activeReservation.check_out;
    totalValue = Number(activeReservation.total_value);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkOutDate = new Date(activeReservation.check_out);
    checkOutDate.setHours(0, 0, 0, 0);

    if (activeReservation.status === "checked_in") {
      status = checkOutDate.getTime() === today.getTime() ? "checking-out" : "checked-in";
    } else if (activeReservation.status === "confirmed") {
      status = "reserved";
    } else {
      status = "pending";
    }
  }

  return {
    id: dbGuest.id,
    name: dbGuest.name,
    email: dbGuest.email,
    phone: dbGuest.phone || "",
    document: dbGuest.document,
    room,
    checkIn,
    checkOut,
    status,
    notes: dbGuest.notes || "",
    totalValue: totalValue || Number(dbGuest.total_spent),
    createdAt: dbGuest.created_at.split("T")[0],
  };
};

export default function Hospedes() {
  const { data: dbGuests = [], isLoading: loadingGuests } = useGuests();
  const { data: dbReservations = [], isLoading: loadingReservations } = useReservations();
  const createGuest = useCreateGuest();
  const updateGuest = useUpdateGuest();
  const deleteGuest = useDeleteGuest();
  const updateReservationStatus = useUpdateReservationStatus();
  const importInputRef = useRef<HTMLInputElement>(null);

  const guests = useMemo(() => dbGuests.map(g => mapDbGuestToUi(g, dbReservations)), [dbGuests, dbReservations]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<GuestStatus | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [viewingGuest, setViewingGuest] = useState<Guest | null>(null);

  const isLoading = loadingGuests || loadingReservations;

  const filteredGuests = useMemo(() => guests.filter((guest) => {
    const term = search.toLowerCase();
    const matchesSearch = guest.name.toLowerCase().includes(term) ||
      guest.email.toLowerCase().includes(term) ||
      guest.document.includes(search) ||
      guest.room.includes(search);
    return matchesSearch && (statusFilter === "all" || guest.status === statusFilter);
  }), [guests, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredGuests.length / ITEMS_PER_PAGE));
  const paginatedGuests = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredGuests.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredGuests, currentPage]);

  const stats = useMemo(() => ({
    total: guests.length,
    checkedIn: guests.filter(g => g.status === "checked-in").length,
    reserved: guests.filter(g => g.status === "reserved").length,
    checkingOut: guests.filter(g => g.status === "checking-out").length,
  }), [guests]);

  const handleAddGuest = (guest: Omit<Guest, "id" | "createdAt">) => {
    createGuest.mutate({
      name: guest.name,
      email: guest.email,
      phone: guest.phone || null,
      document: guest.document,
      document_type: "cpf",
      notes: guest.notes || null,
    }, { onSuccess: () => setIsFormOpen(false) });
  };

  const handleEditGuest = (guest: Omit<Guest, "id" | "createdAt">) => {
    if (!editingGuest) return;
    updateGuest.mutate({
      id: editingGuest.id,
      name: guest.name,
      email: guest.email,
      phone: guest.phone || null,
      document: guest.document,
      notes: guest.notes || null,
    }, { onSuccess: () => setEditingGuest(null) });
  };

  const handleDeleteGuest = (id: string) => deleteGuest.mutate(id);

  const handleCheckIn = (guestId: string) => {
    const reservation = dbReservations.find(r => r.guest_id === guestId && ["pending", "confirmed"].includes(r.status));
    if (!reservation) {
      toast.info("Este hóspede não possui uma reserva pendente ou confirmada.");
      return;
    }
    updateReservationStatus.mutate({ id: reservation.id, status: "checked_in" });
  };

  const handleCheckOut = (guestId: string) => {
    const reservation = dbReservations.find(r => r.guest_id === guestId && r.status === "checked_in");
    if (!reservation) {
      toast.info("Este hóspede não possui uma hospedagem ativa.");
      return;
    }
    updateReservationStatus.mutate({ id: reservation.id, status: "checked_out" });
  };

  const exportGuests = () => {
    const headers = ["Nome", "E-mail", "Telefone", "Documento", "Quarto", "Status", "Check-in", "Check-out"];
    const rows = guests.map(g => [g.name, g.email, g.phone, g.document, g.room, g.status, g.checkIn, g.checkOut]);
    const csv = [headers, ...rows].map(row => row.map(value => `"${String(value ?? "").replaceAll('"', '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `hospedes-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Lista de hóspedes exportada.");
  };

  const importGuests = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const text = await file.text();
    const lines = text.replace(/^\ufeff/, "").split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) {
      toast.error("Arquivo vazio ou sem registros.");
      return;
    }

    const parseCsvLine = (line: string) => {
      const values: string[] = [];
      let current = "";
      let quoted = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"' && line[i + 1] === '"' && quoted) { current += '"'; i++; continue; }
        if (char === '"') { quoted = !quoted; continue; }
        if (char === "," && !quoted) { values.push(current.trim()); current = ""; continue; }
        current += char;
      }
      values.push(current.trim());
      return values;
    };

    const headers = parseCsvLine(lines[0]).map(h => h.toLowerCase());
    const nameIndex = headers.indexOf("nome");
    const emailIndex = headers.indexOf("e-mail") >= 0 ? headers.indexOf("e-mail") : headers.indexOf("email");
    const phoneIndex = headers.indexOf("telefone");
    const documentIndex = headers.indexOf("documento");

    if (nameIndex < 0 || emailIndex < 0 || documentIndex < 0) {
      toast.error("CSV inválido. Use as colunas Nome, E-mail e Documento.");
      return;
    }

    let imported = 0;
    for (const line of lines.slice(1)) {
      const row = parseCsvLine(line);
      const name = row[nameIndex];
      const email = row[emailIndex];
      const document = row[documentIndex];
      if (!name || !email || !document) continue;
      await createGuest.mutateAsync({
        name,
        email,
        document,
        phone: phoneIndex >= 0 ? row[phoneIndex] || null : null,
        document_type: "cpf",
      });
      imported++;
    }
    toast.success(`${imported} hóspede(s) importado(s).`);
  };

  if (isLoading) {
    return <DashboardLayout><div className="flex items-center justify-center h-[calc(100vh-200px)]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground font-display">Gestão de Hóspedes</h1>
            <p className="text-muted-foreground mt-1">Gerencie check-ins, reservas e informações dos hóspedes.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <input ref={importInputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={importGuests} />
            <Button variant="outline" size="sm" className="gap-2" onClick={() => importInputRef.current?.click()}><Upload className="w-4 h-4" />Importar</Button>
            <Button variant="outline" size="sm" className="gap-2" onClick={exportGuests}><Download className="w-4 h-4" />Exportar</Button>
            <Button variant="hero" size="sm" className="gap-2" onClick={() => setIsFormOpen(true)}><UserPlus className="w-4 h-4" />Novo Hóspede</Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm"><p className="text-sm text-muted-foreground">Total</p><p className="text-2xl font-bold text-foreground font-display">{stats.total}</p></div>
          <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm"><p className="text-sm text-muted-foreground">Hospedados</p><p className="text-2xl font-bold text-success font-display">{stats.checkedIn}</p></div>
          <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm"><p className="text-sm text-muted-foreground">Reservados</p><p className="text-2xl font-bold text-primary font-display">{stats.reserved}</p></div>
          <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm"><p className="text-sm text-muted-foreground">Check-out Hoje</p><p className="text-2xl font-bold text-warning font-display">{stats.checkingOut}</p></div>
        </div>

        <GuestFilters search={search} onSearchChange={(value) => { setSearch(value); setCurrentPage(1); }} statusFilter={statusFilter} onStatusChange={(value) => { setStatusFilter(value); setCurrentPage(1); }} />
        <GuestTable guests={paginatedGuests} currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} onEdit={setEditingGuest} onDelete={handleDeleteGuest} onView={setViewingGuest} onCheckIn={handleCheckIn} onCheckOut={handleCheckOut} />

        <GuestFormDialog open={isFormOpen || !!editingGuest} onClose={() => { setIsFormOpen(false); setEditingGuest(null); }} onSubmit={editingGuest ? handleEditGuest : handleAddGuest} guest={editingGuest} />
        <GuestDetailsDialog guest={viewingGuest} onClose={() => setViewingGuest(null)} />
      </div>
      <AIAssistant />
    </DashboardLayout>
  );
}
