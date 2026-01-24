export type ReservationStatus = "pending" | "confirmed" | "checked_in" | "checked_out" | "cancelled";

export interface Reservation {
  id: string;
  roomId: string;
  roomNumber: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: Date;
  checkOut: Date;
  adults: number;
  children: number;
  totalValue: number;
  status: ReservationStatus;
  notes?: string;
  createdAt: Date;
  confirmationCode: string;
}

export const reservationStatusConfig: Record<ReservationStatus, { label: string; color: string; bgColor: string }> = {
  pending: { label: "Pendente", color: "text-warning-foreground", bgColor: "bg-warning" },
  confirmed: { label: "Confirmada", color: "text-primary-foreground", bgColor: "bg-primary" },
  checked_in: { label: "Check-in", color: "text-success-foreground", bgColor: "bg-success" },
  checked_out: { label: "Check-out", color: "text-muted-foreground", bgColor: "bg-muted" },
  cancelled: { label: "Cancelada", color: "text-destructive-foreground", bgColor: "bg-destructive" },
};

export interface CalendarDay {
  date: Date;
  reservations: Reservation[];
  isCurrentMonth: boolean;
  isToday: boolean;
}
