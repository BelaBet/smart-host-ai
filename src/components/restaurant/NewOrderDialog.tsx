import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Minus, Trash2, ShoppingCart } from "lucide-react";
import { MenuItem, Order, OrderItem, menuCategoryLabels, MenuCategory } from "@/types/restaurant";

interface NewOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  menuItems: MenuItem[];
  onCreateOrder: (order: Order) => void;
}

const mockRooms = ["101", "102", "103", "201", "202", "203", "301", "302"];

export function NewOrderDialog({ open, onOpenChange, menuItems, onCreateOrder }: NewOrderDialogProps) {
  const [orderType, setOrderType] = useState<'room' | 'table'>('room');
  const [roomNumber, setRoomNumber] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [guestName, setGuestName] = useState("");
  const [cart, setCart] = useState<Array<{ item: MenuItem; quantity: number; notes: string }>>([]);
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory>('prato_principal');

  const addToCart = (item: MenuItem) => {
    const existing = cart.find(c => c.item.id === item.id);
    if (existing) {
      setCart(cart.map(c => 
        c.item.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
      ));
    } else {
      setCart([...cart, { item, quantity: 1, notes: "" }]);
    }
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart(cart.map(c => {
      if (c.item.id === itemId) {
        const newQuantity = c.quantity + delta;
        return newQuantity > 0 ? { ...c, quantity: newQuantity } : c;
      }
      return c;
    }).filter(c => c.quantity > 0));
  };

  const updateNotes = (itemId: string, notes: string) => {
    setCart(cart.map(c => 
      c.item.id === itemId ? { ...c, notes } : c
    ));
  };

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter(c => c.item.id !== itemId));
  };

  const total = cart.reduce((sum, c) => sum + (c.item.price * c.quantity), 0);

  const handleCreateOrder = () => {
    const orderItems: OrderItem[] = cart.map(c => ({
      id: crypto.randomUUID(),
      menuItem: c.item,
      quantity: c.quantity,
      notes: c.notes || undefined,
      status: 'pending' as const,
    }));

    const order: Order = {
      id: crypto.randomUUID(),
      roomNumber: orderType === 'room' ? roomNumber : undefined,
      tableNumber: orderType === 'table' ? tableNumber : undefined,
      guestName: guestName || undefined,
      items: orderItems,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
      total,
      paid: false,
    };

    onCreateOrder(order);
    onOpenChange(false);
    
    // Reset form
    setCart([]);
    setRoomNumber("");
    setTableNumber("");
    setGuestName("");
  };

  const filteredItems = menuItems.filter(item => 
    item.category === selectedCategory && item.available
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="font-display">Novo Pedido</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Menu Selection */}
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={orderType === 'room' ? 'default' : 'outline'}
                onClick={() => setOrderType('room')}
              >
                Quarto
              </Button>
              <Button
                size="sm"
                variant={orderType === 'table' ? 'default' : 'outline'}
                onClick={() => setOrderType('table')}
              >
                Mesa
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {orderType === 'room' ? (
                <div className="space-y-2">
                  <Label>Quarto</Label>
                  <Select value={roomNumber} onValueChange={setRoomNumber}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockRooms.map(room => (
                        <SelectItem key={room} value={room}>Quarto {room}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>Mesa</Label>
                  <Input 
                    placeholder="Número da mesa" 
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label>Nome do Hóspede</Label>
                <Input 
                  placeholder="Nome (opcional)" 
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                />
              </div>
            </div>

            <Tabs value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as MenuCategory)}>
              <TabsList className="w-full flex-wrap h-auto">
                {Object.entries(menuCategoryLabels).map(([key, label]) => (
                  <TabsTrigger key={key} value={key} className="flex-1">
                    {label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            <ScrollArea className="h-[300px] pr-4">
              <div className="grid grid-cols-1 gap-2">
                {filteredItems.map(item => (
                  <div 
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent cursor-pointer"
                    onClick={() => addToCart(item)}
                  >
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-secondary">R$ {item.price.toFixed(2)}</p>
                      <Button size="sm" variant="ghost">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {filteredItems.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum item disponível nesta categoria
                  </p>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Right: Cart */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-secondary" />
              <h3 className="font-semibold">Comanda</h3>
              {cart.length > 0 && (
                <Badge variant="secondary">{cart.length} itens</Badge>
              )}
            </div>

            <ScrollArea className="h-[350px] pr-4">
              {cart.length === 0 ? (
                <div className="text-center text-muted-foreground py-12">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p>Adicione itens ao pedido</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map(({ item, quantity, notes }) => (
                    <div key={item.id} className="p-3 rounded-lg border space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{item.name}</span>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-6 w-6 text-destructive"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button 
                            size="icon" 
                            variant="outline" 
                            className="h-7 w-7"
                            onClick={() => updateQuantity(item.id, -1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center font-semibold">{quantity}</span>
                          <Button 
                            size="icon" 
                            variant="outline" 
                            className="h-7 w-7"
                            onClick={() => updateQuantity(item.id, 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <span className="font-semibold text-secondary">
                          R$ {(item.price * quantity).toFixed(2)}
                        </span>
                      </div>
                      
                      <Textarea 
                        placeholder="Observações (opcional)" 
                        className="h-16 text-sm"
                        value={notes}
                        onChange={(e) => updateNotes(item.id, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            <div className="border-t pt-4 space-y-4">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total</span>
                <span className="text-secondary">R$ {total.toFixed(2)}</span>
              </div>
              
              <Button 
                className="w-full" 
                size="lg"
                disabled={cart.length === 0 || (!roomNumber && !tableNumber)}
                onClick={handleCreateOrder}
              >
                Criar Pedido
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
