export type GuestStatus = 
  | "reserved" 
  | "checked-in" 
  | "checking-out" 
  | "checked-out" 
  | "pending" 
  | "cancelled";

export interface Guest {
  id: string;
  name: string;
  email: string;
  phone: string;
  document: string;
  room: string;
  checkIn: string;
  checkOut: string;
  status: GuestStatus;
  notes: string;
  totalValue: number;
  createdAt: string;
}

export const guestStatusConfig: Record<GuestStatus, { label: string; color: string }> = {
  reserved: { label: "Reservado", color: "bg-primary/10 text-primary border-primary/20" },
  "checked-in": { label: "Hospedado", color: "bg-success/10 text-success border-success/20" },
  "checking-out": { label: "Check-out Hoje", color: "bg-warning/10 text-warning border-warning/20" },
  "checked-out": { label: "Finalizado", color: "bg-muted text-muted-foreground border-muted" },
  pending: { label: "Pendente", color: "bg-secondary/10 text-secondary border-secondary/20" },
  cancelled: { label: "Cancelado", color: "bg-destructive/10 text-destructive border-destructive/20" },
};
