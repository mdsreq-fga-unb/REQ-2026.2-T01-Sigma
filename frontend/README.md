# SIGMA – Frontend

Interface web do SIGMA (Next.js 16 + React 19 + Axios + TypeScript).
Escopo atual: **UC01 – Gerenciar Autenticação**, **UC02 – Gerenciar Usuários Administrativos**,
**UC04 – Gerenciar Fichas de Matrícula**, **UC06 – Gerenciar Estrutura Escolar** e
**UC08 – Consultar Registros** (busca de alunos, turmas e etapas).

## Como rodar

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

| E-mail | Perfil | Situação |
| --- | --- | --- |
| secretaria@exemplo.com | Administrador | ativa |
| coordenacao@exemplo.com | Administrador | ativa |
| secretaria2@exemplo.com | Usuário | ativa |
| inativa@exemplo.com | Usuário | **inativa** (testa o FE05 do UC01) |

Errar a senha 5 vezes bloqueia a conta por 15 minutos (RN16). Os dados ficam em memória e
voltam ao estado inicial quando o servidor de desenvolvimento é reiniciado.

## Scripts

| Comando | Descrição |
| --- | --- |
| `npm run dev` | servidor de desenvolvimento |
| `npm run build` | build de produção |
| `npm start` | serve o build de produção |
| `npm run typecheck` | checagem de tipos |

## Estrutura

```
src/
├── app/
│   ├── (auth)/login/           # UC01 – tela de login
│   ├── (app)/                  # área autenticada (layout com sidebar)
│   │   ├── alunos/             # UC08 – lista e busca; novo/ – novo aluno; [id]/ – card e abas (UC04)
│   │   ├── turmas/             # UC06/UC08 – turmas e etapas: listagem, busca, cadastro, inativação
│   │   └── usuarios/           # UC02 – listagem, cadastro e inativação
│   └── api/mock/               # mock da API (somente com SIGMA_API_MOCK=true)
├── components/
│   ├── ui/                     # Button, TextField, Alert, Modal, Toast, Icons
│   ├── layout/                 # Sidebar, UserCard, BrandPanel, AppShell, PageHeader
│   ├── auth/                   # LoginForm
│   └── usuarios/               # UsuariosTable, NovoUsuarioModal, InativarUsuarioModal
│   └── alunos/                 # AlunosView, NovoAlunoForm, card/ (layout, visão geral, modais), termos/
│   └── turmas/                 # TurmasEtapasView, BuscaEstrutura, TurmasTable, EtapasList, modais, useTurmasEtapas
├── services/                   # api.ts (Axios) e um *.service.ts por recurso (auth, usuarios, alunos, turmas, etapas)
├── hooks/                      # useAuth, useInactivityLogout, useTheme
├── lib/                        # mensagens, validações, formatação, constantes de sessão
├── mocks/                      # estado em memória do mock
├── styles/tokens.css           # tokens de cor/tipografia (tema claro e escuro)
├── types/
└── proxy.ts                    # proteção de rotas (antigo middleware.ts – renomeado no Next 16)
```

## Convenções

- Componentes **não** chamam o Axios diretamente: usam as funções de `services/*.service.ts`.
- O interceptor de `services/api.ts` converte toda falha em um `ApiError` (`{ status, code, message }`):
  - sem resposta (timeout, servidor fora do ar) → `FALHA_CONEXAO`;
  - `401` (exceto no próprio login) → redireciona para `/login`.
- O login usa `timeout` de 2 s (RNF05); acima disso exibe a mensagem do FE03.
- Textos exibidos ao usuário ficam em `lib/mensagens.ts`.
- Cores sempre via variáveis CSS (`styles/tokens.css`), o que permite o modo escuro.

## Contrato proposto para o backend

O mock implementa o contrato abaixo. Ele é uma **proposta** para alinhar com a equipe do backend
(seção 6.2, item 6 do documento de frontend).

**Sessão:** o backend real responde ao login com `{access_token, token_type, expires_in}`. O frontend
guarda o JWT no cookie `sigma_token` (lido pelo `proxy.ts`) e o envia em `Authorization: Bearer <token>`.
A cada requisição autenticada o backend devolve `X-Renewed-Token` (RN17), que substitui o token salvo.
`GET /auth/me` retorna `is_Admin`, convertido para `perfil` em `auth.service.ts`. O mock mantém o
cookie `httpOnly` e devolve o `Usuario` direto no login; os dois formatos são aceitos.

**Erros** no formato do FastAPI: `{"detail": {"code": "<CODIGO>", "message": "..."}}`. Quando o
backend responde só `{"detail": "<texto>"}`, o código é inferido pelo status (`401` no login →
`CREDENCIAIS_INVALIDAS`, `423` → `CONTA_BLOQUEADA`, `403` no login → `CONTA_INATIVA`, `401`/`403`
nas demais rotas → `NAO_AUTENTICADO`/`SEM_PERMISSAO`, `404` → `NAO_ENCONTRADO`).

**Usuários:** as rotas `/usuarios` seguem o formato do backend (`UsuarioBackend` =
`{id, nome, email, is_Admin, ativo, created_at}`, listagem paginada); `usuarios.service.ts` converte
para `Usuario`. O mock devolve o mesmo formato. Já `/auth/login` e `/auth/me` do mock devolvem `Usuario`.

**Etapas:** o backend não tem `status` nem `quantidadeTurmas` em Etapa; o frontend assume `ATIVO` e `0`.
`PATCH /turmas/{id}/reativar` ainda não existe no backend (fora do MVP); o modal exibe aviso no `404`.

| Método e rota | Sucesso | Erros |
| --- | --- | --- |
| `POST /auth/login` `{email, senha}` | `200` Usuario + cookie | `401 CREDENCIAIS_INVALIDAS`, `423 CONTA_BLOQUEADA`, `403 CONTA_INATIVA` |
| `POST /auth/logout` | `204` | — |
| `GET /auth/me` | `200` Usuario | `401 NAO_AUTENTICADO` |
| `GET /usuarios?pagina=&tamanho=` | `200` `{itens: UsuarioBackend[], total, pagina, tamanho}` | `401` |
| `POST /usuarios` `{nome, email, administrador, senha}` | `201` UsuarioBackend | `403 SEM_PERMISSAO`, `409 EMAIL_EM_USO`, `422 SENHA_FORA_PADRAO`, `422 DADOS_INVALIDOS` |
| `PATCH /usuarios/{id}/inativar` | `200` UsuarioBackend | `403 SEM_PERMISSAO`, `404 NAO_ENCONTRADO`, `422` (própria conta) |
| `PATCH /usuarios/{id}/reativar` | `200` UsuarioBackend | `403 SEM_PERMISSAO`, `404 NAO_ENCONTRADO`, `409 STATUS_INVALIDO` (já ativa) |
| `GET /alunos?busca=&status=&turmaId=&pagina=&tamanhoPagina=` | `200` ListaAlunos | `401` |
| `POST /alunos` `{aluno, matricula}` | `201` AlunoCard ativo | `409 CPF_EM_USO`, `409 ETAPA_INATIVA`, `422 DADOS_INVALIDOS` |
| `GET /alunos/{id}` | `200` AlunoCard | `404 NAO_ENCONTRADO` |
| `PUT /alunos/{id}/termos/{uso-imagem\|saida\|compromisso}` | `200` AlunoCard | `404`, `409 MATRICULA_INATIVA`, `422 FICHAS_INCOMPLETAS`, `422 DADOS_INVALIDOS` |
| `PATCH /alunos/{id}/inativar` | `200` AlunoCard inativo | `404`, `409 STATUS_INVALIDO` |
| `PATCH /alunos/{id}/reativar` | `200` AlunoCard ativo | `404`, `409 STATUS_INVALIDO` |
| `PATCH /alunos/{id}/turma` `{turmaId}` | `200` AlunoCard | `404`, `409 MATRICULA_INATIVA`, `409 TURMA_INATIVA`, `409 ETAPA_INATIVA`, `422` |
| `GET /turmas?busca=&status=` | `200` Turma[] | `401` |
| `POST /turmas` `{nome, etapaId}` | `201` Turma ativa | `409 TURMA_NOME_EM_USO`, `409 ETAPA_INATIVA`, `422 DADOS_INVALIDOS` |
| `PATCH /turmas/{id}/inativar` | `200` Turma inativa | `404 NAO_ENCONTRADO`, `409 STATUS_INVALIDO` |
| `PATCH /turmas/{id}/reativar` | `200` Turma ativa | `404 NAO_ENCONTRADO`, `409 STATUS_INVALIDO`, `409 ETAPA_INATIVA` |
| `GET /etapas?busca=&status=` | `200` Etapa[] | `401` |
| `POST /etapas` `{nome}` | `201` Etapa ativa | `409 ETAPA_NOME_EM_USO`, `422 DADOS_INVALIDOS` |

**Busca de turmas e etapas (UC08 FP02):** `busca` é o nome completo ou parcial e `status` é
`ATIVO` ou `INATIVO`. Os dois são opcionais: sem `status`, vêm todos (o filtro "Todos" não envia
o parâmetro). Registros inativos também aparecem na busca (RN12). Por decisão do time, a busca
**não** ignora acentos nem maiúsculas/minúsculas. O frontend chama `/turmas` e `/etapas` em paralelo
com o mesmo filtro, e a busca só é disparada pelo botão **Buscar** ou pela tecla Enter.

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

**Alunos (UC04 e UC08 FP01):** o backend ainda não tem essas rotas; o frontend usa o mock.
A busca de alunos é por nome completo ou parcial e **ignora** acentos e maiúsculas/minúsculas (RF21),
com filtros opcionais de status e turma e paginação no servidor. `?turma=<id>` na URL de `/alunos`
(link "Ver alunos" da tela de turmas) abre a lista já filtrada.
O card é criado só com os dados pessoais e da matrícula (RF08); os termos são salvos um a um em
`PUT /alunos/{id}/termos/{termo}`, com confirmação (RF23). Cada termo pendente vem como `null`.
Requerimento de matrícula e ficha socioeconômica ainda não têm formulário: o card só informa se
estão preenchidas. Toda alteração registra autor e data no histórico (RF17), exposto em
`ultimaEdicao`. Card inativo não aceita edição (`409 MATRICULA_INATIVA`, RN10). O mock de alunos apenas **consulta** turmas e etapas
para exibir nomes e validar o vínculo; ele não altera o estado da tela de Turmas e etapas. Os tipos completos
(`AlunoCard`, `TermosAluno`, `ListaAlunos`, `NovoAlunoPayload`) estão em `src/types/index.ts`.

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
Assim frontend e API ficam na mesma origem, o cookie de sessão chega ao navegador e o
`proxy.ts` consegue verificar se existe sessão antes de renderizar as rotas internas.
