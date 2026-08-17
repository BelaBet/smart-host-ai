import { useEffect, useMemo, useState } from "react";
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
import { Transaction, CashierSession, DailyReport, TransactionCategory, PaymentMethod } from "@/types/cashier";
import { Plus, Lock, Unlock, FileText, Calendar, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const mapSession = (row: any): CashierSession => ({
  id: row.id,
  openedAt: row.opened_at,
  closedAt: row.closed_at ?? undefined,
  openingBalance: Number(row.opening_balance),
  closingBalance: row.closing_balance == null ? undefined : Number(row.closing_balance),
  expectedBalance: row.expected_balance == null ? undefined : Number(row.expected_balance),
  difference: row.difference == null ? undefined : Number(row.difference),
  status: row.status,
  openedBy: row.opened_by,
  closedBy: row.closed_by ?? undefined,
  notes: row.notes ?? undefined,
});

const mapTransaction = (row: any): Transaction => ({
  id: row.id,
  type: row.type,
  category: row.category,
  description: row.description,
  amount: Number(row.amount),
  paymentMethod: row.payment_method,
  guestId: row.guest_id ?? undefined,
  guestName: row.guests?.name ?? undefined,
  roomNumber: row.room_number ?? undefined,
  createdAt: row.created_at,
  createdBy: row.created_by,
});

export default function Caixa() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [session, setSession] = useState<CashierSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
  const [isSessionDialogOpen, setIsSessionDialogOpen] = useState(false);
  const [sessionDialogMode, setSessionDialogMode] = useState<"open" | "close">("open");
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [guests, setGuests] = useState<Array<{ id: string; name: string; room: string }>>([]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: sessionRow, error: sessionError } = await supabase
        .from("cashier_sessions")
        .select("*")
        .eq("status", "open")
        .maybeSingle();
      if (sessionError) throw sessionError;

      const current = sessionRow ? mapSession(sessionRow) : null;
      setSession(current);

      if (current) {
        const { data, error } = await supabase
          .from("cashier_transactions")
          .select("*, guests(name)")
          .eq("session_id", current.id)
          .is("deleted_at", null)
          .order("created_at", { ascending: false });
        if (error) throw error;
        setTransactions((data ?? []).map(mapTransaction));
      } else {
        setTransactions([]);
      }

      const { data: guestRows, error: guestError } = await supabase
        .from("guests")
        .select("id,name")
        .order("name")
        .limit(500);
      if (guestError) throw guestError;
      setGuests((guestRows ?? []).map((g: any) => ({ id: g.id, name: g.name, room: "" })));
    } catch (error) {
      console.error(error);
      toast.error("Não foi possível carregar o caixa.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadData(); }, [user]);

  const stats = useMemo(() => {
    const totalIncome = transactions.filter(t => t.type === "income").reduce((a, t) => a + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === "expense").reduce((a, t) => a + t.amount, 0);
    return { totalIncome, totalExpense, balance: (session?.openingBalance ?? 0) + totalIncome - totalExpense, transactionCount: transactions.length };
  }, [transactions, session]);

  const dailyReport: DailyReport = useMemo(() => {
    const transactionsByCategory = {} as Record<TransactionCategory, number>;
    const transactionsByPaymentMethod = {} as Record<PaymentMethod, number>;
    (Object.keys({ hospedagem: 1, restaurante: 1, frigobar: 1, lavanderia: 1, estacionamento: 1, outros: 1, "despesa-operacional": 1, "despesa-pessoal": 1, fornecedor: 1 }) as TransactionCategory[]).forEach(k => transactionsByCategory[k] = 0);
    (Object.keys({ cash: 1, credit: 1, debit: 1, pix: 1, transfer: 1 }) as PaymentMethod[]).forEach(k => transactionsByPaymentMethod[k] = 0);
    transactions.forEach(t => { transactionsByCategory[t.category] += t.amount; transactionsByPaymentMethod[t.paymentMethod] += t.amount; });
    return { date: new Date().toISOString(), totalIncome: stats.totalIncome, totalExpense: stats.totalExpense, netBalance: stats.balance, transactionsByCategory, transactionsByPaymentMethod, transactionCount: transactions.length };
  }, [transactions, stats]);

  const handleAddTransaction = async (transaction: Omit<Transaction, "id" | "createdAt" | "createdBy">) => {
    if (!session || !user) return;
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.from("cashier_transactions").insert({
        session_id: session.id,
        type: transaction.type,
        category: transaction.category,
        description: transaction.description,
        amount: transaction.amount,
        payment_method: transaction.paymentMethod,
        guest_id: transaction.guestId || null,
        room_number: transaction.roomNumber || null,
        created_by: user.id,
      }).select("*, guests(name)").single();
      if (error) throw error;
      setTransactions(prev => [mapTransaction(data), ...prev]);
      toast.success(`${transaction.type === "income" ? "Entrada" : "Saída"} registrada com sucesso!`);
    } catch (error) {
      console.error(error);
      toast.error("Não foi possível registrar a transação.");
    } finally { setIsProcessing(false); }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!user) return;
    try {
      const { error } = await supabase.from("cashier_transactions").update({ deleted_at: new Date().toISOString(), deleted_by: user.id }).eq("id", id).eq("created_by", user.id);
      if (error) throw error;
      setTransactions(prev => prev.filter(t => t.id !== id));
      toast.success("Transação removida do caixa.");
    } catch (error) { console.error(error); toast.error("Não foi possível remover a transação."); }
  };

  const handleOpenSession = async (openingBalance: number) => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.rpc("open_cashier", { p_opening_balance: openingBalance });
      if (error) throw error;
      setSession(mapSession(data));
      setTransactions([]);
      toast.success("Caixa aberto com sucesso!");
    } catch (error) { console.error(error); toast.error(error instanceof Error ? error.message : "Não foi possível abrir o caixa."); }
    finally { setIsProcessing(false); }
  };

  const handleCloseSession = async (closingBalance: number, notes?: string) => {
    if (!session) return;
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.rpc("close_cashier", { p_session_id: session.id, p_closing_balance: closingBalance, p_notes: notes ?? null });
      if (error) throw error;
      const closed = mapSession(data);
      setSession(null);
      setTransactions([]);
      toast.success(`Caixa fechado. Diferença: ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(closed.difference ?? 0)}`);
    } catch (error) { console.error(error); toast.error("Não foi possível fechar o caixa."); }
    finally { setIsProcessing(false); }
  };

  const isCashierOpen = session?.status === "open";

  if (loading) return <DashboardLayout><div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div><h1 className="text-3xl font-bold text-foreground">Caixa</h1><p className="text-muted-foreground mt-1">{format(new Date(), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p></div>
          <div className="flex items-center gap-3">
            {isCashierOpen ? <><Badge variant="success" className="px-4 py-2 text-sm"><Unlock className="h-4 w-4 mr-2" />Caixa Aberto</Badge><Button variant="outline" disabled={isProcessing} onClick={() => { setSessionDialogMode("close"); setIsSessionDialogOpen(true); }}><Lock className="h-4 w-4 mr-2" />Fechar Caixa</Button><Button disabled={isProcessing} onClick={() => setIsTransactionDialogOpen(true)}><Plus className="h-4 w-4 mr-2" />Nova Transação</Button></> : <><Badge variant="outline" className="px-4 py-2 text-sm"><Lock className="h-4 w-4 mr-2" />Caixa Fechado</Badge><Button variant="success" disabled={isProcessing} onClick={() => { setSessionDialogMode("open"); setIsSessionDialogOpen(true); }}><Unlock className="h-4 w-4 mr-2" />Abrir Caixa</Button></>}
          </div>
        </div>
        {session && <Card className="border-success/20 bg-success/5"><CardContent className="py-4"><div className="flex flex-wrap items-center gap-6 text-sm"><div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-success" /><span className="text-muted-foreground">Aberto em:</span><span className="font-medium">{format(new Date(session.openedAt), "dd/MM/yyyy")}</span></div><div className="flex items-center gap-2"><Clock className="h-4 w-4 text-success" /><span className="text-muted-foreground">Horário:</span><span className="font-medium">{format(new Date(session.openedAt), "HH:mm")}</span></div><div className="flex items-center gap-2"><FileText className="h-4 w-4 text-success" /><span className="text-muted-foreground">Saldo Inicial:</span><span className="font-medium">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(session.openingBalance)}</span></div></div></CardContent></Card>}
        <CashierStats {...stats} />
        <div><h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><FileText className="h-5 w-5 text-primary" />Relatório do Dia</h2><DailyReportCard report={dailyReport} /></div>
        <Card><CardHeader><CardTitle className="flex items-center justify-between"><span>Transações de Hoje</span><Badge variant="outline">{transactions.length} transações</Badge></CardTitle></CardHeader><CardContent><TransactionTable transactions={transactions} onView={(t) => { setSelectedTransaction(t); setIsDetailsDialogOpen(true); }} onDelete={handleDeleteTransaction} /></CardContent></Card>
      </div>
      <TransactionFormDialog open={isTransactionDialogOpen} onOpenChange={setIsTransactionDialogOpen} onSubmit={handleAddTransaction} guests={guests} />
      <TransactionDetailsDialog transaction={selectedTransaction} open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen} />
      <CashierSessionDialog open={isSessionDialogOpen} onOpenChange={setIsSessionDialogOpen} mode={sessionDialogMode} currentSession={session || undefined} expectedBalance={stats.balance} onOpenSession={handleOpenSession} onCloseSession={handleCloseSession} />
    </DashboardLayout>
  );
}
