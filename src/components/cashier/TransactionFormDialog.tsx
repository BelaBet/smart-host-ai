import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Transaction,
  TransactionType,
  TransactionCategory,
  PaymentMethod,
  paymentMethodConfig,
  transactionCategoryConfig,
} from "@/types/cashier";

const transactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  category: z.string().min(1, "Selecione uma categoria"),
  description: z.string().min(1, "Descrição é obrigatória").max(200),
  amount: z.number().min(0.01, "Valor deve ser maior que zero"),
  paymentMethod: z.string().min(1, "Selecione um método de pagamento"),
  guestName: z.string().optional(),
  roomNumber: z.string().optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface TransactionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (transaction: Omit<Transaction, "id" | "createdAt" | "createdBy">) => void;
  guests?: Array<{ id: string; name: string; room: string }>;
}

export function TransactionFormDialog({
  open,
  onOpenChange,
  onSubmit,
  guests = [],
}: TransactionFormDialogProps) {
  const [transactionType, setTransactionType] = useState<TransactionType>("income");

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "income",
      category: "",
      description: "",
      amount: 0,
      paymentMethod: "",
      guestName: "",
      roomNumber: "",
    },
  });

  const handleSubmit = (data: TransactionFormData) => {
    onSubmit({
      type: data.type as TransactionType,
      category: data.category as TransactionCategory,
      description: data.description,
      amount: data.amount,
      paymentMethod: data.paymentMethod as PaymentMethod,
      guestName: data.guestName,
      roomNumber: data.roomNumber,
    });
    form.reset();
    onOpenChange(false);
  };

  const incomeCategories = Object.entries(transactionCategoryConfig).filter(
    ([_, config]) => config.type === "income"
  );
  const expenseCategories = Object.entries(transactionCategoryConfig).filter(
    ([_, config]) => config.type === "expense"
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nova Transação</DialogTitle>
        </DialogHeader>

        <Tabs
          value={transactionType}
          onValueChange={(v) => {
            setTransactionType(v as TransactionType);
            form.setValue("type", v as TransactionType);
            form.setValue("category", "");
          }}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="income" className="text-success data-[state=active]:bg-success/10">
              Entrada
            </TabsTrigger>
            <TabsTrigger value="expense" className="text-destructive data-[state=active]:bg-destructive/10">
              Saída
            </TabsTrigger>
          </TabsList>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 mt-4">
              <TabsContent value="income" className="mt-0 space-y-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a categoria" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {incomeCategories.map(([key, config]) => (
                            <SelectItem key={key} value={key}>
                              {config.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {guests.length > 0 && (
                  <FormField
                    control={form.control}
                    name="guestName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hóspede (opcional)</FormLabel>
                        <Select
                          onValueChange={(v) => {
                            const guest = guests.find((g) => g.id === v);
                            if (guest) {
                              field.onChange(guest.name);
                              form.setValue("roomNumber", guest.room);
                            }
                          }}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Vincular a hóspede" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {guests.map((guest) => (
                              <SelectItem key={guest.id} value={guest.id}>
                                {guest.name} - Quarto {guest.room}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </TabsContent>

              <TabsContent value="expense" className="mt-0 space-y-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a categoria" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {expenseCategories.map(([key, config]) => (
                            <SelectItem key={key} value={key}>
                              {config.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descreva a transação..."
                        {...field}
                        rows={2}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor (R$)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0,00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Forma de Pagamento</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(paymentMethodConfig).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            {config.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant={transactionType === "income" ? "success" : "destructive"}
                >
                  Registrar {transactionType === "income" ? "Entrada" : "Saída"}
                </Button>
              </div>
            </form>
          </Form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
