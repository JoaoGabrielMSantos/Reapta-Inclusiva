import { Layout } from "@/components/Layout";
import { MetricCard } from "@/components/MetricCard";
import { Card } from "@/components/ui/card";
import { ShoppingBag, Package, DollarSign, Building2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

const supplierData = [
  { name: "A & F COMERCIO DE PLASTICOS LTDA", value: 2032.50 },
  { name: "PONTUAL COMERCIO DE EMBALAGENS LTDA", value: 389.10 },
  { name: "COMERCIAL DE PLASTICOS LR EIRELI", value: 630.00 },
  { name: "BROADWAY REVESTIMENTOS", value: 295.00 },
  { name: "MALHARIA IPANEMA LTDA", value: 42.73 },
];

const monthlyPurchases = [
  { month: "Jan", value: 556 },
  { month: "Fev", value: 722 },
  { month: "Mar", value: 845 },
  { month: "Abr", value: 624 },
  { month: "Mai", value: 890 },
  { month: "Jun", value: 706 },
];

const suppliers = [
  { name: "A & F COMERCIO DE PLASTICOS LTDA", orders: 11, total: "R$ 2.032,50" },
  { name: "PONTUAL COMERCIO DE EMBALAGENS LTDA", orders: 6, total: "R$ 389,10" },
  { name: "COMERCIAL DE PLASTICOS LR EIRELI", orders: 2, total: "R$ 630,00" },
  { name: "BROADWAY REVESTIMENTOS", orders: 1, total: "R$ 295,00" },
  { name: "MALHARIA IPANEMA LTDA", orders: 2, total: "R$ 42,73" },
];

const Compras = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Gestão de Compras</h1>
          <p className="text-muted-foreground">Controle de compras e fornecedores</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total em Compras"
            value="R$ 3.343,33"
            icon={<DollarSign className="w-8 h-8" />}
          />
          <MetricCard
            title="Total de Itens"
            value="132.5"
            icon={<Package className="w-8 h-8" />}
          />
          <MetricCard
            title="Custo Médio/Item"
            value="R$ 25,228"
            icon={<ShoppingBag className="w-8 h-8" />}
          />
          <MetricCard
            title="Fornecedores Ativos"
            value="5"
            icon={<Building2 className="w-8 h-8" />}
          />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Compras por Fornecedor</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={supplierData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`} />
                <Bar dataKey="value" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Compras Mensais</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyPurchases}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`} />
                <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Fornecedores - Resumo</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Fornecedor</th>
                  <th className="text-left py-3 px-4">Nº Pedidos</th>
                  <th className="text-left py-3 px-4">Valor Total</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map((supplier, idx) => (
                  <tr key={idx} className="border-b hover:bg-secondary/50">
                    <td className="py-3 px-4 font-medium">{supplier.name}</td>
                    <td className="py-3 px-4">{supplier.orders}</td>
                    <td className="py-3 px-4 font-semibold text-primary">{supplier.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default Compras;
