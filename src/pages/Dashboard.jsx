import { DashboardCard } from "../components/DashboardCard";
import { DollarSign, TrendingUp, Users, Package } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from "recharts";

const monthlyData = [
  { month: "Jan", value: 115000 },
  { month: "Fev", value: 142000 },
  { month: "Mar", value: 128000 },
  { month: "Abr", value: 165000 },
  { month: "Mai", value: 158000 },
  { month: "Jun", value: 184000 },
];

const stateData = [
  { name: "SC", value: 14.4, color: "#3b82f6" },
  { name: "MT", value: 8.8, color: "#22c55e" },
  { name: "GO", value: 2.6, color: "#f59e0b" },
  { name: "BA", value: 3.1, color: "#ef4444" },
  { name: "ES", value: 3.0, color: "#06b6d4" },
];

const topClients = [
  { name: "Dalthon Curt Bosse", city: "BLUMENAU - SC", value: "R$ 77.155,35" },
  { name: "Jeovanio Isac De Jesus Sousa", city: "BARRA DO GARCAS - MT", value: "R$ 78.925,75" },
  { name: "Israel Teixeira Dos Santos", city: "PAULO AFONSO - BA", value: "R$ 27.965,31" },
  { name: "Carlos Garcia Amorim", city: "SERRA - ES", value: "R$ 26.469,15" },
];

const Dashboard = () => {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard Geral</h1>
        <p className="text-muted-foreground">Visão consolidada do negócio - Dados reais 2025</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          title="Faturamento Total"
          value="R$ 892.388,26"
          change="12.5%"
          icon={DollarSign}
          iconColor="text-green-600"
        />
        <DashboardCard
          title="Lucro Total"
          value="R$ 289.532,87"
          change="15.3%"
          icon={TrendingUp}
          iconColor="text-primary"
        />
        <DashboardCard
          title="Clientes Ativos"
          value="14"
          change="3.1%"
          icon={Users}
          iconColor="text-primary"
        />
        <DashboardCard
          title="Produtos Vendidos"
          value="1.129"
          icon={Package}
          iconColor="text-green-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-lg bg-white shadow">
          <div className="p-4 border-b">
            <h3 className="text-sm font-medium">Faturamento Mensal</h3>
          </div>
          <div className="p-4">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg bg-white shadow">
          <div className="p-4 border-b">
            <h3 className="text-sm font-medium">Vendas por Estado (Top 5)</h3>
          </div>
          <div className="p-4">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stateData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stateData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="rounded-lg bg-white shadow">
          <div className="p-4 border-b">
            <h3 className="text-sm font-medium">Métricas Financeiras</h3>
          </div>
          <div className="p-4 space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Ticket Médio</p>
              <p className="text-2xl font-bold text-primary">R$ 1742.95</p>
            </div>
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Total em Compras</p>
              <p className="text-2xl font-bold text-primary">R$ 3.343,33</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white shadow">
          <div className="p-4 border-b">
            <h3 className="text-sm font-medium">Contas a Receber</h3>
          </div>
          <div className="p-4 space-y-4">
            <div className="bg-warning/10 p-4 rounded-lg border border-warning/20">
              <p className="text-sm text-muted-foreground">A Receber</p>
              <p className="text-2xl font-bold text-warning">R$ 45.230</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-sm text-muted-foreground">Recebido</p>
              <p className="text-2xl font-bold text-green-600">R$ 758.530,021</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white shadow">
          <div className="p-4 border-b">
            <h3 className="text-sm font-medium">Top 4 Clientes</h3>
          </div>
          <div className="p-4 space-y-3">
            {topClients.map((client, index) => (
              <div key={index} className="bg-muted/30 p-3 rounded-lg">
                <p className="font-semibold text-sm">{client.name}</p>
                <p className="text-xs text-muted-foreground">{client.city}</p>
                <p className="text-primary font-bold mt-1">{client.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
