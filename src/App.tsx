import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { RequireAuth } from "@/components/RequireAuth";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Estoque from "./pages/Estoque";
import Vendas from "./pages/Vendas";
import Compras from "./pages/Compras";
import Produtos from "./pages/Produtos";
import Clientes from "./pages/Clientes";
import Cadastro from "./pages/Cadastro";
import Fornecedores from "./pages/Fornecedores";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* root: always show login first */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />

          {/* protected routes */}
          <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
          <Route path="/estoque" element={<RequireAuth><Estoque /></RequireAuth>} />
          <Route path="/vendas" element={<RequireAuth><Vendas /></RequireAuth>} />
          <Route path="/compras" element={<RequireAuth><Compras /></RequireAuth>} />
          <Route path="/produtos" element={<RequireAuth><Produtos /></RequireAuth>} />
          <Route path="/clientes" element={<RequireAuth><Clientes /></RequireAuth>} />
          <Route path="/fornecedores" element={<RequireAuth><Fornecedores /></RequireAuth>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
