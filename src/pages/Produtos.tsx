import React, { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { MetricCard } from "@/components/MetricCard";
import { Card } from "@/components/ui/card";
import { Package, DollarSign, TrendingUp, Tag } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

type ProductRow = {
  tabela: string;
  venda: string;
  data: string;
  entrega: string;
  cliente: string;
  cidade: string;
  estado: string;
  vendedor: string;
  codigos: string;
  produto: string;
  comissao: string;
  entregue: string;
  entregar: string;
  quantidade: number;
  custo_unitario: number;
  preco_venda: number;
  desconto: number;
  valor: number;
};

function parseCsvWithQuotes(text: string, delimiter = ";") {
  const rows: string[][] = [];
  let cur = "";
  let row: string[] = [];
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];
    if (ch === '"') {
      if (inQuotes && next === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === delimiter && !inQuotes) {
      row.push(cur);
      cur = "";
      continue;
    }
    if ((ch === "\n" || ch === "\r") && !inQuotes) {
      if (ch === "\r" && text[i + 1] === "\n") {
        i++;
      }
      row.push(cur);
      rows.push(row);
      row = [];
      cur = "";
      continue;
    }
    cur += ch;
  }
  if (cur !== "" || row.length > 0) {
    row.push(cur);
    rows.push(row);
  }
  return rows;
}

function mapProductRows(rows: string[][]): ProductRow[] {
  if (rows.length === 0) return [];
  let headerIndex = rows.findIndex(
    (r) =>
      r.some((c) => /Produto/i.test(c)) && r.some((c) => /Quantidade/i.test(c))
  );
  if (headerIndex === -1) headerIndex = 0;
  const dataLines = rows.slice(headerIndex + 1);
  const mapped: ProductRow[] = [];
  for (const cols of dataLines) {
    if (cols.length < 5) continue;
    const tabela = (cols[0] ?? "").trim();
    const venda = (cols[1] ?? "").trim();
    const data = (cols[2] ?? "").trim();
    const entrega = (cols[3] ?? "").trim();
    const cliente = (cols[4] ?? "").trim();
    const cidade = (cols[5] ?? "").trim();
    const estado = (cols[6] ?? "").trim();
    const vendedor = (cols[7] ?? "").trim();
    const codigos = (cols[8] ?? "").trim();
    const produto = (cols[9] ?? "").trim();
    const comissao = (cols[10] ?? "").trim();
    const entregue = (cols[11] ?? "").trim();
    const entregar = (cols[12] ?? "").trim();
    const quantidade = parseInt((cols[13] ?? "0").replace(/[^0-9-]/g, "")) || 0;
    const custo_unitario =
      parseFloat((cols[14] ?? "").replace(",", ".") || "0") || 0;
    const preco_venda =
      parseFloat((cols[15] ?? "").replace(",", ".") || "0") || 0;
    const desconto = parseFloat((cols[16] ?? "").replace(",", ".") || "0") || 0;
    const valor = parseFloat((cols[17] ?? "").replace(",", ".") || "0") || 0;
    if (!produto) continue;
    mapped.push({
      tabela,
      venda,
      data,
      entrega,
      cliente,
      cidade,
      estado,
      vendedor,
      codigos,
      produto,
      comissao,
      entregue,
      entregar,
      quantidade,
      custo_unitario,
      preco_venda,
      desconto,
      valor,
    });
  }
  return mapped;
}

const Produtos = () => {
  const [rows, setRows] = useState<ProductRow[]>([]);
  const [salesByState, setSalesByState] = useState<
    Array<{ state: string; value: number }>
  >([]);
  const [topProducts, setTopProducts] = useState<
    Array<{ product: string; quantity: number; revenue: number }>
  >([]);
  const [totalSold, setTotalSold] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [avgProfitPerUnit, setAvgProfitPerUnit] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const csvPath = "/data/relatario_de_vendas_por_produto.csv";
    fetch(csvPath)
      .then((res) => {
        if (!res.ok)
          throw new Error(
            `CSV não encontrado em ${csvPath} (status ${res.status})`
          );
        const ct = res.headers.get("content-type") || "";
        if (ct.includes("text/html"))
          throw new Error(
            `Resposta HTML recebida em vez de CSV. Verifique se ${csvPath} existe e está em public/`
          );
        return res.text();
      })
      .then((text) => {
        if (/\<\/?html/i.test(text))
          throw new Error(
            `Conteúdo HTML recebido em vez de CSV. Verifique o caminho ${csvPath}`
          );
        const raw = parseCsvWithQuotes(text, ";");
        const parsed = mapProductRows(raw);
        setRows(parsed);

        // totals
        const totalQ = parsed.reduce((s, r) => s + (r.quantidade || 0), 0);
        const totalV = parsed.reduce((s, r) => s + (r.valor || 0), 0);
        setTotalSold(totalQ);
        setTotalRevenue(totalV);

        // avg profit per unit: (revenue - cost*qty)/qty
        const totalCost = parsed.reduce(
          (s, r) => s + (r.custo_unitario || 0) * (r.quantidade || 0),
          0
        );
        const profit = totalV - totalCost;
        const avgProfit =
          totalQ > 0 ? Math.round((profit / totalQ) * 100) / 100 : 0;
        setAvgProfitPerUnit(avgProfit);

        // sales by state
        const byState: Record<string, number> = {};
        parsed.forEach((r) => {
          const st = r.estado || "Sem Estado";
          byState[st] = (byState[st] || 0) + (r.valor || 0);
        });
        const stateArr = Object.entries(byState).map(([k, v]) => ({
          state: k,
          value: v,
        }));
        stateArr.sort((a, b) => b.value - a.value);
        setSalesByState(stateArr.slice(0, 12));

        // top products
        const prodMap: Record<string, { quantity: number; revenue: number }> =
          {};
        parsed.forEach((r) => {
          const p = r.produto || "(sem nome)";
          if (!prodMap[p]) prodMap[p] = { quantity: 0, revenue: 0 };
          prodMap[p].quantity += r.quantidade || 0;
          prodMap[p].revenue += r.valor || 0;
        });
        const top = Object.entries(prodMap).map(([name, v]) => ({
          product: name,
          quantity: v.quantity,
          revenue: v.revenue,
        }));
        top.sort((a, b) => b.revenue - a.revenue);
        setTopProducts(top.slice(0, 10));

        setLoading(false);
      })
      .catch((err) => {
        setError(String(err));
        setLoading(false);
      });
  }, []);

  const pieData = topProducts.map((p) => ({
    product: p.product,
    value: Number(p.revenue),
    quantity: p.quantity,
  }));
  const pieTotal = pieData.reduce((s, d) => s + (d.value || 0), 0);

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Análise de Produtos</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Vendido"
            value={totalSold.toString()}
            icon={<Package className="w-8 h-8" />}
          />
          <MetricCard
            title="Receita Total"
            value={`R$ ${totalRevenue.toLocaleString("pt-BR")}`}
            icon={<DollarSign className="w-8 h-8" />}
          />
          <MetricCard
            title="Lucro Médio/Unidade"
            value={`R$ ${avgProfitPerUnit.toLocaleString("pt-BR")}`}
            icon={<TrendingUp className="w-8 h-8" />}
          />
          <MetricCard
            title="Produtos Ativos"
            value={topProducts.length.toString()}
            icon={<Tag className="w-8 h-8" />}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Vendas por Estado</h3>
            {loading ? (
              <div>Carregando dados...</div>
            ) : error ? (
              <div className="text-red-600">
                Carregue `relatorio_de_vendas.csv` na pagina de uploads do
                sistema
              </div>
            ) : (
              <div className="h-56 sm:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesByState}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="state" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) =>
                        `R$ ${value.toLocaleString("pt-BR")}`
                      }
                    />
                    <Bar dataKey="value" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              Top Produtos por Receita
            </h3>
            {loading ? (
              <div>Carregando dados...</div>
            ) : error ? (
              <div className="text-red-600">
                Carregue `relatorio_de_vendas.csv` na pagina de uploads do
                sistema
              </div>
            ) : (
              <div className="h-56 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    {(() => {
                      const pieData = topProducts.map((p) => ({
                        product: p.product,
                        value: Number(p.revenue),
                        quantity: p.quantity,
                      }));
                      const total = pieData.reduce(
                        (s, d) => s + (d.value || 0),
                        0
                      );
                      return (
                        <>
                          <Pie
                            data={pieData}
                            dataKey="value"
                            nameKey="product"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={2}
                            label={({ percent }: any) =>
                              `${(percent * 100).toFixed(1)}%`
                            }
                          >
                            {pieData.map((_, idx) => (
                              <Cell
                                key={`cell-${idx}`}
                                fill={
                                  [
                                    "#4f46e5",
                                    "#06b6d4",
                                    "#10b981",
                                    "#f59e0b",
                                    "#ef4444",
                                    "#8b5cf6",
                                    "#14b8a6",
                                    "#f97316",
                                    "#84cc16",
                                    "#0ea5e9",
                                  ][idx % 10]
                                }
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            content={({ active, payload }: any) => {
                              if (active && payload && payload.length) {
                                const p = payload[0].payload;
                                const percent =
                                  total > 0
                                    ? ((p.value / total) * 100).toFixed(1)
                                    : "0.0";
                                return (
                                  <div className="bg-white p-2 rounded shadow">
                                    <div className="font-semibold">
                                      {p.product}
                                    </div>
                                    <div>
                                      Receita: R${" "}
                                      {Number(p.value).toLocaleString("pt-BR")}
                                    </div>
                                    <div>Quantidade: {p.quantity}</div>
                                    <div className="text-sm text-muted-foreground">
                                      {percent}% do total
                                    </div>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                        </>
                      );
                    })()}
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </div>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            Dados Completos de Produtos
          </h3>
          {loading ? (
            <div>Carregando dados...</div>
          ) : error ? (
            <div className="text-red-600">
              Carregue `relatorio_de_vendas.csv` na pagina de uploads do sistema
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="py-2 px-3">Tabela</th>
                    <th className="py-2 px-3">Venda</th>
                    <th className="py-2 px-3">Data</th>
                    <th className="py-2 px-3">Entrega</th>
                    <th className="py-2 px-3">Cliente</th>
                    <th className="py-2 px-3">Cidade</th>
                    <th className="py-2 px-3">Estado</th>
                    <th className="py-2 px-3">Vendedor</th>
                    <th className="py-2 px-3">Códigos</th>
                    <th className="py-2 px-3">Produto</th>
                    <th className="py-2 px-3">Comissão(%)</th>
                    <th className="py-2 px-3">Entregue</th>
                    <th className="py-2 px-3">Entregar</th>
                    <th className="py-2 px-3">Quantidade</th>
                    <th className="py-2 px-3">Custo Unit.</th>
                    <th className="py-2 px-3">Preço Venda</th>
                    <th className="py-2 px-3">Desconto</th>
                    <th className="py-2 px-3">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, idx) => (
                    <tr key={idx} className="border-b hover:bg-secondary/50">
                      <td className="py-2 px-3">{r.tabela}</td>
                      <td className="py-2 px-3">{r.venda}</td>
                      <td className="py-2 px-3">{r.data}</td>
                      <td className="py-2 px-3">{r.entrega}</td>
                      <td className="py-2 px-3">{r.cliente}</td>
                      <td className="py-2 px-3">{r.cidade}</td>
                      <td className="py-2 px-3">{r.estado}</td>
                      <td className="py-2 px-3">{r.vendedor}</td>
                      <td className="py-2 px-3">{r.codigos}</td>
                      <td className="py-2 px-3 font-medium">{r.produto}</td>
                      <td className="py-2 px-3">{r.comissao}</td>
                      <td className="py-2 px-3">{r.entregue}</td>
                      <td className="py-2 px-3">{r.entregar}</td>
                      <td className="py-2 px-3">{r.quantidade}</td>
                      <td className="py-2 px-3">
                        {r.custo_unitario
                          ? `R$ ${r.custo_unitario.toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                            })}`
                          : "-"}
                      </td>
                      <td className="py-2 px-3">
                        {r.preco_venda
                          ? `R$ ${r.preco_venda.toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                            })}`
                          : "-"}
                      </td>
                      <td className="py-2 px-3">
                        {r.desconto
                          ? `R$ ${r.desconto.toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                            })}`
                          : "-"}
                      </td>
                      <td className="py-2 px-3 font-semibold text-primary">
                        {r.valor
                          ? `R$ ${r.valor.toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                            })}`
                          : "-"}
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

export default Produtos;
