import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut } from "lucide-react";

interface Guest {
  id: string;
  name: string;
  room: string;
  checkIn: string;
  checkOut: string;
  status: "checked-in" | "checking-out" | "reserved";
}

interface RecentGuestsProps {
  guests: Guest[];
}

const statusStyles = {
  "checked-in": "bg-success/10 text-success border-success/20",
  "checking-out": "bg-warning/10 text-warning border-warning/20",
  reserved: "bg-primary/10 text-primary border-primary/20",
};

const statusLabels = {
  "checked-in": "Hospedado",
  "checking-out": "Check-out hoje",
  reserved: "Reservado",
};

export function RecentGuests({ guests }: RecentGuestsProps) {
  return (
    <div className="bg-card rounded-xl p-6 shadow-md border border-border/50">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground font-display">Hóspedes Recentes</h3>
        <Button variant="ghost" size="sm" className="text-secondary">
          Ver todos
        </Button>
      </div>

      <div className="space-y-4">
        {guests.map((guest) => (
          <div
            key={guest.id}
            className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
                <span className="text-sm font-semibold text-secondary">
                  {guest.name.split(" ").map((n) => n[0]).join("")}
                </span>
              </div>
              <div>
                <p className="font-medium text-foreground">{guest.name}</p>
                <p className="text-sm text-muted-foreground">
                  Quarto {guest.room} • {guest.checkIn} - {guest.checkOut}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className={statusStyles[guest.status]}>
                {statusLabels[guest.status]}
              </Badge>
              {guest.status === "reserved" && (
                <Button size="sm" variant="success" className="gap-1">
                  <LogIn className="w-3 h-3" />
                  Check-in
                </Button>
              )}
              {guest.status === "checking-out" && (
                <Button size="sm" variant="outline" className="gap-1">
                  <LogOut className="w-3 h-3" />
                  Check-out
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
