import { cn } from "@/lib/utils";

interface RoomStatusProps {
  rooms: {
    id: string;
    number: string;
    status: "occupied" | "available" | "cleaning" | "maintenance";
    guest?: string;
  }[];
}

const statusColors = {
  occupied: "bg-primary text-primary-foreground",
  available: "bg-success text-success-foreground",
  cleaning: "bg-warning text-warning-foreground",
  maintenance: "bg-destructive text-destructive-foreground",
};

const statusLabels = {
  occupied: "Ocupado",
  available: "Disponível",
  cleaning: "Limpeza",
  maintenance: "Manutenção",
};

export function RoomStatusGrid({ rooms }: RoomStatusProps) {
  return (
    <div className="bg-card rounded-xl p-6 shadow-md border border-border/50">
      <h3 className="text-lg font-semibold text-foreground mb-4 font-display">Status dos Quartos</h3>
      
      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-6">
        {Object.entries(statusLabels).map(([key, label]) => (
          <div key={key} className="flex items-center gap-2">
            <div className={cn("w-3 h-3 rounded-full", statusColors[key as keyof typeof statusColors])} />
            <span className="text-sm text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-2">
        {rooms.map((room) => (
          <div
            key={room.id}
            className={cn(
              "aspect-square rounded-lg flex items-center justify-center text-sm font-semibold cursor-pointer transition-all hover:scale-105 hover:shadow-md",
              statusColors[room.status]
            )}
            title={room.guest ? `Hóspede: ${room.guest}` : statusLabels[room.status]}
          >
            {room.number}
          </div>
        ))}
      </div>
    </div>
  );
}
