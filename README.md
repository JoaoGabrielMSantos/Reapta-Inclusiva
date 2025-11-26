# Reapta-Inclusiva — Guia de hospedagem

Este documento explica como hospedar o frontend e o backend deste projeto, variáveis de ambiente necessárias, testes locais e recomendações de segurança.
## Resumo da arquitetura
- Frontend: Vite + React (build estático em `dist`). Pode ser hospedado em Netlify, Cloudflare Pages, GitHub Pages, ou qualquer host estático.
- Backend: Express em `server/index.js` — processo Node.js persistente (Render, Railway, Fly, DigitalOcean App, VPS). O backend expõe endpoints `POST /api/upload`, `GET/POST /api/cleanup` e serve arquivos em `/data`.
## Variáveis de ambiente importantes (backend)
- `PORT` — porta do servidor (padrão `3000`).
- `CORS_ORIGIN` — controla origens permitidas para CORS.
	- `*` permite qualquer origem (não use com credenciais).
	- `https://meu-front.example.com` permite apenas esse domínio (recomendado em produção).
	- `https://a.com,https://b.com` separadas por vírgula para múltiplas origens.
- `CLEANUP_TTL_MINUTES` — tempo em minutos após o qual pastas de sessão antigas são removidas automaticamente (padrão `15`).
## Hospedando o backend (exemplo: Render / Railway / VPS)
1. No repositório, confirme que `package.json` contém scripts:

```json
2. Criar serviço "Web Service" no provedor (Render/Railway/Fly): configure o repositório, e use:
- Build command: normalmente vazio (o provedor roda `npm install`).
- Start command: `npm run start:server` (ou `npm start`).
3. Defina variáveis de ambiente no painel do serviço:
- `CORS_ORIGIN` = domínio do frontend (ex.: `https://meu-front.example.com`) ou `*` para testes.
- `CLEANUP_TTL_MINUTES` = `15` (padrão) ou conforme sua política.
4. Deploy — verifique saúde:

```powershell
Observações sobre armazenamento:
- Os arquivos são gravados em `server/data/<sessionId>/` por sessão de aba. Em muitos provedores PaaS, o filesystem é efêmero e será perdido em novos deploys ou quando a instância for reiniciada. Para persistência duradoura utilize S3 / Cloud Storage.
## Hospedando o frontend (build estático)
1. No ambiente de build do host do frontend (Netlify/Cloudflare Pages/GitHub Actions) defina a variável de build:
- `VITE_API_BASE` = `https://<seu-backend>` (sem barra no final)
2. Comandos típicos de build e deploy:

Netlify / Cloudflare Pages / GitHub Pages: use `npm run build` e publique a pasta `dist`.
Exemplo local (PowerShell):
```powershell
npm install
## Testes locais (PowerShell)
1. Iniciar backend:
```powershell
npm install
2. (Opcional) Iniciar frontend em modo dev:
```powershell
npm run dev
3. Testar upload via curl (simula frontend):
```powershell
curl -X POST "http://localhost:3000/api/upload" -F "file=@C:\caminho\para\relatario_de_vendas.csv" -F "reportType=vendas" -F "uploadedAt=$(Get-Date -Format o)"
4. Verificar se arquivo foi gravado (PowerShell):
```powershell
dir .\server\data\* -Recurse
5. Testar cleanup (simula fechamento da aba):
```powershell
curl "http://localhost:3000/api/cleanup?sessionId=<sessionId>"
## CORS — como permitir uploads de qualquer dispositivo
- Para permitir uploads de qualquer origem (útil em testes), defina `CORS_ORIGIN='*'` no backend. Isso permite que navegadores façam requests cross-origin, porém não permite envio de credenciais (cookies) quando `*` é usado.
- Em produção, especifique explicitamente os domínios frontends em `CORS_ORIGIN` para habilitar `Access-Control-Allow-Credentials` (cookies/autenticação).
Exemplos PowerShell:
```powershell
# $env:CORS_ORIGIN='*'           # permite qualquer origem (teste)
# $env:CORS_ORIGIN='https://meusite.example.com'  # produção
npm run start:server
## Segurança e limpeza de dados
- Arquivos enviados ficam em `server/data/<sessionId>/` e o frontend tenta limpar essa pasta quando a aba é fechada (usando `navigator.sendBeacon` / `Image` ping / fetch keepalive).
- Para garantir que arquivos não se acumulem, o backend roda um job periódico que remove sessões com mais de `CLEANUP_TTL_MINUTES` minutos.
- Se precisa que os arquivos sobrevivam a reinícios/deploys, use armazenamento externo (S3) e adapte `server/index.js` para salvar/ler desse bucket.
## Problemas comuns e solução rápida
- Upload retorna 415: verifique que o arquivo é `.csv`.
- Dashboard mostra HTML em vez de CSV: provavelmente a URL do backend está errada; confirme `VITE_API_BASE` e teste `curl https://<backend>/data/<arquivo>.csv`.
- CORS bloqueando requests: ajuste `CORS_ORIGIN` para incluir o domínio do frontend e rode redeploy do backend.
## Quer que eu faça isso por você?
- Posso gerar exemplos de `render.yaml` / `Procfile` para Railway/Fly, adicionar scripts de deploy ou adaptar o servidor para gravar em S3.

Se quiser, eu testo localmente os passos (faço upload via curl e mostro as respostas) ou crio instruções específicas para um provedor (Render, Railway, Netlify). Diga qual prefere.
