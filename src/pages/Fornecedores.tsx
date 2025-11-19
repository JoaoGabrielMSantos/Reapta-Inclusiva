import React, { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Fornecedor = {
  status: string;
  codigo: string;
  nome: string;
  municipio: string;
  estado: string;
  telefone: string;
  email: string;
  documento: string;
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

export default function Fornecedores(): JSX.Element {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const path = '/data/relatario_de_fornecedores.csv';
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
        if (raw.length === 0) { setFornecedores([]); setLoading(false); return; }
        // find header row
        const headerRowIdx = raw.findIndex(r => r.some(c => /status/i.test(c) || /codigo/i.test(c) || /nome/i.test(c)));
        const dataRows = headerRowIdx >= 0 ? raw.slice(headerRowIdx + 1) : raw.slice(1);
        const mapped: Fornecedor[] = dataRows.map(cols => {
          const [status = '', codigo = '', nome = '', municipio = '', estado = '', telefones = '', email = '', documento = ''] = cols.map(c => (c ?? '').trim());
          return {
            status: status ? (status[0].toUpperCase() + status.slice(1)) : 'N/A',
            codigo: codigo || '',
            nome: nome || '',
            municipio: municipio || '',
            estado: estado || '',
            telefone: telefones || '',
            email: email || '',
            documento: documento || '',
          };
        }).filter(f => f.codigo || f.nome);
        setFornecedores(mapped);
        setLoading(false);
      })
      .catch(err => {
        setError(String(err));
        setLoading(false);
      });
  }, []);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Fornecedores</h1>
          </div>
        </div>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Relatório de Fornecedores</h3>
          {loading ? (
            <div>Carregando dados...</div>
          ) : error ? (
            <div className="text-red-600">Carregue `relatorio_de_fornecedores.csv` na pagina de uploads do sistema</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Código</th>
                    <th className="text-left py-3 px-4">Nome</th>
                    <th className="text-left py-3 px-4 hidden sm:table-cell">Município</th>
                    <th className="text-left py-3 px-4">Estado</th>
                    <th className="text-left py-3 px-4 hidden sm:table-cell">Telefone</th>
                    <th className="text-left py-3 px-4 hidden sm:table-cell">E-mail</th>
                    <th className="text-left py-3 px-4 hidden sm:table-cell">CNPJ / CPF</th>
                  </tr>
                </thead>
                <tbody>
                  {fornecedores.map((f) => (
                    <tr key={f.codigo || f.nome} className="border-b hover:bg-secondary/50">
                      <td className="py-3 px-4">
                        <Badge variant={f.status && f.status.toLowerCase().startsWith('a') ? 'default' : 'secondary'}>{f.status}</Badge>
                      </td>
                      <td className="py-3 px-4 font-medium">{f.codigo}</td>
                      <td className="py-3 px-4">{f.nome}</td>
                      <td className="py-3 px-4 hidden sm:table-cell">{f.municipio}</td>
                      <td className="py-3 px-4">{f.estado}</td>
                      <td className="py-3 px-4 hidden sm:table-cell">{f.telefone}</td>
                      <td className="py-3 px-4 hidden sm:table-cell">{f.email}</td>
                      <td className="py-3 px-4 font-mono text-sm hidden sm:table-cell">{f.documento}</td>
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
}
