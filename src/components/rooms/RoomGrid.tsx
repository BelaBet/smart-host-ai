import { cn } from "@/lib/utils";
import { Room, roomStatusConfig, roomTypeConfig } from "@/types/room";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface RoomGridProps {
  rooms: Room[];
  onRoomClick: (room: Room) => void;
  selectedFloor: number | null;
}

export function RoomGrid({ rooms, onRoomClick, selectedFloor }: RoomGridProps) {
  const floors = [...new Set(rooms.map(r => r.floor))].sort((a, b) => b - a);
  const filteredRooms = selectedFloor !== null 
    ? rooms.filter(r => r.floor === selectedFloor) 
    : rooms;

  const roomsByFloor = floors.reduce((acc, floor) => {
    acc[floor] = filteredRooms.filter(r => r.floor === floor);
    return acc;
  }, {} as Record<number, Room[]>);

  return (
    <div className="bg-card rounded-xl p-6 shadow-md border border-border/50">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground font-display">Mapa de Quartos</h3>
        
        {/* Legend */}
        <div className="flex flex-wrap gap-3">
          {Object.entries(roomStatusConfig).map(([key, config]) => (
            <div key={key} className="flex items-center gap-1.5">
              <div className={cn("w-3 h-3 rounded-full", config.bgColor)} />
              <span className="text-xs text-muted-foreground">{config.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {floors.map(floor => (
          roomsByFloor[floor]?.length > 0 && (
            <div key={floor}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-medium text-muted-foreground">
                  {floor}º Andar
                </span>
                <div className="flex-1 h-px bg-border" />
              </div>
              
              <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
                {roomsByFloor[floor].map((room) => {
                  const statusConfig = roomStatusConfig[room.status];
                  const typeConfig = roomTypeConfig[room.type];
                  
                  return (
                    <Tooltip key={room.id}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => onRoomClick(room)}
                          className={cn(
                            "aspect-square rounded-lg flex flex-col items-center justify-center text-sm font-semibold cursor-pointer transition-all hover:scale-105 hover:shadow-lg relative group",
                            statusConfig.bgColor,
                            statusConfig.color
                          )}
                        >
                          <span className="text-xs opacity-60">{typeConfig.icon}</span>
                          <span>{room.number}</span>
                          {room.currentGuest && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-card animate-pulse" />
                          )}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs">
                        <div className="space-y-1">
                          <p className="font-semibold">Quarto {room.number} - {typeConfig.label}</p>
                          <p className="text-xs">Status: {statusConfig.label}</p>
                          {room.currentGuest && (
                            <p className="text-xs">Hóspede: {room.currentGuest.name}</p>
                          )}
                          <p className="text-xs">Capacidade: {room.capacity} pessoas</p>
                          <p className="text-xs">R$ {room.pricePerNight.toFixed(2)}/noite</p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </div>
          )
        ))}
      </div>
    </div>
  );
}
