import { Layout } from "@/components/Layout";
import { MetricCard } from "@/components/MetricCard";
import { Card } from "@/components/ui/card";
import { Package, AlertTriangle, AlertCircle, CheckCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Badge } from "@/components/ui/badge";

const categoryData = [
  { category: "Eletrônicos", quantity: 2150 },
  { category: "Vestuário", quantity: 1890 },
  { category: "Alimentos", quantity: 2340 },
  { category: "Móveis", quantity: 1420 },
  { category: "Ferramentas", quantity: 1145 },
];

const lowStockProducts = [
  { product: "Produto A", sku: "SKU-001", current: 5, minimum: 20, status: "critical" },
  { product: "Produto B", sku: "SKU-002", current: 12, minimum: 30, status: "warning" },
  { product: "Produto C", sku: "SKU-003", current: 18, minimum: 25, status: "warning" },
  { product: "Produto D", sku: "SKU-004", current: 3, minimum: 15, status: "critical" },
];

const Estoque = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Gestão de Estoque</h1>
          <p className="text-muted-foreground">Controle e movimentação de produtos</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total de Produtos"
            value="8.945"
            icon={<Package className="w-8 h-8" />}
          />
          <MetricCard
            title="Estoque Baixo"
            value="23"
            icon={<AlertTriangle className="w-8 h-8 text-warning" />}
          />
          <MetricCard
            title="Estoque Crítico"
            value="7"
            icon={<AlertCircle className="w-8 h-8 text-destructive" />}
          />
          <MetricCard
            title="Em Conformidade"
            value="8.915"
            icon={<CheckCircle className="w-8 h-8 text-success" />}
          />
        </div>
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Quantidade por Categoria</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="quantity" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Produtos com Estoque Baixo</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Produto</th>
                  <th className="text-left py-3 px-4">SKU</th>
                  <th className="text-left py-3 px-4">Quantidade Atual</th>
                  <th className="text-left py-3 px-4">Mínimo</th>
                  <th className="text-left py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {lowStockProducts.map((item, idx) => (
                  <tr key={idx} className="border-b hover:bg-secondary/50">
                    <td className="py-3 px-4">{item.product}</td>
                    <td className="py-3 px-4">{item.sku}</td>
                    <td className="py-3 px-4">{item.current}</td>
                    <td className="py-3 px-4">{item.minimum}</td>
                    <td className="py-3 px-4">
                      <Badge variant={item.status === "critical" ? "destructive" : "default"}>
                        {item.status === "critical" ? "Crítico" : "Atenção"}
                      </Badge>
                    </td>
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

export default Estoque;
