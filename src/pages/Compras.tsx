import React, { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { MetricCard } from "@/components/MetricCard";
import { Card } from "@/components/ui/card";
import { ShoppingBag, Package, DollarSign, Building2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type PurchaseRow = {
  data: string;
  entrega: string;
  numero: string;
  fornecedor: string;
  comprador: string;
  situacao: string;
  codigos: string;
  produto: string;
  entregue: string;
  entregar: string;
  quantidade: number;
  preco_custo: number;
  preco_venda: number;
  valor_compra: number;
};

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
      // handle CRLF
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

function mapPurchases(rows: string[][]): PurchaseRow[] {
  if (rows.length === 0) return [];
  // find header row (contains 'Data' and 'Fornecedor')
  let headerIndex = rows.findIndex(r => r.some(c => /data/i.test(c)) && r.some(c => /forneced/i.test(c)));
  if (headerIndex === -1) headerIndex = 0;
  const dataLines = rows.slice(headerIndex + 1);
  const mapped: PurchaseRow[] = [];
  for (const cols of dataLines) {
    // ignore HTML or malformed
    if (cols.length < 5) continue;
    const data = (cols[0] ?? '').trim();
    const entrega = (cols[1] ?? '').trim();
    const numero = (cols[2] ?? '').trim();
    const fornecedor = (cols[3] ?? '').trim();
    const comprador = (cols[4] ?? '').trim();
    const situacao = (cols[5] ?? '').trim();
    const codigos = (cols[6] ?? '').trim();
    const produto = (cols[7] ?? '').trim();
    const entregue = (cols[8] ?? '').trim();
    const entregar = (cols[9] ?? '').trim();
    const quantidade = parseInt((cols[10] ?? '0').replace(/[^0-9-]/g, '')) || 0;
    const preco_custo = parseFloat(((cols[11] ?? '').replace(',', '.')) || '0') || 0;
    const preco_venda = parseFloat(((cols[12] ?? '').replace(',', '.')) || '0') || 0;
    const valor_compra = parseFloat(((cols[13] ?? '').replace(',', '.')) || '0') || 0;
    if (!fornecedor && !produto) continue;
    mapped.push({ data, entrega, numero, fornecedor, comprador, situacao, codigos, produto, entregue, entregar, quantidade, preco_custo, preco_venda, valor_compra });
  }
  return mapped;
}

const Compras = () => {
  const [rows, setRows] = useState<PurchaseRow[]>([]);
  const [supplierData, setSupplierData] = useState<Array<{ name: string; value: number }>>([]);
  const [suppliers, setSuppliers] = useState<Array<{ name: string; orders: number; total: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const csvPath = '/data/relatario_de_compras.csv';
    fetch(csvPath)
      .then(res => {
        if (!res.ok) throw new Error(`CSV não encontrado em ${csvPath} (status ${res.status})`);
        const ct = res.headers.get('content-type') || '';
        if (ct.includes('text/html')) throw new Error(`Resposta HTML recebida em vez de CSV. Verifique se ${csvPath} existe e está em public/`);
        return res.text();
      })
      .then(text => {
        if (/\<\/?html/i.test(text)) throw new Error(`Conteúdo HTML recebido em vez de CSV. Verifique o caminho ${csvPath}`);
        const rawRows = parseCsvWithQuotes(text, ';');
        const parsed = mapPurchases(rawRows);
        setRows(parsed);

        // supplier totals
        const bySupplier: Record<string, number> = {};
        parsed.forEach(p => {
          const k = p.fornecedor || 'SEM_FORNECEDOR';
          bySupplier[k] = (bySupplier[k] || 0) + (p.valor_compra || 0);
        });
        const suppliersArr = Object.entries(bySupplier).map(([k, v]) => ({ name: k, value: v }));
        suppliersArr.sort((a, b) => b.value - a.value);
        setSupplierData(suppliersArr.slice(0, 20));

        // (removido cálculo de compras mensais — gráfico não será mais exibido)

        // suppliers table: orders count and total
        const mapSup: Record<string, { orders: number; total: number }> = {};
        parsed.forEach(p => {
          const k = p.fornecedor || '(sem fornecedor)';
          if (!mapSup[k]) mapSup[k] = { orders: 0, total: 0 };
          mapSup[k].orders += 1;
          mapSup[k].total += p.valor_compra || 0;
        });
        const supArray = Object.entries(mapSup).map(([name, v]) => ({ name, orders: v.orders, total: `R$ ${v.total.toLocaleString('pt-BR')}` }));
        supArray.sort((a, b) => {
          const va = parseFloat(a.total.replace(/[^0-9,-]/g, '').replace(',', '.')) || 0;
          const vb = parseFloat(b.total.replace(/[^0-9,-]/g, '').replace(',', '.')) || 0;
          return vb - va;
        });
        setSuppliers(supArray);

        setLoading(false);
      })
      .catch(err => {
        setError(String(err));
        setLoading(false);
      });
  }, []);

  const totalValue = rows.reduce((s, r) => s + (r.valor_compra || 0), 0);
  const totalItems = rows.reduce((s, r) => s + (r.quantidade || 0), 0);
  const avgCostPerItem = totalItems > 0 ? Math.round((totalValue / totalItems) * 100) / 100 : 0;

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Gestão de Compras</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard title="Total em Compras" value={`R$ ${totalValue.toLocaleString('pt-BR')}`} icon={<DollarSign className="w-8 h-8" />} />
          <MetricCard title="Total de Itens" value={totalItems.toString()} icon={<Package className="w-8 h-8" />} />
          <MetricCard title="Custo Médio/Item" value={`R$ ${avgCostPerItem.toLocaleString('pt-BR')}`} icon={<ShoppingBag className="w-8 h-8" />} />
          <MetricCard title="Fornecedores Ativos" value={suppliers.length.toString()} icon={<Building2 className="w-8 h-8" />} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="lg:col-span-2 p-4">
            <h3 className="text-lg font-semibold mb-4">Compras por Fornecedor</h3>
            {loading ? (
              <div>Carregando dados...</div>
            ) : error ? (
              <div className="text-red-600">Carregue `relatorio_de_compras.csv` na pagina de uploads do sistema</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={supplierData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={260} tick={{ fontSize: 15 }} />
                  <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>

          {/* Gráfico de Compras Mensais removido conforme solicitado */}
        </div>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Fornecedores - Resumo</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Fornecedor</th>
                  <th className="text-left py-3 px-4">Nº Pedidos</th>
                  <th className="text-left py-3 px-4">Valor Total</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map((supplier, idx) => (
                  <tr key={idx} className="border-b hover:bg-secondary/50">
                    <td className="py-3 px-4 font-medium text-base md:text-lg">{supplier.name}</td>
                    <td className="py-3 px-4">{supplier.orders}</td>
                    <td className="py-3 px-4 font-semibold text-primary">{supplier.total}</td>
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

export default Compras;
