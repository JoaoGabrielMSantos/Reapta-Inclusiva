import { Layout } from "@/components/Layout";
import { MetricCard } from "@/components/MetricCard";
import { Card } from "@/components/ui/card";
import { ShoppingCart, DollarSign, TrendingUp, Users } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const salesByState = [
  { state: "SC", value: 158220 },
  { state: "MT", value: 78926 },
  { state: "GO", value: 50000 },
  { state: "BA", value: 27965 },
  { state: "ES", value: 26469 },
  { state: "PA", value: 17546 },
  { state: "AL", value: 8443 },
  { state: "RN", value: 4905 },
];

const clientDetails = [
  { name: "Dalthon Curt Bosse", location: "BLUMENAU - SC", orders: 79, total: "R$ 77.155,35" },
  { name: "Jeovanio Isac De Jesus Sousa", location: "BARRA DO GARCAS - MT", orders: 33, total: "R$ 78.925,75" },
  { name: "Israel Teixeira Dos Santos", location: "PAULO AFONSO - BA", orders: 86, total: "R$ 27.965,31" },
  { name: "Carlos Garcia Amorim", location: "SERRA - ES", orders: 41, total: "R$ 26.469,15" },
  { name: "Darc Marilhants Silva Castro", location: "GOIÂNIA - GO", orders: 84, total: "R$ 23.097,18" },
  { name: "Rosanny Santana", location: "CASTANHAL - PA", orders: 21, total: "R$ 17.546,49" },
  { name: "Sidenia Maria Alves dantas", location: "N/A", orders: 77, total: "R$ 14.604,32" },
  { name: "Alexandre José", location: "MACEIÓ - AL", orders: 20, total: "R$ 8.443,47" },
  { name: "Ricardo Wildson", location: "JUCURUTU - RN", orders: 20, total: "R$ 4.904,59" },
  { name: "Leydiane Martins Coelho", location: "SÃO LUÍS - MA", orders: 13, total: "R$ 4.212,59" },
  { name: "Tiago Luz", location: "PALMAS - PARA", orders: 8, total: "R$ 3.988,48" },
  { name: "Cristina Correia Rodrigues", location: "ARACAJU - SE", orders: 17, total: "R$ 3.618,26" },
  { name: "Sandra Mascena", location: "CAMPINA GRANDE - PB", orders: 12, total: "R$ 2.553,55" },
  { name: "Ivandra Marlene", location: "EXTERIOR - EX", orders: 1, total: "R$ 1.113,45" },
];

const Vendas = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Análise de Vendas</h1>
          <p className="text-muted-foreground">Dados reais de vendas da empresa</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total de Vendas"
            value="512"
            icon={<ShoppingCart className="w-8 h-8" />}
          />
          <MetricCard
            title="Faturamento"
            value="R$ 892.388,26"
            icon={<DollarSign className="w-8 h-8" />}
            trend="12.5%"
            trendUp
          />
          <MetricCard
            title="Ticket Médio"
            value="R$ 1.742,95"
            icon={<TrendingUp className="w-8 h-8" />}
          />
          <MetricCard
            title="Clientes Únicos"
            value="14"
            icon={<Users className="w-8 h-8" />}
          />
        </div>
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Faturamento por Estado</h3>
          <ResponsiveContainer width="100%" height={350}>
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
          <h3 className="text-lg font-semibold mb-4">Detalhamento de Vendas por Cliente</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Cliente</th>
                  <th className="text-left py-3 px-4">Localização</th>
                  <th className="text-left py-3 px-4">Nº Pedidos</th>
                  <th className="text-left py-3 px-4">Valor Total</th>
                </tr>
              </thead>
              <tbody>
                {clientDetails.map((client, idx) => (
                  <tr key={idx} className="border-b hover:bg-secondary/50">
                    <td className="py-3 px-4 font-medium">{client.name}</td>
                    <td className="py-3 px-4">{client.location}</td>
                    <td className="py-3 px-4">{client.orders}</td>
                    <td className="py-3 px-4 font-semibold text-primary">{client.total}</td>
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

export default Vendas;
