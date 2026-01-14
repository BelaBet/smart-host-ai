import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Trash2, TrendingUp, TrendingDown } from "lucide-react";
import {
  Transaction,
  paymentMethodConfig,
  transactionCategoryConfig,
} from "@/types/cashier";

interface TransactionTableProps {
  transactions: Transaction[];
  onView: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

export function TransactionTable({ transactions, onView, onDelete }: TransactionTableProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Nenhuma transação registrada hoje.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-[50px]">Tipo</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Hóspede/Quarto</TableHead>
            <TableHead>Pagamento</TableHead>
            <TableHead>Hora</TableHead>
            <TableHead className="text-right">Valor</TableHead>
            <TableHead className="w-[100px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id} className="hover:bg-muted/30">
              <TableCell>
                {transaction.type === "income" ? (
                  <div className="p-2 rounded-full bg-success/10 w-fit">
                    <TrendingUp className="h-4 w-4 text-success" />
                  </div>
                ) : (
                  <div className="p-2 rounded-full bg-destructive/10 w-fit">
                    <TrendingDown className="h-4 w-4 text-destructive" />
                  </div>
                )}
              </TableCell>
              <TableCell className="font-medium max-w-[200px] truncate">
                {transaction.description}
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {transactionCategoryConfig[transaction.category]?.label || transaction.category}
                </Badge>
              </TableCell>
              <TableCell>
                {transaction.guestName ? (
                  <div className="text-sm">
                    <p className="font-medium">{transaction.guestName}</p>
                    {transaction.roomNumber && (
                      <p className="text-muted-foreground">Quarto {transaction.roomNumber}</p>
                    )}
                  </div>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell>
                <Badge variant="secondary">
                  {paymentMethodConfig[transaction.paymentMethod]?.label || transaction.paymentMethod}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {format(new Date(transaction.createdAt), "HH:mm", { locale: ptBR })}
              </TableCell>
              <TableCell className="text-right">
                <span
                  className={`font-semibold ${
                    transaction.type === "income" ? "text-success" : "text-destructive"
                  }`}
                >
                  {transaction.type === "income" ? "+" : "-"} {formatCurrency(transaction.amount)}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={() => onView(transaction)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(transaction.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
