import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Hospedes from "./pages/Hospedes";
import Quartos from "./pages/Quartos";
import Caixa from "./pages/Caixa";
import Restaurante from "./pages/Restaurante";
import Relatorios from "./pages/Relatorios";
import Reservas from "./pages/Reservas";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/hospedes" element={<Hospedes />} />
          <Route path="/dashboard/quartos" element={<Quartos />} />
          <Route path="/dashboard/caixa" element={<Caixa />} />
          <Route path="/dashboard/restaurante" element={<Restaurante />} />
          <Route path="/dashboard/relatorios" element={<Relatorios />} />
          <Route path="/dashboard/reservas" element={<Reservas />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
