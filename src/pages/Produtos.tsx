import { Layout } from "@/components/Layout";
import { MetricCard } from "@/components/MetricCard";
import { Card } from "@/components/ui/card";
import { Package, DollarSign, TrendingUp, Tag } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const salesByState = [
  { state: "SP", value: 58165 },
  { state: "SC", value: 51044 },
  { state: "MG", value: 50589 },
  { state: "DF", value: 35000 },
  { state: "RJ", value: 28000 },
  { state: "PA", value: 18000 },
  { state: "BA", value: 15000 },
  { state: "RS", value: 12000 },
];

const salesByCategory = [
  { category: "Contenção", value: 138000 },
  { category: "Proteção", value: 98000 },
  { category: "Mobilidade", value: 85000 },
  { category: "Higiene", value: 67000 },
];

const topProducts = [
  { product: "Cinto abdominal com velcro M", quantity: 285, revenue: "R$ 63.506,60" },
  { product: "Trocador de fraldas adulto", quantity: 166, revenue: "R$ 50.589,23" },
  { product: "Bolsa para cadeira de rodas", quantity: 98, revenue: "R$ 52.784,90" },
  { product: "Avental protetor imperveável", quantity: 139, revenue: "R$ 23.196,10" },
  { product: "Par de luva G", quantity: 125, revenue: "R$ 11.184,93" },
];

const Produtos = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Análise de Produtos</h1>
          <p className="text-muted-foreground">Vendas por produto e desempenho</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Vendido"
            value="1.129"
            icon={<Package className="w-8 h-8" />}
          />
          <MetricCard
            title="Lucro Total"
            value="R$ 289.532,87"
            icon={<DollarSign className="w-8 h-8" />}
            trend="18.5%"
            trendUp
          />
          <MetricCard
            title="Lucro Médio/Unidade"
            value="R$ 256,451"
            icon={<TrendingUp className="w-8 h-8" />}
          />
          <MetricCard
            title="Categorias Ativas"
            value="4"
            icon={<Tag className="w-8 h-8" />}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Vendas por Estado</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesByState}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="state" />
                <YAxis />
                <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`} />
                <Bar dataKey="value" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Vendas por Categoria</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesByCategory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`} />
                <Bar dataKey="value" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Top Produtos por Vendas</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Produto</th>
                  <th className="text-left py-3 px-4">Quantidade</th>
                  <th className="text-left py-3 px-4">Receita Total</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((product, idx) => (
                  <tr key={idx} className="border-b hover:bg-secondary/50">
                    <td className="py-3 px-4 font-medium">{product.product}</td>
                    <td className="py-3 px-4">{product.quantity}</td>
                    <td className="py-3 px-4 font-semibold text-primary">{product.revenue}</td>
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

export default Produtos;
