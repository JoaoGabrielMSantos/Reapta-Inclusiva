import React, { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { MetricCard } from "@/components/MetricCard";
import { Card } from "@/components/ui/card";
import { ShoppingCart, DollarSign, TrendingUp, Users } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type SaleRow = {
  situacao: string;
  numero: string;
  tipo: string;
  vendedor: string;
  cliente: string;
  municipio: string;
  estado: string;
  telefone?: string;
  entrega?: string;
  total: number;
};

function parseSalesCsv(csv: string): SaleRow[] {
  const lines = csv.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  let headerIndex = lines.findIndex(ln => /situa/i.test(ln) && /n[úu]mero|numero/i.test(ln));
  if (headerIndex === -1) headerIndex = 0;
  const dataLines = lines.slice(headerIndex + 1);
  const rows: SaleRow[] = [];
  for (const line of dataLines) {
    if (/\<\/?(html|!doctype|div|span|script|body|head)/i.test(line)) continue;
    const cols = line.split(';');
    const situacao = (cols[0] ?? '').trim();
    const numero = (cols[1] ?? '').trim();
    const tipo = (cols[2] ?? '').trim();
    const vendedor = (cols[3] ?? '').trim();
    const cliente = (cols[4] ?? '').trim();
    const municipio = (cols[5] ?? '').trim();
    const estado = (cols[6] ?? '').trim();
    const telefone = (cols[7] ?? '').trim();
    const entrega = (cols[9] ?? '').trim();
    const totalRaw = (cols[15] ?? '').trim();
    const total = parseInt(totalRaw.replace(/[^0-9-]/g, '')) || 0;
    if (!cliente && !numero) continue;
    rows.push({ situacao, numero, tipo, vendedor, cliente, municipio, estado, telefone, entrega, total });
  }
  return rows;
}

const Vendas = () => {
  const [rows, setRows] = useState<SaleRow[]>([]);
  const [salesByState, setSalesByState] = useState<Array<{ state: string; value: number }>>([]);
  const [clientDetails, setClientDetails] = useState<Array<{ name: string; location: string; total: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const csvPath = '/data/relatario_de_vendas.csv';
    fetch(csvPath)
      .then(res => {
        if (!res.ok) throw new Error(`CSV não encontrado em ${csvPath} (status ${res.status})`);
        const ct = res.headers.get('content-type') || '';
        if (ct.includes('text/html')) throw new Error(`Resposta HTML recebida em vez de CSV. Verifique se ${csvPath} existe e está em public/`);
        return res.text();
      })
      .then(text => {
        if (/\<\/?html/i.test(text)) throw new Error(`Conteúdo HTML recebido em vez de CSV. Verifique o caminho ${csvPath}`);
        const parsed = parseSalesCsv(text);
        setRows(parsed);

        const byState: Record<string, number> = {};
        parsed.forEach(r => {
          const key = r.estado || 'SEM_ESTADO';
          byState[key] = (byState[key] || 0) + (r.total || 0);
        });
        const states = Object.entries(byState).map(([k, v]) => ({ state: k, value: v }));
        states.sort((a, b) => b.value - a.value);
        setSalesByState(states.slice(0, 12));

        const clients = parsed.map(p => ({ name: p.cliente, location: p.municipio, total: `R$ ${p.total.toLocaleString('pt-BR')}` }));
        setClientDetails(clients.slice(0, 50));

        setLoading(false);
      })
      .catch(err => {
        setError(String(err));
        setLoading(false);
      });
  }, []);
  // métricas derivadas
  const totalSalesCount = rows.length;
  const faturamento = rows.reduce((s, r) => s + (r.total || 0), 0);
  const ticketMedio = totalSalesCount > 0 ? Math.round((faturamento / totalSalesCount) * 100) / 100 : 0;
  const clientesSet = new Set(rows.map(r => r.cliente).filter(Boolean));
  const clientesUnicos = clientesSet.size;

  // agrega por cliente: número de pedidos e total
  const clientsMap: Record<string, { name: string; location: string; orders: number; total: number }> = {};
  rows.forEach(r => {
    const key = r.cliente || '(sem nome)';
    if (!clientsMap[key]) clientsMap[key] = { name: key, location: r.municipio || '', orders: 0, total: 0 };
    clientsMap[key].orders += 1;
    clientsMap[key].total += r.total || 0;
  });
  const clientsArray = Object.values(clientsMap).sort((a, b) => b.total - a.total);

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Análise de Vendas</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total de Vendas"
            value={totalSalesCount.toString()}
            icon={<ShoppingCart className="w-8 h-8" />}
          />
          <MetricCard
            title="Faturamento"
            value={`R$ ${faturamento.toLocaleString('pt-BR')}`}
            icon={<DollarSign className="w-8 h-8" />}
            trend="-"
          />
          <MetricCard
            title="Ticket Médio"
            value={`R$ ${ticketMedio.toLocaleString('pt-BR')}`}
            icon={<TrendingUp className="w-8 h-8" />}
          />
          <MetricCard
            title="Clientes Únicos"
            value={clientesUnicos.toString()}
            icon={<Users className="w-8 h-8" />}
          />
        </div>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Faturamento por Estado</h3>
          {loading ? (
            <div>Carregando dados...</div>
          ) : error ? (
            <div className="text-red-600">Carregue `relatorio_de_vendas.csv` na pagina de uploads do sistema</div>
          ) : (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={salesByState}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="state" />
                <YAxis />
                <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`} />
                <Bar dataKey="value" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Detalhamento de Vendas por Cliente</h3>
          {loading ? (
            <div>Carregando...</div>
          ) : (
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
                  {clientsArray.map((client, idx) => (
                    <tr key={idx} className="border-b hover:bg-secondary/50">
                      <td className="py-3 px-4 font-medium">{client.name}</td>
                      <td className="py-3 px-4">{client.location}</td>
                      <td className="py-3 px-4">{client.orders}</td>
                      <td className="py-3 px-4 font-semibold text-primary">{`R$ ${client.total.toLocaleString('pt-BR')}`}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default Vendas;
