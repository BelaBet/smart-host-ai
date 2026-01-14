import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InventoryItem } from "@/types/restaurant";

interface RestockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: InventoryItem | null;
  onRestock: (itemId: string, quantity: number) => void;
}

export function RestockDialog({ open, onOpenChange, item, onRestock }: RestockDialogProps) {
  const [quantity, setQuantity] = useState("");

  const handleRestock = () => {
    if (item && quantity) {
      onRestock(item.id, parseFloat(quantity));
      onOpenChange(false);
      setQuantity("");
    }
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display">Repor Estoque</DialogTitle>
          <DialogDescription>
            Adicionar quantidade ao item: <strong>{item.name}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="flex justify-between text-sm">
              <span>Estoque atual:</span>
              <span className="font-semibold">{item.quantity} {item.unit}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Mínimo:</span>
              <span>{item.minQuantity} {item.unit}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Quantidade a adicionar ({item.unit})</Label>
            <Input
              type="number"
              step="0.1"
              placeholder="0"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>

          {quantity && (
            <div className="p-4 rounded-lg bg-success/10 text-success">
              <div className="flex justify-between text-sm font-medium">
                <span>Novo estoque:</span>
                <span>{(item.quantity + parseFloat(quantity || "0")).toFixed(1)} {item.unit}</span>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleRestock} disabled={!quantity || parseFloat(quantity) <= 0}>
              Confirmar Reposição
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
