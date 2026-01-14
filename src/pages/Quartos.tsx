import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { RoomStats } from "@/components/rooms/RoomStats";
import { RoomGrid } from "@/components/rooms/RoomGrid";
import { RoomFilters } from "@/components/rooms/RoomFilters";
import { RoomDetailsDialog } from "@/components/rooms/RoomDetailsDialog";
import { RoomFormDialog } from "@/components/rooms/RoomFormDialog";
import { MaintenanceFormDialog } from "@/components/rooms/MaintenanceFormDialog";
import { Button } from "@/components/ui/button";
import { Room, RoomStatus, RoomType, MaintenanceLog } from "@/types/room";
import { Plus, LayoutGrid, List } from "lucide-react";
import { AIAssistant } from "@/components/dashboard/AIAssistant";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { roomStatusConfig, roomTypeConfig } from "@/types/room";
import { cn } from "@/lib/utils";

// Mock data
const initialRooms: Room[] = [
  // 1º Andar
  ...Array.from({ length: 10 }, (_, i) => ({
    id: `room-${101 + i}`,
    number: String(101 + i),
    floor: 1,
    type: (i < 6 ? "standard" : i < 8 ? "deluxe" : "suite") as RoomType,
    status: (i < 4 ? "occupied" : i < 7 ? "available" : i < 9 ? "cleaning" : "maintenance") as RoomStatus,
    capacity: i < 6 ? 2 : i < 8 ? 3 : 4,
    pricePerNight: i < 6 ? 150 : i < 8 ? 250 : 400,
    amenities: ["Wi-Fi", "TV", "Ar-condicionado", ...(i >= 6 ? ["Frigobar"] : []), ...(i >= 8 ? ["Banheira", "Varanda"] : [])],
    currentGuest: i < 4 ? { id: `guest-${i}`, name: `Hóspede ${i + 1}`, checkIn: "10/01/2025", checkOut: "15/01/2025" } : undefined,
    lastCleaning: "2025-01-13T14:30:00",
    occupancyHistory: i < 4 ? [
      { id: `hist-${i}-1`, guestName: "Cliente Anterior", checkIn: "05/01/2025", checkOut: "09/01/2025", totalDays: 4, totalValue: 600 },
    ] : [],
    maintenanceLogs: i === 9 ? [
      { id: "log-1", date: "13/01/2025", type: "maintenance" as const, description: "Reparo no ar-condicionado", responsiblePerson: "Carlos", status: "in_progress" as const },
    ] : [],
  })),
  // 2º Andar
  ...Array.from({ length: 10 }, (_, i) => ({
    id: `room-${201 + i}`,
    number: String(201 + i),
    floor: 2,
    type: (i < 5 ? "standard" : i < 8 ? "deluxe" : "suite") as RoomType,
    status: (i < 5 ? "occupied" : i < 8 ? "available" : "reserved") as RoomStatus,
    capacity: i < 5 ? 2 : i < 8 ? 3 : 4,
    pricePerNight: i < 5 ? 160 : i < 8 ? 280 : 450,
    amenities: ["Wi-Fi", "TV", "Ar-condicionado", "Frigobar"],
    currentGuest: i < 5 ? { id: `guest-2-${i}`, name: `Hóspede 2-${i + 1}`, checkIn: "12/01/2025", checkOut: "16/01/2025" } : undefined,
    lastCleaning: "2025-01-13T10:00:00",
    occupancyHistory: [],
    maintenanceLogs: [],
  })),
  // 3º Andar - Master Suites
  ...Array.from({ length: 5 }, (_, i) => ({
    id: `room-${301 + i}`,
    number: String(301 + i),
    floor: 3,
    type: (i < 3 ? "suite" : "master") as RoomType,
    status: (i < 2 ? "occupied" : i < 4 ? "available" : "reserved") as RoomStatus,
    capacity: i < 3 ? 4 : 6,
    pricePerNight: i < 3 ? 500 : 800,
    amenities: ["Wi-Fi", "TV", "Ar-condicionado", "Frigobar", "Cofre", "Banheira", "Varanda", "Vista Mar"],
    currentGuest: i < 2 ? { id: `guest-3-${i}`, name: `VIP ${i + 1}`, checkIn: "11/01/2025", checkOut: "18/01/2025" } : undefined,
    lastCleaning: "2025-01-13T08:00:00",
    occupancyHistory: [
      { id: `hist-3-${i}-1`, guestName: "Celebridade", checkIn: "01/01/2025", checkOut: "10/01/2025", totalDays: 9, totalValue: 7200 },
    ],
    maintenanceLogs: [],
  })),
];

export default function Quartos() {
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<RoomStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<RoomType | "all">("all");
  const [floorFilter, setFloorFilter] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [maintenanceDialogOpen, setMaintenanceDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  const floors = [...new Set(rooms.map(r => r.floor))].sort();

  // Filter rooms
  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.number.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || room.status === statusFilter;
    const matchesType = typeFilter === "all" || room.type === typeFilter;
    const matchesFloor = floorFilter === null || room.floor === floorFilter;
    return matchesSearch && matchesStatus && matchesType && matchesFloor;
  });

  const handleRoomClick = (room: Room) => {
    setSelectedRoom(room);
    setDetailsDialogOpen(true);
  };

  const handleStatusChange = (roomId: string, status: RoomStatus) => {
    setRooms(prev => prev.map(room => 
      room.id === roomId 
        ? { 
            ...room, 
            status,
            lastCleaning: status === "available" ? new Date().toISOString() : room.lastCleaning 
          } 
        : room
    ));
    setSelectedRoom(prev => prev?.id === roomId ? { ...prev, status } : prev);
    toast.success(`Status do quarto atualizado para ${roomStatusConfig[status].label}`);
  };

  const handleAddMaintenance = (room: Room) => {
    setSelectedRoom(room);
    setMaintenanceDialogOpen(true);
  };

  const handleMaintenanceSubmit = (roomId: string, log: MaintenanceLog) => {
    setRooms(prev => prev.map(room => 
      room.id === roomId 
        ? { ...room, maintenanceLogs: [log, ...room.maintenanceLogs] } 
        : room
    ));
    setSelectedRoom(prev => 
      prev?.id === roomId 
        ? { ...prev, maintenanceLogs: [log, ...prev.maintenanceLogs] } 
        : prev
    );
  };

  const handleRoomSubmit = (roomData: Partial<Room>) => {
    if (roomData.id) {
      // Edit existing room
      setRooms(prev => prev.map(room => 
        room.id === roomData.id ? { ...room, ...roomData } as Room : room
      ));
    } else {
      // Add new room
      const newRoom: Room = {
        id: `room-${Date.now()}`,
        number: roomData.number!,
        floor: roomData.floor!,
        type: roomData.type!,
        status: "available",
        capacity: roomData.capacity!,
        pricePerNight: roomData.pricePerNight!,
        amenities: roomData.amenities || [],
        notes: roomData.notes,
        occupancyHistory: [],
        maintenanceLogs: [],
      };
      setRooms(prev => [...prev, newRoom]);
    }
  };

  const handleEditRoom = (room: Room) => {
    setEditingRoom(room);
    setFormDialogOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground font-display">Quartos</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie os quartos e acompanhe ocupação em tempo real.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-muted rounded-lg p-1">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
            <Button onClick={() => { setEditingRoom(null); setFormDialogOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Quarto
            </Button>
          </div>
        </div>

        {/* Stats */}
        <RoomStats rooms={rooms} />

        {/* Filters */}
        <RoomFilters
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
          floorFilter={floorFilter}
          onFloorFilterChange={setFloorFilter}
          floors={floors}
        />

        {/* Room Grid or List */}
        {viewMode === "grid" ? (
          <RoomGrid
            rooms={filteredRooms}
            onRoomClick={handleRoomClick}
            selectedFloor={floorFilter}
          />
        ) : (
          <div className="bg-card rounded-xl shadow-md border border-border/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quarto</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Andar</TableHead>
                  <TableHead>Capacidade</TableHead>
                  <TableHead>Diária</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Hóspede</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRooms.map((room) => {
                  const statusConfig = roomStatusConfig[room.status];
                  const typeConfig = roomTypeConfig[room.type];
                  return (
                    <TableRow key={room.id}>
                      <TableCell className="font-semibold">{room.number}</TableCell>
                      <TableCell>
                        <span className="flex items-center gap-1">
                          {typeConfig.icon} {typeConfig.label}
                        </span>
                      </TableCell>
                      <TableCell>{room.floor}º</TableCell>
                      <TableCell>{room.capacity}</TableCell>
                      <TableCell>R$ {room.pricePerNight.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge className={cn(statusConfig.bgColor, statusConfig.color)}>
                          {statusConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {room.currentGuest?.name || "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRoomClick(room)}
                        >
                          Detalhes
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditRoom(room)}
                        >
                          Editar
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Dialogs */}
      <RoomDetailsDialog
        room={selectedRoom}
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        onStatusChange={handleStatusChange}
        onAddMaintenance={handleAddMaintenance}
      />

      <RoomFormDialog
        room={editingRoom}
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        onSubmit={handleRoomSubmit}
      />

      <MaintenanceFormDialog
        room={selectedRoom}
        open={maintenanceDialogOpen}
        onOpenChange={setMaintenanceDialogOpen}
        onSubmit={handleMaintenanceSubmit}
      />

      {/* AI Assistant */}
      <AIAssistant />
    </DashboardLayout>
  );
}
