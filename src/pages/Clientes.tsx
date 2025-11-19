import React, { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { MetricCard } from "@/components/MetricCard";
import { Card } from "@/components/ui/card";
import { Users, UserCheck, UserX, DollarSign } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Badge } from "@/components/ui/badge";

type ClientAgg = { name: string; purchases: number; revenue: number };

function parseCsvWithQuotes(text: string, delimiter = ';') {
  const rows: string[][] = [];
  let cur = '';
  let row: string[] = [];
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];
    if (ch === '"') {
      if (inQuotes && next === '"') { cur += '"'; i++; } else { inQuotes = !inQuotes; }
      continue;
    }
    if (ch === delimiter && !inQuotes) {
      row.push(cur);
      cur = '';
      continue;
    }
    if ((ch === '\n' || ch === '\r') && !inQuotes) {
      if (ch === '\r' && text[i + 1] === '\n') { i++; }
      row.push(cur);
      rows.push(row);
      row = [];
      cur = '';
      continue;
    }
    cur += ch;
  }
  if (cur !== '' || row.length > 0) {
    row.push(cur);
    rows.push(row);
  }
  return rows;
}

const Clientes = () => {
  const [distributionData, setDistributionData] = useState<Array<{ name: string; value: number; color: string }>>([]);
  const [topClients, setTopClients] = useState<ClientAgg[]>([]);
  const [clientsDetail, setClientsDetail] = useState<Array<{ name: string; purchases: number; total: string; status: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const path = '/data/relatario_de_vendas.csv';
    fetch(path)
      .then(res => {
        if (!res.ok) throw new Error(`CSV não encontrado em ${path} (status ${res.status})`);
        const ct = res.headers.get('content-type') || '';
        if (ct.includes('text/html')) throw new Error(`Resposta HTML recebida em vez de CSV. Verifique se ${path} existe e está em public/`);
        return res.text();
      })
      .then(text => {
        if (/<\/?html/i.test(text)) throw new Error(`Conteúdo HTML recebido em vez de CSV. Verifique o caminho ${path}`);
        const raw = parseCsvWithQuotes(text, ';');
        if (raw.length === 0) { setLoading(false); return; }

        // find header row
        const headerIdx = raw.findIndex(r => r.some(c => /cliente/i.test(c)) && r.some(c => /total/i.test(c)));
        const header = raw[headerIdx] || raw[0];
        const idxCliente = header.findIndex(h => /cliente/i.test(h));
        const idxTotal = header.findIndex(h => /total/i.test(h));

        const dataRows = raw.slice(headerIdx + 1);
        const map: Record<string, { purchases: number; revenue: number }> = {};
        for (const cols of dataRows) {
          if (!cols || cols.length === 0) continue;
          const cliente = (cols[idxCliente] || '').trim();
          if (!cliente) continue;
          const rawTotal = (cols[idxTotal] || '').toString().trim();
          const value = parseFloat(rawTotal.replace(/[^0-9,.-]/g, '').replace(/,/g, '.')) || 0;
          if (!map[cliente]) map[cliente] = { purchases: 0, revenue: 0 };
          map[cliente].purchases += 1;
          map[cliente].revenue += value;
        }

        const clients = Object.entries(map).map(([name, v]) => ({ name, purchases: v.purchases, revenue: v.revenue }));
        clients.sort((a, b) => b.revenue - a.revenue);

        // top clients for UI
        setTopClients(clients.slice(0, 5));

        // distribution PF/PJ by heuristic on name (containing corporate keywords)
        const pjRegex = /\b(LTDA|EIRELI|ME|S\.A\.|SA|COMPANHIA|INDUSTRIA|INDÚSTRIA|DISTRIBUIDORA|COMERCIO|COMÉRCIO|Ltda|Ltda\.|LTDA\.)\b/i;
        let pj = 0, pf = 0;
        clients.forEach(c => { if (pjRegex.test(c.name)) pj += 1; else pf += 1; });
        const totalClients = Math.max(1, pj + pf);
        setDistributionData([
          { name: 'Pessoa Jurídica', value: Math.round((pj / totalClients) * 100), color: '#3B82F6' },
          { name: 'Pessoa Física', value: Math.round((pf / totalClients) * 100), color: '#10B981' },
        ]);

        // clients detail
        setClientsDetail(clients.map(c => ({ name: c.name, purchases: c.purchases, total: `R$ ${c.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, status: c.purchases > 0 ? 'Ativo' : 'Inativo' })));

        setLoading(false);
      })
      .catch(err => { setError(String(err)); setLoading(false); });
  }, []);

  const totalClients = clientsDetail.length;
  const totalActive = clientsDetail.filter(c => c.status === 'Ativo').length;
  const totalInactive = totalClients - totalActive;
  const avgTicket = clientsDetail.length ? Math.round(clientsDetail.reduce((s, c) => s + parseFloat(c.total.replace(/[^0-9,.-]/g, '').replace(/,/g, '.')), 0) / clientsDetail.length) : 0;

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Gestão de Clientes</h1>
          <p className="text-muted-foreground">Cadastro e análise de clientes</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard title="Total de Clientes" value={String(totalClients)} icon={<Users className="w-8 h-8" />} />
          <MetricCard title="Clientes Ativos" value={String(totalActive)} icon={<UserCheck className="w-8 h-8 text-success" />} />
          <MetricCard title="Clientes Inativos" value={String(totalInactive)} icon={<UserX className="w-8 h-8 text-muted-foreground" />} />
          <MetricCard title="Ticket Médio/Cliente" value={`R$ ${avgTicket.toLocaleString('pt-BR')}`} icon={<DollarSign className="w-8 h-8" />} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-3">Distribuição por Tipo</h3>
            {loading ? (
              <div>Carregando dados...</div>
            ) : error ? (
              <div className="text-red-600">Carregue `relatorio_de_vendas.csv` na pagina de uploads do sistema.</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ percent }: any) => `${(percent * 100).toFixed(1)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" align="center" />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Clientes com Maior Volume de Compras</h3>
            {loading ? (
              <div>Carregando dados...</div>
            ) : error ? (
              <div className="text-red-600">Carregue `relatorio_de_vendas.csv` na pagina de uploads do sistema.</div>
            ) : (
              <div className="space-y-4">
                {topClients.map((client, idx) => (
                  <div key={idx} className="p-4 bg-secondary rounded-lg">
                    <p className="font-semibold">{client.name}</p>
                    <p className="text-sm text-muted-foreground mt-1">{client.purchases} compras</p>
                    <p className="text-xl font-bold text-primary mt-2">R$ {client.revenue.toLocaleString('pt-BR')}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Relatório Detalhado de Clientes</h3>
          {loading ? (
              <div>Carregando dados...</div>
            ) : error ? (
              <div className="text-red-600">Carregue `relatorio_de_vendas.csv` na pagina de uploads do sistema.</div>
            ) : (
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
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default Clientes;
