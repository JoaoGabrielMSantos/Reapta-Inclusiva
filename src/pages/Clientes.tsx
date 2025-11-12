import { Layout } from "@/components/Layout";
import { MetricCard } from "@/components/MetricCard";
import { Card } from "@/components/ui/card";
import { Users, UserCheck, UserX, DollarSign } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Badge } from "@/components/ui/badge";

const distributionData = [
  { name: "Pessoa Jurídica", value: 65, color: "#3B82F6" },
  { name: "Pessoa Física", value: 35, color: "#10B981" },
];

const topClients = [
  { name: "Empresa ABC Ltda", purchases: 89, value: "R$ 145.200" },
  { name: "Comércio XYZ SA", purchases: 76, value: "R$ 128.900" },
  { name: "Indústria DEF", purchases: 64, value: "R$ 102.450" },
  { name: "Distribuidora GHI", purchases: 52, value: "R$ 88.100" },
  { name: "Varejo JKL", purchases: 45, value: "R$ 67.800" },
];

const clientsDetail = [
  { name: "Empresa ABC Ltda", purchases: 89, total: "R$ 145.200", status: "Ativo" },
  { name: "Comércio XYZ SA", purchases: 76, total: "R$ 128.900", status: "Ativo" },
  { name: "Indústria DEF", purchases: 64, total: "R$ 102.450", status: "Ativo" },
  { name: "Distribuidora GHI", purchases: 52, total: "R$ 88.100", status: "Ativo" },
  { name: "Varejo JKL", purchases: 45, total: "R$ 67.800", status: "Inativo" },
];

const Clientes = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Gestão de Clientes</h1>
          <p className="text-muted-foreground">Cadastro e análise de clientes</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total de Clientes"
            value="567"
            icon={<Users className="w-8 h-8" />}
            trend="3.1%"
            trendUp
          />
          <MetricCard
            title="Clientes Ativos"
            value="523"
            icon={<UserCheck className="w-8 h-8 text-success" />}
          />
          <MetricCard
            title="Clientes Inativos"
            value="44"
            icon={<UserX className="w-8 h-8 text-muted-foreground" />}
          />
          <MetricCard
            title="Ticket Médio/Cliente"
            value="R$ 578"
            icon={<DollarSign className="w-8 h-8" />}
            trend="5.2%"
            trendUp
          />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Distribuição por Tipo</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Clientes com Maior Volume de Compras</h3>
            <div className="space-y-4">
              {topClients.map((client, idx) => (
                <div key={idx} className="p-4 bg-secondary rounded-lg">
                  <p className="font-semibold">{client.name}</p>
                  <p className="text-sm text-muted-foreground mt-1">{client.purchases} compras</p>
                  <p className="text-xl font-bold text-primary mt-2">{client.value}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Relatório Detalhado de Clientes</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Cliente</th>
                  <th className="text-left py-3 px-4">Nº Compras</th>
                  <th className="text-left py-3 px-4">Valor Total</th>
                  <th className="text-left py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {clientsDetail.map((client, idx) => (
                  <tr key={idx} className="border-b hover:bg-secondary/50">
                    <td className="py-3 px-4 font-medium">{client.name}</td>
                    <td className="py-3 px-4">{client.purchases}</td>
                    <td className="py-3 px-4 font-semibold text-primary">{client.total}</td>
                    <td className="py-3 px-4">
                      <Badge variant={client.status === "Ativo" ? "default" : "secondary"}>
                        {client.status}
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

export default Clientes;
