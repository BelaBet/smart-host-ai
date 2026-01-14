export type MenuCategory = 'entrada' | 'prato_principal' | 'sobremesa' | 'bebida' | 'petisco';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: MenuCategory;
  image?: string;
  available: boolean;
  preparationTime: number; // in minutes
  ingredients: string[];
}

export interface InventoryItem {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  minQuantity: number;
  costPerUnit: number;
  lastRestocked: Date;
  supplier?: string;
}

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';

export interface OrderItem {
  id: string;
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
  status: OrderStatus;
}

export interface Order {
  id: string;
  roomNumber?: string;
  tableNumber?: string;
  guestName?: string;
  items: OrderItem[];
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
  total: number;
  paymentMethod?: 'cash' | 'card' | 'room_charge' | 'pix';
  paid: boolean;
}

export const menuCategoryLabels: Record<MenuCategory, string> = {
  entrada: 'Entradas',
  prato_principal: 'Pratos Principais',
  sobremesa: 'Sobremesas',
  bebida: 'Bebidas',
  petisco: 'Petiscos',
};

export const orderStatusLabels: Record<OrderStatus, string> = {
  pending: 'Pendente',
  preparing: 'Preparando',
  ready: 'Pronto',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
};

export const orderStatusColors: Record<OrderStatus, string> = {
  pending: 'warning',
  preparing: 'default',
  ready: 'success',
  delivered: 'secondary',
  cancelled: 'destructive',
};
