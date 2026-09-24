# 2. Solução Proposta
 
## 2.1 Objetivo Geral do Produto
 
O objetivo geral do produto é melhorar o sistema atual de organização e recuperação das informações das fichas, substituindo o processo atualmente realizado de forma manual e predominantemente física através de um sistema digital de gerenciamento de cards de matrícula da Creche Estação Vida, centralizando o cadastro, armazenamento, consulta e atualização de informações.
 
A solução busca facilitar exclusivamente o trabalho da equipe responsável pela secretaria, tornando o acesso e a manutenção dos dados mais rápidos, organizados e seguros. Com isso, espera-se reduzir a dependência de documentos físicos, diminuir os riscos de perda ou deterioração das fichas e melhorar a eficiência dos processos administrativos da instituição, proporcionando uma gestão mais adequada das informações dos alunos.
 
A solução atende uma demanda única, exclusiva e interna do secretariado da Creche Estação Vida, ainda que a instituição use de sistemas da prefeitura para prestar contas e cuidar de outras áreas da creche. Portanto, o nosso projeto/produto de software não depende de qualquer tipo de aprovação municipal, tendo em vista que o cliente vai ser a logística interna da creche, onde as principais usuárias seriam as secretárias da instituição. Dessa forma, nossa solução apresenta um único tipo de perfil, o perfil de secretariado, que será capaz de ter acesso total ao sistema a fim de usar do produto por completo.
 
Os dados armazenados e mantidos pelo nosso sistema serão consumidos exclusivamente pela creche, não tendo vínculo nenhum com a prefeitura, uma vez que a mesma já tem um sistema próprio. Com isso em vista, o vínculo da instituição com a prefeitura não nos limita em nenhum ponto quanto à infraestrutura, uma vez que o sistema funcionará independentemente do sistema da prefeitura.
 
Tendo em vista que são dados sensíveis de crianças, a nossa solução pretende ter privacidade de dados e retenção segura. Com isso, o sistema vai manter a privacidade dos dados pessoais restringindo sua visualização apenas a usuários autenticados, apoiando a segurança da informação exigida pela LGPD.
 
## 2.2 Objetivos Específicos (OE) do Produto
 
- **OE.1:** Facilitar e melhorar a continuidade do processo administrativo.
- **OE.2:** Reduzir riscos de perda e deterioração.
- **OE.3:** Controlar o acesso quanto às informações dos cards.
- **OE.4:** Reduzir o tempo de edição e manutenção de cards de matrícula, de modo que fique mais ágil do que feito atualmente (modo manual).
- **OE.5:** Preservar e centralizar as informações das matrículas.
## 2.3 Características de Produto (mapeadas com os Objetivos Específicos do Produto)
 
| ID | OE Principal | Contribuição secundária | Característica | Descrição resumida | Valor de negócio principal |
|---|---|---|---|---|---|
| CP1 | OE.1 | OE.2 | Gerenciamento de cards de matrícula | Permitir o cadastro das informações dos alunos, centralizando os dados em cards de matrícula. | Redução do tempo de cadastro e de outras atividades da secretaria. |
| CP2 | OE.1 | OE.2 | Edição e Atualização de cards de matrícula | Permitir a edição dos atuais cards. | Garantir a atualização de dados do usuário. |
| CP3 | OE.5 | OE.2, OE.4 | Consulta de informações dos cards de matrícula | Facilitar a consulta de cards de matrícula, ou um conjunto de tais. | Reduzir o tempo necessário para localizar um card, otimizando o tempo das secretárias. |
| CP4 | OE.3 | — | Controle de acesso de usuários | Permitir o cadastro de usuários ativos no sistema, tanto com autorização para editar o sistema ou apenas visualizar as informações. | Controla o acesso ao sistema, proporcionando segurança e confiabilidade de informações. |
| CP5 | OE.1 | OE.5, OE.2 | Gerenciamento de documentos | Anexação ou deleção de documentos vinculados aos cards de matrícula. | Permite a anexação de documentos fixados aos cards de matrícula. |
| CP6 | OE.1 | OE.5 | Avisos Rápidos | Postagem de avisos administrativos, para todos os usuários do sistema. | Facilita a comunicação entre as secretárias, facilitando o trabalho em equipe e coordenação no time. |
| CP7 | OE.5 | — | Módulo de gerenciamento de turmas e etapas | Criação, edição e inativação de turmas e etapas; vínculo de cards em turmas e etapas. | Facilita a organização dos cards de alunos, ajudando a logística entre as secretárias e otimizando o tempo de busca de um card. |
 
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
A proposta se diferencia por ser uma solução enxuta e desenvolvida de acordo com as necessidades da Creche Estação Vida, tendo como foco principal o cadastro, armazenamento, consulta e manutenção dos cards de matrícula. Em vez de oferecer uma grande quantidade de funcionalidades que não fazem parte da necessidade atual da instituição, o sistema será direcionado aos processos que atualmente geram maior dificuldade para a equipe administrativa.
 
Dessa forma, a solução busca oferecer uma ferramenta voltada aos processos de cadastro, consulta, atualização e organização dos cards de matrícula, com interface que possa ser utilizada pelas profissionais da secretaria sem conhecimentos técnicos específicos, considerando principalmente o número reduzido de profissionais responsáveis pela secretaria e a grande quantidade de documentos físicos acumulados ao longo dos anos. A proposta pretende, portanto, substituir gradualmente o processo manual por uma forma mais organizada e eficiente de gerenciamento das informações dos alunos.
 
## 2.6 Viabilidade da Proposta
 
Após a análise inicial, o cliente apresentou informações suficientes para o levantamento inicial de requisitos e para a definição de uma proposta de solução viável no contexto da disciplina. A equipe possui conhecimento técnico suficiente para desenvolver as principais funcionalidades previstas dentro do prazo estipulado, utilizando tecnologias compatíveis com sua capacidade técnica. Ademais, o acesso ao cliente é viável ao longo do período de desenvolvimento do projeto, possibilitando esclarecimento de dúvidas e validação das entregas.
 
A infraestrutura da instituição também não é um impedimento para o uso do nosso produto, tendo em vista que é um lugar com conectividade estável e conta com um acervo de computadores disponível maior do que o necessário. Sobre o nível de conhecimento tecnológico das secretárias, por já terem usado sistemas digitais antes, tais profissionais não declararam ser uma dificuldade usar o nosso produto. A digitalização do acervo é plenamente concebível: a cliente declarou que não espera que todas as fichas sejam digitalizadas para o sistema, e que planeja começar a usar o produto no primeiro semestre de 2027, o que faz com que nosso sistema seja usado paralelamente com as fichas antigas, substituindo-as pouco a pouco.
 
Dado o prazo estabelecido, conhecimento técnico disponível e a proximidade com o cliente, considera-se viável a entrega de um MVP funcional, cobrindo as principais funcionalidades estabelecidas. Portanto, a proposta é técnica e operacionalmente viável dentro do contexto da disciplina.
 
## 2.7 Benefícios Esperados
 
### 2.7.1 Benefícios para o Cliente
 
Dentre os benefícios previstos para o cliente em questão, podemos incluir:
 
- Facilidade na gestão das matrículas dos alunos da instituição, dado o maior controle operacional que a solução visa implementar;
- Redução do custo da emissão de matrículas devido ao processo integrado e digital;
- Redução das chances de ocorrência de perda e/ou danos em relação às informações;
- Otimização dos espaços físicos utilizados pela instituição que, antes, eram usados para armazenamento de documentação e que, com a solução, podem ser melhor reutilizados.
### 2.7.2 Benefícios para os Usuários
 
Dentre os benefícios previstos para os usuários do sistema, podemos incluir:
 
- Facilidade no preenchimento de matrículas, exigindo menos esforço e aumentando a praticidade;
- Praticidade na busca por informações com um banco de dados integrado;
- Maior segurança e confiabilidade das informações dos alunos matriculados.