import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ReservationStatus } from "@/types/reservation";
import { Search, X } from "lucide-react";

interface ReservationFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: ReservationStatus | "all";
  onStatusFilterChange: (value: ReservationStatus | "all") => void;
}

export function ReservationFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}: ReservationFiltersProps) {
  const hasFilters = search || statusFilter !== "all";

  const clearFilters = () => {
    onSearchChange("");
    onStatusFilterChange("all");
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, email ou código..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
      
      <Select value={statusFilter} onValueChange={(v) => onStatusFilterChange(v as ReservationStatus | "all")}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os status</SelectItem>
          <SelectItem value="pending">Pendentes</SelectItem>
          <SelectItem value="confirmed">Confirmadas</SelectItem>
          <SelectItem value="checked_in">Check-in</SelectItem>
          <SelectItem value="checked_out">Check-out</SelectItem>
          <SelectItem value="cancelled">Canceladas</SelectItem>
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button variant="ghost" size="icon" onClick={clearFilters}>
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
