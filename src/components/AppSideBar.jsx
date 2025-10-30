import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  ShoppingBag,
  Box,
  Users,
  Truck,
  FileText,
  ArrowDownCircle,
  ArrowUpCircle,
} from "lucide-react";
// Simple sidebar implementation using plain HTML (avoid missing UI imports)

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Estoque", url: "/estoque", icon: Package },
  { title: "Vendas", url: "/vendas", icon: ShoppingCart },
  { title: "Compras", url: "/compras", icon: ShoppingBag },
  { title: "Produtos", url: "/produtos", icon: Box },
  { title: "Clientes", url: "/clientes", icon: Users },
  { title: "Fornecedores", url: "/fornecedores", icon: Truck },
  { title: "Fiscal", url: "/fiscal", icon: FileText },
  { title: "Contas a Receber", url: "/contas-receber", icon: ArrowDownCircle },
  { title: "Contas a Pagar", url: "/contas-pagar", icon: ArrowUpCircle },
];

export function AppSidebar() {
  return (
    <aside className="w-64 border-r px-4 py-6">
      <h1 className="text-xl font-bold mb-4">REAPTA INCLUSIVA</h1>
      <nav>
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.title}>
              <NavLink
                to={item.url}
                end
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md ${
                    isActive ? 'bg-gray-100 font-semibold' : 'hover:bg-gray-50'
                  }`
                }
              >
                <item.icon className="h-5 w-5" />
                <span>{item.title}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
