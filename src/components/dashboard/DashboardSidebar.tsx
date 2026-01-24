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
} from "lucide-react";
import { useState } from "react";
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
}

export function DashboardSidebar({ collapsed, onToggle }: DashboardSidebarProps) {
  const location = useLocation();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-sidebar text-sidebar-foreground transition-all duration-300 z-50 flex flex-col",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="p-4 border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 gradient-gold rounded-lg flex items-center justify-center flex-shrink-0">
            <Hotel className="w-6 h-6 text-primary" />
          </div>
          {!collapsed && (
            <span className="text-xl font-display font-bold text-sidebar-foreground">
              Hospeda<span className="text-sidebar-primary">IA</span>
            </span>
          )}
        </Link>
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
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "hover:bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggle}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-sidebar-accent border border-sidebar-border hover:bg-sidebar-primary hover:text-sidebar-primary-foreground"
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </Button>

      {/* User Section */}
      <div className="p-4 border-t border-sidebar-border">
        <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
          <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-semibold text-sidebar-accent-foreground">AD</span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">Admin</p>
              <p className="text-xs text-sidebar-foreground/60 truncate">admin@hotel.com</p>
            </div>
          )}
          {!collapsed && (
            <Link to="/">
              <Button variant="ghost" size="icon" className="text-sidebar-foreground hover:text-sidebar-primary">
                <LogOut className="w-4 h-4" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </aside>
  );
}
