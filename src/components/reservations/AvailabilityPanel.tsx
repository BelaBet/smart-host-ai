import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Room, roomStatusConfig, roomTypeConfig } from "@/types/room";
import { Reservation } from "@/types/reservation";
import { cn } from "@/lib/utils";
import { format, isWithinInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Users, DollarSign, Plus } from "lucide-react";

interface AvailabilityPanelProps {
  rooms: Room[];
  reservations: Reservation[];
  selectedDate: Date | null;
  onCreateReservation: (roomId: string) => void;
}

export function AvailabilityPanel({
  rooms,
  reservations,
  selectedDate,
  onCreateReservation,
}: AvailabilityPanelProps) {
  const checkDate = selectedDate || new Date();

  const getRoomAvailability = (room: Room) => {
    const overlappingReservation = reservations.find(res => {
      if (res.roomId !== room.id || res.status === "cancelled" || res.status === "checked_out") {
        return false;
      }
      const checkIn = new Date(res.checkIn);
      const checkOut = new Date(res.checkOut);
      checkIn.setHours(0, 0, 0, 0);
      checkOut.setHours(0, 0, 0, 0);
      const compareDate = new Date(checkDate);
      compareDate.setHours(0, 0, 0, 0);
      
      return isWithinInterval(compareDate, { start: checkIn, end: checkOut });
    });

    return {
      isAvailable: !overlappingReservation && room.status === "available",
      reservation: overlappingReservation,
    };
  };

  const availableRooms = rooms.filter(room => getRoomAvailability(room).isAvailable);
  const occupiedRooms = rooms.filter(room => !getRoomAvailability(room).isAvailable);

  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-success/10 to-success/5">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="w-5 h-5" />
          Disponibilidade - {format(checkDate, "dd 'de' MMMM", { locale: ptBR })}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-success/10 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-success">{availableRooms.length}</div>
            <div className="text-sm text-muted-foreground">Disponíveis</div>
          </div>
          <div className="bg-destructive/10 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-destructive">{occupiedRooms.length}</div>
            <div className="text-sm text-muted-foreground">Ocupados</div>
          </div>
        </div>

        {/* Available Rooms */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            Quartos Disponíveis
          </h4>
          {availableRooms.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum quarto disponível para esta data
            </p>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {availableRooms.map((room) => {
                const typeConfig = roomTypeConfig[room.type];
                return (
                  <div
                    key={room.id}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{typeConfig.icon}</span>
                      <div>
                        <div className="font-semibold">Quarto {room.number}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <Users className="w-3 h-3" />
                          {room.capacity} pessoas
                          <span className="mx-1">•</span>
                          <DollarSign className="w-3 h-3" />
                          R$ {room.pricePerNight}
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => onCreateReservation(room.id)}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Reservar
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Occupied Rooms */}
        {occupiedRooms.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Quartos Ocupados
            </h4>
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {occupiedRooms.slice(0, 5).map((room) => {
                const { reservation } = getRoomAvailability(room);
                const statusConfig = roomStatusConfig[room.status];
                
                return (
                  <div
                    key={room.id}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg opacity-70"
                  >
                    <div>
                      <div className="font-semibold flex items-center gap-2">
                        Quarto {room.number}
                        <Badge className={cn(statusConfig.bgColor, statusConfig.color, "text-xs")}>
                          {statusConfig.label}
                        </Badge>
                      </div>
                      {reservation && (
                        <div className="text-sm text-muted-foreground">
                          {reservation.guestName} • até {format(new Date(reservation.checkOut), "dd/MM")}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {occupiedRooms.length > 5 && (
                <p className="text-sm text-muted-foreground text-center">
                  +{occupiedRooms.length - 5} quartos ocupados
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
