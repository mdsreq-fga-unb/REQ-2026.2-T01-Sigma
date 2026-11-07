# SIGMA – Frontend

Interface web do SIGMA (Next.js 16 + React 19 + Axios + TypeScript).
Escopo atual: **UC01 – Gerenciar Autenticação**, **UC02 – Gerenciar Usuários Administrativos**
e **UC04 – Gerenciar Fichas de Matrícula**.

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
│   │   ├── alunos/             # UC04 – cards de matrícula, fichas e histórico
│   │   ├── turmas/             # placeholder (UC06)
│   │   └── usuarios/           # UC02 – listagem, cadastro e inativação
│   └── api/mock/               # mock da API (somente com SIGMA_API_MOCK=true)
├── components/
│   ├── ui/                     # Button, TextField, Alert, Modal, Toast, Icons
│   ├── layout/                 # Sidebar, UserCard, BrandPanel, AppShell, PageHeader
│   ├── auth/                   # LoginForm
│   └── usuarios/               # UsuariosTable, NovoUsuarioModal, InativarUsuarioModal
│   └── alunos/                 # MatriculaForm, MatriculasView
├── services/                   # api.ts (Axios), auth.service.ts, usuarios.service.ts, matriculas.service.ts
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

**Sessão:** cookie `httpOnly` chamado `sigma_session`, emitido no login e removido no logout.

**Erros** no formato do FastAPI: `{"detail": {"code": "<CODIGO>", "message": "..."}}`.

| Método e rota | Sucesso | Erros |
| --- | --- | --- |
| `POST /auth/login` `{email, senha}` | `200` Usuario + cookie | `401 CREDENCIAIS_INVALIDAS`, `423 CONTA_BLOQUEADA`, `403 CONTA_INATIVA` |
| `POST /auth/logout` | `204` | — |
| `GET /auth/me` | `200` Usuario | `401 NAO_AUTENTICADO` |
| `GET /usuarios` | `200` Usuario[] | `401` |
| `POST /usuarios` `{nome, email, administrador, senha}` | `201` Usuario | `403 SEM_PERMISSAO`, `409 EMAIL_EM_USO`, `422 SENHA_FORA_PADRAO`, `422 DADOS_INVALIDOS` |
| `PATCH /usuarios/{id}/inativar` | `200` Usuario | `403 SEM_PERMISSAO`, `404 NAO_ENCONTRADO`, `422` (própria conta) |
| `GET /matriculas` | `200` Matricula[] | `401` |
| `POST /matriculas` `{aluno, fichas}` | `201` Matricula ativa | `409 CPF_EM_USO`, `409 MATRICULA_EM_USO`, `422 FICHAS_INCOMPLETAS` |
| `GET /matriculas/{id}` | `200` Matricula com histórico | `401`, `404 NAO_ENCONTRADO` |
| `PUT /matriculas/{id}` `{aluno, fichas}` | `200` Matricula atualizada | `409 CPF_EM_USO`, `409 MATRICULA_EM_USO`, `409 MATRICULA_INATIVA`, `422 FICHAS_INCOMPLETAS` |
| `PATCH /matriculas/{id}/inativar` | `200` Matricula inativa | `404 NAO_ENCONTRADO` |
| `PATCH /matriculas/{id}/reativar` | `200` Matricula ativa | `404 NAO_ENCONTRADO`, `409 CPF_EM_USO`, `422 FICHAS_INCOMPLETAS` |

No mock, o card reúne os dados cadastrais do aluno e as fichas socioeconômica,
autorização de imagem, autorização de saída, compromisso escolar e requerimento de
matrícula. A matrícula só é ativada após o preenchimento das fichas obrigatórias e o
aceite do compromisso escolar. Edições e mudanças de status registram data, autor e
campos alterados no histórico. O estado do mock é mantido em memória e reinicializado
com o servidor de desenvolvimento.

```ts
interface Matricula {
  id: string;
  aluno: DadosAluno;
  fichas: FichasMatricula;
  status: "ATIVA" | "INATIVA";
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
BACKEND_URL=http://localhost:8000
SIGMA_API_MOCK=false
```

As chamadas para `/api/backend/*` são repassadas pelo Next ao FastAPI (`next.config.ts`).
Assim frontend e API ficam na mesma origem, o cookie de sessão chega ao navegador e o
`proxy.ts` consegue verificar se existe sessão antes de renderizar as rotas internas.
