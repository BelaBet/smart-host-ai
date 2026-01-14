import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, X } from "lucide-react";
import { RoomStatus, RoomType, roomStatusConfig, roomTypeConfig } from "@/types/room";

interface RoomFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: RoomStatus | "all";
  onStatusFilterChange: (value: RoomStatus | "all") => void;
  typeFilter: RoomType | "all";
  onTypeFilterChange: (value: RoomType | "all") => void;
  floorFilter: number | null;
  onFloorFilterChange: (value: number | null) => void;
  floors: number[];
}

export function RoomFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  typeFilter,
  onTypeFilterChange,
  floorFilter,
  onFloorFilterChange,
  floors,
}: RoomFiltersProps) {
  const hasFilters = search || statusFilter !== "all" || typeFilter !== "all" || floorFilter !== null;

  const clearFilters = () => {
    onSearchChange("");
    onStatusFilterChange("all");
    onTypeFilterChange("all");
    onFloorFilterChange(null);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por número do quarto..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <Select value={statusFilter} onValueChange={(v) => onStatusFilterChange(v as RoomStatus | "all")}>
        <SelectTrigger className="w-full sm:w-40">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos Status</SelectItem>
          {Object.entries(roomStatusConfig).map(([key, config]) => (
            <SelectItem key={key} value={key}>
              {config.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={typeFilter} onValueChange={(v) => onTypeFilterChange(v as RoomType | "all")}>
        <SelectTrigger className="w-full sm:w-40">
          <SelectValue placeholder="Tipo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos Tipos</SelectItem>
          {Object.entries(roomTypeConfig).map(([key, config]) => (
            <SelectItem key={key} value={key}>
              {config.icon} {config.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select 
        value={floorFilter?.toString() || "all"} 
        onValueChange={(v) => onFloorFilterChange(v === "all" ? null : parseInt(v))}
      >
        <SelectTrigger className="w-full sm:w-32">
          <SelectValue placeholder="Andar" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos Andares</SelectItem>
          {floors.map((floor) => (
            <SelectItem key={floor} value={floor.toString()}>
              {floor}º Andar
            </SelectItem>
          ))}
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
