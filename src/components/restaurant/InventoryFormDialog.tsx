import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { InventoryItem } from "@/types/restaurant";

const inventorySchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  unit: z.string().min(1, "Unidade é obrigatória"),
  quantity: z.coerce.number().min(0, "Quantidade não pode ser negativa"),
  minQuantity: z.coerce.number().min(0, "Quantidade mínima não pode ser negativa"),
  costPerUnit: z.coerce.number().min(0, "Custo não pode ser negativo"),
  supplier: z.string().optional(),
});

type InventoryFormData = z.infer<typeof inventorySchema>;

interface InventoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: InventoryItem | null;
  onSave: (item: InventoryItem) => void;
}

export function InventoryFormDialog({ open, onOpenChange, item, onSave }: InventoryFormDialogProps) {
  const form = useForm<InventoryFormData>({
    resolver: zodResolver(inventorySchema),
    defaultValues: {
      name: "",
      unit: "kg",
      quantity: 0,
      minQuantity: 5,
      costPerUnit: 0,
      supplier: "",
    },
  });

  useEffect(() => {
    if (item) {
      form.reset({
        name: item.name,
        unit: item.unit,
        quantity: item.quantity,
        minQuantity: item.minQuantity,
        costPerUnit: item.costPerUnit,
        supplier: item.supplier || "",
      });
    } else {
      form.reset({
        name: "",
        unit: "kg",
        quantity: 0,
        minQuantity: 5,
        costPerUnit: 0,
        supplier: "",
      });
    }
  }, [item, form]);

  const onSubmit = (data: InventoryFormData) => {
    const inventoryItem: InventoryItem = {
      id: item?.id || crypto.randomUUID(),
      name: data.name,
      unit: data.unit,
      quantity: data.quantity,
      minQuantity: data.minQuantity,
      costPerUnit: data.costPerUnit,
      supplier: data.supplier || undefined,
      lastRestocked: item?.lastRestocked || new Date(),
    };
    onSave(inventoryItem);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">
            {item ? "Editar Item" : "Novo Item de Estoque"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do item" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantidade</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidade</FormLabel>
                    <FormControl>
                      <Input placeholder="kg, L, un" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="minQuantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Qtd. Mínima</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="costPerUnit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custo Unit. (R$)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="supplier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fornecedor (opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do fornecedor" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {item ? "Salvar Alterações" : "Adicionar Item"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
