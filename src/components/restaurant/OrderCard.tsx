import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  User, 
  Home, 
  ChefHat, 
  Check, 
  X,
  Printer
} from "lucide-react";
import { Order, orderStatusLabels, orderStatusColors } from "@/types/restaurant";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface OrderCardProps {
  order: Order;
  onUpdateStatus: (orderId: string, status: Order['status']) => void;
  onPrintOrder?: (order: Order) => void;
}

export function OrderCard({ order, onUpdateStatus, onPrintOrder }: OrderCardProps) {
  const getNextStatus = (): Order['status'] | null => {
    switch (order.status) {
      case 'pending': return 'preparing';
      case 'preparing': return 'ready';
      case 'ready': return 'delivered';
      default: return null;
    }
  };

  const nextStatus = getNextStatus();

  return (
    <Card variant="elevated" className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-display">
            Pedido #{order.id.slice(0, 6)}
          </CardTitle>
          <Badge variant={orderStatusColors[order.status] as any}>
            {orderStatusLabels[order.status]}
          </Badge>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {order.roomNumber && (
            <div className="flex items-center gap-1">
              <Home className="h-4 w-4" />
              <span>Quarto {order.roomNumber}</span>
            </div>
          )}
          {order.tableNumber && (
            <div className="flex items-center gap-1">
              <ChefHat className="h-4 w-4" />
              <span>Mesa {order.tableNumber}</span>
            </div>
          )}
          {order.guestName && (
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>{order.guestName}</span>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between items-center text-sm">
              <div className="flex-1">
                <span className="font-medium">{item.quantity}x</span>{" "}
                <span>{item.menuItem.name}</span>
                {item.notes && (
                  <p className="text-xs text-muted-foreground italic">
                    Obs: {item.notes}
                  </p>
                )}
              </div>
              <span className="text-muted-foreground">
                R$ {(item.menuItem.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
        
        <div className="border-t pt-3">
          <div className="flex justify-between items-center font-semibold">
            <span>Total</span>
            <span className="text-secondary">R$ {order.total.toFixed(2)}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>
              {formatDistanceToNow(new Date(order.createdAt), { 
                addSuffix: true, 
                locale: ptBR 
              })}
            </span>
          </div>
          
          {order.paid && (
            <Badge variant="success" className="text-xs">Pago</Badge>
          )}
        </div>
        
        <div className="flex gap-2 pt-2">
          {onPrintOrder && (
            <Button 
              size="sm" 
              variant="outline" 
              className="flex-1"
              onClick={() => onPrintOrder(order)}
            >
              <Printer className="h-4 w-4 mr-1" />
              Imprimir
            </Button>
          )}
          
          {order.status !== 'cancelled' && order.status !== 'delivered' && (
            <Button 
              size="sm" 
              variant="outline" 
              className="text-destructive"
              onClick={() => onUpdateStatus(order.id, 'cancelled')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          
          {nextStatus && (
            <Button 
              size="sm" 
              className="flex-1"
              onClick={() => onUpdateStatus(order.id, nextStatus)}
            >
              <Check className="h-4 w-4 mr-1" />
              {nextStatus === 'preparing' && 'Preparar'}
              {nextStatus === 'ready' && 'Pronto'}
              {nextStatus === 'delivered' && 'Entregar'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
