import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Transaction,
  paymentMethodConfig,
  transactionCategoryConfig,
} from "@/types/cashier";
import { TrendingUp, TrendingDown, User, DoorOpen, Clock, Tag, CreditCard, FileText } from "lucide-react";

interface TransactionDetailsDialogProps {
  transaction: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TransactionDetailsDialog({
  transaction,
  open,
  onOpenChange,
}: TransactionDetailsDialogProps) {
  if (!transaction) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const isIncome = transaction.type === "income";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isIncome ? (
              <div className="p-2 rounded-full bg-success/10">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
            ) : (
              <div className="p-2 rounded-full bg-destructive/10">
                <TrendingDown className="h-5 w-5 text-destructive" />
              </div>
            )}
            Detalhes da Transação
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-center py-4">
            <p
              className={`text-3xl font-bold ${
                isIncome ? "text-success" : "text-destructive"
              }`}
            >
              {isIncome ? "+" : "-"} {formatCurrency(transaction.amount)}
            </p>
            <Badge variant={isIncome ? "success" : "destructive"} className="mt-2">
              {isIncome ? "Entrada" : "Saída"}
            </Badge>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Descrição</p>
                <p className="font-medium">{transaction.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Categoria</p>
                <p className="font-medium">
                  {transactionCategoryConfig[transaction.category]?.label || transaction.category}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Forma de Pagamento</p>
                <p className="font-medium">
                  {paymentMethodConfig[transaction.paymentMethod]?.label || transaction.paymentMethod}
                </p>
              </div>
            </div>

            {transaction.guestName && (
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Hóspede</p>
                  <p className="font-medium">{transaction.guestName}</p>
                </div>
              </div>
            )}

            {transaction.roomNumber && (
              <div className="flex items-center gap-3">
                <DoorOpen className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Quarto</p>
                  <p className="font-medium">{transaction.roomNumber}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Data e Hora</p>
                <p className="font-medium">
                  {format(new Date(transaction.createdAt), "dd 'de' MMMM 'às' HH:mm", {
                    locale: ptBR,
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
