import { useState, useMemo } from "react";
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
import { useReservations, ReservationWithDetails } from "@/hooks/useReservations";
import { toast } from "sonner";

const ITEMS_PER_PAGE = 10;

// Map DB guest to UI guest with reservation info
const mapDbGuestToUi = (dbGuest: DbGuest, reservations: ReservationWithDetails[]): Guest => {
  // Find active reservation for this guest
  const activeReservation = reservations.find(
    r => r.guest_id === dbGuest.id && 
    (r.status === "checked_in" || r.status === "confirmed" || r.status === "pending")
  );
  
  // Determine status based on reservations
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
      if (checkOutDate.getTime() === today.getTime()) {
        status = "checking-out";
      } else {
        status = "checked-in";
      }
    } else if (activeReservation.status === "confirmed") {
      status = "reserved";
    } else if (activeReservation.status === "pending") {
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

  const guests = useMemo(
    () => dbGuests.map(g => mapDbGuestToUi(g, dbReservations)),
    [dbGuests, dbReservations]
  );

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<GuestStatus | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [viewingGuest, setViewingGuest] = useState<Guest | null>(null);

  const isLoading = loadingGuests || loadingReservations;

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
    createGuest.mutate({
      name: guest.name,
      email: guest.email,
      phone: guest.phone || null,
      document: guest.document,
      document_type: "cpf",
      notes: guest.notes || null,
    }, {
      onSuccess: () => {
        setIsFormOpen(false);
      }
    });
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
    }, {
      onSuccess: () => {
        setEditingGuest(null);
      }
    });
  };

  const handleDeleteGuest = (id: string) => {
    deleteGuest.mutate(id);
  };

  const handleCheckIn = (id: string) => {
    // This would update the reservation status - for now just show toast
    toast.info("Para realizar check-in, vá para a página de Reservas");
  };

  const handleCheckOut = (id: string) => {
    // This would update the reservation status - for now just show toast
    toast.info("Para realizar check-out, vá para a página de Reservas");
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8">
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
