# 2. Solução Proposta

## 2.1 Objetivo Geral do Produto

O objetivo geral do produto é ser capaz de centralizar o cadastro, armazenamento, consulta e atualização das informações dos alunos, substituindo o processo atualmente realizado de forma manual e predominantemente física através de um **sistema digital de gerenciamento das fichas de matrícula da Creche Estação Vida.**

A solução busca facilitar o trabalho da equipe responsável pela secretaria, tornando o acesso e a manutenção dos dados mais rápidos, organizados e seguros. Com isso, espera-se reduzir a dependência de documentos físicos, diminuir os riscos de perda ou deterioração das fichas e melhorar a eficiência dos processos administrativos da instituição, proporcionando uma gestão mais adequada das informações dos alunos.

## 2.2 Objetivos Específicos (OE) do Produto

- **OE.1:** Aumentar a capacidade da instituição de atender o grande volume de fichas.
- **OE.2:** Reduzir a dependência de fichas e documentos físicos, diminuindo o acúmulo de papéis e a necessidade de espaço para armazenamento.
- **OE.3:** Aumentar a segurança das informações dos alunos.
- **OE.4:** Otimização de tempo no gerenciamento das fichas de matrículas.
- **OE.5:** Agilizar e tornar rápido a atualização de dados.

## 2.3 Características de Produto (mapeadas com os Objetivos Específicos do Produto)

| OE Principal | Contribuição secundária |ID| Característica | Descrição resumida | Valor de negócio principal |
|---|---|---|---|---|---|
| OE.1 | OE.4, OE.5 | CP.1|Módulo de Gerenciamento de Usuário | Permitir o cadastro e a manutenção das informações dos alunos, centralizando os dados das fichas de matrícula em um único sistema. | Redução do tempo de atendimento e de outras atividades da secretaria. |
| OE.4 | OE.3 | CP.2 |Módulo de Busca de F.M e Usuário | Facilitar a consulta e a localização das informações dos alunos, reduzindo o tempo necessário para encontrar os dados atualmente armazenados em documentos físicos. | Garantir a segurança do sistema e atualização de dados do usuário. |
| OE.2 | OE.3 | CP.3| Sistema de Gerenciamento de Documentos | Sistema para inserção de documentação obrigatória digitalizada. | Otimização de espaço físico e tempo; eliminação de custos e acúmulo de papel. |
| OE.3 | — | CP.4| Módulo de Autenticação dos Usuário | Módulo para realizar login do usuário. | Garantir a segurança do sistema. |
| OE.5 | OE.4, OE.1 | CP.5| Módulo de Edição de Documentos | Módulo de edição de documentos previamente inseridos. | Garantir atualização dos documentos dos alunos. |

## 2.4 Tecnologias a Serem Utilizadas

| Camada / Categoria | Tecnologias & Ferramentas |
|---|---|
| Backend | Python, FastAPI, SQLAlchemy |
| Frontend | Next.js, Axios |
| Banco de Dados | PostgreSQL |
| Versionamento | Git e GitHub |
| Conteinerização | Docker |
| Prototipação | Figma |

## 2.5 Pesquisa de Mercado e Análise Competitiva

O mercado de soluções para gestão de instituições de ensino e creches possui diversas plataformas voltadas ao cadastro e gerenciamento de informações de alunos. Entre as soluções existentes, destacam-se:

- **Sistemas de gestão escolar**, como o Sponte, que oferecem recursos para matrícula, cadastro de alunos, documentos escolares, frequência e outros processos administrativos e pedagógicos. Essas plataformas possuem uma ampla variedade de funcionalidades, mas podem apresentar recursos que não são necessários para a realidade específica da Creche Estação Vida.
- **Sistemas de gestão educacional de código aberto**, como o i-Educar, que permitem o gerenciamento de informações escolares e são utilizados principalmente por redes públicas de ensino. Apesar de oferecerem possibilidades de adaptação, possuem uma estrutura voltada para uma gestão educacional mais ampla.
- **Documentos e fichas físicas**, que ainda representam uma alternativa utilizada pela instituição para armazenar as informações dos alunos. Embora permitam o registro dos dados, esse modelo dificulta a consulta, atualização e organização das informações, além de exigir espaço físico e aumentar os riscos de perda ou deterioração dos documentos.

A proposta se diferencia por ser uma solução **enxuta e desenvolvida de acordo com as necessidades da Creche Estação Vida**, tendo como foco principal o cadastro, armazenamento, consulta e manutenção das fichas de matrícula. Em vez de oferecer uma grande quantidade de funcionalidades que não fazem parte da necessidade atual da instituição, o sistema será direcionado aos processos que atualmente geram maior dificuldade para a equipe administrativa.

Dessa forma, a solução busca oferecer uma ferramenta **voltada aos processos de cadastro, consulta, atualização e organização das fichas de matrícula, com interface que possa ser utilizada pelas profissionais da secretaria sem conhecimentos técnicos específicos**, considerando principalmente o número reduzido de profissionais responsáveis pela secretaria e a grande quantidade de documentos físicos acumulados ao longo dos anos. A proposta pretende, portanto, substituir gradualmente o processo manual por uma forma mais organizada e eficiente de gerenciamento das informações dos alunos.

## 2.6 Viabilidade da Proposta

Após a análise inicial, o cliente apresentou informações suficientes para o levantamento inicial de requisitos e para a definição de uma proposta de solução viável no contexto da disciplina. A equipe possui conhecimento técnico suficiente para desenvolver as principais funcionalidades previstas dentro do prazo estipulado, utilizando tecnologias compatíveis com sua capacidade técnica. Ademais, o acesso ao cliente é viável ao longo do período de desenvolvimento do projeto, possibilitando esclarecimento de dúvidas e validação das entregas.

Dado o prazo estabelecido, conhecimento técnico disponível e a proximidade com o cliente, considera-se viável a entrega de um MVP funcional, cobrindo as principais funcionalidades estabelecidas. Portanto, a proposta é técnica e operacionalmente viável dentro do contexto da disciplina.

## 2.7 Benefícios Esperados

### 2.7.1 Benefícios para o Cliente

Dentre os benefícios previstos para o cliente em questão, podemos incluir:

- Facilidade na gestão das matrículas dos alunos da instituição, dado o maior controle operacional que a solução visa implementar;
- Redução do custo da emissão de matrículas devido ao processo integrado e inteiramente digital;
- Redução das chances de ocorrência de perda e/ou danos em relação às informações;
- Otimização dos espaços físicos utilizados pela instituição que, antes, eram usados para armazenamento de documentação e que, com a solução, podem ser melhor reutilizados.

### 2.7.2 Benefícios para os Usuários

Dentre os benefícios previstos para os usuários do sistema, podemos incluir:

- Facilidade no preenchimento de matrículas, exigindo menos esforço e aumentando a praticidade;
- Praticidade na busca por informações com um banco de dados integrado;
- Maior segurança e confiabilidade das informações dos alunos matriculados.