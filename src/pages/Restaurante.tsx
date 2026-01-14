import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { RestaurantStats } from "@/components/restaurant/RestaurantStats";
import { MenuCard } from "@/components/restaurant/MenuCard";
import { MenuFormDialog } from "@/components/restaurant/MenuFormDialog";
import { OrderCard } from "@/components/restaurant/OrderCard";
import { NewOrderDialog } from "@/components/restaurant/NewOrderDialog";
import { InventoryTable } from "@/components/restaurant/InventoryTable";
import { InventoryFormDialog } from "@/components/restaurant/InventoryFormDialog";
import { RestockDialog } from "@/components/restaurant/RestockDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Plus, 
  Search, 
  UtensilsCrossed, 
  ShoppingCart, 
  Package,
  Filter
} from "lucide-react";
import { 
  MenuItem, 
  Order, 
  InventoryItem, 
  MenuCategory,
  menuCategoryLabels 
} from "@/types/restaurant";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

// Mock data
const mockMenuItems: MenuItem[] = [
  {
    id: "1",
    name: "Bruschetta Caprese",
    description: "Torradas artesanais com tomate, mozzarella fresca e manjericão",
    price: 28.90,
    category: "entrada",
    available: true,
    preparationTime: 10,
    ingredients: ["Pão italiano", "Tomate", "Mozzarella", "Manjericão", "Azeite"],
  },
  {
    id: "2",
    name: "Filé ao Molho Madeira",
    description: "Filé mignon grelhado com molho madeira, acompanha arroz e batatas",
    price: 89.90,
    category: "prato_principal",
    available: true,
    preparationTime: 25,
    ingredients: ["Filé mignon", "Cogumelos", "Vinho madeira", "Arroz", "Batatas"],
  },
  {
    id: "3",
    name: "Salmão Grelhado",
    description: "Salmão fresco grelhado com legumes salteados e purê de batata",
    price: 79.90,
    category: "prato_principal",
    available: true,
    preparationTime: 20,
    ingredients: ["Salmão", "Legumes", "Batata", "Ervas"],
  },
  {
    id: "4",
    name: "Petit Gâteau",
    description: "Bolo de chocolate com recheio cremoso e sorvete de baunilha",
    price: 32.00,
    category: "sobremesa",
    available: true,
    preparationTime: 15,
    ingredients: ["Chocolate", "Farinha", "Ovos", "Sorvete"],
  },
  {
    id: "5",
    name: "Caipirinha",
    description: "Drink clássico brasileiro com cachaça, limão e açúcar",
    price: 22.00,
    category: "bebida",
    available: true,
    preparationTime: 5,
    ingredients: ["Cachaça", "Limão", "Açúcar", "Gelo"],
  },
  {
    id: "6",
    name: "Porção de Batata Frita",
    description: "Batatas fritas crocantes com molho especial da casa",
    price: 35.00,
    category: "petisco",
    available: true,
    preparationTime: 12,
    ingredients: ["Batata", "Sal", "Molho especial"],
  },
];

const mockOrders: Order[] = [
  {
    id: "ord-001",
    roomNumber: "101",
    guestName: "João Silva",
    items: [
      {
        id: "oi-1",
        menuItem: mockMenuItems[1],
        quantity: 2,
        status: "preparing",
      },
      {
        id: "oi-2",
        menuItem: mockMenuItems[4],
        quantity: 2,
        status: "pending",
      },
    ],
    status: "preparing",
    createdAt: new Date(Date.now() - 15 * 60 * 1000),
    updatedAt: new Date(),
    total: 223.80,
    paid: false,
  },
  {
    id: "ord-002",
    tableNumber: "5",
    guestName: "Maria Santos",
    items: [
      {
        id: "oi-3",
        menuItem: mockMenuItems[0],
        quantity: 1,
        status: "ready",
      },
      {
        id: "oi-4",
        menuItem: mockMenuItems[2],
        quantity: 1,
        status: "preparing",
      },
    ],
    status: "preparing",
    createdAt: new Date(Date.now() - 10 * 60 * 1000),
    updatedAt: new Date(),
    total: 108.80,
    paid: false,
  },
  {
    id: "ord-003",
    roomNumber: "203",
    items: [
      {
        id: "oi-5",
        menuItem: mockMenuItems[3],
        quantity: 2,
        notes: "Sem sorvete",
        status: "pending",
      },
    ],
    status: "pending",
    createdAt: new Date(Date.now() - 5 * 60 * 1000),
    updatedAt: new Date(),
    total: 64.00,
    paid: false,
  },
];

const mockInventory: InventoryItem[] = [
  {
    id: "inv-1",
    name: "Filé Mignon",
    unit: "kg",
    quantity: 8,
    minQuantity: 5,
    costPerUnit: 89.90,
    lastRestocked: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    supplier: "Frigorífico Premium",
  },
  {
    id: "inv-2",
    name: "Salmão Fresco",
    unit: "kg",
    quantity: 3,
    minQuantity: 5,
    costPerUnit: 120.00,
    lastRestocked: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    supplier: "Pescados do Mar",
  },
  {
    id: "inv-3",
    name: "Chocolate Belga",
    unit: "kg",
    quantity: 2,
    minQuantity: 3,
    costPerUnit: 65.00,
    lastRestocked: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    supplier: "Chocolatier & Cia",
  },
  {
    id: "inv-4",
    name: "Cachaça Premium",
    unit: "L",
    quantity: 15,
    minQuantity: 5,
    costPerUnit: 45.00,
    lastRestocked: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    supplier: "Distribuidora de Bebidas",
  },
  {
    id: "inv-5",
    name: "Batata",
    unit: "kg",
    quantity: 25,
    minQuantity: 10,
    costPerUnit: 5.50,
    lastRestocked: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    supplier: "Hortifruti Central",
  },
];

export default function Restaurante() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(mockMenuItems);
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [inventory, setInventory] = useState<InventoryItem[]>(mockInventory);
  
  const [searchMenu, setSearchMenu] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<MenuCategory | "all">("all");
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("active");
  
  const [menuFormOpen, setMenuFormOpen] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  
  const [newOrderOpen, setNewOrderOpen] = useState(false);
  
  const [inventoryFormOpen, setInventoryFormOpen] = useState(false);
  const [editingInventory, setEditingInventory] = useState<InventoryItem | null>(null);
  const [restockDialogOpen, setRestockDialogOpen] = useState(false);
  const [restockingItem, setRestockingItem] = useState<InventoryItem | null>(null);

  // Menu handlers
  const handleSaveMenuItem = (item: MenuItem) => {
    const exists = menuItems.find(m => m.id === item.id);
    if (exists) {
      setMenuItems(menuItems.map(m => m.id === item.id ? item : m));
      toast.success("Item atualizado com sucesso!");
    } else {
      setMenuItems([...menuItems, item]);
      toast.success("Item adicionado ao cardápio!");
    }
    setEditingMenuItem(null);
  };

  const handleDeleteMenuItem = (item: MenuItem) => {
    setMenuItems(menuItems.filter(m => m.id !== item.id));
    toast.success("Item removido do cardápio!");
  };

  // Order handlers
  const handleCreateOrder = (order: Order) => {
    setOrders([order, ...orders]);
    toast.success("Pedido criado com sucesso!");
  };

  const handleUpdateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(orders.map(o => 
      o.id === orderId ? { ...o, status, updatedAt: new Date() } : o
    ));
    toast.success(`Status atualizado para: ${status}`);
  };

  const handlePrintOrder = (order: Order) => {
    toast.info("Imprimindo comanda...");
    // In real app, this would trigger print
  };

  // Inventory handlers
  const handleSaveInventory = (item: InventoryItem) => {
    const exists = inventory.find(i => i.id === item.id);
    if (exists) {
      setInventory(inventory.map(i => i.id === item.id ? item : i));
      toast.success("Item de estoque atualizado!");
    } else {
      setInventory([...inventory, item]);
      toast.success("Item adicionado ao estoque!");
    }
    setEditingInventory(null);
  };

  const handleRestock = (itemId: string, quantity: number) => {
    setInventory(inventory.map(i => 
      i.id === itemId 
        ? { ...i, quantity: i.quantity + quantity, lastRestocked: new Date() }
        : i
    ));
    toast.success("Estoque reposto com sucesso!");
  };

  // Filters
  const filteredMenuItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchMenu.toLowerCase()) ||
      item.description.toLowerCase().includes(searchMenu.toLowerCase());
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredOrders = orders.filter(order => {
    if (orderStatusFilter === "active") {
      return !['delivered', 'cancelled'].includes(order.status);
    }
    if (orderStatusFilter === "completed") {
      return order.status === 'delivered';
    }
    return true;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-display text-foreground">
              Restaurante
            </h1>
            <p className="text-muted-foreground">
              Gerencie cardápio, pedidos e estoque
            </p>
          </div>
          <Button onClick={() => setNewOrderOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Pedido
          </Button>
        </div>

        {/* Stats */}
        <RestaurantStats orders={orders} inventory={inventory} />

        {/* Main Content Tabs */}
        <Tabs defaultValue="orders" className="space-y-4">
          <TabsList>
            <TabsTrigger value="orders" className="gap-2">
              <ShoppingCart className="h-4 w-4" />
              Pedidos
            </TabsTrigger>
            <TabsTrigger value="menu" className="gap-2">
              <UtensilsCrossed className="h-4 w-4" />
              Cardápio
            </TabsTrigger>
            <TabsTrigger value="inventory" className="gap-2">
              <Package className="h-4 w-4" />
              Estoque
            </TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-4">
            <div className="flex items-center gap-4">
              <Select value={orderStatusFilter} onValueChange={setOrderStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Pedidos Ativos</SelectItem>
                  <SelectItem value="completed">Concluídos</SelectItem>
                  <SelectItem value="all">Todos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredOrders.map(order => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onUpdateStatus={handleUpdateOrderStatus}
                  onPrintOrder={handlePrintOrder}
                />
              ))}
              {filteredOrders.length === 0 && (
                <Card variant="elevated" className="col-span-full">
                  <CardContent className="py-12 text-center">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-20" />
                    <p className="text-muted-foreground">Nenhum pedido encontrado</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Menu Tab */}
          <TabsContent value="menu" className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar no cardápio..." 
                  className="pl-10"
                  value={searchMenu}
                  onChange={(e) => setSearchMenu(e.target.value)}
                />
              </div>
              <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as MenuCategory | "all")}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas Categorias</SelectItem>
                  {Object.entries(menuCategoryLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={() => { setEditingMenuItem(null); setMenuFormOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Item
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredMenuItems.map(item => (
                <MenuCard
                  key={item.id}
                  item={item}
                  onEdit={(item) => { setEditingMenuItem(item); setMenuFormOpen(true); }}
                  onDelete={handleDeleteMenuItem}
                  onAddToOrder={() => setNewOrderOpen(true)}
                />
              ))}
              {filteredMenuItems.length === 0 && (
                <Card variant="elevated" className="col-span-full">
                  <CardContent className="py-12 text-center">
                    <UtensilsCrossed className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-20" />
                    <p className="text-muted-foreground">Nenhum item encontrado</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => { setEditingInventory(null); setInventoryFormOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Item
              </Button>
            </div>

            <InventoryTable
              items={inventory}
              onEdit={(item) => { setEditingInventory(item); setInventoryFormOpen(true); }}
              onRestock={(item) => { setRestockingItem(item); setRestockDialogOpen(true); }}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      <MenuFormDialog
        open={menuFormOpen}
        onOpenChange={setMenuFormOpen}
        item={editingMenuItem}
        onSave={handleSaveMenuItem}
      />

      <NewOrderDialog
        open={newOrderOpen}
        onOpenChange={setNewOrderOpen}
        menuItems={menuItems}
        onCreateOrder={handleCreateOrder}
      />

      <InventoryFormDialog
        open={inventoryFormOpen}
        onOpenChange={setInventoryFormOpen}
        item={editingInventory}
        onSave={handleSaveInventory}
      />

      <RestockDialog
        open={restockDialogOpen}
        onOpenChange={setRestockDialogOpen}
        item={restockingItem}
        onRestock={handleRestock}
      />
    </DashboardLayout>
  );
}
