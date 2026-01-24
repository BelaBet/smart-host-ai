import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ReservationStats } from "@/components/reservations/ReservationStats";
import { ReservationCalendar } from "@/components/reservations/ReservationCalendar";
import { ReservationTable } from "@/components/reservations/ReservationTable";
import { ReservationFilters } from "@/components/reservations/ReservationFilters";
import { ReservationFormDialog } from "@/components/reservations/ReservationFormDialog";
import { ReservationDetailsDialog } from "@/components/reservations/ReservationDetailsDialog";
import { AvailabilityPanel } from "@/components/reservations/AvailabilityPanel";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Reservation, ReservationStatus } from "@/types/reservation";
import { Room, RoomType, RoomStatus } from "@/types/room";
import { Plus, CalendarDays, List, Loader2 } from "lucide-react";
import { AIAssistant } from "@/components/dashboard/AIAssistant";
import { useReservations, useCreateReservation, useUpdateReservation, useUpdateReservationStatus, ReservationWithDetails, DbReservationStatus } from "@/hooks/useReservations";
import { useRooms, DbRoom, DbRoomType, DbRoomStatus } from "@/hooks/useRooms";
import { useGuests, useCreateGuest, DbGuest } from "@/hooks/useGuests";

// Map DB reservation to UI reservation
const mapDbReservationToUi = (dbRes: ReservationWithDetails): Reservation => ({
  id: dbRes.id,
  roomId: dbRes.room_id,
  roomNumber: dbRes.rooms?.number || "",
  guestName: dbRes.guests?.name || "",
  guestEmail: dbRes.guests?.email || "",
  guestPhone: dbRes.guests?.phone || "",
  checkIn: new Date(dbRes.check_in),
  checkOut: new Date(dbRes.check_out),
  adults: dbRes.adults,
  children: dbRes.children,
  totalValue: Number(dbRes.total_value),
  status: dbRes.status as ReservationStatus,
  notes: dbRes.notes || undefined,
  createdAt: new Date(dbRes.created_at),
  confirmationCode: dbRes.confirmation_code,
});

// Map DB room to UI room
const mapDbRoomToUi = (dbRoom: DbRoom): Room => {
  const typeMapping: Record<DbRoomType, RoomType> = {
    standard: "standard",
    superior: "standard",
    deluxe: "deluxe",
    suite: "suite",
    presidential: "master",
  };

  return {
    id: dbRoom.id,
    number: dbRoom.number,
    floor: dbRoom.floor,
    type: typeMapping[dbRoom.type] || "standard",
    status: dbRoom.status as RoomStatus,
    capacity: dbRoom.capacity,
    pricePerNight: Number(dbRoom.price_per_night),
    amenities: dbRoom.amenities || [],
    occupancyHistory: [],
    maintenanceLogs: [],
  };
};

export default function Reservas() {
  const { data: dbReservations = [], isLoading: loadingReservations } = useReservations();
  const { data: dbRooms = [], isLoading: loadingRooms } = useRooms();
  const { data: dbGuests = [], isLoading: loadingGuests } = useGuests();
  
  const createReservation = useCreateReservation();
  const updateReservation = useUpdateReservation();
  const updateReservationStatus = useUpdateReservationStatus();
  const createGuest = useCreateGuest();

  const reservations = useMemo(() => dbReservations.map(mapDbReservationToUi), [dbReservations]);
  const rooms = useMemo(() => dbRooms.map(mapDbRoomToUi), [dbRooms]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ReservationStatus | "all">("all");
  const [activeTab, setActiveTab] = useState("calendar");
  
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [preselectedRoomId, setPreselectedRoomId] = useState<string | null>(null);

  const isLoading = loadingReservations || loadingRooms || loadingGuests;

  // Filter reservations
  const filteredReservations = reservations.filter(res => {
    const matchesSearch = 
      res.guestName.toLowerCase().includes(search.toLowerCase()) ||
      res.guestEmail.toLowerCase().includes(search.toLowerCase()) ||
      res.confirmationCode.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || res.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
  };

  const handleReservationClick = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setDetailsDialogOpen(true);
  };

  const handleCreateReservation = (roomId?: string) => {
    setEditingReservation(null);
    if (roomId) {
      setPreselectedRoomId(roomId);
    }
    setFormDialogOpen(true);
  };

  const handleEditReservation = (reservation: Reservation) => {
    setEditingReservation(reservation);
    setPreselectedRoomId(null);
    setFormDialogOpen(true);
  };

  const handleReservationSubmit = async (data: Partial<Reservation>) => {
    // Find or create guest
    let guestId = dbReservations.find(r => r.id === data.id)?.guest_id;
    
    if (!guestId) {
      // Check if guest exists by email
      const existingGuest = dbGuests.find(g => g.email === data.guestEmail);
      if (existingGuest) {
        guestId = existingGuest.id;
      } else {
        // Create new guest
        try {
          const newGuest = await createGuest.mutateAsync({
            name: data.guestName!,
            email: data.guestEmail!,
            phone: data.guestPhone || null,
            document: "000.000.000-00", // Placeholder - should be collected in form
            document_type: "cpf",
          });
          guestId = newGuest.id;
        } catch (error) {
          console.error("Error creating guest:", error);
          return;
        }
      }
    }

    if (data.id) {
      // Update existing
      updateReservation.mutate({
        id: data.id,
        room_id: data.roomId,
        check_in: data.checkIn?.toISOString().split("T")[0],
        check_out: data.checkOut?.toISOString().split("T")[0],
        adults: data.adults,
        children: data.children,
        total_value: data.totalValue,
        notes: data.notes,
      });
    } else {
      // Create new
      createReservation.mutate({
        room_id: data.roomId!,
        guest_id: guestId!,
        check_in: data.checkIn!.toISOString().split("T")[0],
        check_out: data.checkOut!.toISOString().split("T")[0],
        adults: data.adults || 1,
        children: data.children || 0,
        total_value: data.totalValue!,
        notes: data.notes,
        status: "pending",
      });
    }
    setPreselectedRoomId(null);
  };

  const handleStatusChange = (id: string, status: ReservationStatus) => {
    updateReservationStatus.mutate(
      { id, status: status as DbReservationStatus },
      {
        onSuccess: () => {
          setSelectedReservation(prev => 
            prev?.id === id ? { ...prev, status } : prev
          );
        },
      }
    );
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
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground font-display">Reservas</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie reservas, disponibilidade e check-ins.
            </p>
          </div>
          <Button onClick={() => handleCreateReservation()}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Reserva
          </Button>
        </div>

        {/* Stats */}
        <ReservationStats reservations={reservations} />

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4" />
              Calendário
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center gap-2">
              <List className="w-4 h-4" />
              Lista
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ReservationCalendar
                  reservations={reservations}
                  onDayClick={handleDayClick}
                  onReservationClick={handleReservationClick}
                />
              </div>
              <div>
                <AvailabilityPanel
                  rooms={rooms}
                  reservations={reservations}
                  selectedDate={selectedDate}
                  onCreateReservation={(roomId) => handleCreateReservation(roomId)}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="list" className="mt-6 space-y-4">
            <ReservationFilters
              search={search}
              onSearchChange={setSearch}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
            />
            <ReservationTable
              reservations={filteredReservations}
              onView={handleReservationClick}
              onEdit={handleEditReservation}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      <ReservationFormDialog
        reservation={editingReservation}
        rooms={rooms.map(r => preselectedRoomId === r.id ? { ...r, status: "available" as RoomStatus } : r)}
        open={formDialogOpen}
        onOpenChange={(open) => {
          setFormDialogOpen(open);
          if (!open) setPreselectedRoomId(null);
        }}
        onSubmit={handleReservationSubmit}
        selectedDate={selectedDate}
      />

      <ReservationDetailsDialog
        reservation={selectedReservation}
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        onStatusChange={handleStatusChange}
        onEdit={handleEditReservation}
      />

      {/* AI Assistant */}
      <AIAssistant />
    </DashboardLayout>
  );
}
