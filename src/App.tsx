import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Checkout from "./pages/Checkout";
import Dashboard from "./pages/Dashboard";
import Hospedes from "./pages/Hospedes";
import Quartos from "./pages/Quartos";
import Caixa from "./pages/Caixa";
import Restaurante from "./pages/Restaurante";
import Relatorios from "./pages/Relatorios";
import Reservas from "./pages/Reservas";
import Auditoria from "./pages/Auditoria";
import SuperAdmin from "./pages/SuperAdmin";
import Onboarding from "./pages/Onboarding";
import Assinatura from "./pages/Assinatura";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();
const App = () => <QueryClientProvider client={queryClient}><AuthProvider><TooltipProvider><Toaster/><Sonner/><BrowserRouter><Routes>
<Route path="/" element={<Index/>}/><Route path="/login" element={<Login/>}/><Route path="/checkout" element={<Checkout/>}/><Route path="/onboarding" element={<ProtectedRoute><Onboarding/></ProtectedRoute>}/><Route path="/reset-password" element={<ResetPassword/>}/>
<Route path="/dashboard" element={<ProtectedRoute><Dashboard/></ProtectedRoute>}/><Route path="/dashboard/hospedes" element={<ProtectedRoute><Hospedes/></ProtectedRoute>}/><Route path="/dashboard/quartos" element={<ProtectedRoute><Quartos/></ProtectedRoute>}/><Route path="/dashboard/caixa" element={<ProtectedRoute><Caixa/></ProtectedRoute>}/><Route path="/dashboard/restaurante" element={<ProtectedRoute><Restaurante/></ProtectedRoute>}/><Route path="/dashboard/relatorios" element={<ProtectedRoute><Relatorios/></ProtectedRoute>}/><Route path="/dashboard/reservas" element={<ProtectedRoute><Reservas/></ProtectedRoute>}/><Route path="/dashboard/auditoria" element={<ProtectedRoute><Auditoria/></ProtectedRoute>}/><Route path="/dashboard/assinatura" element={<ProtectedRoute><Assinatura/></ProtectedRoute>}/><Route path="/platform" element={<ProtectedRoute><SuperAdmin/></ProtectedRoute>}/>
<Route path="*" element={<NotFound/>}/></Routes></BrowserRouter></TooltipProvider></AuthProvider></QueryClientProvider>;
export default App;
