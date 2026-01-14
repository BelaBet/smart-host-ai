import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { AIAssistant } from "@/components/dashboard/AIAssistant";
import { GuestTable } from "@/components/guests/GuestTable";
import { GuestFilters } from "@/components/guests/GuestFilters";
import { GuestFormDialog } from "@/components/guests/GuestFormDialog";
import { GuestDetailsDialog } from "@/components/guests/GuestDetailsDialog";
import { Button } from "@/components/ui/button";
import { UserPlus, Download, Upload } from "lucide-react";
import { Guest, GuestStatus } from "@/types/guest";

// Mock data
const mockGuests: Guest[] = [
  {
    id: "1",
    name: "João Silva",
    email: "joao.silva@email.com",
    phone: "(11) 98765-4321",
    document: "123.456.789-00",
    room: "101",
    checkIn: "2025-01-10",
    checkOut: "2025-01-15",
    status: "checked-in",
    notes: "Preferência por quarto silencioso",
    totalValue: 1500,
    createdAt: "2025-01-08",
  },
  {
    id: "2",
    name: "Maria Santos",
    email: "maria.santos@email.com",
    phone: "(21) 99876-5432",
    document: "987.654.321-00",
    room: "205",
    checkIn: "2025-01-12",
    checkOut: "2025-01-14",
    status: "checking-out",
    notes: "Alérgica a amendoim",
    totalValue: 800,
    createdAt: "2025-01-10",
  },
  {
    id: "3",
    name: "Pedro Oliveira",
    email: "pedro.oliveira@email.com",
    phone: "(31) 97654-3210",
    document: "456.789.123-00",
    room: "302",
    checkIn: "2025-01-14",
    checkOut: "2025-01-18",
    status: "reserved",
    notes: "",
    totalValue: 1200,
    createdAt: "2025-01-11",
  },
  {
    id: "4",
    name: "Ana Costa",
    email: "ana.costa@email.com",
    phone: "(41) 96543-2109",
    document: "789.123.456-00",
    room: "108",
    checkIn: "2025-01-08",
    checkOut: "2025-01-16",
    status: "checked-in",
    notes: "VIP - Cliente frequente",
    totalValue: 2400,
    createdAt: "2025-01-06",
  },
  {
    id: "5",
    name: "Carlos Ferreira",
    email: "carlos.ferreira@email.com",
    phone: "(51) 95432-1098",
    document: "321.654.987-00",
    room: "110",
    checkIn: "2025-01-05",
    checkOut: "2025-01-10",
    status: "checked-out",
    notes: "",
    totalValue: 1000,
    createdAt: "2025-01-03",
  },
  {
    id: "6",
    name: "Fernanda Lima",
    email: "fernanda.lima@email.com",
    phone: "(61) 94321-0987",
    document: "654.987.321-00",
    room: "203",
    checkIn: "2025-01-15",
    checkOut: "2025-01-20",
    status: "reserved",
    notes: "Chegada prevista às 18h",
    totalValue: 1500,
    createdAt: "2025-01-12",
  },
  {
    id: "7",
    name: "Ricardo Souza",
    email: "ricardo.souza@email.com",
    phone: "(71) 93210-9876",
    document: "147.258.369-00",
    room: "305",
    checkIn: "2025-01-11",
    checkOut: "2025-01-13",
    status: "checked-in",
    notes: "",
    totalValue: 600,
    createdAt: "2025-01-09",
  },
  {
    id: "8",
    name: "Juliana Alves",
    email: "juliana.alves@email.com",
    phone: "(81) 92109-8765",
    document: "258.369.147-00",
    room: "",
    checkIn: "2025-01-20",
    checkOut: "2025-01-25",
    status: "pending",
    notes: "Aguardando confirmação de pagamento",
    totalValue: 1500,
    createdAt: "2025-01-13",
  },
];

const ITEMS_PER_PAGE = 5;

export default function Hospedes() {
  const [guests, setGuests] = useState<Guest[]>(mockGuests);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<GuestStatus | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [viewingGuest, setViewingGuest] = useState<Guest | null>(null);

  // Filter and search guests
  const filteredGuests = useMemo(() => {
    return guests.filter((guest) => {
      const matchesSearch =
        guest.name.toLowerCase().includes(search.toLowerCase()) ||
        guest.email.toLowerCase().includes(search.toLowerCase()) ||
        guest.document.includes(search) ||
        guest.room.includes(search);

      const matchesStatus =
        statusFilter === "all" || guest.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [guests, search, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredGuests.length / ITEMS_PER_PAGE);
  const paginatedGuests = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredGuests.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredGuests, currentPage]);

  // Stats
  const stats = useMemo(() => {
    return {
      total: guests.length,
      checkedIn: guests.filter((g) => g.status === "checked-in").length,
      reserved: guests.filter((g) => g.status === "reserved").length,
      checkingOut: guests.filter((g) => g.status === "checking-out").length,
    };
  }, [guests]);

  const handleAddGuest = (guest: Omit<Guest, "id" | "createdAt">) => {
    const newGuest: Guest = {
      ...guest,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split("T")[0],
    };
    setGuests((prev) => [newGuest, ...prev]);
    setIsFormOpen(false);
  };

  const handleEditGuest = (guest: Omit<Guest, "id" | "createdAt">) => {
    if (!editingGuest) return;
    setGuests((prev) =>
      prev.map((g) =>
        g.id === editingGuest.id
          ? { ...guest, id: editingGuest.id, createdAt: editingGuest.createdAt }
          : g
      )
    );
    setEditingGuest(null);
  };

  const handleDeleteGuest = (id: string) => {
    setGuests((prev) => prev.filter((g) => g.id !== id));
  };

  const handleCheckIn = (id: string) => {
    setGuests((prev) =>
      prev.map((g) => (g.id === id ? { ...g, status: "checked-in" as GuestStatus } : g))
    );
  };

  const handleCheckOut = (id: string) => {
    setGuests((prev) =>
      prev.map((g) => (g.id === id ? { ...g, status: "checked-out" as GuestStatus } : g))
    );
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground font-display">
              Gestão de Hóspedes
            </h1>
            <p className="text-muted-foreground mt-1">
              Gerencie check-ins, reservas e informações dos hóspedes.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm" className="gap-2">
              <Upload className="w-4 h-4" />
              Importar
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              Exportar
            </Button>
            <Button
              variant="hero"
              size="sm"
              className="gap-2"
              onClick={() => setIsFormOpen(true)}
            >
              <UserPlus className="w-4 h-4" />
              Novo Hóspede
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-bold text-foreground font-display">
              {stats.total}
            </p>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm">
            <p className="text-sm text-muted-foreground">Hospedados</p>
            <p className="text-2xl font-bold text-success font-display">
              {stats.checkedIn}
            </p>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm">
            <p className="text-sm text-muted-foreground">Reservados</p>
            <p className="text-2xl font-bold text-primary font-display">
              {stats.reserved}
            </p>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm">
            <p className="text-sm text-muted-foreground">Check-out Hoje</p>
            <p className="text-2xl font-bold text-warning font-display">
              {stats.checkingOut}
            </p>
          </div>
        </div>

        {/* Filters */}
        <GuestFilters
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
        />

        {/* Table */}
        <GuestTable
          guests={paginatedGuests}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          onEdit={(guest) => setEditingGuest(guest)}
          onDelete={handleDeleteGuest}
          onView={(guest) => setViewingGuest(guest)}
          onCheckIn={handleCheckIn}
          onCheckOut={handleCheckOut}
        />

        {/* Add/Edit Dialog */}
        <GuestFormDialog
          open={isFormOpen || !!editingGuest}
          onClose={() => {
            setIsFormOpen(false);
            setEditingGuest(null);
          }}
          onSubmit={editingGuest ? handleEditGuest : handleAddGuest}
          guest={editingGuest}
        />

        {/* View Details Dialog */}
        <GuestDetailsDialog
          guest={viewingGuest}
          onClose={() => setViewingGuest(null)}
        />
      </div>

      <AIAssistant />
    </DashboardLayout>
  );
}
