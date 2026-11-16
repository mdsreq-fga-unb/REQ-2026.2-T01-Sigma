# SIGMA â€“ Frontend

Interface web do SIGMA (Next.js 16 + React 19 + Axios + TypeScript).
Escopo atual: **UC01 â€“ Gerenciar AutenticaÃ§Ã£o**, **UC02 â€“ Gerenciar UsuÃ¡rios Administrativos**,
**UC04 â€“ Gerenciar Fichas de MatrÃ­cula**, **UC06 â€“ Gerenciar Estrutura Escolar** e
**UC08 â€“ Consultar Registros** (busca de alunos, turmas e etapas).

## Como rodar

### OpÃ§Ã£o 1: com Docker (recomendado)

Na raiz do projeto, crie o arquivo `.env` a partir do exemplo do backend e ajuste os valores
necessÃ¡rios, especialmente `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`,
`JWT_SECRET_KEY`, `ADMIN_EMAIL` e `ADMIN_PASSWORD`.

```bash
cd ..
cp .env.example .env
# ajuste as variÃ¡veis do .env

docker compose up --build
```

Acesse:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000` (somente dentro da rede do Docker, usado pelo frontend via proxy)
- DocumentaÃ§Ã£o Swagger: `http://localhost:8000/docs`

Essa opÃ§Ã£o sobe o PostgreSQL, o backend FastAPI e o frontend Next.js juntos. No container do
frontend, `SIGMA_API_MOCK` estÃ¡ desligado e a aplicaÃ§Ã£o usa a API real do backend.

### OpÃ§Ã£o 2: localmente com Node.js

Requisitos: Node.js 20+.

```bash
cd frontend
npm install
npm run dev
```

Acesse `http://localhost:3000`. Em `npm run dev` o frontend usa um **mock da API** (ver abaixo),
configurado em `.env.development`.

### Contas do mock

Todas com a senha `Sigma@2026`:

| E-mail | Perfil | SituaÃ§Ã£o |
| --- | --- | --- |
| secretaria@exemplo.com | Administrador | ativa |
| coordenacao@exemplo.com | Administrador | ativa |
| secretaria2@exemplo.com | UsuÃ¡rio | ativa |
| inativa@exemplo.com | UsuÃ¡rio | **inativa** (testa o FE05 do UC01) |

Errar a senha 5 vezes bloqueia a conta por 15 minutos (RN16). Os dados ficam em memÃ³ria e
voltam ao estado inicial quando o servidor de desenvolvimento Ã© reiniciado.

## Scripts

| Comando | DescriÃ§Ã£o |
| --- | --- |
| `npm run dev` | servidor de desenvolvimento |
| `npm run build` | build de produÃ§Ã£o |
| `npm start` | serve o build de produÃ§Ã£o |
| `npm run typecheck` | checagem de tipos |

## Estrutura

```
src/
â”œâ”€â”€ app/
â”‚   â”œâ”€â”€ (auth)/login/           # UC01 â€“ tela de login
â”‚   â”œâ”€â”€ (app)/                  # Ã¡rea autenticada (layout com sidebar)
â”‚   â”‚   â”œâ”€â”€ alunos/             # UC08 â€“ lista e busca; novo/ â€“ novo aluno; [id]/ â€“ card e abas (UC04)
â”‚   â”‚   â”œâ”€â”€ turmas/             # UC06/UC08 â€“ turmas e etapas: listagem, busca, cadastro, inativaÃ§Ã£o
â”‚   â”‚   â””â”€â”€ usuarios/           # UC02 â€“ listagem, cadastro e inativaÃ§Ã£o
â”‚   â””â”€â”€ api/mock/               # mock da API (somente com SIGMA_API_MOCK=true)
â”œâ”€â”€ components/
â”‚   â”œâ”€â”€ ui/                     # Button, TextField, Alert, Modal, Toast, Icons
â”‚   â”œâ”€â”€ layout/                 # Sidebar, UserCard, BrandPanel, AppShell, PageHeader
â”‚   â”œâ”€â”€ auth/                   # LoginForm
â”‚   â””â”€â”€ usuarios/               # UsuariosTable, NovoUsuarioModal, InativarUsuarioModal
â”‚   â””â”€â”€ alunos/                 # AlunosView, NovoAlunoForm, card/ (layout, visÃ£o geral, modais), termos/
â”‚   â””â”€â”€ turmas/                 # TurmasEtapasView, BuscaEstrutura, TurmasTable, EtapasList, modais, useTurmasEtapas
â”œâ”€â”€ services/                   # api.ts (Axios) e um *.service.ts por recurso (auth, usuarios, alunos, turmas, etapas)
â”œâ”€â”€ hooks/                      # useAuth, useInactivityLogout, useTheme
â”œâ”€â”€ lib/                        # mensagens, validaÃ§Ãµes, formataÃ§Ã£o, constantes de sessÃ£o
â”œâ”€â”€ mocks/                      # estado em memÃ³ria do mock
â”œâ”€â”€ styles/tokens.css           # tokens de cor/tipografia (tema claro e escuro)
â”œâ”€â”€ types/
â””â”€â”€ proxy.ts                    # proteÃ§Ã£o de rotas (antigo middleware.ts â€“ renomeado no Next 16)
```

## ConvenÃ§Ãµes

- Componentes **nÃo** chamam o Axios diretamente: usam as funÃ§Ãµes de `services/*.service.ts`.
- O interceptor de `services/api.ts` converte toda falha em um `ApiError` (`{ status, code, message }`):
  - sem resposta (timeout, servidor fora do ar) â†’ `FALHA_CONEXAO`;
  - `401` (exceto no prÃ³prio login) â†’ redireciona para `/login`.
- O login usa `timeout` de 2 s (RNF05); acima disso exibe a mensagem do FE03.
- Textos exibidos ao usuÃ¡rio ficam em `lib/mensagens.ts`.
- Cores sempre via variÃ¡veis CSS (`styles/tokens.css`), o que permite o modo escuro.

## Contrato proposto para o backend

O mock implementa o contrato abaixo. Ele Ã© uma **proposta** para alinhar com a equipe do backend
(seÃ§Ã£o 6.2, item 6 do documento de frontend).

**SessÃ£o:** o backend real responde ao login com `{access_token, token_type, expires_in}`. O frontend
guarda o JWT no cookie `sigma_token` (lido pelo `proxy.ts`) e o envia em `Authorization: Bearer <token>`.
A cada requisiÃ§Ã£o autenticada o backend devolve `X-Renewed-Token` (RN17), que substitui o token salvo.
`GET /auth/me` retorna `is_Admin`, convertido para `perfil` em `auth.service.ts`. O mock mantÃ©m o
cookie `httpOnly` e devolve o `Usuario` direto no login; os dois formatos sÃ£o aceitos.

**Erros** no formato do FastAPI: `{"detail": {"code": "<CODIGO>", "message": "..."}}`. Quando o
backend responde sÃ³ `{"detail": "<texto>"}`, o cÃ³digo Ã© inferido pelo status (`401` no login â†’
`CREDENCIAIS_INVALIDAS`, `423` â†’ `CONTA_BLOQUEADA`, `403` no login â†’ `CONTA_INATIVA`, `401`/`403`
nas demais rotas â†’ `NAO_AUTENTICADO`/`SEM_PERMISSAO`, `404` â†’ `NAO_ENCONTRADO`).

**UsuÃ¡rios:** as rotas `/usuarios` seguem o formato do backend (`UsuarioBackend` =
`{id, nome, email, is_Admin, ativo, created_at}`, listagem paginada); `usuarios.service.ts` converte
para `Usuario`. O mock devolve o mesmo formato. JÃ¡ `/auth/login` e `/auth/me` do mock devolvem `Usuario`.

**Etapas:** o backend nÃ£o tem `status` nem `quantidadeTurmas` em Etapa; o frontend assume `ATIVO` e `0`.
`PATCH /turmas/{id}/reativar` ainda nÃ£o existe no backend (fora do MVP); o modal exibe aviso no `404`.

| MÃ©todo e rota | Sucesso | Erros |
| --- | --- | --- |
| `POST /auth/login` `{email, senha}` | `200` Usuario + cookie | `401 CREDENCIAIS_INVALIDAS`, `423 CONTA_BLOQUEADA`, `403 CONTA_INATIVA` |
| `POST /auth/logout` | `204` | â€” |
| `GET /auth/me` | `200` Usuario | `401 NAO_AUTENTICADO` |
| `GET /usuarios?pagina=&tamanho=` | `200` `{itens: UsuarioBackend[], total, pagina, tamanho}` | `401` |
| `POST /usuarios` `{nome, email, administrador, senha}` | `201` UsuarioBackend | `403 SEM_PERMISSAO`, `409 EMAIL_EM_USO`, `422 SENHA_FORA_PADRAO`, `422 DADOS_INVALIDOS` |
| `PATCH /usuarios/{id}/inativar` | `200` UsuarioBackend | `403 SEM_PERMISSAO`, `404 NAO_ENCONTRADO`, `422` (prÃ³pria conta) |
| `PATCH /usuarios/{id}/reativar` | `200` UsuarioBackend | `403 SEM_PERMISSAO`, `404 NAO_ENCONTRADO`, `409 STATUS_INVALIDO` (jÃ¡ ativa) |
| `GET /alunos?busca=&status=&turmaId=&pagina=&tamanhoPagina=` | `200` ListaAlunos | `401` |
| `POST /alunos` `{aluno, matricula}` | `201` AlunoCard ativo | `409 CPF_EM_USO`, `409 ETAPA_INATIVA`, `422 DADOS_INVALIDOS` |
| `GET /alunos/{id}` | `200` AlunoCard | `404 NAO_ENCONTRADO` |
| `PUT /alunos/{id}/termos/{uso-imagem\|saida\|compromisso}` | `200` AlunoCard | `404`, `409 MATRICULA_INATIVA`, `422 FICHAS_INCOMPLETAS`, `422 DADOS_INVALIDOS` |
| `PATCH /alunos/{id}/inativar` | `200` AlunoCard inativo | `404`, `409 STATUS_INVALIDO` |
| `PATCH /alunos/{id}/reativar` | `200` AlunoCard ativo | `404`, `409 STATUS_INVALIDO` |
| `PATCH /alunos/{id}/turma` `{turmaId}` | `200` AlunoCard | `404`, `409 MATRICULA_INATIVA`, `409 TURMA_INATIVA`, `409 ETAPA_INATIVA`, `422` |
| `GET /usuarios` | `200` Usuario[] | `401` |
| `POST /usuarios` `{nome, email, administrador, senha}` | `201` Usuario | `403 SEM_PERMISSAO`, `409 EMAIL_EM_USO`, `422 SENHA_FORA_PADRAO`, `422 DADOS_INVALIDOS` |
| `PATCH /usuarios/{id}/inativar` | `200` Usuario | `403 SEM_PERMISSAO`, `404 NAO_ENCONTRADO`, `422` (prÃ³pria conta) |
| `PATCH /usuarios/{id}/reativar` | `200` Usuario | `403 SEM_PERMISSAO`, `404 NAO_ENCONTRADO`, `409 STATUS_INVALIDO` (jÃ¡ ativa) |
| `GET /matriculas` | `200` Matricula[] | `401` |
| `POST /matriculas` `{aluno, fichas}` | `201` Matricula pendente | `409 CPF_EM_USO`, `422 DADOS_INVALIDOS` |
| `GET /matriculas/{id}` | `200` Matricula com histÃ³rico | `401`, `404 NAO_ENCONTRADO` |
| `PUT /matriculas/{id}` `{aluno, fichas}` | `200` Matricula pendente ou ativa, conforme completude | `409 CPF_EM_USO`, `409 MATRICULA_EM_USO`, `409 MATRICULA_INATIVA`, `422 DADOS_INVALIDOS` |
| `PATCH /matriculas/{id}/inativar` | `200` Matricula inativa | `404 NAO_ENCONTRADO` |
| `PATCH /matriculas/{id}/reativar` | `200` Matricula ativa | `404 NAO_ENCONTRADO`, `409 CPF_EM_USO`, `422 FICHAS_INCOMPLETAS` |
| `GET /turmas?busca=&status=` | `200` Turma[] | `401` |
| `POST /turmas` `{nome, etapaId}` | `201` Turma ativa | `409 TURMA_NOME_EM_USO`, `409 ETAPA_INATIVA`, `422 DADOS_INVALIDOS` |
| `PATCH /turmas/{id}/inativar` | `200` Turma inativa | `404 NAO_ENCONTRADO`, `409 STATUS_INVALIDO` |
| `PATCH /turmas/{id}/reativar` | `200` Turma ativa | `404 NAO_ENCONTRADO`, `409 STATUS_INVALIDO`, `409 ETAPA_INATIVA` |
| `GET /etapas?busca=&status=` | `200` Etapa[] | `401` |
| `POST /etapas` `{nome}` | `201` Etapa ativa | `409 ETAPA_NOME_EM_USO`, `422 DADOS_INVALIDOS` |

**Busca de turmas e etapas (UC08 FP02):** `busca` Ã© o nome completo ou parcial e `status` Ã©
`ATIVO` ou `INATIVO`. Os dois sÃ£o opcionais: sem `status`, vÃªm todos (o filtro "Todos" nÃ£o envia
o parÃ¢metro). Registros inativos tambÃ©m aparecem na busca (RN12). Por decisÃ£o do time, a busca
**nÃ£o** ignora acentos nem maiÃºsculas/minÃºsculas. O frontend chama `/turmas` e `/etapas` em paralelo
com o mesmo filtro, e a busca sÃ³ Ã© disparada pelo botÃ£o **Buscar** ou pela tecla Enter.

```ts
type StatusEstrutura = "ATIVO" | "INATIVO";

interface Turma {
  id: string;
  nome: string;
  etapa: { id: string; nome: string };
  quantidadeAlunos: number;
  status: StatusEstrutura;
}

interface Etapa {
  id: string;
  nome: string;
  quantidadeTurmas: number; // turmas vinculadas, ativas e inativas
  status: StatusEstrutura;
}
```

**Alunos (UC04 e UC08 FP01):** o backend ainda nÃ£o tem essas rotas; o frontend usa o mock.
A busca de alunos por nome completo ou parcial e **ignora** acentos e maiúsculas/minúsculas (RF21),
com filtros opcionais de status e turma e paginação no servidor. `?turma=<id>` na URL de `/alunos`
(link "Ver alunos" da tela de turmas) abre a lista já filtrada.
O card criado são com os dados pessoais e da matrícula (RF08); os termos são salvos um a um em
`PUT /alunos/{id}/termos/{termo}`, com confirmação (RF23). Cada termo pendente vem como `null`.
Requerimento de matrí­cula e ficha socioeconomica ainda não tem formulário: o card informa se
estão preenchidas. Toda alteração registra autor e data no histórico (RF17), exposto em
`ultimaEdicao`. Card inativo não aceita edição (`409 MATRICULA_INATIVA`, RN10). O mock de alunos apenas **consulta** turmas e etapas
para exibir nomes e validar o vínculo; ele não altera o estado da tela de Turmas e etapas. Os tipos completos
(`AlunoCard`, `TermosAluno`, `ListaAlunos`, `NovoAlunoPayload`) estão em `src/types/index.ts`.
No mock, o card é criado primeiro com dados pessoais e informações iniciais de matri­cula,
e recebe o status pendente. Dentro do perfil do aluno, a equipe preenche e salva as fichas.
O card reúne os dados cadastrais do aluno e as fichas Requerimento,
Socioeconômica, autorização de imagem, autorização de saÃ­da e compromisso escolar.
Requerimento e Socioeconômica seguem o formulário do protótipo: incluem documentação
civil, filiação, saúde, compromisso de entrega de documentos, renovações e transferência;
endereço, moradia, transporte, núcleo familiar, propriedades adicionais e declaração
socioeconômica, respectivamente. Campos pessoais compartilhados são mantidos no cadastro
do aluno. A matrícula é ativada após o preenchimento das fichas obrigatórias e o aceite
do compromisso escolar; salvamentos incompletos preservam os dados e mantêm o status pendente.
Edições e mudanças de status registram data, autor e campos
alterados no histórico. O estado do mock é mantido em memória e reinicializado com o
servidor de desenvolvimento.

```ts
interface Matricula {
  id: string;
  aluno: DadosAluno;
  fichas: FichasMatricula;
  status: "PENDENTE" | "ATIVA" | "INATIVA";
  criadaEm: string;
  atualizadaEm: string;
  historico: {
    id: string;
    data: string;
    autor: string;
    tipo: "CRIACAO" | "EDICAO" | "INATIVACAO" | "REATIVACAO";
    alteracoes: string[];
  }[];
}
```

```ts
interface Usuario {
  id: string;
  nome: string;
  email: string;
  perfil: "ADMINISTRADOR" | "USUARIO";
  ativo: boolean;
  criadoEm: string;        // ISO 8601
  criadoPor: string | null; // nome de quem criou
}
```

### Usando o backend real

Crie `frontend/.env.local` (ver `.env.example`):

```
NEXT_PUBLIC_API_URL=/api/backend
BACKEND_URL=http://localhost:8001
SIGMA_API_MOCK=false
```

As chamadas para `/api/backend/*` são repassadas pelo Next ao FastAPI (`next.config.ts`).
Assim frontend e API ficam na mesma origem, o cookie de seção chega ao navegador e o
`proxy.ts` consegue verificar se existe sessÃ£o antes de renderizar as rotas internas.