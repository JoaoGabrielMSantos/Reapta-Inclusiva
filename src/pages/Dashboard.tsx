import { Layout } from "@/components/Layout";
import { MetricCard } from "@/components/MetricCard";
import { Card } from "@/components/ui/card";
import { DollarSign, TrendingUp, Users, Package } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const monthlyRevenue = [
  { month: "Jan", value: 120500 },
  { month: "Fev", value: 145800 },
  { month: "Mar", value: 132900 },
  { month: "Abr", value: 168200 },
  { month: "Mai", value: 156700 },
  { month: "Jun", value: 168288 },
];

const salesByState = [
  { name: "SC", value: 158220, color: "#3B82F6" },
  { name: "MT", value: 78926, color: "#10B981" },
  { name: "BA", value: 27965, color: "#F59E0B" },
  { name: "ES", value: 26469, color: "#06B6D4" },
  { name: "GO", value: 23097, color: "#EF4444" },
];

const topClients = [
  { name: "Dalthon Curt Bosse", location: "BLUMENAU - SC", value: "R$ 77.155,35" },
  { name: "Jeovanio Isac De Jesus Sousa", location: "BARRA DO GARCAS - MT", value: "R$ 78.925,75" },
  { name: "Israel Teixeira Dos Santos", location: "PAULO AFONSO - BA", value: "R$ 27.965,31" },
  { name: "Carlos Garcia Amorim", location: "SERRA - ES", value: "R$ 26.469,15" },
];

const Dashboard = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard Geral</h1>
          <p className="text-muted-foreground">Visão consolidada do negócio - Dados reais 2025</p>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Faturamento Total"
            value="R$ 892.388,26"
            icon={<DollarSign className="w-8 h-8" />}
            trend="12.5%"
            trendUp
          />
          <MetricCard
            title="Lucro Total"
            value="R$ 289.532,87"
            icon={<TrendingUp className="w-8 h-8" />}
            trend="15.3%"
            trendUp
          />
          <MetricCard
            title="Clientes Ativos"
            value="14"
            icon={<Users className="w-8 h-8" />}
            trend="3.1%"
            trendUp
          />
          <MetricCard
            title="Produtos Vendidos"
            value="1.129"
            icon={<Package className="w-8 h-8" />}
          />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Faturamento Mensal</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`} />
                <Bar dataKey="value" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Vendas por Estado (Top 5)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={salesByState}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {salesByState.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Métricas Financeiras</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-secondary rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Ticket Médio</p>
                  <p className="text-2xl font-bold text-primary">R$ 1742.95</p>
                </div>
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
              <div className="flex justify-between items-center p-4 bg-secondary rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Total em Compras</p>
                  <p className="text-2xl font-bold text-primary">R$ 3.343,33</p>
                </div>
                <Package className="w-8 h-8 text-primary" />
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Contas a Receber</h3>
            <div className="space-y-4">
              <div className="p-4 bg-warning/10 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">A Receber</p>
                <p className="text-2xl font-bold text-warning">R$ 45.230</p>
              </div>
              <div className="p-4 bg-success/10 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Recebido</p>
                <p className="text-2xl font-bold text-success">R$ 758.530,021</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Top 4 Clientes</h3>
            <div className="space-y-3">
              {topClients.map((client, idx) => (
                <div key={idx} className="p-3 bg-secondary rounded-lg">
                  <p className="font-semibold text-sm">{client.name}</p>
                  <p className="text-xs text-muted-foreground">{client.location}</p>
                  <p className="text-lg font-bold text-primary mt-1">{client.value}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
