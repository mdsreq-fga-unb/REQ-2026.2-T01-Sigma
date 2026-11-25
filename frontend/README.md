# SIGMA – Frontend

Interface web do SIGMA (Next.js 16 + React 19 + Axios + TypeScript).

## Como rodar

### Opção 1: com Docker (recomendado)

Na raiz do projeto, crie o arquivo `.env` a partir do exemplo do backend e ajuste os valores
necessários, especialmente `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`,
`JWT_SECRET_KEY`, `ADMIN_EMAIL` e `ADMIN_PASSWORD`.

```bash
cd ..
cp .env.exemple .env
# ajuste as variáveis do .env

docker compose up --build
```

Acesse:

- Frontend: `http://localhost:3000`
- Backend (API): `http://localhost:8001`
- Documentação Swagger: `http://localhost:8001/docs` (ou conforme porta exposta)

O serviço `frontend` no Docker Compose usa a API real via rewrite/proxy (`/api/backend`).
Em banco novo, crie o primeiro admin:

```bash
docker compose exec -T backend python -m app.scripts.seed_admin
```

### Opção 2: localmente com Node.js

Requisitos: Node.js 20+.

```bash
cd frontend
npm install
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## Backend, mock e integração com a API

O frontend consome a API em `NEXT_PUBLIC_API_URL` (padrão no desenvolvimento: `/api/mock`). O cliente HTTP ([src/services/api.ts](src/services/api.ts)) envia o token de sessão, persiste `X-Renewed-Token` quando presente e redireciona para `/login` em `401` fora da tela de autenticação.

- **Modo mock (desenvolvimento sem FastAPI):** rotas em `src/app/api/mock/*` espelham contratos simulados. Variáveis típicas em `.env.development`: `NEXT_PUBLIC_API_URL=/api/mock` e `SIGMA_API_MOCK=true`.
- **Modo backend real (Docker/local):** use o rewrite do Next para manter mesma origem e repassar headers de renovação de token. Configure em `.env.local` (ou variáveis do serviço `frontend`):
  - `NEXT_PUBLIC_API_URL=/api/backend`
  - `BACKEND_URL=http://localhost:8001` (local, com backend publicado na porta 8001) ou `BACKEND_URL=http://backend:8000` (entre containers no Docker Compose)
  - `SIGMA_API_MOCK=false`

As chamadas para `/api/backend/*` são repassadas pelo Next ao FastAPI (`next.config.ts`), permitindo que o navegador mantenha a mesma origem e que o token renovado seja tratado pelo cliente.

**Contrato UC04/alunos (estado atual):**
- **Integrado ao backend real (adaptação no front, id do card = id da matrícula):** ficha socioeconômica (`GET/PUT /matriculas/{id}/socioeconomica`), termo de uso de imagem (`GET/PUT /matriculas/{id}/termo-imagem` e texto em `GET /termos/uso-imagem/texto`), termo de saída (`GET/PUT /matriculas/{id}/termo-saida`) e exportação PDF (`GET /matriculas/{id}/socioeconomica|termo-imagem|termo-saida/pdf`) quando disponível.
- **Parcial/no mock apenas:** a UI de requerimento ainda usa o formulário legado no modo real enquanto a adaptação completa do contrato de `GET/PUT /matriculas/{id}/requerimento` não é finalizada; termo de compromisso permanece mock/local por ausência de rotas no backend.
- **Bloqueios de backend (fora desta integração):** listar/buscar/criar card agregado (`/alunos`), status consolidado de fichas em uma única rota, inativar/reativar/vincular turma, documentos e histórico/`ultimaEdicao`. Nessas áreas o comportamento em modo real pode ser limitado. Auth, usuários, etapas e turmas seguem integráveis pelas rotas existentes em `app/routes/`.

## Scripts

```bash
npm run dev       # servidor de desenvolvimento
npm run build     # build de produção
npm run start     # inicia build de produção
npm run lint      # ESLint
npm run typecheck # verificação TypeScript
```