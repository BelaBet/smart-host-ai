import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Clock, Edit, Trash2 } from "lucide-react";
import { MenuItem, menuCategoryLabels } from "@/types/restaurant";

interface MenuCardProps {
  item: MenuItem;
  onAddToOrder?: (item: MenuItem) => void;
  onEdit?: (item: MenuItem) => void;
  onDelete?: (item: MenuItem) => void;
  showActions?: boolean;
}

export function MenuCard({ item, onAddToOrder, onEdit, onDelete, showActions = true }: MenuCardProps) {
  return (
    <Card variant="elevated" className={`overflow-hidden ${!item.available ? 'opacity-60' : ''}`}>
      <div className="h-32 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
        <span className="text-4xl">🍽️</span>
      </div>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-semibold text-foreground">{item.name}</h3>
            <Badge variant="outline" className="text-xs mt-1">
              {menuCategoryLabels[item.category]}
            </Badge>
          </div>
          <span className="text-lg font-bold text-secondary">
            R$ {item.price.toFixed(2)}
          </span>
        </div>
        
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {item.description}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{item.preparationTime} min</span>
          </div>
          
          {!item.available ? (
            <Badge variant="destructive">Indisponível</Badge>
          ) : showActions && (
            <div className="flex gap-1">
              {onEdit && (
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onEdit(item)}>
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              {onDelete && (
                <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => onDelete(item)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
              {onAddToOrder && (
                <Button size="sm" onClick={() => onAddToOrder(item)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
