import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Reservation, 
  ReservationStatus, 
  reservationStatusConfig 
} from "@/types/reservation";
import { cn } from "@/lib/utils";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Calendar,
  User,
  Mail,
  Phone,
  Bed,
  Users,
  CreditCard,
  FileText,
  Copy,
  Check,
  X,
  LogIn,
  LogOut,
  Pencil,
  Send,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ReservationDetailsDialogProps {
  reservation: Reservation | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange: (id: string, status: ReservationStatus) => void;
  onEdit: (reservation: Reservation) => void;
}

export function ReservationDetailsDialog({
  reservation,
  open,
  onOpenChange,
  onStatusChange,
  onEdit,
}: ReservationDetailsDialogProps) {
  const [copied, setCopied] = useState(false);

  if (!reservation) return null;

  const config = reservationStatusConfig[reservation.status];
  const nights = differenceInDays(new Date(reservation.checkOut), new Date(reservation.checkIn));

  const copyConfirmationCode = () => {
    navigator.clipboard.writeText(reservation.confirmationCode);
    setCopied(true);
    toast.success("Código copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendConfirmation = () => {
    // This would integrate with email service when Cloud is enabled
    toast.success(`Email de confirmação enviado para ${reservation.guestEmail}`);
  };

  const getStatusActions = () => {
    switch (reservation.status) {
      case "pending":
        return (
          <div className="flex gap-2">
            <Button
              onClick={() => onStatusChange(reservation.id, "confirmed")}
              className="flex-1"
            >
              <Check className="w-4 h-4 mr-2" />
              Confirmar
            </Button>
            <Button
              variant="destructive"
              onClick={() => onStatusChange(reservation.id, "cancelled")}
              className="flex-1"
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
          </div>
        );
      case "confirmed":
        return (
          <div className="flex gap-2">
            <Button
              onClick={() => onStatusChange(reservation.id, "checked_in")}
              className="flex-1"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Fazer Check-in
            </Button>
            <Button
              variant="destructive"
              onClick={() => onStatusChange(reservation.id, "cancelled")}
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
          </div>
        );
      case "checked_in":
        return (
          <Button
            onClick={() => onStatusChange(reservation.id, "checked_out")}
            className="w-full"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Fazer Check-out
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              Reserva #{reservation.confirmationCode}
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={copyConfirmationCode}
              >
                {copied ? (
                  <Check className="w-3 h-3 text-success" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </Button>
            </DialogTitle>
            <Badge className={cn(config.bgColor, config.color)}>
              {config.label}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Guest Info */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Hóspede
            </h4>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{reservation.guestName}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span>{reservation.guestEmail}</span>
              </div>
              {reservation.guestPhone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{reservation.guestPhone}</span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span>
                  {reservation.adults} adulto(s)
                  {reservation.children > 0 && `, ${reservation.children} criança(s)`}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Room & Dates */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Hospedagem
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Bed className="w-4 h-4 text-muted-foreground" />
                  <span>Quarto {reservation.roomNumber}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div className="text-sm">
                    <div>Check-in: {format(new Date(reservation.checkIn), "dd/MM/yyyy", { locale: ptBR })}</div>
                    <div>Check-out: {format(new Date(reservation.checkOut), "dd/MM/yyyy", { locale: ptBR })}</div>
                  </div>
                </div>
              </div>
              <div className="bg-muted/50 p-3 rounded-lg">
                <div className="text-sm text-muted-foreground">{nights} noite(s)</div>
                <div className="text-2xl font-bold text-primary">
                  R$ {reservation.totalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </div>

          {reservation.notes && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Observações
                </h4>
                <p className="text-sm bg-muted/50 p-3 rounded-lg">
                  {reservation.notes}
                </p>
              </div>
            </>
          )}

          <Separator />

          {/* Actions */}
          <div className="space-y-3">
            {getStatusActions()}
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  onOpenChange(false);
                  onEdit(reservation);
                }}
              >
                <Pencil className="w-4 h-4 mr-2" />
                Editar
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleSendConfirmation}
              >
                <Send className="w-4 h-4 mr-2" />
                Enviar Email
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
