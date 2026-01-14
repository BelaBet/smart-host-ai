import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Mail,
  Phone,
  FileText,
  Bed,
  Calendar,
  DollarSign,
  StickyNote,
  LogIn,
  LogOut,
  Pencil,
} from "lucide-react";
import { Guest, guestStatusConfig } from "@/types/guest";
import { cn } from "@/lib/utils";

interface GuestDetailsDialogProps {
  guest: Guest | null;
  onClose: () => void;
}

export function GuestDetailsDialog({ guest, onClose }: GuestDetailsDialogProps) {
  if (!guest) return null;

  const statusConfig = guestStatusConfig[guest.status];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const calculateNights = () => {
    const checkIn = new Date(guest.checkIn);
    const checkOut = new Date(guest.checkOut);
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <Dialog open={!!guest} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            Detalhes do Hóspede
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Guest Header */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center">
              <span className="text-xl font-semibold text-secondary">
                {guest.name
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground font-display">
                {guest.name}
              </h3>
              <Badge variant="outline" className={cn(statusConfig.color, "mt-1")}>
                {statusConfig.label}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Contact Info */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Informações de Contato
            </h4>
            <div className="grid gap-3">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span>{guest.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>{guest.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span>{guest.document}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Stay Info */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Informações da Estadia
            </h4>
            <div className="grid gap-3">
              {guest.room && (
                <div className="flex items-center gap-3 text-sm">
                  <Bed className="w-4 h-4 text-muted-foreground" />
                  <span>Quarto {guest.room}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-success" />
                <div>
                  <span className="text-muted-foreground">Check-in: </span>
                  <span>{formatDate(guest.checkIn)}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-warning" />
                <div>
                  <span className="text-muted-foreground">Check-out: </span>
                  <span>{formatDate(guest.checkOut)}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                <div>
                  <span className="text-muted-foreground">Valor Total: </span>
                  <span className="font-semibold">{formatCurrency(guest.totalValue)}</span>
                  <span className="text-muted-foreground ml-2">
                    ({calculateNights()} noites)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {guest.notes && (
            <>
              <Separator />
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Observações
                </h4>
                <div className="flex items-start gap-3 text-sm">
                  <StickyNote className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <p className="text-muted-foreground">{guest.notes}</p>
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Actions */}
          <div className="flex gap-2">
            {guest.status === "reserved" && (
              <Button variant="success" className="flex-1 gap-2">
                <LogIn className="w-4 h-4" />
                Fazer Check-in
              </Button>
            )}
            {(guest.status === "checked-in" || guest.status === "checking-out") && (
              <Button variant="secondary" className="flex-1 gap-2">
                <LogOut className="w-4 h-4" />
                Fazer Check-out
              </Button>
            )}
            <Button variant="outline" className="gap-2">
              <Pencil className="w-4 h-4" />
              Editar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
