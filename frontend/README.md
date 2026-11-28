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

**Contrato UC04/alunos:**
- `POST /alunos` cria aluno, responsável e matrícula; `GET /alunos/{id_aluno}` devolve a visão geral. A URL do card usa `id_aluno`; a resposta também traz `id_matricula`.
- Os endpoints de fichas/termos usam `id_matricula` em `/matriculas/{id_matricula}/...`: requerimento, socioeconômica, termo de imagem, termo de saída e termo de compromisso. As abas integradas usam esse id; PDFs disponíveis: `GET /matriculas/{id_matricula}/{socioeconomica|requerimento|termo-imagem|termo-saida|termo-compromisso}/pdf`.
- Requerimento: o formulário real carrega e salva o contrato de `GET/PUT /matriculas/{id_matricula}/requerimento`; ano de escolaridade e turma são somente leitura. A resposta usa `completa`.
- Ficha socioeconômica: `GET/PUT /matriculas/{id_matricula}/socioeconomica`; o formulário envia a lista completa de membros, preserva os IDs, usa os enums atuais de moradia/transporte e exibe dados pessoais somente leitura.
- Termos de imagem e saída convertem os formatos do formulário para os schemas reais, inclusive autorização de imagem não respondida (`null`). O texto oficial do termo vem de `GET /termos/uso-imagem/texto`.
- O cadastro envia `aluno.data_nasc`/`raca`, `responsavel.nome`/`parentesco`/`cpf`/`telefone` e `matricula.id_etapa`/`ano`/`data_matricula`. Nome e parentesco do responsável são obrigatórios. O sexo (`MASCULINO`/`FEMININO`) segue o enum da API; os rótulos de raça são convertidos para os nomes do enum backend (por exemplo, `PARDA` → `PARDO`). O campo ID/RG do formulário não é aceito pelo endpoint de cadastro e não é enviado.
- No modo real, a lista permanece vazia até o backend disponibilizar `GET /alunos` com busca. Inativar/reativar, vincular turma e histórico de edições também dependem de rotas futuras.
- Documentos digitais (UC05), por enquanto só no mock: `GET /alunos/{id}/documentos` devolve `{ itens, dataAceiteCompromisso }`; `POST` (multipart `arquivo` + `tipo`) anexa; `PUT /alunos/{id}/documentos/{documentoId}` (multipart `arquivo`) substitui; `GET .../{documentoId}/arquivo` baixa o PDF com o nome original. Um arquivo por tipo, só PDF; anexar e substituir geram linha "Documentos · Anexo" no histórico. No mock, os PDFs das fichas (`/matriculas/{id}/{ficha}/pdf`) são PDFs simples de exemplo.

**Configuração de ambiente:** o padrão continua sendo mock em desenvolvimento (`NEXT_PUBLIC_API_URL=/api/mock`, `SIGMA_API_MOCK=true`), para que o frontend funcione sem a API. Para testar com o backend, defina em `.env.local` ou no ambiente do serviço `frontend`:

```env
NEXT_PUBLIC_API_URL=/api/backend
BACKEND_URL=http://localhost:8001
SIGMA_API_MOCK=false
```

No Docker Compose, use `BACKEND_URL=http://backend:8000`. O navegador sempre chama `/api/backend`; o rewrite em `next.config.ts` encaminha a requisição pelo Next, evitando depender de CORS do FastAPI. Não configure `NEXT_PUBLIC_API_URL=http://localhost:8000` diretamente no browser.

## Scripts

```bash
npm run dev       # servidor de desenvolvimento
npm run build     # build de produção
npm run start     # inicia build de produção
npm run lint      # ESLint
npm run typecheck # verificação TypeScript
```