import React from "react";
import { Layout } from "@/components/Layout";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const REPORT_TYPES = [
  { key: "compras", label: "Relatório de compras" },
  { key: "estoque", label: "Relatório de estoque" },
  { key: "fornecedores", label: "Relatório de Fornecedores" },
  { key: "vendas_produto", label: "Relatório de vendas por produto" },
  { key: "vendas", label: "Relatório de vendas" },
];

const Atualizacao = () => {
  const { toast } = useToast();

  const [individualFiles, setIndividualFiles] = React.useState<Record<string, File | null>>(() => {
    const map: Record<string, File | null> = {};
    REPORT_TYPES.forEach((r) => (map[r.key] = null));
    return map;
  });

  const [batchFiles, setBatchFiles] = React.useState<FileList | null>(null);
  const [batchType, setBatchType] = React.useState<string>(REPORT_TYPES[0].key);
  const [loading, setLoading] = React.useState(false);

  const handleFileChange = (key: string, file?: File) => {
    setIndividualFiles((prev) => ({ ...prev, [key]: file ?? null }));
  };

  const uploadFile = async (file: File, reportType: string) => {
    const form = new FormData();
    form.append("file", file);
    form.append("reportType", reportType);

    // Endpoint backend presumido: /api/upload
    const res = await fetch("/api/upload", {
      method: "POST",
      body: form,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "Erro no upload");
      throw new Error(text || "Erro no upload");
    }

    return res.json().catch(() => ({}));
  };

  const handleIndividualUpload = async (typeKey: string) => {
    const file = individualFiles[typeKey];
    if (!file) {
      toast({ title: "Nenhum arquivo selecionado", description: "Selecione um arquivo antes de enviar." });
      return;
    }

    try {
      setLoading(true);
      await uploadFile(file, typeKey);
      toast({ title: "Upload concluído", description: `Arquivo enviado: ${file.name}` });
      handleFileChange(typeKey); // limpa o campo
    } catch (err: any) {
      toast({ title: "Erro no upload", description: String(err.message || err) });
    } finally {
      setLoading(false);
    }
  };

  const handleBatchUpload = async () => {
    if (!batchFiles || batchFiles.length === 0) {
      toast({ title: "Nenhum arquivo selecionado", description: "Selecione ao menos um arquivo para envio em bloco." });
      return;
    }

    setLoading(true);
    const results: { name: string; ok: boolean; error?: string }[] = [];

    for (let i = 0; i < batchFiles.length; i++) {
      const f = batchFiles[i];
      try {
        await uploadFile(f, batchType);
        results.push({ name: f.name, ok: true });
      } catch (err: any) {
        results.push({ name: f.name, ok: false, error: String(err.message || err) });
      }
    }

    const success = results.filter((r) => r.ok).length;
    const fail = results.length - success;

    toast({ title: `Upload em bloco finalizado`, description: `${success} sucesso(s), ${fail} falha(s)` });
    setLoading(false);
    setBatchFiles(null);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Importar relatórios</h1>
          <p className="text-muted-foreground">Carregue arquivos que alimentam os gráficos e relatórios do sistema.</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {REPORT_TYPES.map((r) => (
            <Card key={r.key} className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-2">{r.label}</h3>
                  <p className="text-sm text-muted-foreground mb-3">Envie o arquivo correspondente a este relatório.</p>
                  <input
                    id={`file-${r.key}`}
                    type="file"
                    accept=".csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,application/json"
                    onChange={(e) => handleFileChange(r.key, e.target.files?.[0])}
                    className="mb-3"
                  />
                  <div className="flex gap-2">
                    <Button onClick={() => handleIndividualUpload(r.key)} disabled={loading}>
                      Enviar
                    </Button>
                    <Button variant="outline" onClick={() => handleFileChange(r.key)} disabled={loading}>
                      Limpar
                    </Button>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>Tipo: <strong>{r.key}</strong></p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Atualizacao;
