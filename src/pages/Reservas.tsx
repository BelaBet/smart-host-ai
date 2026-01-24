import { useState } from "react";
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
import { Plus, CalendarDays, List } from "lucide-react";
import { AIAssistant } from "@/components/dashboard/AIAssistant";
import { toast } from "sonner";
import { addDays, subDays } from "date-fns";

// Mock rooms data (would come from shared state/API)
const mockRooms: Room[] = [
  ...Array.from({ length: 10 }, (_, i) => ({
    id: `room-${101 + i}`,
    number: String(101 + i),
    floor: 1,
    type: (i < 6 ? "standard" : i < 8 ? "deluxe" : "suite") as RoomType,
    status: (i < 4 ? "occupied" : "available") as RoomStatus,
    capacity: i < 6 ? 2 : i < 8 ? 3 : 4,
    pricePerNight: i < 6 ? 150 : i < 8 ? 250 : 400,
    amenities: ["Wi-Fi", "TV", "Ar-condicionado"],
    occupancyHistory: [],
    maintenanceLogs: [],
  })),
  ...Array.from({ length: 10 }, (_, i) => ({
    id: `room-${201 + i}`,
    number: String(201 + i),
    floor: 2,
    type: (i < 5 ? "standard" : i < 8 ? "deluxe" : "suite") as RoomType,
    status: "available" as RoomStatus,
    capacity: i < 5 ? 2 : i < 8 ? 3 : 4,
    pricePerNight: i < 5 ? 160 : i < 8 ? 280 : 450,
    amenities: ["Wi-Fi", "TV", "Ar-condicionado", "Frigobar"],
    occupancyHistory: [],
    maintenanceLogs: [],
  })),
];

// Mock reservations
const generateConfirmationCode = () => {
  return `RES${Date.now().toString(36).toUpperCase()}`;
};

const initialReservations: Reservation[] = [
  {
    id: "res-1",
    roomId: "room-101",
    roomNumber: "101",
    guestName: "João Silva",
    guestEmail: "joao@email.com",
    guestPhone: "(11) 99999-0001",
    checkIn: new Date(),
    checkOut: addDays(new Date(), 3),
    adults: 2,
    children: 0,
    totalValue: 450,
    status: "checked_in",
    confirmationCode: "RES001ABC",
    createdAt: subDays(new Date(), 7),
  },
  {
    id: "res-2",
    roomId: "room-102",
    roomNumber: "102",
    guestName: "Maria Santos",
    guestEmail: "maria@email.com",
    guestPhone: "(11) 99999-0002",
    checkIn: addDays(new Date(), 1),
    checkOut: addDays(new Date(), 5),
    adults: 2,
    children: 1,
    totalValue: 600,
    status: "confirmed",
    confirmationCode: "RES002DEF",
    createdAt: subDays(new Date(), 3),
  },
  {
    id: "res-3",
    roomId: "room-107",
    roomNumber: "107",
    guestName: "Carlos Oliveira",
    guestEmail: "carlos@email.com",
    guestPhone: "(11) 99999-0003",
    checkIn: addDays(new Date(), 2),
    checkOut: addDays(new Date(), 4),
    adults: 3,
    children: 0,
    totalValue: 500,
    status: "pending",
    confirmationCode: "RES003GHI",
    createdAt: subDays(new Date(), 1),
  },
  {
    id: "res-4",
    roomId: "room-109",
    roomNumber: "109",
    guestName: "Ana Costa",
    guestEmail: "ana@email.com",
    guestPhone: "(11) 99999-0004",
    checkIn: addDays(new Date(), 5),
    checkOut: addDays(new Date(), 10),
    adults: 2,
    children: 2,
    totalValue: 2000,
    status: "confirmed",
    notes: "Preferência por andar alto, lua de mel",
    confirmationCode: "RES004JKL",
    createdAt: subDays(new Date(), 5),
  },
  {
    id: "res-5",
    roomId: "room-201",
    roomNumber: "201",
    guestName: "Pedro Almeida",
    guestEmail: "pedro@email.com",
    guestPhone: "(11) 99999-0005",
    checkIn: subDays(new Date(), 5),
    checkOut: subDays(new Date(), 2),
    adults: 1,
    children: 0,
    totalValue: 480,
    status: "checked_out",
    confirmationCode: "RES005MNO",
    createdAt: subDays(new Date(), 10),
  },
];

export default function Reservas() {
  const [reservations, setReservations] = useState<Reservation[]>(initialReservations);
  const [rooms] = useState<Room[]>(mockRooms);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ReservationStatus | "all">("all");
  const [activeTab, setActiveTab] = useState("calendar");
  
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [preselectedRoomId, setPreselectedRoomId] = useState<string | null>(null);

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

  const handleReservationSubmit = (data: Partial<Reservation>) => {
    if (data.id) {
      // Update existing
      setReservations(prev => prev.map(res => 
        res.id === data.id ? { ...res, ...data } as Reservation : res
      ));
    } else {
      // Create new
      const newReservation: Reservation = {
        ...data,
        id: `res-${Date.now()}`,
        confirmationCode: generateConfirmationCode(),
        createdAt: new Date(),
      } as Reservation;
      setReservations(prev => [...prev, newReservation]);
    }
    setPreselectedRoomId(null);
  };

  const handleStatusChange = (id: string, status: ReservationStatus) => {
    setReservations(prev => prev.map(res => 
      res.id === id ? { ...res, status } : res
    ));
    setSelectedReservation(prev => 
      prev?.id === id ? { ...prev, status } : prev
    );
    
    const statusMessages: Record<ReservationStatus, string> = {
      pending: "Reserva marcada como pendente",
      confirmed: "Reserva confirmada com sucesso!",
      checked_in: "Check-in realizado com sucesso!",
      checked_out: "Check-out realizado com sucesso!",
      cancelled: "Reserva cancelada",
    };
    toast.success(statusMessages[status]);
  };

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
