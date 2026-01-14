import { useState, useMemo } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CashierStats } from "@/components/cashier/CashierStats";
import { TransactionTable } from "@/components/cashier/TransactionTable";
import { TransactionFormDialog } from "@/components/cashier/TransactionFormDialog";
import { TransactionDetailsDialog } from "@/components/cashier/TransactionDetailsDialog";
import { CashierSessionDialog } from "@/components/cashier/CashierSessionDialog";
import { DailyReportCard } from "@/components/cashier/DailyReportCard";
import {
  Transaction,
  CashierSession,
  DailyReport,
  TransactionCategory,
  PaymentMethod,
} from "@/types/cashier";
import {
  Plus,
  Lock,
  Unlock,
  FileText,
  Calendar,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

// Mock data
const mockTransactions: Transaction[] = [
  {
    id: "1",
    type: "income",
    category: "hospedagem",
    description: "Check-out Quarto 101 - Maria Silva",
    amount: 450.0,
    paymentMethod: "credit",
    guestName: "Maria Silva",
    roomNumber: "101",
    createdAt: new Date().toISOString(),
    createdBy: "Admin",
  },
  {
    id: "2",
    type: "income",
    category: "restaurante",
    description: "Café da manhã - Mesa 5",
    amount: 85.0,
    paymentMethod: "pix",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    createdBy: "Admin",
  },
  {
    id: "3",
    type: "expense",
    category: "fornecedor",
    description: "Compra de produtos de limpeza",
    amount: 320.0,
    paymentMethod: "transfer",
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    createdBy: "Admin",
  },
  {
    id: "4",
    type: "income",
    category: "frigobar",
    description: "Consumo frigobar - Quarto 205",
    amount: 65.0,
    paymentMethod: "cash",
    guestName: "João Santos",
    roomNumber: "205",
    createdAt: new Date(Date.now() - 10800000).toISOString(),
    createdBy: "Admin",
  },
];

const mockGuests = [
  { id: "1", name: "Maria Silva", room: "101" },
  { id: "2", name: "João Santos", room: "205" },
  { id: "3", name: "Ana Costa", room: "302" },
];

export default function Caixa() {
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [session, setSession] = useState<CashierSession | null>({
    id: "1",
    openedAt: new Date().toISOString(),
    openingBalance: 500,
    status: "open",
    openedBy: "Admin",
  });
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
  const [isSessionDialogOpen, setIsSessionDialogOpen] = useState(false);
  const [sessionDialogMode, setSessionDialogMode] = useState<"open" | "close">("open");
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  const stats = useMemo(() => {
    const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((acc, t) => acc + t.amount, 0);
    const totalExpense = transactions
      .filter((t) => t.type === "expense")
      .reduce((acc, t) => acc + t.amount, 0);
    const balance = (session?.openingBalance || 0) + totalIncome - totalExpense;

    return {
      totalIncome,
      totalExpense,
      balance,
      transactionCount: transactions.length,
    };
  }, [transactions, session]);

  const dailyReport: DailyReport = useMemo(() => {
    const transactionsByCategory: Record<TransactionCategory, number> = {
      hospedagem: 0,
      restaurante: 0,
      frigobar: 0,
      lavanderia: 0,
      estacionamento: 0,
      outros: 0,
      "despesa-operacional": 0,
      "despesa-pessoal": 0,
      fornecedor: 0,
    };

    const transactionsByPaymentMethod: Record<PaymentMethod, number> = {
      cash: 0,
      credit: 0,
      debit: 0,
      pix: 0,
      transfer: 0,
    };

    transactions.forEach((t) => {
      transactionsByCategory[t.category] += t.amount;
      transactionsByPaymentMethod[t.paymentMethod] += t.amount;
    });

    return {
      date: new Date().toISOString(),
      totalIncome: stats.totalIncome,
      totalExpense: stats.totalExpense,
      netBalance: stats.balance,
      transactionsByCategory,
      transactionsByPaymentMethod,
      transactionCount: transactions.length,
    };
  }, [transactions, stats]);

  const handleAddTransaction = (
    transaction: Omit<Transaction, "id" | "createdAt" | "createdBy">
  ) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      createdBy: "Admin",
    };
    setTransactions([newTransaction, ...transactions]);
    toast.success(
      `${transaction.type === "income" ? "Entrada" : "Saída"} registrada com sucesso!`
    );
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(transactions.filter((t) => t.id !== id));
    toast.success("Transação removida!");
  };

  const handleViewTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsDetailsDialogOpen(true);
  };

  const handleOpenSession = (openingBalance: number) => {
    const newSession: CashierSession = {
      id: Date.now().toString(),
      openedAt: new Date().toISOString(),
      openingBalance,
      status: "open",
      openedBy: "Admin",
    };
    setSession(newSession);
    setTransactions([]);
    toast.success("Caixa aberto com sucesso!");
  };

  const handleCloseSession = (closingBalance: number, notes?: string) => {
    if (session) {
      const closedSession: CashierSession = {
        ...session,
        closedAt: new Date().toISOString(),
        closingBalance,
        expectedBalance: stats.balance,
        difference: closingBalance - stats.balance,
        status: "closed",
        closedBy: "Admin",
        notes,
      };
      setSession(null);
      toast.success("Caixa fechado com sucesso!");
      console.log("Session closed:", closedSession);
    }
  };

  const isCashierOpen = session?.status === "open";

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Caixa</h1>
            <p className="text-muted-foreground mt-1">
              {format(new Date(), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isCashierOpen ? (
              <>
                <Badge variant="success" className="px-4 py-2 text-sm">
                  <Unlock className="h-4 w-4 mr-2" />
                  Caixa Aberto
                </Badge>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSessionDialogMode("close");
                    setIsSessionDialogOpen(true);
                  }}
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Fechar Caixa
                </Button>
                <Button onClick={() => setIsTransactionDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Transação
                </Button>
              </>
            ) : (
              <>
                <Badge variant="outline" className="px-4 py-2 text-sm">
                  <Lock className="h-4 w-4 mr-2" />
                  Caixa Fechado
                </Badge>
                <Button
                  variant="success"
                  onClick={() => {
                    setSessionDialogMode("open");
                    setIsSessionDialogOpen(true);
                  }}
                >
                  <Unlock className="h-4 w-4 mr-2" />
                  Abrir Caixa
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Session Info */}
        {session && isCashierOpen && (
          <Card className="border-success/20 bg-success/5">
            <CardContent className="py-4">
              <div className="flex flex-wrap items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-success" />
                  <span className="text-muted-foreground">Aberto em:</span>
                  <span className="font-medium">
                    {format(new Date(session.openedAt), "dd/MM/yyyy", { locale: ptBR })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-success" />
                  <span className="text-muted-foreground">Horário:</span>
                  <span className="font-medium">
                    {format(new Date(session.openedAt), "HH:mm", { locale: ptBR })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-success" />
                  <span className="text-muted-foreground">Saldo Inicial:</span>
                  <span className="font-medium">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(session.openingBalance)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <CashierStats {...stats} />

        {/* Daily Report */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Relatório do Dia
          </h2>
          <DailyReportCard report={dailyReport} />
        </div>

        {/* Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Transações de Hoje</span>
              <Badge variant="outline">{transactions.length} transações</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TransactionTable
              transactions={transactions}
              onView={handleViewTransaction}
              onDelete={handleDeleteTransaction}
            />
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <TransactionFormDialog
        open={isTransactionDialogOpen}
        onOpenChange={setIsTransactionDialogOpen}
        onSubmit={handleAddTransaction}
        guests={mockGuests}
      />

      <TransactionDetailsDialog
        transaction={selectedTransaction}
        open={isDetailsDialogOpen}
        onOpenChange={setIsDetailsDialogOpen}
      />

      <CashierSessionDialog
        open={isSessionDialogOpen}
        onOpenChange={setIsSessionDialogOpen}
        mode={sessionDialogMode}
        currentSession={session || undefined}
        expectedBalance={stats.balance}
        onOpenSession={handleOpenSession}
        onCloseSession={handleCloseSession}
      />
    </DashboardLayout>
  );
}
