import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Reservation, ReservationStatus } from "@/types/reservation";
import { Room } from "@/types/room";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ReservationFormDialogProps {
  reservation?: Reservation | null;
  rooms: Room[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (reservation: Partial<Reservation>) => void;
  selectedDate?: Date | null;
}

export function ReservationFormDialog({
  reservation,
  rooms,
  open,
  onOpenChange,
  onSubmit,
  selectedDate,
}: ReservationFormDialogProps) {
  const [formData, setFormData] = useState({
    roomId: "",
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    checkIn: selectedDate || new Date(),
    checkOut: new Date(Date.now() + 86400000),
    adults: 1,
    children: 0,
    notes: "",
    status: "pending" as ReservationStatus,
  });

  const availableRooms = rooms.filter(r => r.status === "available" || r.id === reservation?.roomId);

  useEffect(() => {
    if (reservation) {
      setFormData({
        roomId: reservation.roomId,
        guestName: reservation.guestName,
        guestEmail: reservation.guestEmail,
        guestPhone: reservation.guestPhone,
        checkIn: new Date(reservation.checkIn),
        checkOut: new Date(reservation.checkOut),
        adults: reservation.adults,
        children: reservation.children,
        notes: reservation.notes || "",
        status: reservation.status,
      });
    } else {
      setFormData({
        roomId: "",
        guestName: "",
        guestEmail: "",
        guestPhone: "",
        checkIn: selectedDate || new Date(),
        checkOut: new Date((selectedDate || new Date()).getTime() + 86400000),
        adults: 1,
        children: 0,
        notes: "",
        status: "pending",
      });
    }
  }, [reservation, open, selectedDate]);

  const selectedRoom = rooms.find(r => r.id === formData.roomId);
  const nights = differenceInDays(formData.checkOut, formData.checkIn);
  const totalValue = selectedRoom ? selectedRoom.pricePerNight * Math.max(nights, 1) : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.roomId) {
      toast.error("Selecione um quarto");
      return;
    }
    
    if (!formData.guestName.trim()) {
      toast.error("Informe o nome do hóspede");
      return;
    }

    if (!formData.guestEmail.trim()) {
      toast.error("Informe o email do hóspede");
      return;
    }

    if (nights < 1) {
      toast.error("O check-out deve ser após o check-in");
      return;
    }

    const room = rooms.find(r => r.id === formData.roomId);
    
    onSubmit({
      ...reservation,
      ...formData,
      roomNumber: room?.number || "",
      totalValue,
    });
    
    onOpenChange(false);
    toast.success(reservation ? "Reserva atualizada com sucesso!" : "Reserva criada com sucesso!");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {reservation ? "Editar Reserva" : "Nova Reserva"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Room Selection */}
          <div className="space-y-2">
            <Label>Quarto *</Label>
            <Select
              value={formData.roomId}
              onValueChange={(value) => setFormData({ ...formData, roomId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um quarto" />
              </SelectTrigger>
              <SelectContent>
                {availableRooms.map((room) => (
                  <SelectItem key={room.id} value={room.id}>
                    {room.number} - {room.type} (até {room.capacity} pessoas) - R$ {room.pricePerNight}/noite
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Guest Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome do Hóspede *</Label>
              <Input
                value={formData.guestName}
                onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                placeholder="Nome completo"
              />
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input
                type="email"
                value={formData.guestEmail}
                onChange={(e) => setFormData({ ...formData, guestEmail: e.target.value })}
                placeholder="email@exemplo.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input
                value={formData.guestPhone}
                onChange={(e) => setFormData({ ...formData, guestPhone: e.target.value })}
                placeholder="(00) 00000-0000"
              />
            </div>
            {reservation && (
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as ReservationStatus })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="confirmed">Confirmada</SelectItem>
                    <SelectItem value="checked_in">Check-in</SelectItem>
                    <SelectItem value="checked_out">Check-out</SelectItem>
                    <SelectItem value="cancelled">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Check-in *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.checkIn && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.checkIn ? (
                      format(formData.checkIn, "PPP", { locale: ptBR })
                    ) : (
                      <span>Selecione a data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.checkIn}
                    onSelect={(date) => date && setFormData({ ...formData, checkIn: date })}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Check-out *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.checkOut && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.checkOut ? (
                      format(formData.checkOut, "PPP", { locale: ptBR })
                    ) : (
                      <span>Selecione a data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.checkOut}
                    onSelect={(date) => date && setFormData({ ...formData, checkOut: date })}
                    disabled={(date) => date <= formData.checkIn}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Guests Count */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Adultos</Label>
              <Input
                type="number"
                min={1}
                max={selectedRoom?.capacity || 10}
                value={formData.adults}
                onChange={(e) => setFormData({ ...formData, adults: parseInt(e.target.value) || 1 })}
              />
            </div>
            <div className="space-y-2">
              <Label>Crianças</Label>
              <Input
                type="number"
                min={0}
                value={formData.children}
                onChange={(e) => setFormData({ ...formData, children: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Observações especiais, preferências do hóspede..."
              rows={3}
            />
          </div>

          {/* Summary */}
          {selectedRoom && nights > 0 && (
            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <h4 className="font-semibold">Resumo da Reserva</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-muted-foreground">Quarto:</span>
                <span>{selectedRoom.number} ({selectedRoom.type})</span>
                <span className="text-muted-foreground">Noites:</span>
                <span>{nights}</span>
                <span className="text-muted-foreground">Diária:</span>
                <span>R$ {selectedRoom.pricePerNight.toFixed(2)}</span>
                <span className="text-muted-foreground font-semibold">Total:</span>
                <span className="font-bold text-primary">R$ {totalValue.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {reservation ? "Salvar Alterações" : "Criar Reserva"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
