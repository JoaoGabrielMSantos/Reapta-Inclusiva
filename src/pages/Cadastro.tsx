import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type CargoOption = 'Administrador' | 'Atendente' | 'Gerente' | 'Outro';

export default function Cadastro(): JSX.Element {
  const [cargo, setCargo] = useState<CargoOption>('Atendente');
  const [nFuncionario, setNFuncionario] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmaSenha, setConfirmaSenha] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!nFuncionario.trim() || !senha.trim() || !confirmaSenha.trim()) {
      setError('Preencha todos os campos.');
      return;
    }

    if (senha !== confirmaSenha) {
      setError('As senhas não coincidem.');
      return;
    }

    // Simular persistência: armazenar usuários no localStorage
    try {
      const raw = localStorage.getItem('users');
      const users = raw ? JSON.parse(raw) : [];
      // verificar duplicidade de Nº Funcionário
      if (users.some((u: any) => u.nFuncionario === nFuncionario)) {
        setError('Já existe um usuário com esse Nº Funcionário.');
        return;
      }

      const newUser = { cargo, nFuncionario, senha };
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));

      // navegar para login
      navigate('/login');
    } catch (err) {
      setError('Erro ao salvar usuário.');
      console.error(err);
    }
  };

  return (
    <Layout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-2xl p-6">
          <h1 className="text-2xl font-bold mb-2">Cadastro de Funcionário</h1>
          <p className="text-sm text-muted-foreground mb-4">Crie uma conta para o funcionário</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Cargo</Label>
              <select
                value={cargo}
                onChange={(e) => setCargo(e.target.value as CargoOption)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option>Administrador</option>
                <option>Gerente</option>
                <option>Atendente</option>
                <option>Outro</option>
              </select>
            </div>

            <div>
              <Label>Nº Funcionário</Label>
              <Input value={nFuncionario} onChange={(e) => setNFuncionario(e.target.value)} placeholder="0001" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Senha</Label>
                <Input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="Senha" />
              </div>
              <div>
                <Label>Confirme a senha</Label>
                <Input type="password" value={confirmaSenha} onChange={(e) => setConfirmaSenha(e.target.value)} placeholder="Confirme a senha" />
              </div>
            </div>

            {error && <div className="text-sm text-red-600">{error}</div>}

            <div className="flex items-center justify-end">
              <Button type="submit">Cadastrar</Button>
            </div>
          </form>
        </Card>
      </div>
    </Layout>
  );
}
