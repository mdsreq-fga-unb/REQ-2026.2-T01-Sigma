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
uvicorn app:main -reload // tem que estar na mesma pasta que a main.py
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

3. Acesse o frontend em `http://localhost:3000` e a documentação da API em
   `http://localhost:8001/docs`.

Na primeira inicialização, o backend aplica as migrations e cria o administrador definido por
`ADMIN_EMAIL` e `ADMIN_PASSWORD` no `.env`. Os dados do PostgreSQL ficam no volume `postgres_data`.
Para encerrar sem apagar os dados, use `docker compose down`; para apagar também o banco local,
use `docker compose down -v`.

O frontend real consome autenticação, usuários e estrutura escolar (turmas/etapas) disponíveis na
API. O backend ainda não implementa os endpoints de matrículas usados pela tela de alunos.

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