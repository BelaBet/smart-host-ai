import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Reservation, reservationStatusConfig } from "@/types/reservation";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Eye, Pencil } from "lucide-react";

interface ReservationTableProps {
  reservations: Reservation[];
  onView: (reservation: Reservation) => void;
  onEdit: (reservation: Reservation) => void;
}

export function ReservationTable({ reservations, onView, onEdit }: ReservationTableProps) {
  return (
    <div className="bg-card rounded-xl shadow-md border border-border/50 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Código</TableHead>
            <TableHead>Hóspede</TableHead>
            <TableHead>Quarto</TableHead>
            <TableHead>Check-in</TableHead>
            <TableHead>Check-out</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reservations.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                Nenhuma reserva encontrada
              </TableCell>
            </TableRow>
          ) : (
            reservations.map((reservation) => {
              const config = reservationStatusConfig[reservation.status];
              return (
                <TableRow key={reservation.id}>
                  <TableCell className="font-mono text-sm">
                    {reservation.confirmationCode}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{reservation.guestName}</div>
                      <div className="text-sm text-muted-foreground">{reservation.guestEmail}</div>
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold">{reservation.roomNumber}</TableCell>
                  <TableCell>
                    {format(new Date(reservation.checkIn), "dd/MM/yyyy", { locale: ptBR })}
                  </TableCell>
                  <TableCell>
                    {format(new Date(reservation.checkOut), "dd/MM/yyyy", { locale: ptBR })}
                  </TableCell>
                  <TableCell>
                    R$ {reservation.totalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>
                    <Badge className={cn(config.bgColor, config.color)}>
                      {config.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onView(reservation)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(reservation)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
