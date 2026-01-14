import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Plus, AlertTriangle } from "lucide-react";
import { InventoryItem } from "@/types/restaurant";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface InventoryTableProps {
  items: InventoryItem[];
  onEdit: (item: InventoryItem) => void;
  onRestock: (item: InventoryItem) => void;
}

export function InventoryTable({ items, onEdit, onRestock }: InventoryTableProps) {
  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Item</TableHead>
            <TableHead className="text-center">Quantidade</TableHead>
            <TableHead className="text-center">Mínimo</TableHead>
            <TableHead className="text-right">Custo Unit.</TableHead>
            <TableHead>Última Reposição</TableHead>
            <TableHead>Fornecedor</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const isLowStock = item.quantity <= item.minQuantity;
            
            return (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell className="text-center">
                  <span className={isLowStock ? 'text-destructive font-semibold' : ''}>
                    {item.quantity} {item.unit}
                  </span>
                </TableCell>
                <TableCell className="text-center text-muted-foreground">
                  {item.minQuantity} {item.unit}
                </TableCell>
                <TableCell className="text-right">
                  R$ {item.costPerUnit.toFixed(2)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {format(new Date(item.lastRestocked), "dd/MM/yyyy", { locale: ptBR })}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {item.supplier || '-'}
                </TableCell>
                <TableCell className="text-center">
                  {isLowStock ? (
                    <Badge variant="destructive" className="gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Baixo
                    </Badge>
                  ) : (
                    <Badge variant="success">OK</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button size="icon" variant="ghost" onClick={() => onEdit(item)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => onRestock(item)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
          {items.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                Nenhum item no estoque
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
