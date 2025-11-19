import React, { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { MetricCard } from "@/components/MetricCard";
import { Card } from "@/components/ui/card";
import { Package, AlertTriangle, AlertCircle, CheckCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Badge } from "@/components/ui/badge";

type StockRow = {
  codigo: string;
  produto: string;
  local: string;
  fabricante: string;
  proprietario: string;
  propriedade_flag?: string;
  propriedade_text?: string;
  tipo?: string;
  ncm?: string;
  quantidade: number;
  preco_venda?: number;
  total_venda?: number;
  preco_custo?: number;
  total_custo?: number;
};

function parseSemicolonCsv(csv: string): StockRow[] {
  const lines = csv.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
  // Encontrar a linha do cabeçalho (que contém 'Códigos' ou 'Produto')
  // procura cabeçalho com variações de acento e caixa
  let headerIndex = lines.findIndex((ln) => /c[óo]digos/i.test(ln) && /produto/i.test(ln));
  if (headerIndex === -1) headerIndex = 0;

  const header = lines[headerIndex].split(';').map(h => h.trim());
  const dataLines = lines.slice(headerIndex + 1);

  const rows: StockRow[] = [];

  for (const line of dataLines) {
    // ignora linhas HTML ou conteúdo inválido (por exemplo quando o servidor retorna index.html)
    if (/\<\/?(html|!doctype|div|span|script|body|head)/i.test(line)) continue;
    const cols = line.split(';');
    // map expected positions defensivamente
    const codigo = (cols[0] ?? '').trim();
    const produto = (cols[1] ?? '').trim();
    const local = (cols[2] ?? '').trim();
    const fabricante = (cols[3] ?? '').trim();
    const proprietario = (cols[4] ?? '').trim();
    const propriedade_flag = (cols[6] ?? '').trim();
    const propriedade_text = (cols[7] ?? '').trim();
    const tipo = (cols[9] ?? '').trim();
    const ncm = (cols[10] ?? '').trim();
    const quantidade = parseInt((cols[11] ?? '0').replace(/[^0-9-]/g, '')) || 0;
    const preco_venda = parseFloat(((cols[12] ?? '').replace(',', '.')) || '0') || 0;
    const total_venda = parseFloat(((cols[13] ?? '').replace(',', '.')) || '0') || 0;
    const preco_custo = parseFloat(((cols[14] ?? '').replace(',', '.')) || '0') || 0;
    const total_custo = parseFloat(((cols[15] ?? '').replace(',', '.')) || '0') || 0;

    // Ignora linhas sem código/produto ou sem quantidade
    if ((!codigo && !produto) || (quantidade === 0 && !produto)) continue;

    rows.push({ codigo, produto, local, fabricante, proprietario, propriedade_flag, propriedade_text, tipo, ncm, quantidade, preco_venda, total_venda, preco_custo, total_custo });
  }

  return rows;
}

const Estoque = () => {
  const [rows, setRows] = useState<StockRow[]>([]);
  const [categoryData, setCategoryData] = useState<{ category: string; quantity: number }[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Array<{ product: string; sku: string; current: number; minimum: number; status: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const csvPath = '/data/relatario_de_estoque.csv';
    fetch(csvPath)
      .then((res) => {
        if (!res.ok) throw new Error(`CSV não encontrado em ${csvPath} (status ${res.status})`);
        const ct = res.headers.get('content-type') || '';
        // Se o servidor retornar HTML (ex: index.html via dev server), tratar como ausência do CSV
        if (ct.includes('text/html')) throw new Error(`Resposta HTML recebida em vez de CSV. Verifique se ${csvPath} existe e está em public/`);
        return res.text();
      })
      .then((text) => {
        // Proteção adicional: se o conteúdo aparenta ser HTML, aborta
        if (/\<\/?html/i.test(text)) throw new Error(`Conteúdo HTML recebido em vez de CSV. Verifique o caminho ${csvPath}`);
        const parsed = parseSemicolonCsv(text);
        setRows(parsed);
        

        // Agrupar por fabricante
        const byFab: Record<string, number> = {};
        parsed.forEach((r) => {
          const key = r.fabricante || 'SEM_FABRICANTE';
          byFab[key] = (byFab[key] || 0) + (r.quantidade || 0);
        });
        const categories = Object.entries(byFab).map(([k, v]) => ({ category: k, quantity: v }));
        categories.sort((a, b) => b.quantity - a.quantity);
        setCategoryData(categories.slice(0, 10));

        // low stock
        const low = parsed.filter((r) => r.quantidade <= 20).map((r) => ({
          product: r.produto || '(sem nome)',
          sku: r.codigo || '',
          current: r.quantidade || 0,
          minimum: 20,
          status: (r.quantidade || 0) <= 5 ? 'critical' : 'warning',
        }));
        setLowStockProducts(low);

        setLoading(false);
      })
      .catch((err) => {
        setError(String(err));
        setLoading(false);
      });
  }, []);

  const totalProducts = rows.reduce((s, r) => s + (r.quantidade || 0), 0);
  const lowCount = lowStockProducts.length;
  const criticalCount = lowStockProducts.filter((l) => l.status === 'critical').length;
  const inCompliance = rows.length - lowCount;

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Gestão de Estoque</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total de Produtos"
            value={totalProducts.toString()}
            icon={<Package className="w-8 h-8" />}
          />
          <MetricCard
            title="Estoque Baixo"
            value={lowCount.toString()}
            icon={<AlertTriangle className="w-8 h-8 text-warning" />}
          />
          <MetricCard
            title="Estoque Crítico"
            value={criticalCount.toString()}
            icon={<AlertCircle className="w-8 h-8 text-destructive" />}
          />
          <MetricCard
            title="Em Conformidade"
            value={inCompliance.toString()}
            icon={<CheckCircle className="w-8 h-8 text-success" />}
          />
        </div>
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Quantidade por Fabricante (Top)</h3>
          {loading ? (
            <div>Carregando dados...</div>
          ) : error ? (
            <div className="text-red-600">Carregue `relatorio_de_estoque.csv` na pagina de uploads do sistema</div>
          ) : (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="quantity" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Produtos com Estoque Baixo</h3>
          {loading ? (
            <div>Carregando...</div>
          ) : (
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
                        <Badge variant={item.status === 'critical' ? 'destructive' : 'default'}>
                          {item.status === 'critical' ? 'Crítico' : 'Atenção'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Relatório completo de Estoque</h3>
          {loading ? (
            <div>Carregando...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3">Código</th>
                    <th className="text-left py-2 px-3">Produto</th>
                    <th className="text-left py-2 px-3">Fabricante</th>
                    <th className="text-left py-2 px-3">Quantidade</th>
                    <th className="text-left py-2 px-3">Preço Custo</th>
                    <th className="text-left py-2 px-3">Total Custo</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={i} className="border-b hover:bg-secondary/50">
                      <td className="py-2 px-3">{r.codigo}</td>
                      <td className="py-2 px-3">{r.produto}</td>
                      <td className="py-2 px-3">{r.fabricante}</td>
                      <td className="py-2 px-3">{r.quantidade}</td>
                      <td className="py-2 px-3">{r.preco_custo?.toString() ?? ''}</td>
                      <td className="py-2 px-3">{r.total_custo?.toString() ?? ''}</td>
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

export default Estoque;
