import React, { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { MetricCard } from "@/components/MetricCard";
import { Card } from "@/components/ui/card";
import { DollarSign, TrendingUp, Users, Package } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const MONTH_LABELS = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

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

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [monthlyRevenue, setMonthlyRevenue] = useState<Array<{month:string; value:number}>>([]);
  const [monthlyProfit, setMonthlyProfit] = useState<Array<{month:string; value:number}>>([]);
  const [salesByState, setSalesByState] = useState<Array<{name:string; value:number; color:string}>>([]);
  const [topClients, setTopClients] = useState<Array<{name:string; location:string; value:string}>>([]);
  const [totalClientsCount, setTotalClientsCount] = useState<number>(0);
  const [activeClientsCount, setActiveClientsCount] = useState<number>(0);
  const [topProducts, setTopProducts] = useState<Array<{name:string; qty:number; revenue:number}>>([]);
  const [lowStock, setLowStock] = useState<Array<{product:string; qty:number}>>([]);
  const [suppliersTop, setSuppliersTop] = useState<Array<{name:string; value:number}>>([]);
  const colorPalette = ['#3B82F6','#10B981','#F59E0B','#06B6D4','#EF4444','#8B5CF6','#F472B6'];

  const [faturamentoTotal, setFaturamentoTotal] = useState<number>(0);
  const [produtosVendidos, setProdutosVendidos] = useState<number>(0);
  const [totalCompras, setTotalCompras] = useState<number>(0);
  const [ticketMedio, setTicketMedio] = useState<number>(0);

  useEffect(() => {
    async function load() {
      try {
        // fetch vendas, vendas_por_produto, compras, estoque in parallel
        const paths = [
          '/data/relatario_de_vendas.csv',
          '/data/relatario_de_vendas_por_produto.csv',
          '/data/relatario_de_compras.csv',
          '/data/relatario_de_estoque.csv',
        ];
        const responses = await Promise.all(paths.map(p => fetch(p)));
        const texts = await Promise.all(responses.map((r,i) => {
          if (!r.ok) throw new Error(`Arquivo ${paths[i]} não encontrado (status ${r.status})`);
          const ct = r.headers.get('content-type') || '';
          if (ct.includes('text/html')) throw new Error(`Resposta HTML recebida em vez de CSV para ${paths[i]}`);
          return r.text();
        }));

        const [vendasText, vendasProdText, comprasText, estoqueText] = texts;
        if (/<\/?html/i.test(vendasText) || /<\/?html/i.test(vendasProdText)) throw new Error('Conteúdo HTML recebido em vez de CSV');

        // parse vendas
        const vendasRaw = parseCsvWithQuotes(vendasText, ';');
        const headerIdx = vendasRaw.findIndex(r => r.some(c => /cliente/i.test(c)) && r.some(c => /total/i.test(c)) && r.some(c => /estado/i.test(c)));
        const header = vendasRaw[headerIdx] || vendasRaw[0];
        const idxCliente = header.findIndex(h => /cliente/i.test(h));
        const idxTotal = header.findIndex(h => /total/i.test(h));
        const idxEstado = header.findIndex(h => /estado/i.test(h));
        const idxEntrega = header.findIndex(h => /entreg/i.test(h) || /data/i.test(h));

        const dataRows = vendasRaw.slice(headerIdx + 1);
        const byClient: Record<string, { purchases:number; revenue:number; location?:string }> = {};
        const byState: Record<string, number> = {};
        const byMonth: Record<string, number> = {};
        let totalRevenue = 0;
        let totalSalesCount = 0;

        for (const cols of dataRows) {
          if (!cols || cols.length === 0) continue;
          const cliente = (cols[idxCliente] || '').trim();
          if (!cliente) continue;
          const rawTotal = (cols[idxTotal] || '').toString().trim();
          const value = parseFloat(rawTotal.replace(/[^0-9,.-]/g, '').replace(/,/g, '.')) || 0;
          const estado = (cols[idxEstado] || '').trim();
          const entrega = (cols[idxEntrega] || '').trim();

          totalRevenue += value;
          totalSalesCount += 1;

          if (!byClient[cliente]) byClient[cliente] = { purchases: 0, revenue: 0, location: '' };
          byClient[cliente].purchases += 1;
          byClient[cliente].revenue += value;
          if (!byClient[cliente].location) {
            const municipio = cols[header.findIndex(h => /município|cidade|cidade/i.test(h))] || '';
            byClient[cliente].location = `${(municipio || '').toString().trim()}${estado ? ` - ${estado}` : ''}`.trim();
          }

          if (estado) {
            byState[estado] = (byState[estado] || 0) + value;
          }

          // month grouping from entrega (dd/mm/yyyy)
          if (entrega) {
            const parts = entrega.split('/');
            if (parts.length >= 3) {
              const month = parseInt(parts[1], 10) - 1;
              const key = `${parts[2]}-${String(month).padStart(2,'0')}`; // YYYY-MM
              byMonth[key] = (byMonth[key] || 0) + value;
            }
          }
        }

        // top clients + totals
        const clients = Object.entries(byClient).map(([name, v]) => ({ name, purchases: v.purchases, revenue: v.revenue, location: v.location }));
        clients.sort((a,b) => b.revenue - a.revenue);
        setTopClients(clients.slice(0,4).map(c => ({ name: c.name, location: c.location || '', value: `R$ ${c.revenue.toLocaleString('pt-BR')}`})));
        // total and active clients (active = has purchases > 0)
        setTotalClientsCount(clients.length);
        setActiveClientsCount(clients.filter(c => (c.purchases || 0) > 0).length);

        // salesByState top 5
        const stateEntries = Object.entries(byState).map(([k,v]) => ({ name:k, value:v }));
        stateEntries.sort((a,b) => b.value - a.value);
        const palette = ['#3B82F6','#10B981','#F59E0B','#06B6D4','#EF4444','#8B5CF6','#F472B6'];
        setSalesByState(stateEntries.slice(0,5).map((e,i) => ({ name: e.name || 'N/D', value: e.value, color: palette[i % palette.length] })));

        // If monthlyProfit not yet set by product parsing, fallback to revenue per month
        if (!monthlyProfit.length) {
          const monthKeys = Object.keys(byMonth).sort();
          const monthly = monthKeys.map(k => {
            const parts = k.split('-');
            const monthIdx = parseInt(parts[1],10);
            return { month: MONTH_LABELS[monthIdx] || k, value: Math.round(byMonth[k]) };
          }).slice(-6);
          setMonthlyRevenue(monthly.length ? monthly : [{month:'—', value:0}]);
        }

        setFaturamentoTotal(Math.round(totalRevenue));
        setTicketMedio(totalSalesCount ? Math.round(totalRevenue / totalSalesCount) : 0);

        // parse vendas_por_produto to count produtos vendidos (Quantidade Venda) and compute monthly profit
        try {
          const prodRaw = parseCsvWithQuotes(vendasProdText, ';');
          const headerIdxP = prodRaw.findIndex(r => r.some(c => /produto/i.test(c)) && r.some(c => /Quantidade Venda|Quantidade|Valor|Preço Venda|Custo Unitário|Custo/i.test(c)));
          let totalQty = 0;
          const prodMap: Record<string, { qty:number; revenue:number }> = {};
          const monthlyProfitMap: Record<string, number> = {};
          if (headerIdxP >= 0) {
            const headerP = prodRaw[headerIdxP];
            const idxQtd = headerP.findIndex(h => /Quantidade Venda|Quantidade/i.test(h));
            const idxProd = headerP.findIndex(h => /produto/i.test(h));
            const idxValor = headerP.findIndex(h => /Valor|Preço Venda|Valor Venda/i.test(h));
            const idxCusto = headerP.findIndex(h => /Custo Unitário|Custo|Preço Custo/i.test(h));
            const idxData = headerP.findIndex(h => /Entrega|Data/i.test(h));
            const dataP = prodRaw.slice(headerIdxP + 1);
            for (const cols of dataP) {
              if (!cols || cols.length === 0) continue;
              const q = idxQtd >= 0 ? parseInt((cols[idxQtd] || '0').toString().replace(/[^0-9-]/g,''),10) || 0 : 0;
              const prodName = idxProd >= 0 ? (cols[idxProd] || '').toString().trim() : 'Desconhecido';
              const rawValor = idxValor >= 0 ? (cols[idxValor] || '').toString().trim() : '';
              const rawCusto = idxCusto >= 0 ? (cols[idxCusto] || '').toString().trim() : '';
              const rawDate = idxData >= 0 ? (cols[idxData] || '').toString().trim() : '';
              const v = parseFloat(rawValor.replace(/[^0-9,.-]/g, '').replace(/,/g, '.')) || 0;
              const custoUnit = parseFloat(rawCusto.replace(/[^0-9,.-]/g, '').replace(/,/g, '.')) || 0;
              const revenue = v;
              const cost = custoUnit * q;
              const profit = revenue - cost;
              totalQty += q;
              if (!prodMap[prodName]) prodMap[prodName] = { qty: 0, revenue: 0 };
              prodMap[prodName].qty += q;
              prodMap[prodName].revenue += revenue;

              // aggregate profit by month if date available
              if (rawDate) {
                const parts = rawDate.split('/');
                if (parts.length >= 3) {
                  const monthIdx = parseInt(parts[1], 10) - 1;
                  const key = `${parts[2]}-${String(monthIdx).padStart(2,'0')}`; // YYYY-MM
                  monthlyProfitMap[key] = (monthlyProfitMap[key] || 0) + profit;
                }
              }
            }
          }
          // fallback: try to grab any numeric summary for qty
          if (totalQty === 0) {
            for (const r of prodRaw) {
              for (const cell of r) {
                const v = cell.replace(/[^0-9]/g, '');
                if (v && parseInt(v,10) > 0 && parseInt(v,10) < 100000) {
                  totalQty = parseInt(v,10);
                  break;
                }
              }
              if (totalQty) break;
            }
          }
          setProdutosVendidos(totalQty);
          // top products by revenue
          const prodArr = Object.entries(prodMap).map(([name, obj]) => ({ name, qty: obj.qty, revenue: obj.revenue }));
          prodArr.sort((a,b) => b.revenue - a.revenue);
          setTopProducts(prodArr.slice(0,10));

          // build monthlyProfit from monthlyProfitMap; fallback: use byMonth revenue - approximate cost if not available
          const profitKeys = Object.keys(monthlyProfitMap).sort();
          if (profitKeys.length > 0) {
            const monthly = profitKeys.map(k => {
              const parts = k.split('-');
              const monthIdx = parseInt(parts[1],10);
              return { month: MONTH_LABELS[monthIdx] || k, value: Math.round(monthlyProfitMap[k]) };
            }).slice(-6);
            setMonthlyProfit(monthly.length ? monthly : [{ month: '—', value: 0 }]);
          }
        } catch (e) {
          setProdutosVendidos(0);
        }

        // parse compras and aggregate by fornecedor
        try {
          const comprasRaw = parseCsvWithQuotes(comprasText, ';');
          const headerIdxC = comprasRaw.findIndex(r => r.some(c => /Valor Compra|Valor|ValorCompra/i.test(c)) && r.some(c => /Data|Compra|Data da Compra/i.test(c)));
          let totalCompr = 0;
          const suppliersMap: Record<string, number> = {};
          if (headerIdxC >= 0) {
            const headerC = comprasRaw[headerIdxC];
            const idxValor = headerC.findIndex(h => /Valor Compra|Valor|ValorCompra/i.test(h));
            const idxFornecedor = headerC.findIndex(h => /Fornecedor|Raz[oó]n|Nome do Fornecedor/i.test(h));
            const dataC = comprasRaw.slice(headerIdxC + 1);
            for (const cols of dataC) {
              if (!cols || cols.length === 0) continue;
              const rawVal = idxValor >= 0 ? (cols[idxValor] || '').toString() : '';
              const v = parseFloat(rawVal.replace(/[^0-9,.-]/g, '').replace(/,/g, '.')) || 0;
              totalCompr += v;
              const fornecedor = idxFornecedor >= 0 ? (cols[idxFornecedor] || '').toString().trim() : 'Desconhecido';
              if (!suppliersMap[fornecedor]) suppliersMap[fornecedor] = 0;
              suppliersMap[fornecedor] += v;
            }
          }
          setTotalCompras(Math.round(totalCompr));
          // set top suppliers
          const supArr = Object.entries(suppliersMap).map(([name, value]) => ({ name, value }));
          supArr.sort((a,b) => b.value - a.value);
          setSuppliersTop(supArr.slice(0,8));
        } catch (e) {
          setTotalCompras(0);
          setSuppliersTop([]);
        }

        // parse estoque to get low stock items
        try {
          const estoqueRaw = parseCsvWithQuotes(estoqueText, ';');
          const headerIdxE = estoqueRaw.findIndex(r => r.some(c => /Produto|Códigos/i.test(c)) && r.some(c => /Quantidade Total|Quantidade/i.test(c)));
          const low: Array<{product:string; qty:number}> = [];
          if (headerIdxE >= 0) {
            const headerE = estoqueRaw[headerIdxE];
            const idxProd = headerE.findIndex(h => /Produto|Descrição/i.test(h));
            const idxQtd = headerE.findIndex(h => /Quantidade Total|Quantidade/i.test(h));
            const dataE = estoqueRaw.slice(headerIdxE + 1);
            for (const cols of dataE) {
              if (!cols || cols.length === 0) continue;
              const prodName = idxProd >= 0 ? (cols[idxProd] || '').toString().trim() : '';
              const q = idxQtd >= 0 ? parseInt((cols[idxQtd] || '0').toString().replace(/[^0-9-]/g,''),10) || 0 : 0;
              if (prodName) low.push({ product: prodName, qty: q });
            }
          }
          low.sort((a,b) => a.qty - b.qty);
          setLowStock(low.slice(0,8));
        } catch (e) {
          setLowStock([]);
        }

        setLoading(false);
      } catch (err: any) {
        setError(String(err));
        setLoading(false);
      }
    }

    load();
  }, []);

  // build combined chart data: month / revenue / profit
  const chartData = (() => {
    const map = new Map<string, { month: string; revenue: number; profit: number }>();
    // revenue entries
    (monthlyRevenue || []).forEach(r => {
      map.set(r.month, { month: r.month, revenue: r.value || 0, profit: 0 });
    });
    // profit entries override/augment
    (monthlyProfit || []).forEach(p => {
      const existing = map.get(p.month) || { month: p.month, revenue: 0, profit: 0 };
      existing.profit = p.value || 0;
      map.set(p.month, existing);
    });
    // ensure sorted by month order present in MONTH_LABELS (attempt)
    const arr = Array.from(map.values());
    return arr.slice(-6);
  })();

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard Geral</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Faturamento Total"
            value={`R$ ${faturamentoTotal.toLocaleString('pt-BR')}`}
            icon={<DollarSign className="w-8 h-8" />}
            trend={undefined}
          />
          <MetricCard
            title="Lucro Total"
            value={`R$ ${Math.round(faturamentoTotal * 0.32).toLocaleString('pt-BR')}`}
            icon={<TrendingUp className="w-8 h-8" />}
          />
          <MetricCard
            title="Clientes Ativos"
            value={String(activeClientsCount)}
            icon={<Users className="w-8 h-8" />}
          />
          <MetricCard
            title="Produtos Vendidos"
            value={String(produtosVendidos)}
            icon={<Package className="w-8 h-8" />}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Principais Fornecedores (Total Compras)</h3>
              {loading ? <div>Carregando...</div> : error ? <div className="text-red-600">{error}</div> : (
                suppliersTop.length === 0 ? <div>Nenhum fornecedor encontrado.</div> : (
                <div className="h-56 sm:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      {(() => {
                        const pieData = suppliersTop.slice(0,10).map(s => ({ supplier: s.name, value: Number(s.value || 0) }));
                        const total = pieData.reduce((s, d) => s + (d.value || 0), 0);
                        return (
                          <>
                            <Pie
                              data={pieData}
                              dataKey="value"
                              nameKey="supplier"
                              innerRadius={60}
                              outerRadius={100}
                              paddingAngle={2}
                              label={({ percent }: any) => `${(percent * 100).toFixed(1)}%`}
                            >
                              {pieData.map((_, idx) => (
                                <Cell key={`cell-sup-${idx}`} fill={colorPalette[idx % colorPalette.length]} />
                              ))}
                            </Pie>
                            <Tooltip content={({ active, payload }: any) => {
                              if (active && payload && payload.length) {
                                const p = payload[0].payload;
                                const percent = total > 0 ? ((p.value / total) * 100).toFixed(1) : '0.0';
                                return (
                                  <div className="bg-white p-2 rounded shadow">
                                    <div className="font-semibold">{p.supplier}</div>
                                    <div className="text-sm text-muted-foreground">{percent}% do total</div>
                                  </div>
                                );
                              }
                              return null;
                            }} />
                          </>
                        );
                      })()}
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                )
              )}
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Vendas por Estado (Top 5)</h3>
            {loading ? <div>Carregando...</div> : error ? <div className="text-red-600">{error}</div> : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={salesByState}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {salesByState.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => `R$ ${value.toLocaleString('pt-BR')}`} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Métricas Financeiras</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-secondary rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Ticket Médio</p>
                  <p className="text-2xl font-bold text-primary">R$ {ticketMedio.toLocaleString('pt-BR')}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
              <div className="flex justify-between items-center p-4 bg-secondary rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Total em Compras</p>
                  <p className="text-2xl font-bold text-primary">R$ {totalCompras.toLocaleString('pt-BR')}</p>
                </div>
                <Package className="w-8 h-8 text-primary" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Top Produtos Vendidos</h3>
            {loading ? <div>Carregando...</div> : error ? <div className="text-red-600">{error}</div> : (
              <div className="h-56 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    {(() => {
                      const pieData = topProducts.slice(0,10).map(p => ({ product: p.name, value: Number(p.revenue || 0), quantity: p.qty }));
                      const total = pieData.reduce((s, d) => s + (d.value || 0), 0);
                      return (
                        <>
                          <Pie
                            data={pieData}
                            dataKey="value"
                            nameKey="product"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={2}
                            label={({ percent }: any) => `${(percent * 100).toFixed(1)}%`}
                          >
                            {pieData.map((_, idx) => (
                              <Cell key={`cell-prod-${idx}`} fill={colorPalette[idx % colorPalette.length]} />
                            ))}
                          </Pie>
                          <Tooltip content={({ active, payload }: any) => {
                            if (active && payload && payload.length) {
                              const p = payload[0].payload;
                              const percent = total > 0 ? ((p.value / total) * 100).toFixed(1) : '0.0';
                              return (
                                <div className="bg-white p-2 rounded shadow">
                                  <div className="font-semibold">{p.product}</div>
                                  <div>Receita: R$ {Number(p.value).toLocaleString('pt-BR')}</div>
                                  <div>Quantidade: {p.quantity}</div>
                                  <div className="text-sm text-muted-foreground">{percent}% do total</div>
                                </div>
                              );
                            }
                            return null;
                          }} />
                        </>
                      );
                    })()}
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Estoque — Itens com Menor Quantidade</h3>
            {loading ? <div>Carregando...</div> : error ? <div className="text-red-600">{error}</div> : (
              <div className="space-y-2">
                {lowStock.length === 0 ? <div>Nenhum dado de estoque disponível.</div> : (
                  lowStock.map((it, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 bg-secondary/10 rounded">
                      <div className="text-sm font-medium">{it.product}</div>
                      <div className="text-sm font-semibold">{it.qty}</div>
                    </div>
                  ))
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
