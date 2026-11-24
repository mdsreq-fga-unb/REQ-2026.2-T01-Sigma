# REQ-2026.2-T01-Sigma


## Requisitos

- Python 3.12

## Configuração

Clone o repositório:

```bash
git clone URL_DO_REPOSITORIO
cd meu-projeto
```

Crie um ambiente virtual

```bash
python -m venv .venv
```
**O `-m` é pra referenciar o python do venv;**
Instale as dependências

````bash
python -m pip install -r requirements.txt
````

Para executar 

````bash
uvicorn app.main:app --reload
````

A API vai ta dísponível em `http://127.0.0.1:8000`
E sua documentação em : `http://127.0.0.1:8000/docs`

## Executar com Docker

Requisitos: Docker com Compose v2.

1. Copie `.env.example` para `.env` e ajuste as senhas e a chave JWT.
2. Na raiz do projeto, execute:

   ```bash
   docker compose up --build
   ```

3. Acesse o frontend em `http://localhost:3000`. O backend e o PostgreSQL ficam
   disponíveis apenas na rede interna do Compose.

O backend aplica as migrations antes de iniciar. Para criar manualmente o administrador inicial,
com os valores de `ADMIN_NAME`, `ADMIN_EMAIL` e `ADMIN_PASSWORD` do `.env`, execute:

```bash
docker compose exec backend python -m app.scripts.seed_admin
```

Os dados do PostgreSQL ficam no volume `postgres_data`. Para encerrar sem apagar os dados, use
`docker compose down`; para apagar também o banco local, use `docker compose down -v`.

Para iniciar a configuração de produção (com `DEBUG=False`), use:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d
```

O frontend real consome autenticação, usuários e estrutura escolar (turmas/etapas) disponíveis na
API. Das matrículas, o backend implementa por enquanto o Requerimento de matrícula e os termos de uso
de imagem e de saída (UC04, seções abaixo); os demais endpoints usados pela tela de alunos ainda não existem.

# API do Requerimento de matrícula (UC04)

Consulta, preenchimento, edição e exportação em PDF do Requerimento de matrícula. Mesmas regras
gerais dos termos (autenticação, tudo ou nada, idempotência, histórico sem valores e formato do 422,
descritas na seção dos termos abaixo).

| Método | Rota | Ação | Respostas |
|---|---|---|---|
| GET | `/matriculas/{id}/requerimento` | Obter a ficha | 200; 401; 404; 503 |
| PUT | `/matriculas/{id}/requerimento` | Salvar a ficha (cria ou atualiza) | 200; 401; 404; 409; 422; 503 |
| GET | `/matriculas/{id}/requerimento/pdf` | Exportar PDF | 200 `application/pdf`; 401; 404; 500 |

Código: `app/schemas/requerimento.py`, `app/services/service_requerimento.py`,
`app/repository/repository_matricula.py` e `app/templates/fichas/requerimento.html`.

## Onde cada seção é gravada

| Seção (corpo do PUT) | Tabela | Observação |
|---|---|---|
| `dados_pessoais` | `Aluno` | Vale para todas as matrículas e fichas do aluno |
| `matricula` (`ano_letivo`, `data_matricula`) | `Matricula` | `ano_escolaridade` e `turma` vêm só na resposta (somente leitura; troca de turma é o UC07) |
| `documentacao_civil` | `DocumentacaoCivil` | Uma por aluno: aparece já preenchida nas outras matrículas dele |
| `endereco_contato` | `Aluno` (endereço) e `RequerimentoMatricula.telefone_requerimento` (telefone) | |
| `filiacao`, `termo_compromisso`, `transferencia` | `RequerimentoMatricula` | Por matrícula |
| `saude` | `Saude` | Por matrícula |

## Regras

- **Obrigatórios (lista inicial, a confirmar com o PO):** nome, data de nascimento, sexo, CPF,
  naturalidade, UF (de naturalidade), nacionalidade, cor/raça, ano letivo, data da matrícula e
  endereço (logradouro, cidade e CEP, as colunas obrigatórias do aluno). Ficam em `CAMPOS_OBRIGATORIOS`.
- `completa` é verdadeiro quando o requerimento já foi salvo e não tem pendências.
- **Duplicidade (409):** "Já existe um aluno cadastrado com este CPF.", "... com este NIS." e
  "... com este RG nesta UF." (o mesmo RG em outra UF é aceito). Se dois salvamentos concorrerem,
  o banco recusa e a resposta é a mesma.
- **Formatos:** CPF (com dígito verificador), NIS (11), telefones (10 ou 11) e CEP (8) só com dígitos;
  UF em sigla maiúscula; datas em ISO. O CEP é devolvido sempre só com dígitos.
- **Datas:** nascimento, expedição do RG e emissão da certidão não podem ser futuras; a emissão da
  certidão não pode ser anterior ao nascimento; a data de entrega da transferência exige a do pedido
  e não pode ser anterior a ela. Ano letivo entre 2000 e o ano que vem.
- **Saúde:** marcar `OUTROS` exige a observação correspondente.
- **Histórico:** `PREENCHIMENTO_REQUERIMENTO` no primeiro salvamento; `EDICAO_REQUERIMENTO` com os nomes
  dos campos alterados (ex.: "Nome do aluno; Saúde – problemas de saúde"), sem valores; `EXPORTACAO_PDF`
  em cada PDF. Saúde, raça e documentos nunca vão para o histórico nem para o log.

## Valores aceitos (nomes do enum)

| Campo | Valores |
|---|---|
| `sexo` | `FEMININO`, `MASCULINO`, `NAO_DECLARADO` |
| `raca` | `BRANCO`, `PRETO`, `PARDO`, `AMARELO`, `INDIGENA`, `NAO_DECLARADO` |
| `tipo_certidao` | `NASCIMENTO`, `CASAMENTO` |
| `saude.problemas` | `AUDICAO`, `GARGANTA`, `FALA`, `VISAO`, `DESMAIOS`, `RINS`, `ALERGIA`, `OUTROS` |
| `saude.acompanhamentos` | `PSICOLOGICO`, `ALERGISTA`, `UROLOGICO`, `FONOAUDIOLOGICO`, `CARDIOLOGICO`, `RINS`, `OUTROS` |
| `termo_compromisso.documentos_entregues` | `FOTO_3X4`, `COMPROVANTE_RESIDENCIA`, `CERTIDAO_NASCIMENTO`, `HISTORICO_ESCOLAR`, `CARTAO_VACINA` |

As listas não aceitam repetição. A escolaridade dos pais é texto livre até a lista oficial ser definida.

## Exemplo de corpo do PUT

```jsonc
// PUT /matriculas/7/requerimento (seções opcionais podem ser omitidas)
{
  "dados_pessoais": {"nome": "Ana Beatriz de Souza", "data_nascimento": "2022-05-10", "sexo": "FEMININO",
                     "nis": "12345678901", "cpf": "52998224725", "naturalidade": "Brasília", "uf": "DF",
                     "nacionalidade": "Brasileira", "raca": "PARDO"},
  "matricula": {"ano_letivo": 2026, "data_matricula": "2026-02-02"},
  "documentacao_civil": {"rg": "1234567", "orgao_emissor": "SSP", "uf_rg": "GO", "data_expedicao": "2023-01-15",
                         "tipo_certidao": "NASCIMENTO", "num_termo": "000123", "folha": "045", "livro": "A-12",
                         "data_emissao_certidao": "2022-05-20", "nome_cartorio": "Cartório do 1º Ofício",
                         "uf_cartorio": "DF", "documento_estrangeiro": null},
  "filiacao": {"pai": {"nome": "João Carlos de Souza", "escolaridade": "Ensino médio completo",
                       "local_trabalho": "Mercado Central", "telefone_trabalho": "6133334444"},
               "mae": {"nome": "Maria das Graças Souza", "escolaridade": null, "local_trabalho": null, "telefone_trabalho": null}},
  "endereco_contato": {"logradouro": "Rua das Flores", "numero": "10", "bairro": "Centro",
                       "cidade": "Águas Lindas de Goiás", "uf": "GO", "cep": "72910000", "telefone": "61999998888"},
  "saude": {"problemas": ["ALERGIA", "OUTROS"], "observacao_problemas": "Intolerância a lactose",
            "acompanhamentos": [], "observacao_acompanhamentos": null},
  "termo_compromisso": {"nome_responsavel": "Maria das Graças Souza", "documentos_entregues": ["FOTO_3X4", "CARTAO_VACINA"]},
  "transferencia": {"data_pedido": null, "data_entrega": null, "nome_responsavel": null}
}
```

A resposta repete as seções e acrescenta `matricula.ano_escolaridade`, `matricula.turma`, `completa`,
`created_at` e `updated_at` (nulos enquanto a ficha não foi salva; `updated_at` é o da última edição).

## Para o time de frontend (requerimento)

- O **modal de confirmação** antes de salvar continua no frontend.
- Sexo, raça e as listas usam os **nomes do enum** acima (o formulário atual envia `M`/`F`, `BRANCA` etc.).
- **Endereço:** o protótipo e o papel têm um único campo "Endereço"; a API usa as colunas do aluno
  (logradouro, número, bairro, cidade, UF e CEP), e logradouro, cidade e CEP são obrigatórios. A tela
  precisa separar os campos (ou o time decide outra regra; veja as pendências).
- **Ano de escolaridade** é somente leitura na API, como pede a issue #90 (troca de turma é o UC07);
  no protótipo ele aparece como lista editável.
- O campo **"ID"** do protótipo e do papel não é gravado (pendência abaixo).
- **Renovações de matrícula** (tabela do protótipo, quadros do papel) não existem no banco: o PDF sai com
  o quadro em branco para preencher à mão, e o botão "Registrar renovação" ainda não tem API.
- "Problemas de saúde": o formulário atual tem "Sangramento", que não existe no banco nem no papel; o certo é "Garganta".
- **Documentos entregues** (`termo_compromisso.documentos_entregues`) é o que a aba Documentos e o resumo
  "3 de 5 entregues" do card devem ler.
- Quando um campo tem formato inválido (ex.: sexo "F"), o 422 traz esse erro junto com os obrigatórios
  vazios. As regras que comparam campos (CPF, UF, datas) aparecem depois que os formatos forem corrigidos.

## PDF do requerimento

Segue o modelo em papel da Secretaria Municipal de Educação, em 2 páginas: cabeçalho com escola e INEP
(em branco), dados pessoais, documentação civil, filiação, endereço e assinatura do responsável pela
matrícula; saúde e acompanhamento médico; quadro de renovações em branco; transferência; termo de
compromisso (com o texto do prazo de 30 dias) e assinaturas do(a) Secretário(a) Escolar e do(a) Diretor(a).
O cabeçalho usa o logo do sistema, não o da Prefeitura.

## Pendências com o PO (requerimento)

- Lista definitiva de campos obrigatórios.
- Campo "ID" (protótipo e papel). Se for o identificador do aluno na Secretaria ou no Censo Escolar,
  precisa de coluna própria, em nova issue de banco.
- Endereço em campo único (protótipo) x colunas separadas obrigatórias (banco).
- Ano de escolaridade editável (protótipo) x somente leitura (issue #90).
- Renovações de matrícula: o protótipo registra data, ano e responsável; precisa de tabela nova no banco.
- Número do INEP da creche, para sair impresso no PDF.
- Lista oficial de escolaridade dos pais (o protótipo usa uma lista; a API aceita texto livre).
- Telefone da seção "Endereço e contato": gravado em `RequerimentoMatricula.telefone_requerimento`,
  como documenta o modelo do banco; `Aluno.telefone` ("telefone do próprio aluno") não é alterado.
- Histórico com valores: o protótipo da aba Histórico mostra "valor anterior" e "valor novo" por campo,
  mas as issues #90 e #92 pedem só os nomes dos campos (LGPD) e a `Operacao` tem uma única descrição.
  Mostrar valores exige decisão do PO (LGPD) e mudança no banco.

# API dos termos da matrícula (UC04)

Termo de autorização de uso de imagem e Termo de autorização de saída do aluno. Cada termo é
**por matrícula** (um por ano letivo): salvar o termo de uma matrícula nunca altera o de outra
matrícula do mesmo aluno. Todas as rotas exigem token e conta ativa (`401` sem token, `403` com
conta inativa) e aparecem em `/docs`.

| Método | Rota | Ação | Respostas |
|---|---|---|---|
| GET | `/matriculas/{id}/termo-imagem` | Obter termo de imagem | 200; 401; 404 |
| PUT | `/matriculas/{id}/termo-imagem` | Salvar termo de imagem (cria ou atualiza) | 200; 401; 404; 422; 503 |
| GET | `/matriculas/{id}/termo-imagem/pdf` | Exportar PDF | 200 `application/pdf`; 401; 404; 500 |
| GET | `/matriculas/{id}/termo-saida` | Obter termo de saída | 200; 401; 404 |
| PUT | `/matriculas/{id}/termo-saida` | Salvar termo de saída, com as pessoas autorizadas | 200; 401; 404; 422; 503 |
| GET | `/matriculas/{id}/termo-saida/pdf` | Exportar PDF | 200 `application/pdf`; 401; 404; 500 |
| GET | `/termos/uso-imagem/texto` | Texto integral do termo de imagem | 200; 401 |

Código: rotas em `app/routes/route_matriculas.py` e `route_termos.py`, regras em
`app/services/service_termo_imagem.py` e `service_termo_saida.py`, schemas em
`app/schemas/termo_imagem.py` e `termo_saida.py`, acesso ao banco em
`app/repository/repository_termos.py`. O histórico de edições e o PDF são serviços genéricos,
reaproveitáveis pelas outras fichas: `service_historico.py` e `service_pdf.py`.

## Regras

- **Tudo ou nada (FE04):** termo, pessoas autorizadas e histórico são gravados em uma única
  transação. Falha de banco: `503` com "Não foi possível salvar. Tente novamente." e nada fica gravado.
- **Idempotente:** reenviar o mesmo termo não duplica pessoas (envie o `id` das já salvas) e, se nada
  mudou, não gera registro de edição.
- **Histórico (`Operacao`):** primeira gravação = `PREENCHIMENTO_TERMO_*`; demais = `EDICAO_TERMO_*`
  com os **nomes** dos campos alterados (ex.: "Responsável legal – CPF"), **nunca os valores**
  (LGPD). Cada exportação gera `EXPORTACAO_PDF`. O corpo das requisições não é registrado em log.
- **Campos obrigatórios (FE01):** ficam em uma lista única no topo de cada schema
  (`CAMPOS_OBRIGATORIOS`), para ajustar quando o PO confirmar. A lista atual é provisória.
- **Matrícula inativa e ativação da matrícula** não fazem parte desta entrega.

### Termo de imagem

- Obrigatórios para salvar: nome, CPF e "residente em" do responsável, local e data.
- **A autorização aceita vazio** (`null` = "não respondido") e "não autoriza" (`false`) é resposta válida.
  O indicador `completa` só é verdadeiro com a autorização respondida (sim ou não).
- Termo ainda não salvo: o `GET` sugere "residente em" com o endereço do aluno
  (`Rua, nº 10, Bairro, Cidade/UF, CEP 00000-000`); o `PUT` grava o que for enviado.
- CPF: 11 dígitos, **só números**, com dígito verificador válido (sem verificação de unicidade).

### Termo de saída

- Obrigatórios para salvar: nome do responsável, forma de saída e data; em cada pessoa autorizada,
  nome e parentesco. Período é texto livre (até 50 caracteres) e opcional.
- Forma de saída: `RESPONSAVEIS`, `TRANSPORTE_ESCOLAR` ou `OUTROS`.
  `TRANSPORTE_ESCOLAR` e `OUTROS` exigem ao menos uma pessoa autorizada; `RESPONSAVEIS` aceita a lista
  vazia. `OUTROS` exige a descrição; nas outras formas a descrição é descartada.
- **Pessoas autorizadas** são enviadas como lista completa, no máximo 4: com `id` é atualizada, sem
  `id` é criada e a que não vier na lista é removida. O `id` precisa ser de uma pessoa do termo desta
  matrícula (senão, `422`). Na resposta, vêm na ordem de cadastro (por `id`).
- **O local é fixo** (`LOCAL_TERMO_SAIDA`): aparece só na resposta e qualquer `local` enviado é ignorado.

### Formato do erro 422

Mesmo formato padrão do FastAPI: uma lista com **um item por problema**, todos de uma vez, para o
frontend destacar todos os campos juntos. Use `loc` (sem o primeiro item, `"body"`) para achar o campo
e `msg` para o texto.

```jsonc
{
  "detail": [
    {"type": "campo_obrigatorio", "loc": ["body", "responsavel", "cpf"],
     "msg": "Campo obrigatório não preenchido: Responsável legal – CPF."},
    {"type": "campo_obrigatorio", "loc": ["body", "pessoas_autorizadas", 1, "parentesco"],
     "msg": "Campo obrigatório não preenchido: Pessoas autorizadas – pessoa 2 – parentesco."}
  ]
}
```

### Exemplos de corpo do PUT

```jsonc
// PUT /matriculas/7/termo-imagem
{
  "responsavel": {"nome": "Maria das Graças Souza", "nacionalidade": "Brasileira", "estado_civil": "Solteira",
                  "rg": "1234567 SSP/GO", "cpf": "52998224725",
                  "residente_em": "Rua das Flores, nº 10, Centro, Águas Lindas de Goiás/GO, CEP 72910-000"},
  "autorizacao": {"autoriza": true, "local": "Águas Lindas de Goiás", "data": "2026-11-20"}
}

// PUT /matriculas/7/termo-saida
{
  "responsavel": {"nome": "Maria das Graças Souza"},
  "periodo": "Integral",
  "saida": {"forma_saida": "TRANSPORTE_ESCOLAR", "descricao_outros": null},
  "pessoas_autorizadas": [{"id": 12, "nome": "João Carlos de Souza", "parentesco": "Avô"},
                          {"nome": "Luiza Pereira", "parentesco": "Tia"}],
  "data": "2026-11-20"
}
```

A resposta (`GET` e `PUT`) repete esses blocos e acrescenta `aluno` (somente leitura: `nome`,
`data_nascimento`, `etapa` e `ano_letivo`), `completa`, `created_at` e `updated_at` (nulos enquanto o
termo não foi salvo). No termo de saída vem também `local`.

## Para o time de frontend

- Uma rota por termo (tabela acima). A **confirmação antes de salvar** continua sendo um modal no frontend.
- Os dados do aluno (`aluno`) são **somente leitura** nos dois termos. Qualquer coisa enviada neles é ignorada.
- **Período do termo de saída é editável** (texto livre). O Figma mostra o campo como somente leitura no
  bloco do aluno, então a tela precisa ser ajustada.
- **Local do termo de saída é fixo**: vem na resposta (`local`) e não é editável.
- **"Residente em"** do termo de imagem vem sugerido no `GET` e é obrigatório.
- **Autorização de imagem aceita vazio** ("não respondido"); a opção "não autoriza" existe. O mock atual
  do frontend ainda não tem as duas coisas.
- **Pessoas autorizadas:** enviar como lista completa a cada salvamento, com `id` nas já salvas, no máximo 4.
  **É preciso um botão de remover pessoa**, que não existe no Figma.
- O link "Ver texto completo do termo" usa `GET /termos/uso-imagem/texto` (`{"titulo", "texto"}`, parágrafos
  separados por linha em branco). É o mesmo texto do PDF.
- CPF **só com dígitos**; datas em ISO (`AAAA-MM-DD`). A máscara é do frontend.
- Os nomes dos campos da API são em `snake_case` (os mocks atuais usam camelCase).
- Os PDFs vêm com `Content-Disposition: attachment; filename="termo-imagem-<aluno>-<ano>.pdf"` e
  `Cache-Control: no-store`. Como a rota devolve o arquivo, o `X-Renewed-Token` continua vindo nelas.

## Pendências com o PO (não bloqueiam)

- Opção "Não autoriza": não existe no termo em papel. Validar com a creche.
- Texto oficial do termo de imagem: até a entrega, `app/templates/termos/uso_imagem.txt` usa o texto de
  abrangência da tela. Para trocar, basta editar esse arquivo (rota de texto e PDF mudam juntos).
- Lista de campos obrigatórios de cada termo e valor do local fixo do termo de saída.
- Logo do PDF: está o logo do Sigma. Troque `app/templates/static/logo.png` pelo da creche.

# PDF das fichas e termos (WeasyPrint)

Os PDFs são gerados com **Jinja2 + WeasyPrint** a partir de `app/templates/`:

```text
app/templates/
├── fichas/      base.html (cabeçalho e rodapé), _macros.html, fichas.css e um .html por ficha/termo
├── termos/      textos integrais dos termos (arquivo único, usado pela rota de texto e pelo PDF)
└── static/      logo.png e fontes (DejaVu Sans, com a licença). Nada é carregado de fora.
```

- **No container (recomendado):** `docker compose up --build`. A imagem já instala as bibliotecas
  (Pango, HarfBuzz) e a fonte. Não há nada para instalar à mão.
- **Linux (Debian/Ubuntu), sem container:**

  ```bash
  sudo apt install libpango-1.0-0 libharfbuzz0b libpangoft2-1.0-0 libharfbuzz-subset0 fonts-dejavu-core
  ```

- **Windows:** o WeasyPrint precisa do Pango via MSYS2.
  1. Instale o [MSYS2](https://www.msys2.org/#installation) mantendo as opções padrão.
  2. No shell do MSYS2, execute `pacman -S mingw-w64-x86_64-pango` e feche o shell.
  3. No terminal em que for rodar a API ou o `pytest`, aponte para as DLLs:
     `set WEASYPRINT_DLL_DIRECTORIES=C:\msys64\mingw64\bin` (cmd) ou
     `$env:WEASYPRINT_DLL_DIRECTORIES="C:\msys64\mingw64\bin"` (PowerShell).
  4. Confira com `python -m weasyprint --info`.

  Alternativas: gerar e testar o PDF pelo container ou pelo WSL.
  Documentação oficial: <https://doc.courtbouillon.org/weasyprint/stable/first_steps.html>.
- **Sem o Pango a API sobe normalmente**: só as rotas de PDF respondem `500` ("Não foi possível gerar o
  PDF"), e os testes de PDF são **pulados** em vez de quebrar a suíte.
- O texto dos PDFs é autoescapado: um texto com HTML digitado no formulário sai como texto.

## Configuração do termo de saída

| Variável | Padrão | Para que serve |
|---|---|---|
| `LOCAL_TERMO_SAIDA` | `Águas Lindas de Goiás` | Local impresso no Termo de autorização de saída. Fixo: não é gravado no banco nem aceito pela API. |

Já está no `.env.exemple` e no `docker-compose.yml`.

# Estrutura de pastas 

O projeto utiliza **Python, FastAPI, SQLAlchemy e PostgreSQL**, com uma arquitetura organizada por responsabilidades. O objetivo dessa organização é separar as diferentes partes da aplicação, facilitando a manutenção, a implementação de novas funcionalidades e o trabalho em equipe.

## Estrutura geral

```text
meu-projeto/
│
├── alembic/
│   └── versions/
│
├── app/
│   ├── main.py
│   │
│   ├── core/
│   │   ├── config.py
│   │   └── database.py
│   │
│   ├── models/
│   │   └── aluno.py
│   │
│   ├── schemas/
│   │   └── aluno.py
│   │
│   ├── repositories/
│   │   └── aluno_repository.py
│   │
│   ├── services/
│   │   └── aluno_service.py
│   │
│   └── routers/
│       └── aluno_router.py
│
├── tests/
│
├── .env
├── .env.example
├── .gitignore
├── alembic.ini
├── requirements.txt
└── README.md
```

---

## 1. Pasta `app/`

É a pasta principal da aplicação. Contém todo o código responsável pelo funcionamento da API, incluindo configurações, conexão com o banco de dados, modelos, validações, regras de negócio e endpoints.

### 1.1. Arquivo `main.py`

É o ponto de entrada da aplicação FastAPI. Responsável por instanciar a aplicação, registrar os routers e configurar recursos gerais da API.

**O que deve conter:**
- Instância principal do FastAPI.
- Registro dos routers da aplicação.
- Configurações gerais, como título e descrição da API.
- Middlewares e eventos de inicialização, quando necessários.

### 1.2. Pasta `core/`

Contém configurações e recursos fundamentais para o funcionamento da aplicação. É onde ficam centralizadas configurações que podem ser utilizadas por diferentes partes do projeto.

**O que deve conter:**
- Configurações de ambiente.
- Leitura de variáveis do arquivo `.env`.
- Configuração da conexão com o banco de dados.
- Recursos compartilhados de infraestrutura e segurança.

#### `config.py`

Responsável por carregar e disponibilizar as configurações da aplicação, utilizando variáveis de ambiente.

**O que deve conter:**
- Leitura das variáveis do `.env`.
- Configurações de ambiente, como desenvolvimento e produção.
- Configurações gerais da aplicação.

#### `database.py`

Responsável por configurar a comunicação entre a aplicação e o PostgreSQL utilizando SQLAlchemy.

**O que deve conter:**
- Criação do engine de conexão com o banco.
- Configuração das sessões do SQLAlchemy.
- Classe Base para os modelos ORM.
- Função de dependência para disponibilizar sessões do banco aos endpoints.

### 1.3. Pasta `models/`

Contém os modelos ORM da aplicação, desenvolvidos com SQLAlchemy. Cada modelo representa uma entidade do banco de dados e define como seus dados serão armazenados.

**O que deve conter:**
- Classes que representam as tabelas do PostgreSQL.
- Definição de colunas e tipos de dados.
- Chaves primárias e estrangeiras.
- Restrições e relacionamentos entre tabelas.

**Exemplo:** `aluno.py` pode conter a classe `Aluno`, responsável por representar a tabela de alunos no banco de dados.

### 1.4. Pasta `schemas/`

Contém os schemas desenvolvidos com Pydantic, utilizados para validar, organizar e definir o formato dos dados que entram e saem da API.

**O que deve conter:**
- Schemas para criação de registros.
- Schemas para atualização de registros.
- Schemas para respostas da API.
- Regras de validação dos dados recebidos.

**Exemplo:** `aluno.py` pode conter `AlunoCreate`, `AlunoUpdate` e `AlunoResponse`, definindo os dados necessários para cadastrar, atualizar e retornar informações de um aluno.

### 1.5. Pasta `repositories/`

Responsável por concentrar as operações de acesso e persistência dos dados no banco de dados. Faz a comunicação entre a camada de serviços e o SQLAlchemy.

**O que deve conter:**
- Consultas ao banco de dados.
- Operações de inserção de registros.
- Atualização e exclusão de dados.
- Busca de registros por identificadores ou critérios específicos.

**Exemplo:** `aluno_repository.py` pode conter funções para cadastrar, buscar, listar, atualizar e excluir alunos.

### 1.6. Pasta `services/`

Responsável por implementar as regras de negócio da aplicação. É onde ficam os processos e validações que determinam como cada funcionalidade deve funcionar.

**O que deve conter:**
- Regras de negócio.
- Validações que dependem do contexto da aplicação.
- Processamento de informações.
- Coordenação das operações realizadas pelos repositories.
- Tratamento de situações específicas da aplicação.

**Exemplo:** `aluno_service.py` pode verificar se um aluno já possui cadastro antes de solicitar a criação de um novo registro.

### 1.7. Pasta `routers/`

Responsável por definir os endpoints da API e receber as requisições HTTP feitas pelo frontend ou por outros sistemas.

**O que deve conter:**
- Definição das rotas da API.
- Métodos HTTP, como GET, POST, PUT, PATCH e DELETE.
- Recebimento dos dados enviados nas requisições.
- Utilização dos schemas para validação.
- Chamada dos serviços responsáveis por executar as operações.

**Exemplo:** `aluno_router.py` pode definir endpoints como `POST /alunos`, `GET /alunos` e `GET /alunos/{id}`.

---

## 2. Pasta `alembic/`

Responsável por armazenar o histórico de alterações na estrutura do banco de dados, utilizando a ferramenta Alembic.

As alterações realizadas nos modelos SQLAlchemy podem ser registradas em migrations, permitindo atualizar a estrutura do banco de maneira controlada.

### 2.1. Pasta `versions/`

Armazena os arquivos de migrations gerados pelo Alembic.

**O que deve conter:**
- Scripts de criação de tabelas.
- Scripts de alteração de colunas.
- Scripts de criação ou remoção de relacionamentos.
- Scripts de outras alterações na estrutura do banco.

### 2.2. Arquivo `alembic.ini`

Arquivo de configuração principal do Alembic. Define informações necessárias para executar as migrations, como a localização dos scripts e configurações de execução.

---

## 3. Pasta `tests/`

Contém os testes automatizados utilizados para verificar se as funcionalidades da aplicação estão funcionando corretamente.

**O que deve conter:**
- Testes unitários das regras de negócio.
- Testes dos endpoints da API.
- Testes de integração com o banco de dados.
- Testes de validação e tratamento de erros.

Os testes devem verificar tanto os cenários de funcionamento esperado quanto situações em que a aplicação deve retornar erros.

---

## 4. Arquivos da raiz do projeto

### `.env`

Arquivo que armazena as variáveis de ambiente utilizadas pela aplicação, como credenciais do banco de dados e configurações específicas de execução.

Contém informações reais e sensíveis, portanto não deve ser enviado ao repositório Git.

### `.env.example`

Arquivo de exemplo que apresenta as variáveis de ambiente necessárias para executar o projeto, sem utilizar credenciais reais.

Serve como referência para que outros desenvolvedores possam configurar seus próprios arquivos `.env`.

### `.gitignore`

Define quais arquivos e pastas devem ser ignorados pelo Git, impedindo que arquivos desnecessários ou sensíveis sejam enviados ao repositório.

Exemplos:
- Ambientes virtuais (`.venv/`).
- Arquivos de variáveis de ambiente (`.env`).
- Arquivos temporários do Python (`__pycache__/`).
- Configurações locais de IDEs.

### `requirements.txt`

Lista as bibliotecas e dependências Python necessárias para executar o projeto.

Permite que outros desenvolvedores instalem as dependências utilizando:

```bash
pip install -r requirements.txt
```

### `README.md`

Documento principal do projeto. Apresenta informações sobre a aplicação e orientações para sua utilização e desenvolvimento.

**O que deve conter:**
- Descrição e objetivo do projeto.
- Tecnologias utilizadas.
- Pré-requisitos para execução.
- Instruções de instalação e configuração.
- Instruções para executar a aplicação.
- Informações sobre banco de dados e migrations.

---

## 5. Fluxo de comunicação entre as camadas

A comunicação entre as pastas segue uma divisão de responsabilidades. Em uma operação comum de cadastro, por exemplo, o fluxo acontece da seguinte maneira:

1. **Router:** recebe a requisição HTTP.
2. **Schema:** valida os dados enviados.
3. **Service:** executa as regras de negócio.
4. **Repository:** realiza a operação de persistência.
5. **Model:** representa a entidade que será armazenada.
6. **SQLAlchemy:** converte as operações em comandos SQL.
7. **PostgreSQL:** armazena ou consulta os dados.

Essa separação permite que cada parte da aplicação tenha uma responsabilidade bem definida, reduzindo o acoplamento entre as funcionalidades e facilitando a evolução do projeto.