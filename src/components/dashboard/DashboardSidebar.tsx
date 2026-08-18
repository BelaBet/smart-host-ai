import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  UsersRound,
  BedDouble,
  WalletCards,
  Utensils,
  Bot,
  ChartNoAxesCombined,
  SlidersHorizontal,
  LogOut,
  Hotel,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  ClipboardCheck,
  X,
  CreditCard,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: UsersRound, label: "Hóspedes", path: "/dashboard/hospedes" },
  { icon: BedDouble, label: "Quartos", path: "/dashboard/quartos" },
  { icon: CalendarDays, label: "Reservas", path: "/dashboard/reservas" },
  { icon: WalletCards, label: "Caixa", path: "/dashboard/caixa" },
  { icon: Utensils, label: "Restaurante", path: "/dashboard/restaurante" },
  { icon: Bot, label: "Assistente IA", path: "/dashboard/assistente" },
  { icon: ChartNoAxesCombined, label: "Relatórios", path: "/dashboard/relatorios" },
  { icon: ClipboardCheck, label: "Auditoria", path: "/dashboard/auditoria" },
  { icon: CreditCard, label: "Assinatura", path: "/dashboard/assinatura" },
  { icon: SlidersHorizontal, label: "Configurações", path: "/dashboard/config" },
];

export function DashboardSidebar({
  collapsed,
  onToggle,
  mobileOpen = false,
  onCloseMobile,
}: {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}) {
  const location = useLocation();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-[100dvh] bg-sidebar text-sidebar-foreground transition-transform lg:transition-all duration-300 z-50 flex flex-col",
        collapsed ? "lg:w-20" : "lg:w-64",
        "w-64 max-w-[85vw]",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
      )}
    >
      <div className="p-4 border-b border-sidebar-border flex items-center justify-between gap-2">
        <Link to="/" className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 gradient-gold rounded-lg flex items-center justify-center">
            <Hotel className="w-6 h-6 text-primary" aria-hidden="true" />
          </div>
          <span className={cn("text-xl font-display font-bold truncate", collapsed && "lg:hidden")}>
            Hospeda<span className="text-sidebar-primary">IA</span>
          </span>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Fechar menu"
          onClick={onCloseMobile}
          className="lg:hidden"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </Button>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto" aria-label="Navegação principal">
        {menuItems.map((item) => {
          const active = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              aria-current={active ? "page" : undefined}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-lg transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                collapsed && "lg:justify-center",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "hover:bg-sidebar-accent",
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" strokeWidth={1.8} aria-hidden="true" />
              <span className={cn("font-medium truncate", collapsed && "lg:hidden")}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <Link
        to="/platform"
        title={collapsed ? "Super Admin" : undefined}
        className="m-4 flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-sidebar-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
      >
        <Building2 className="w-5 h-5 flex-shrink-0" strokeWidth={1.8} aria-hidden="true" />
        <span className={cn("font-medium", collapsed && "lg:hidden")}>Super Admin</span>
      </Link>

      <Button
        variant="ghost"
        size="icon"
        aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
        onClick={onToggle}
        className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 rounded-full"
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4" aria-hidden="true" />
        ) : (
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
        )}
      </Button>

      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center font-medium">
            AD
          </div>
          <div className={cn("flex-1 min-w-0", collapsed && "lg:hidden")}>
            <p className="text-sm font-medium truncate">Admin</p>
            <p className="text-xs text-muted-foreground truncate">Conta atual</p>
          </div>
          <Link to="/" title="Sair">
            <Button variant="ghost" size="icon" aria-label="Sair">
              <LogOut className="w-4 h-4" aria-hidden="true" />
            </Button>
          </Link>
        </div>
      </div>
    </aside>
  );
}
