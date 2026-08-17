import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarPlus, Contact, WalletCards, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const actions = [
  { label: "Nova reserva", path: "/dashboard/reservas", icon: CalendarPlus, shortcut: "R" },
  { label: "Hóspedes", path: "/dashboard/hospedes", icon: Contact, shortcut: "H" },
  { label: "Caixa", path: "/dashboard/caixa", icon: WalletCards, shortcut: "C" },
];

export function QuickActions() {
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLSelectElement) return;
      if (!event.altKey) return;
      const action = actions.find(item => item.shortcut.toLowerCase() === event.key.toLowerCase());
      if (action) { event.preventDefault(); navigate(action.path); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [navigate]);

  return (
    <Card>
      <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Search className="h-4 w-4" />Acesso rápido</CardTitle></CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {actions.map(({ label, path, icon: Icon, shortcut }) => (
          <Button key={path} variant="outline" className="justify-between h-auto py-3" onClick={() => navigate(path)}>
            <span className="flex items-center gap-2 min-w-0"><Icon className="h-4 w-4 shrink-0" /><span className="truncate">{label}</span></span>
            <kbd className="hidden sm:inline-flex rounded border px-1.5 text-[10px] text-muted-foreground">Alt+{shortcut}</kbd>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
