export type PaymentMethod = "cash" | "credit" | "debit" | "pix" | "transfer";
export type TransactionType = "income" | "expense";
export type TransactionCategory = 
  | "hospedagem" 
  | "restaurante" 
  | "frigobar" 
  | "lavanderia" 
  | "estacionamento" 
  | "outros"
  | "despesa-operacional"
  | "despesa-pessoal"
  | "fornecedor";

export interface Transaction {
  id: string;
  type: TransactionType;
  category: TransactionCategory;
  description: string;
  amount: number;
  paymentMethod: PaymentMethod;
  guestId?: string;
  guestName?: string;
  roomNumber?: string;
  createdAt: string;
  createdBy: string;
}

export interface CashierSession {
  id: string;
  openedAt: string;
  closedAt?: string;
  openingBalance: number;
  closingBalance?: number;
  expectedBalance?: number;
  difference?: number;
  status: "open" | "closed";
  openedBy: string;
  closedBy?: string;
  notes?: string;
}

export interface DailyReport {
  date: string;
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  transactionsByCategory: Record<TransactionCategory, number>;
  transactionsByPaymentMethod: Record<PaymentMethod, number>;
  transactionCount: number;
}

export const paymentMethodConfig: Record<PaymentMethod, { label: string; icon: string }> = {
  cash: { label: "Dinheiro", icon: "Banknote" },
  credit: { label: "Crédito", icon: "CreditCard" },
  debit: { label: "Débito", icon: "CreditCard" },
  pix: { label: "PIX", icon: "Smartphone" },
  transfer: { label: "Transferência", icon: "ArrowRightLeft" },
};

export const transactionCategoryConfig: Record<TransactionCategory, { label: string; type: TransactionType }> = {
  hospedagem: { label: "Hospedagem", type: "income" },
  restaurante: { label: "Restaurante", type: "income" },
  frigobar: { label: "Frigobar", type: "income" },
  lavanderia: { label: "Lavanderia", type: "income" },
  estacionamento: { label: "Estacionamento", type: "income" },
  outros: { label: "Outros", type: "income" },
  "despesa-operacional": { label: "Despesa Operacional", type: "expense" },
  "despesa-pessoal": { label: "Despesa Pessoal", type: "expense" },
  fornecedor: { label: "Fornecedor", type: "expense" },
};
