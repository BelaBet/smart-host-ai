import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Room, roomStatusConfig, roomTypeConfig, RoomStatus } from "@/types/room";
import { 
  Bed, 
  Users, 
  DollarSign, 
  Calendar, 
  Sparkles, 
  Wrench, 
  CheckCircle,
  Clock,
  History,
  Settings,
  Wifi,
  Tv,
  Wind,
  Coffee
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface RoomDetailsDialogProps {
  room: Room | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange: (roomId: string, status: RoomStatus) => void;
  onAddMaintenance: (room: Room) => void;
}

const amenityIcons: Record<string, React.ReactNode> = {
  "Wi-Fi": <Wifi className="w-4 h-4" />,
  "TV": <Tv className="w-4 h-4" />,
  "Ar-condicionado": <Wind className="w-4 h-4" />,
  "Frigobar": <Coffee className="w-4 h-4" />,
};

export function RoomDetailsDialog({ 
  room, 
  open, 
  onOpenChange, 
  onStatusChange,
  onAddMaintenance 
}: RoomDetailsDialogProps) {
  if (!room) return null;

  const statusConfig = roomStatusConfig[room.status];
  const typeConfig = roomTypeConfig[room.type];

  const quickStatusActions: { status: RoomStatus; label: string; icon: React.ReactNode }[] = [
    { status: "available", label: "Disponível", icon: <CheckCircle className="w-4 h-4" /> },
    { status: "cleaning", label: "Limpeza", icon: <Sparkles className="w-4 h-4" /> },
    { status: "maintenance", label: "Manutenção", icon: <Wrench className="w-4 h-4" /> },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span className="text-2xl">{typeConfig.icon}</span>
            Quarto {room.number}
            <Badge className={`${statusConfig.bgColor} ${statusConfig.color}`}>
              {statusConfig.label}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="info" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="info">Informações</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
            <TabsTrigger value="maintenance">Manutenção</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-6 mt-4">
            {/* Room Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <Bed className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Tipo</p>
                  <p className="font-semibold">{typeConfig.label}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <Users className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Capacidade</p>
                  <p className="font-semibold">{room.capacity} pessoas</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <DollarSign className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Diária</p>
                  <p className="font-semibold">R$ {room.pricePerNight.toFixed(2)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <Calendar className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Andar</p>
                  <p className="font-semibold">{room.floor}º Andar</p>
                </div>
              </div>
            </div>

            {/* Current Guest */}
            {room.currentGuest && (
              <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Hóspede Atual
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p><span className="text-muted-foreground">Nome:</span> {room.currentGuest.name}</p>
                  <p><span className="text-muted-foreground">Check-in:</span> {room.currentGuest.checkIn}</p>
                  <p><span className="text-muted-foreground">Check-out:</span> {room.currentGuest.checkOut}</p>
                </div>
              </div>
            )}

            {/* Amenities */}
            <div>
              <h4 className="font-semibold text-foreground mb-3">Comodidades</h4>
              <div className="flex flex-wrap gap-2">
                {room.amenities.map((amenity) => (
                  <Badge key={amenity} variant="outline" className="flex items-center gap-1.5">
                    {amenityIcons[amenity] || <Settings className="w-4 h-4" />}
                    {amenity}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <h4 className="font-semibold text-foreground mb-3">Ações Rápidas</h4>
              <div className="flex flex-wrap gap-2">
                {quickStatusActions
                  .filter(action => action.status !== room.status)
                  .map((action) => (
                    <Button
                      key={action.status}
                      variant="outline"
                      size="sm"
                      onClick={() => onStatusChange(room.id, action.status)}
                      className="flex items-center gap-2"
                    >
                      {action.icon}
                      Marcar como {action.label}
                    </Button>
                  ))}
              </div>
            </div>

            {/* Last Cleaning */}
            {room.lastCleaning && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                Última limpeza: {format(new Date(room.lastCleaning), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                <History className="w-4 h-4" />
                Histórico de Ocupação
              </h4>
              
              {room.occupancyHistory.length === 0 ? (
                <p className="text-muted-foreground text-sm py-8 text-center">
                  Nenhum histórico de ocupação encontrado.
                </p>
              ) : (
                <div className="space-y-2">
                  {room.occupancyHistory.map((history) => (
                    <div
                      key={history.id}
                      className="p-3 bg-muted rounded-lg flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium">{history.guestName}</p>
                        <p className="text-sm text-muted-foreground">
                          {history.checkIn} - {history.checkOut} ({history.totalDays} dias)
                        </p>
                      </div>
                      <p className="font-semibold text-primary">
                        R$ {history.totalValue.toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="maintenance" className="mt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <Wrench className="w-4 h-4" />
                  Registro de Manutenção
                </h4>
                <Button size="sm" onClick={() => onAddMaintenance(room)}>
                  Adicionar Registro
                </Button>
              </div>
              
              {room.maintenanceLogs.length === 0 ? (
                <p className="text-muted-foreground text-sm py-8 text-center">
                  Nenhum registro de manutenção encontrado.
                </p>
              ) : (
                <div className="space-y-2">
                  {room.maintenanceLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 bg-muted rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <Badge variant={
                          log.type === "cleaning" ? "secondary" :
                          log.type === "maintenance" ? "destructive" : "outline"
                        }>
                          {log.type === "cleaning" ? "Limpeza" :
                           log.type === "maintenance" ? "Manutenção" : "Inspeção"}
                        </Badge>
                        <Badge variant={
                          log.status === "completed" ? "default" :
                          log.status === "in_progress" ? "secondary" : "outline"
                        }>
                          {log.status === "completed" ? "Concluído" :
                           log.status === "in_progress" ? "Em Andamento" : "Pendente"}
                        </Badge>
                      </div>
                      <p className="text-sm">{log.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {log.date} - {log.responsiblePerson}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
