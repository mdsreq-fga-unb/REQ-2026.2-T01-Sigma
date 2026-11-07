# Migrations com Alembic

Guia para criar e aplicar mudanças no banco de dados deste projeto. Não é preciso conhecer o Alembic a fundo para seguir os passos.

---

## 0. Antes de começar: o que NÃO vai para o Git conferir antes 

Antes de qualquer coisa, confira se o projeto tem um arquivo `.gitignore` na raiz cobrindo pelo menos estes itens:

```gitignore
# Segredos - NUNCA versionar
.env

# Ambiente virtual
.venv/
venv/

# Cache do Python
__pycache__/
*.py[cod]
```

Por que isso importa aqui:

- **`.env`** guarda a URL do banco, com **usuário e senha**. Se for para o Git, a senha fica no histórico do repositório para sempre, mesmo que você apague depois. É por isso que a seção 3.3 lê a URL do `settings` em vez de escrevê-la no `alembic.ini`.
- **`__pycache__/`** aparece dentro de `alembic/versions/` depois que as migrations rodam. São arquivos gerados automaticamente: versioná-los só causa conflito no `git merge`.

O que **deve** ir para o Git: `alembic.ini`, `alembic/env.py` e **todos** os arquivos de `alembic/versions/`. As migrations são código do projeto.

---

## 1. Por que o Alembic existe?

O código do projeto descreve as tabelas através dos **models** (classes Python como `Carro`). Mas o banco de dados (PostgreSQL) é um programa separado: ele **não lê o código Python**. Alguém precisa traduzir o model em comandos SQL (`CREATE TABLE`, `ALTER TABLE`...) e executá-los no banco.

O SQLAlchemy tem o `Base.metadata.create_all()`, que cria as tabelas que ainda não existem. O problema é que ele **nunca altera uma tabela que já existe**. Se alguém adicionar uma coluna `cor` no model `Carro`, o `create_all` não faz nada, e o banco fica diferente do código.

O **Alembic** resolve isso. Ele funciona como um "controle de versão do banco":

- Cada mudança na estrutura do banco vira um arquivo Python chamado **migration**.
- As migrations ficam no Git, junto com o código. Quem fizer `git pull` recebe as mudanças.
- O Alembic anota no próprio banco qual foi a última migration aplicada, e aplica só o que falta.
- Cada migration sabe **desfazer** o que fez, então dá para voltar atrás.

> Se você conhece Java/Spring: o Alembic é o equivalente ao Flyway ou Liquibase.

### Em um projeto em grupo, isso é essencial

Sem migrations, cada pessoa tem um banco diferente na própria máquina e ninguém sabe exatamente qual é a estrutura "correta". Com migrations, todo mundo roda o mesmo comando e fica com o banco idêntico.

---

## 2. Conceitos rápidos

| Termo | O que é |
|---|---|
| **Model** | Classe Python que descreve uma tabela (ex.: `Carro`). |
| **Migration** (ou revisão) | Arquivo em `alembic/versions/` com os passos para mudar o banco. |
| **`upgrade()`** | Função da migration que **aplica** a mudança. |
| **`downgrade()`** | Função da migration que **desfaz** a mudança. |
| **head** | A migration mais recente. `upgrade head` = "aplique tudo até a última". |
| **`alembic_version`** | Tabela que o Alembic cria no banco para anotar qual migration está aplicada. Não mexa nela à mão. |
| **autogenerate** | Recurso que compara os models com o banco e escreve a migration para você. |

---

## 3. Configuração inicial (feita uma única vez por projeto)

> Se a pasta `alembic/` e o arquivo `alembic.ini` já existem no repositório, **pule para a seção 4**. A configuração já foi feita.

Todos os comandos abaixo são executados **na raiz do projeto**, com o ambiente virtual (venv) **ativado**.

### 3.1 Instalar

```bash
pip install alembic
```

Adicione `alembic` ao `requirements.txt` para que o resto do time também o instale.

### 3.2 Iniciar

```bash
alembic init alembic
```

Isso cria:

```
alembic.ini           ← configurações gerais
alembic/
├── env.py            ← conecta o Alembic ao projeto (vamos editar)
├── script.py.mako    ← modelo usado para gerar migrations
└── versions/         ← onde as migrations ficam
```

### 3.3 Configurar o `alembic/env.py`

O Alembic precisa saber duas coisas: **onde está o banco** e **quais são os models**.

Abra `alembic/env.py` e faça três ajustes.

**a) Importar as configurações, a Base e os models** (perto do topo do arquivo):

```python
from app.core.config import settings
from app.core.database import Base   # ajuste para o arquivo onde a sua Base está definida

# Importe TODOS os models. Se um model não for importado aqui,
# o Alembic não sabe que ele existe e não cria a tabela.
from app.models import carro  # noqa: F401
```

**b) Passar a URL do banco** (logo depois da linha `config = context.config`):

```python
config.set_main_option("sqlalchemy.url", settings.database_url)
```

> Por que não colocar a URL direto no `alembic.ini`? Porque a URL contém usuário e senha, e o `alembic.ini` vai para o Git. Lendo do `settings`, a senha continua só no `.env`.

**c) Apontar o `target_metadata`** (procure a linha `target_metadata = None` e troque):

```python
target_metadata = Base.metadata
```

Sem isso, o autogenerate não enxerga os models e gera migrations vazias.

### 3.4 Remover o `create_all` do código

Se o projeto tiver uma chamada como `Base.metadata.create_all(bind=engine)` (geralmente no `main.py`), **remova**. Daqui para frente, quem cria e altera tabelas é só o Alembic. Usar os dois juntos faz o banco ficar diferente do que as migrations dizem.

---

## 4. Fluxo do dia a dia: criar uma migration

Sempre que você **criar ou alterar um model** (nova tabela, nova coluna, mudança de tipo, etc.), siga estes passos.

### Passo 0: atualize o seu código e o seu banco

```bash
git pull
alembic upgrade head
```

Isso garante que você parte da versão mais recente. Gerar migration em cima de um banco desatualizado é a causa mais comum de problema.

### Passo 1: altere o model

Exemplo: adicionar a coluna `cor` em `Carro`.

### Passo 2: gere a migration

```bash
alembic revision --autogenerate -m "adiciona coluna cor em carros"
```

- `-m` é a descrição da mudança. Escreva algo claro, no mesmo estilo de uma mensagem de commit.
- Um novo arquivo aparece em `alembic/versions/`, com um nome como `a1b2c3d4e5f6_adiciona_coluna_cor_em_carros.py`.

### Passo 3: revise o arquivo gerado (obrigatório)

O autogenerate **ajuda, mas não é perfeito**. Abra o arquivo e confira:

- O `upgrade()` faz o que você esperava? (ex.: `op.add_column('carros', ...)`)
- O `downgrade()` desfaz exatamente isso? (ex.: `op.drop_column('carros', 'cor')`)
- Não tem nada **a mais** (tabelas ou colunas que você não mexeu)?
- O arquivo não está **vazio** (só com `pass`)? Se estiver, veja a seção 7.

**Atenção para renomear coisas:** se você renomear uma coluna, o Alembic entende como "apagar a coluna antiga e criar uma nova", o que **apaga os dados**. Nesse caso, edite a migration à mão para usar `op.alter_column(..., new_column_name=...)`.

### Passo 4: aplique no banco

```bash
alembic upgrade head
```

Confira no banco (pgAdmin, DBeaver, etc.) se a mudança apareceu.

### Passo 5: teste o caminho de volta (recomendado)

```bash
alembic downgrade -1
alembic upgrade head
```

Se os dois funcionarem, a migration está correta nos dois sentidos.

### Passo 6: faça commit

Faça commit da **mudança no model e da migration juntas**, no mesmo PR. Uma sem a outra deixa o projeto quebrado para quem fizer `pull`.

---

## 5. Recebi migrations novas de outra pessoa. E agora?

Depois do `git pull`, basta:

```bash
alembic upgrade head
```

O Alembic olha a tabela `alembic_version`, vê em qual migration o seu banco está e aplica só as que faltam.

---

## 6. Comandos úteis

| Comando | O que faz |
|---|---|
| `alembic upgrade head` | Aplica todas as migrations pendentes. |
| `alembic downgrade -1` | Desfaz a última migration aplicada. |
| `alembic current` | Mostra em qual migration o seu banco está. |
| `alembic history` | Lista todas as migrations, da mais nova para a mais antiga. |
| `alembic heads` | Mostra a(s) migration(s) mais recente(s). Deve haver **só uma**. |
| `alembic upgrade head --sql` | Mostra o SQL que seria executado, **sem executar**. Útil para conferir. |

---

## 7. Problemas comuns

### A migration gerada está vazia (só `pass`)

O Alembic não encontrou diferença entre os models e o banco. Causas prováveis:

- O model **não foi importado** no `env.py` (seção 3.3a).
- O `target_metadata` ainda está `None` (seção 3.3c).
- A tabela já foi criada por fora (por um `create_all`, por exemplo).

Apague o arquivo vazio, corrija a causa e gere de novo.

### `relation "xxx" does not exist`

A tabela não existe no banco. Rode `alembic upgrade head`. Se continuar, confira se existe uma migration que cria essa tabela.

### `relation "xxx" already exists`

A tabela foi criada fora do Alembic (normalmente por um `create_all`). Em ambiente local, o mais simples é apagar a tabela (ou o banco inteiro) e rodar `alembic upgrade head` de novo. **Não faça isso em produção.** Peça ajuda.

### `Multiple head revisions are present`

Duas pessoas geraram migrations ao mesmo tempo, a partir do mesmo ponto, e as duas entraram no Git. O Alembic agora tem dois "finais" e não sabe qual seguir. Para juntar:

```bash
alembic merge heads -m "merge das migrations"
alembic upgrade head
```

Revise e faça commit do arquivo de merge gerado.

### `Target database is not up to date`

Você tentou gerar uma migration com o banco desatualizado. Rode `alembic upgrade head` e gere de novo.

---

## 8. Regras do time

1. **Nunca edite uma migration que já foi para a branch principal.** Se algo estiver errado, crie uma **nova** migration corrigindo.
2. **Nunca altere o banco à mão** (criar coluna pelo pgAdmin, por exemplo). Toda mudança passa por migration.
3. **Sempre `git pull` e `alembic upgrade head` antes de gerar uma migration.**
4. **Model e migration vão no mesmo PR.**
5. **Sempre revise o arquivo gerado** antes de aplicar e de fazer commit.
6. **Senha do banco só no `.env`**, nunca no `alembic.ini` nem no código.

---

## Resumo em uma linha

> Mudou o model → `alembic revision --autogenerate -m "..."` → revisa o arquivo → `alembic upgrade head` → commit de tudo junto.
