import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  LogIn,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Bed,
} from "lucide-react";
import { Guest, guestStatusConfig } from "@/types/guest";
import { cn } from "@/lib/utils";

interface GuestTableProps {
  guests: Guest[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onEdit: (guest: Guest) => void;
  onDelete: (id: string) => void;
  onView: (guest: Guest) => void;
  onCheckIn: (id: string) => void;
  onCheckOut: (id: string) => void;
}

export function GuestTable({
  guests,
  currentPage,
  totalPages,
  onPageChange,
  onEdit,
  onDelete,
  onView,
  onCheckIn,
  onCheckOut,
}: GuestTableProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  return (
    <div className="bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="font-semibold">Hóspede</TableHead>
              <TableHead className="font-semibold">Documento</TableHead>
              <TableHead className="font-semibold">Quarto</TableHead>
              <TableHead className="font-semibold">Check-in</TableHead>
              <TableHead className="font-semibold">Check-out</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold text-right">Valor</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {guests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12">
                  <div className="text-muted-foreground">
                    <p className="text-lg font-medium">Nenhum hóspede encontrado</p>
                    <p className="text-sm">Tente ajustar os filtros ou adicione um novo hóspede.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              guests.map((guest) => {
                const statusConfig = guestStatusConfig[guest.status];
                return (
                  <TableRow
                    key={guest.id}
                    className="hover:bg-muted/20 transition-colors"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-semibold text-secondary">
                            {guest.name
                              .split(" ")
                              .map((n) => n[0])
                              .slice(0, 2)
                              .join("")}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{guest.name}</p>
                          <p className="text-sm text-muted-foreground">{guest.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {guest.document}
                    </TableCell>
                    <TableCell>
                      {guest.room ? (
                        <div className="flex items-center gap-2">
                          <Bed className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{guest.room}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(guest.checkIn)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(guest.checkOut)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn(statusConfig.color)}>
                        {statusConfig.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(guest.totalValue)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => onView(guest)}>
                            <Eye className="w-4 h-4 mr-2" />
                            Ver Detalhes
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEdit(guest)}>
                            <Pencil className="w-4 h-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {guest.status === "reserved" && (
                            <DropdownMenuItem
                              onClick={() => onCheckIn(guest.id)}
                              className="text-success"
                            >
                              <LogIn className="w-4 h-4 mr-2" />
                              Fazer Check-in
                            </DropdownMenuItem>
                          )}
                          {(guest.status === "checked-in" ||
                            guest.status === "checking-out") && (
                            <DropdownMenuItem
                              onClick={() => onCheckOut(guest.id)}
                              className="text-warning"
                            >
                              <LogOut className="w-4 h-4 mr-2" />
                              Fazer Check-out
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onDelete(guest.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Página {currentPage} de {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Próxima
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
