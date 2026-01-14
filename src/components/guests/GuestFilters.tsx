import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, X } from "lucide-react";
import { GuestStatus, guestStatusConfig } from "@/types/guest";
import { cn } from "@/lib/utils";

interface GuestFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: GuestStatus | "all";
  onStatusChange: (value: GuestStatus | "all") => void;
}

const statusOptions: { value: GuestStatus | "all"; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "checked-in", label: "Hospedados" },
  { value: "reserved", label: "Reservados" },
  { value: "checking-out", label: "Check-out Hoje" },
  { value: "pending", label: "Pendentes" },
  { value: "checked-out", label: "Finalizados" },
  { value: "cancelled", label: "Cancelados" },
];

export function GuestFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
}: GuestFiltersProps) {
  return (
    <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, email, documento ou quarto..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-background"
          />
          {search && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-muted-foreground" />
          {statusOptions.map((option) => (
            <Button
              key={option.value}
              variant={statusFilter === option.value ? "secondary" : "ghost"}
              size="sm"
              onClick={() => onStatusChange(option.value)}
              className={cn(
                "text-xs",
                statusFilter === option.value && "shadow-gold"
              )}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
