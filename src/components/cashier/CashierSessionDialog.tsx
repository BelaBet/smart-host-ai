import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { Textarea } from "@/components/ui/textarea";
import { CashierSession } from "@/types/cashier";
import { AlertTriangle, CheckCircle } from "lucide-react";

const openSessionSchema = z.object({
  openingBalance: z.number().min(0, "O saldo inicial deve ser maior ou igual a zero"),
});

const closeSessionSchema = z.object({
  closingBalance: z.number().min(0, "O saldo final deve ser maior ou igual a zero"),
  notes: z.string().optional(),
});

interface CashierSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "open" | "close";
  currentSession?: CashierSession;
  expectedBalance?: number;
  onOpenSession: (openingBalance: number) => void;
  onCloseSession: (closingBalance: number, notes?: string) => void;
}

export function CashierSessionDialog({
  open,
  onOpenChange,
  mode,
  currentSession,
  expectedBalance = 0,
  onOpenSession,
  onCloseSession,
}: CashierSessionDialogProps) {
  const [closingBalance, setClosingBalance] = useState<number>(expectedBalance);

  const openForm = useForm<z.infer<typeof openSessionSchema>>({
    resolver: zodResolver(openSessionSchema),
    defaultValues: {
      openingBalance: 0,
    },
  });

  const closeForm = useForm<z.infer<typeof closeSessionSchema>>({
    resolver: zodResolver(closeSessionSchema),
    defaultValues: {
      closingBalance: expectedBalance,
      notes: "",
    },
  });

  const handleOpenSession = (data: z.infer<typeof openSessionSchema>) => {
    onOpenSession(data.openingBalance);
    openForm.reset();
    onOpenChange(false);
  };

  const handleCloseSession = (data: z.infer<typeof closeSessionSchema>) => {
    onCloseSession(data.closingBalance, data.notes);
    closeForm.reset();
    onOpenChange(false);
  };

  const difference = closingBalance - expectedBalance;
  const hasDifference = Math.abs(difference) > 0.01;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "open" ? "Abrir Caixa" : "Fechar Caixa"}
          </DialogTitle>
          <DialogDescription>
            {mode === "open"
              ? "Informe o saldo inicial para abrir o caixa."
              : "Confira o saldo e feche o caixa do dia."}
          </DialogDescription>
        </DialogHeader>

        {mode === "open" ? (
          <Form {...openForm}>
            <form onSubmit={openForm.handleSubmit(handleOpenSession)} className="space-y-4">
              <FormField
                control={openForm.control}
                name="openingBalance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Saldo Inicial (R$)</FormLabel>
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

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="success">
                  Abrir Caixa
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          <Form {...closeForm}>
            <form onSubmit={closeForm.handleSubmit(handleCloseSession)} className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Saldo Esperado:</span>
                  <span className="font-semibold">{formatCurrency(expectedBalance)}</span>
                </div>
              </div>

              <FormField
                control={closeForm.control}
                name="closingBalance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Saldo em Caixa (R$)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0,00"
                        {...field}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || 0;
                          field.onChange(value);
                          setClosingBalance(value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {hasDifference && (
                <div
                  className={`p-4 rounded-lg flex items-start gap-3 ${
                    difference > 0
                      ? "bg-success/10 text-success"
                      : "bg-destructive/10 text-destructive"
                  }`}
                >
                  <AlertTriangle className="h-5 w-5 mt-0.5" />
                  <div>
                    <p className="font-medium">
                      Diferença: {difference > 0 ? "+" : ""}
                      {formatCurrency(difference)}
                    </p>
                    <p className="text-sm opacity-80">
                      {difference > 0
                        ? "Há mais dinheiro em caixa do que o esperado."
                        : "Há menos dinheiro em caixa do que o esperado."}
                    </p>
                  </div>
                </div>
              )}

              {!hasDifference && closingBalance > 0 && (
                <div className="p-4 rounded-lg bg-success/10 text-success flex items-center gap-3">
                  <CheckCircle className="h-5 w-5" />
                  <p className="font-medium">Caixa confere!</p>
                </div>
              )}

              <FormField
                control={closeForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações (opcional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Adicione observações sobre o fechamento..."
                        {...field}
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="destructive">
                  Fechar Caixa
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
