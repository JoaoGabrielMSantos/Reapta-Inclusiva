import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Card } from '@/components/ui/card';

export default function Login(): JSX.Element {
  const [nFuncionario, setNFuncionario] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  // default redirect after login should be the protected dashboard
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!nFuncionario.trim() || !senha.trim()) {
      setError('Preencha Nº Funcionário e a senha.');
      return;
    }

    // Simula autenticação: aqui você pode chamar sua API
    // Salva um flag simples no localStorage
    localStorage.setItem('auth', 'true');
    localStorage.setItem('nFuncionario', nFuncionario);

    // Redireciona para onde o usuário veio (ou /)
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md p-8">
        <h1 className="text-2xl font-bold mb-2">Acesso</h1>
        <p className="text-sm text-muted-foreground mb-6">Entre com seu Nº Funcionário e senha</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nº Funcionário</label>
            <input
              value={nFuncionario}
              onChange={(e) => setNFuncionario(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="0001"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Senha</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Sua senha"
            />
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <div className="flex items-center justify-between">
            <button type="submit" className="bg-primary text-white px-4 py-2 rounded-md">Entrar</button>
          </div>
        </form>
      </Card>
    </div>
  );
}
