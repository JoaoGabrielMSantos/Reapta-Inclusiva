import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  ShoppingBag, 
  Box,
  Users,
  UserPlus,
  Building2,
  FileText,
  CreditCard,
  Wallet
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: ReactNode;
}

  const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Package, label: "Estoque", path: "/estoque" },
  { icon: ShoppingCart, label: "Vendas", path: "/vendas" },
  { icon: ShoppingBag, label: "Compras", path: "/compras" },
  { icon: Box, label: "Produtos", path: "/produtos" },
  { icon: Users, label: "Clientes", path: "/clientes" },
  { icon: Building2, label: "Fornecedores", path: "/fornecedores" },
  { icon: FileText, label: "Uploads", path: "/uploads" },
  { icon: UserPlus, label: "Cadastro", path: "/cadastro" },
];

export const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="w-64 bg-[hsl(var(--sidebar-background))] text-[hsl(var(--sidebar-foreground))] fixed h-full overflow-y-auto">
        <div className="p-6">
          <h1 className="text-xl font-bold">REAPTA INCLUSIVA</h1>
        </div>
        <nav className="px-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                  isActive
                    ? "bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-accent-foreground))]"
                    : "hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))]"
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="ml-64 flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
