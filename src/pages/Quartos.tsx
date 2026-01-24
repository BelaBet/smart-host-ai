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
import { Plus, LayoutGrid, List, Loader2 } from "lucide-react";
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
import { 
  useRooms, 
  useCreateRoom, 
  useUpdateRoom, 
  useUpdateRoomStatus,
  useCreateMaintenance,
  DbRoom,
  DbRoomStatus,
  DbRoomType,
} from "@/hooks/useRooms";

// Map DB types to UI types
const mapDbRoomToUiRoom = (dbRoom: DbRoom): Room => ({
  id: dbRoom.id,
  number: dbRoom.number,
  floor: dbRoom.floor,
  type: mapDbTypeToUiType(dbRoom.type),
  status: dbRoom.status as RoomStatus,
  capacity: dbRoom.capacity,
  pricePerNight: Number(dbRoom.price_per_night),
  amenities: dbRoom.amenities || [],
  notes: dbRoom.notes || undefined,
  occupancyHistory: [],
  maintenanceLogs: [],
});

const mapDbTypeToUiType = (dbType: DbRoomType): RoomType => {
  const mapping: Record<DbRoomType, RoomType> = {
    standard: "standard",
    superior: "standard",
    deluxe: "deluxe",
    suite: "suite",
    presidential: "master",
  };
  return mapping[dbType] || "standard";
};

const mapUiTypeToDbType = (uiType: RoomType): DbRoomType => {
  const mapping: Record<RoomType, DbRoomType> = {
    standard: "standard",
    deluxe: "deluxe",
    suite: "suite",
    master: "presidential",
  };
  return mapping[uiType] || "standard";
};

export default function Quartos() {
  const { data: dbRooms = [], isLoading, error } = useRooms();
  const createRoom = useCreateRoom();
  const updateRoom = useUpdateRoom();
  const updateRoomStatus = useUpdateRoomStatus();
  const createMaintenance = useCreateMaintenance();

  const rooms = dbRooms.map(mapDbRoomToUiRoom);

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
    updateRoomStatus.mutate(
      { id: roomId, status: status as DbRoomStatus },
      {
        onSuccess: () => {
          setSelectedRoom(prev => prev?.id === roomId ? { ...prev, status } : prev);
          toast.success(`Status do quarto atualizado para ${roomStatusConfig[status].label}`);
        },
      }
    );
  };

  const handleAddMaintenance = (room: Room) => {
    setSelectedRoom(room);
    setMaintenanceDialogOpen(true);
  };

  const handleMaintenanceSubmit = (roomId: string, log: MaintenanceLog) => {
    createMaintenance.mutate({
      room_id: roomId,
      type: log.type,
      description: log.description,
      status: log.status,
      scheduled_date: log.date,
    });
  };

  const handleRoomSubmit = (roomData: Partial<Room>) => {
    if (roomData.id) {
      // Edit existing room
      updateRoom.mutate({
        id: roomData.id,
        number: roomData.number,
        floor: roomData.floor,
        type: mapUiTypeToDbType(roomData.type!),
        capacity: roomData.capacity,
        price_per_night: roomData.pricePerNight,
        amenities: roomData.amenities,
        notes: roomData.notes,
      });
    } else {
      // Add new room
      createRoom.mutate({
        number: roomData.number!,
        floor: roomData.floor!,
        type: mapUiTypeToDbType(roomData.type!),
        capacity: roomData.capacity!,
        price_per_night: roomData.pricePerNight!,
        amenities: roomData.amenities || [],
        notes: roomData.notes,
      });
    }
  };

  const handleEditRoom = (room: Room) => {
    setEditingRoom(room);
    setFormDialogOpen(true);
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

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-destructive">
          <p>Erro ao carregar quartos</p>
          <p className="text-sm text-muted-foreground">{error.message}</p>
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
