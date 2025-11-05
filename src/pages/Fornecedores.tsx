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

const fornecedoresData: Fornecedor[] = [
  {
    status: 'Ativo',
    codigo: 'F001',
    nome: 'Distribuidora Santa Maria',
    municipio: 'Blumenau',
    estado: 'SC',
    telefone: '(47) 99999-0001',
    email: 'contato@santamaria.com.br',
    documento: '12.345.678/0001-90',
  },
  {
    status: 'Inativo',
    codigo: 'F002',
    nome: 'Fornecedora Central',
    municipio: 'Curitiba',
    estado: 'PR',
    telefone: '(41) 98888-0002',
    email: 'vendas@central.com.br',
    documento: '987.654.321-00',
  },
  {
    status: 'Ativo',
    codigo: 'F003',
    nome: 'ABC Comércio',
    municipio: 'São Paulo',
    estado: 'SP',
    telefone: '(11) 97777-0003',
    email: 'financeiro@abc.com.br',
    documento: '45.678.901/0001-12',
  },
];

export default function Fornecedores(): JSX.Element {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Fornecedores</h1>
            <p className="text-sm text-muted-foreground">Lista de fornecedores com informações de contato e identificação</p>
          </div>
        </div>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Relatório de Fornecedores</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Código</th>
                  <th className="text-left py-3 px-4">Nome</th>
                  <th className="text-left py-3 px-4">Município</th>
                  <th className="text-left py-3 px-4">Estado</th>
                  <th className="text-left py-3 px-4">Telefone</th>
                  <th className="text-left py-3 px-4">E-mail</th>
                  <th className="text-left py-3 px-4">CNPJ / CPF</th>
                </tr>
              </thead>
              <tbody>
                {fornecedoresData.map((f) => (
                  <tr key={f.codigo} className="border-b hover:bg-secondary/50">
                    <td className="py-3 px-4">
                      <Badge variant={f.status === 'Ativo' ? 'default' : 'secondary'}>{f.status}</Badge>
                    </td>
                    <td className="py-3 px-4 font-medium">{f.codigo}</td>
                    <td className="py-3 px-4">{f.nome}</td>
                    <td className="py-3 px-4">{f.municipio}</td>
                    <td className="py-3 px-4">{f.estado}</td>
                    <td className="py-3 px-4">{f.telefone}</td>
                    <td className="py-3 px-4">{f.email}</td>
                    <td className="py-3 px-4 font-mono text-sm">{f.documento}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
