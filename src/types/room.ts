export type RoomStatus = "available" | "occupied" | "cleaning" | "maintenance" | "reserved";

export type RoomType = "standard" | "deluxe" | "suite" | "master";

export interface OccupancyHistory {
  id: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  totalDays: number;
  totalValue: number;
}

export interface MaintenanceLog {
  id: string;
  date: string;
  type: "cleaning" | "maintenance" | "inspection";
  description: string;
  responsiblePerson: string;
  status: "pending" | "in_progress" | "completed";
}

export interface Room {
  id: string;
  number: string;
  floor: number;
  type: RoomType;
  status: RoomStatus;
  capacity: number;
  pricePerNight: number;
  amenities: string[];
  currentGuest?: {
    id: string;
    name: string;
    checkIn: string;
    checkOut: string;
  };
  lastCleaning?: string;
  notes?: string;
  occupancyHistory: OccupancyHistory[];
  maintenanceLogs: MaintenanceLog[];
}

export const roomStatusConfig: Record<RoomStatus, { label: string; color: string; bgColor: string }> = {
  available: { label: "Disponível", color: "text-success-foreground", bgColor: "bg-success" },
  occupied: { label: "Ocupado", color: "text-primary-foreground", bgColor: "bg-primary" },
  cleaning: { label: "Limpeza", color: "text-warning-foreground", bgColor: "bg-warning" },
  maintenance: { label: "Manutenção", color: "text-destructive-foreground", bgColor: "bg-destructive" },
  reserved: { label: "Reservado", color: "text-secondary-foreground", bgColor: "bg-secondary" },
};

export const roomTypeConfig: Record<RoomType, { label: string; icon: string }> = {
  standard: { label: "Standard", icon: "🛏️" },
  deluxe: { label: "Deluxe", icon: "🌟" },
  suite: { label: "Suíte", icon: "👑" },
  master: { label: "Master", icon: "💎" },
};
