# Reapta Inclusiva

**Acesse o projeto online:** [https://reapta-inclusiva.onrender.com](https://reapta-inclusiva.onrender.com)

---

> ⚠️ **ATENÇÃO:**  
> Este repositório é mantido exclusivamente para fins acadêmicos e **NÃO aceita contribuições, alterações, sugestões, pedidos, recomendações ou qualquer tipo de intervenção externa**.  
> **Nenhuma solicitação será analisada ou incorporada ao projeto.**

Este repositório contém o código-fonte do projeto **Reapta Inclusiva**, desenvolvido no contexto acadêmico para a disciplina de **Residência Porto Digital**. O projeto foi concebido em parceria com a empresa Reapta Inclusiva com o objetivo de otimizar a análise de dados, facilitando a leitura de planilhas através da conversão automática de informações em gráficos visuais interativos.

## 📋 Sobre o Projeto

A aplicação consiste em uma plataforma web _fullstack_ que processa arquivos de dados e os apresenta de forma gráfica e interativa. O sistema visa simplificar a interpretação de informações complexas contidas em planilhas, oferecendo uma interface amigável para a visualização de métricas vitais para o negócio.

O desenvolvimento foca na integração robusta entre um frontend responsivo e um backend capaz de manipular uploads de arquivos de forma eficiente.

## 🚀 Principais Funcionalidades

- **Upload de Arquivos**: Envio de planilhas e arquivos de dados para processamento no servidor.
- **Visualização de Dados**: Geração automática de gráficos (barras, linhas, pizza) baseados nos dados processados.
- **Dashboard Interativo**: Interface limpa e organizada para análise de métricas.
- **Responsividade**: Layout adaptável para desktops, tablets e dispositivos móveis.
- **Feedback Visual**: Sistema de notificações e toasts para feedback imediato das ações do usuário.

## 💻 Linguagens Utilizadas

As principais linguagens de programação e marcação que compõem a base do projeto são:

- **TypeScript**: Linguagem principal do Frontend. Adiciona segurança e tipagem ao código, prevenindo erros comuns durante o desenvolvimento.
- **JavaScript**: Linguagem utilizada no Backend (Node.js) para lógica do servidor e manipulação de dados.
- **HTML5 & CSS3**: Estrutura semântica e estilização base da aplicação.

## 🛠 Tecnologias Utilizadas

Abaixo, uma explicação simples das ferramentas escolhidas e seus papéis no projeto:

### Frontend (Interface do Usuário)
- **React**: Biblioteca principal para construir a interface visual e interativa com a qual o usuário navega.
- **Vite**: Ferramenta de construção que torna o desenvolvimento extremamente rápido e otimizado.
- **Tailwind CSS**: Framework de estilos que permite criar layouts bonitos e responsivos de forma ágil.
- **Recharts**: Biblioteca especializada em transformar dados numéricos em gráficos visuais (barras, linhas, pizza).
- **Radix UI**: Conjunto de componentes acessíveis (como menus e botões) prontos para uso.
- **TanStack Query**: Gerencia a comunicação com o servidor, mantendo os dados da tela sempre atualizados.

### Backend (Servidor e API)
- **Node.js**: Ambiente que permite rodar JavaScript fora do navegador, sustentando o servidor.
- **Express**: Framework que facilita a criação das rotas da API e o gerenciamento das requisições.
- **Multer**: Ferramenta essencial para receber os arquivos (planilhas) que os usuários enviam pelo site.

## ☁️ Hospedagem e Deploy

O projeto encontra-se hospedado e acessível publicamente através da plataforma **Render**.

- **Plataforma**: Render
- **URL de Acesso**: [https://reapta-inclusiva.onrender.com](https://reapta-inclusiva.onrender.com)

A infraestrutura do Render foi escolhida devido à sua compatibilidade nativa com aplicações Node.js e React, além de oferecer integração contínua (CI/CD) que facilita a atualização automática do ambiente de produção. A aplicação em nuvem garante que as funcionalidades de processamento de dados e visualização estejam disponíveis de forma estável e performática para os usuários finais.

## 📂 Estrutura de Pastas

```
Reapta-Inclusiva/
├── data/                # Diretório para arquivos de dados
├── public/              # Arquivos estáticos públicos
├── server/              # Backend/API
│   └── index.js
├── src/                 # Frontend (React)
│   ├── components/
│   ├── hooks/
│   ├── pages/
│   └── lib/
├── eslint.config.js
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── vite.config.ts
```

## ⚙️ Instalação e Execução Detalhada

Para rodar o projeto corretamente em sua máquina local, é necessário executar o **backend (servidor)** e o **frontend (interface)** simultaneamente. Isso garante que a interface possa se comunicar com a API para enviar arquivos e receber dados.

Siga os passos abaixo utilizando **dois terminais distintos**:

### Passo 1: Clone o Repositório
```bash
git clone https://github.com/JoaoHSantana2007/Reapta-Inclusiva.git
cd Reapta-Inclusiva
```

### Passo 2: Execute os Comandos nos Terminais

Abra duas abas ou janelas do seu terminal e siga as instruções para cada um:

#### **Terminal 1 - Backend (Servidor)**
Este terminal iniciará a API responsável pelo processamento dos dados.
```bash
# Instala as dependências do projeto (caso ainda não tenha feito)
npm install

# Inicia o servidor backend
npm run start:server
```
*O servidor backend ficará ativo aguardando requisições.*

#### **Terminal 2 - Frontend (Interface)**
Este terminal iniciará a aplicação visual com a qual o usuário interage.
```bash
# Garante que as dependências estejam instaladas
npm install

# Inicia o ambiente de desenvolvimento do frontend
npm run dev
```
*O Vite iniciará o servidor de desenvolvimento local (geralmente em `http://localhost:5173`).*

### Resumo da Execução

| Terminal | Função | Comandos |
|----------|--------|----------|
| **Terminal 1** | **Backend** | `npm install` <br> `npm run start:server` |
| **Terminal 2** | **Frontend** | `npm install` <br> `npm run dev` |

Após executar os comandos em ambos os terminais, acesse a aplicação pelo navegador no endereço indicado pelo Terminal 2 (ex: `http://localhost:5173`).

## 🔌 Endpoints da API

O servidor backend expõe endpoints REST para o gerenciamento e consumo de dados. Abaixo estão as principais rotas utilizadas:

| Método | Rota | Descrição |
|---|---|---|
| **POST** | `/api/upload` | Responsável por receber o upload de arquivos `.csv`. O endpoint utiliza o `multer` para processar o arquivo, sanitiza o nome removendo caracteres especiais e o armazena na pasta segura do servidor. |
| **GET** | `/api/health` | Rota de verificação de status ("Health Check"). Retorna um JSON `{ ok: true }` para confirmar que a API está online e respondendo. |
| **GET** | `/data/:nome_do_arquivo` | Permite o acesso direto aos arquivos estáticos processados e armazenados na pasta `data`. Utilizado pelo frontend para ler o conteúdo das planilhas. |

## 🤝 Guia de Contribuição

> ⚠️ **IMPORTANTE:**  
> **Este repositório NÃO aceita contribuições, sugestões, pedidos de alteração ou qualquer tipo de recomendação de terceiros.**  
> Qualquer solicitação desse tipo será ignorada e não será processada.

## 📝 Licença

Este projeto foi desenvolvido para fins acadêmicos e não possui uma licença de código aberto especificada neste repositório. Todos os direitos sobre o nome e dados pertencem à **Reapta Inclusiva**.
