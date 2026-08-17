import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Bed,
  DollarSign,
  UtensilsCrossed,
  Bot,
  BarChart3,
  Settings,
  LogOut,
  Hotel,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Users, label: "Hóspedes", path: "/dashboard/hospedes" },
  { icon: Bed, label: "Quartos", path: "/dashboard/quartos" },
  { icon: CalendarDays, label: "Reservas", path: "/dashboard/reservas" },
  { icon: DollarSign, label: "Caixa", path: "/dashboard/caixa" },
  { icon: UtensilsCrossed, label: "Restaurante", path: "/dashboard/restaurante" },
  { icon: Bot, label: "Assistente IA", path: "/dashboard/assistente" },
  { icon: BarChart3, label: "Relatórios", path: "/dashboard/relatorios" },
  { icon: Settings, label: "Configurações", path: "/dashboard/config" },
];

interface DashboardSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function DashboardSidebar({
  collapsed,
  onToggle,
  mobileOpen = false,
  onCloseMobile,
}: DashboardSidebarProps) {
  const location = useLocation();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-[100dvh] bg-sidebar text-sidebar-foreground transition-transform lg:transition-all duration-300 z-50 flex flex-col",
        collapsed ? "lg:w-20" : "lg:w-64",
        "w-64 max-w-[85vw]",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
    >
      {/* Logo */}
      <div className="p-4 border-b border-sidebar-border flex items-center justify-between gap-2">
        <Link to="/" className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 gradient-gold rounded-lg flex items-center justify-center flex-shrink-0">
            <Hotel className="w-6 h-6 text-primary" />
          </div>
          <span
            className={cn(
              "text-xl font-display font-bold text-sidebar-foreground truncate",
              collapsed && "lg:hidden"
            )}
          >
            Hospeda<span className="text-sidebar-primary">IA</span>
          </span>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Fechar menu"
          onClick={onCloseMobile}
          className="lg:hidden text-sidebar-foreground hover:bg-sidebar-accent flex-shrink-0"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200",
                collapsed && "lg:justify-center",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "hover:bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className={cn("font-medium truncate", collapsed && "lg:hidden")}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Toggle Button (desktop only) */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggle}
        className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 rounded-full bg-sidebar-accent border border-sidebar-border hover:bg-sidebar-primary hover:text-sidebar-primary-foreground"
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </Button>

      {/* User Section */}
      <div className="p-4 border-t border-sidebar-border">
        <div className={cn("flex items-center gap-3", collapsed && "lg:justify-center")}>
          <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-semibold text-sidebar-accent-foreground">AD</span>
          </div>
          <div className={cn("flex-1 min-w-0", collapsed && "lg:hidden")}>
            <p className="text-sm font-medium text-sidebar-foreground truncate">Admin</p>
            <p className="text-xs text-sidebar-foreground/60 truncate">admin@hotel.com</p>
          </div>
          <Link to="/" className={cn(collapsed && "lg:hidden")}>
            <Button variant="ghost" size="icon" className="text-sidebar-foreground hover:text-sidebar-primary">
              <LogOut className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </aside>
  );
}
