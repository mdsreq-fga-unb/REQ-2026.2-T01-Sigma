# 4 ESTRATÉGIAS DE ENGENHARIA DE SOFTWARE

## 4.1 Estratégia Priorizada

**Abordagem:** A equipe optou pela abordagem híbrida. De acordo com essa prática, aspectos ágeis como a importância do produto funcionando e de o cliente estar disponível para comentários também são aplicados. As dimensões de uma abordagem centrada em planos, como fases e marcos, também são preservadas. Essas escolhas surgiram da suposição da equipe de que o cliente estará disponível para comentários durante todo o desenvolvimento do projeto e quererá alterações, mas também dos desafios representados pelo processamento de quantidades substanciais de dados, pela infraestrutura física da instituição de caridade e pelas questões relacionadas à segurança.

**Ciclo de vida:** Como mencionado anteriormente, a abordagem escolhida inclui a incorporação de aspectos iterativos e incrementais ao processo de desenvolvimento do software. Isso significa que, durante todo o ciclo de vida, alguns aspectos do sistema serão priorizados, planejados aprofundadamente, construídos e colocados em produção. Ao mesmo tempo, o escopo do produto a ser desenvolvido crescerá ciclicamente de acordo com os resultados dessas etapas e os feedbacks do cliente (a secretária, a coordenação e a direção da Creche Estação Vida).

**Processo:** Para implementar a estratégia e o ciclo de vida escolhidos, a equipe precisa de um método específico, que, neste caso, é o OpenUP. Esse processo é essencialmente uma variação mais leve do UP original e, como tal, é bem-sucedido em equipes menores e com escopo em transformação. Ele possui os benefícios tanto de uma abordagem centrada em planos quanto de uma abordagem ágil, e a quantidade total de documentação necessária para ele é minimizada sem sacrificar a qualidade.

### 4.1.1 Adaptação do OpenUP ao Projeto

Quando se escolhe um método, ele não é, nem de longe, seguido como um conjunto rígido de regras e regulamentos. A equipe escolheu algumas das opções oferecidas como úteis para o projeto atual, conforme descrito abaixo.

**Fases:**

As fases que serão seguidas são apresentadas na tabela abaixo, juntamente com suas justificativas.

| Fase | Objetivo |
|------|----------|
| Concepção | Compreensão do problema, determinação de requisitos iniciais, conceituação do MVP e delimitação de riscos significativos (segurança, migração e infraestrutura). |
| Elaboração | Refinação dos requisitos significativos, modelagem de casos de uso, prototipagem de interfaces e construção das primeiras definições de arquiteturas de controle de acesso e armazenamento. |
| Construção | Desenvolvimento das funcionalidades priorizadas em uma base iterativa e incremental, com demonstração a partes interessadas e testes de validade. |
| Transição | Validação final com partes interessadas, testes de aceitação, registro de alterações e definição de especificações futuras. |

**Papéis**

| Abordagem adaptada | |
|---------------------|--|
| Analista | Responsável por elicitação, análise e formulação de requisitos; de fato, distribuídos entre os membros da equipe. |
| Desenvolvedor | Responsável por implementação e testes unitários |
| Testador | Responsável por testes de integração e validação com partes interessadas; possivelmente acumulado com o papel de Desenvolvedor |
| Gerente de Projeto | Responsável por planejamento e priorização do backlog, comunicação com o cliente |

**Artefatos:**

Assim como no nível das fases e dos papéis, os artefatos não são seguidos de forma rígida. Em vez disso, aqueles que ajudam a alcançar as metas do projeto são empregados, conforme mostrado na tabela abaixo.

| Artefato | Objetivo |
|----------|----------|
| Visão | Documentação do problema, dos objetivos e do escopo do projeto |
| Lista de Requisitos (backlog) | Registro e priorização de requisitos |
| Casos de Uso (leves e detalhados) | Descrição do sistema de acordo com suas entidades e ações |
| Histórias do Usuário | Descrição do sistema do ponto de vista dos usuários, para auxiliar na priorização do backlog |
| Protótipos | Validação da arquitetura gráfica antes da construção real |
| Especificações Suplementares | Documentação de requisitos funcionais e não funcionais |

**Práticas**

Igualmente conforme descrito acima, algumas das práticas sugeridas pelo OpenUP foram identificadas como úteis para este projeto. Elas incluem os seguintes aspectos do processamento iterativo e incremental.

- Iterações curtas e baseadas em releases;
- Priorização baseada no valor e nos riscos;
- Validação constante com partes interessadas após cada iteração;
- Documentação leve e em transformação;
- Gestão de mudanças leve e de transformação.

### 4.1.2 Relação entre os Artefatos

Dois dos artefatos escolhidos para este projeto podem parecer redundantes para algumas pessoas: casos de uso e histórias do usuário. A equipe resolveu essa situação especificando relações claras para evitar ambiguidades e acredita ter encontrado a melhor maneira de aplicá-los a este projeto, conforme mostrado na tabela abaixo.

| Características | Casos de Uso | Histórias do Usuário |
|-----------------|--------------|----------------------|
| Objetivo | Descrição do sistema de acordo com seus atores e ações | A descrição do sistema do ponto de vista dos usuários |
| Uso | Principal para desenvolvimento e validação | Complementares aos casos de uso; usado para demonstração a partes interessadas |
| Nível | Nível mais alto de descrição, com refinamento gradual; nível de detalhe maior | Breve e casual; nível mais baixo de detalhe |
| Relação | Cada história do usuário é inspirada em pelo menos alguns casos de uso | Cada caso de uso pode ser derivado de várias histórias do usuário |
| Exemplo | A história do usuário "Como secretária, eu quero cadastrar um aluno para ter acesso aos dados" é baseada no caso de uso "Cadastrar aluno" | |

### 4.1.3 Direção dos Riscos

Como mencionado anteriormente, o OpenUP tem sido amplamente orientado por riscos desde seu surgimento. Assim, quando se trata desse projeto, a equipe precisa abordar os riscos significativos que se aplicam a ele primeiro, com aqueles que são menos prováveis sendo abordados posteriormente ou ignorados completamente. Os riscos significativos identificados para este projeto são apresentados na tabela abaixo, juntamente com as formas como eles serão enfrentados.

| Risco | Maneira de Enfrentar |
|-------|----------------------|
| Segurança | Garantir a confidencialidade e a proteção de informações pessoais; controlar quem tem acesso às informações e ao sistema como um todo |
| Migração | Determinar se todos os documentos físicos serão convertidos para eletrônicos; se não forem, como a equipe administrará aqueles que continuam sendo usados. |
| Infraestrutura | Ensinar e treinar os membros da equipe sobre tecnologias que estejam alinhadas às capacidades da Creche Estação Vida |
| Arquitetura de Armazenamento | Definir esse aspecto em uma base iterativa e incremental, em vez de concentrá-lo em uma única etapa, considerando o tamanho e a natureza do projeto. |
| Controle de Acesso | Definir os tipos de permissão para diferentes indivíduos/entidades. |
| Recuperação de Dados | Garantir que a equipe esteja ciente de backup e restauração em caso de perda de dados. |

## 4.2 Comparação

A comparação de dois processos de desenvolvimento de software potenciais é apresentada abaixo. Eles são o OpenUP (a escolha da equipe) e o UP (Unified Process).

| Critérios | OpenUP | UP (Unified Process) |
|---|---|---|
| **Tipo** | Processo de desenvolvimento de software (versão leve do UP) | Processo de desenvolvimento de software (abrangente) |
| **Abordagem** | Abordagem híbrida (combina estrutura do UP com agilidade) | Abordagem dirigida por plano, com ênfase em disciplina e documentação |
| **Ciclo de vida** | Iterativo e incremental, com fases (Concepção, Elaboração, Construção, Transição) | Iterativo e incremental, com as mesmas fases, porém com mais formalidade entre elas |
| **Documentação** | Documentação enxuta, com artefatos mínimos (Visão, Lista de Requisitos, Casos de Uso simplificados) | Documentação extensa e detalhada, com múltiplos artefatos formais |
| **Papéis** | Analista, Desenvolvedor, Testador, Gerente de Projeto, com flexibilidade para adaptação | Papéis bem definidos e especializados (Analista, Arquiteto, Designer, Testador, Gerente, etc.) |
| **Requisitos** | Elicitação gradual, foco em casos de uso leves e orientação por riscos | Elicitação formal e abrangente, com documentação detalhada de requisitos e casos de uso completos |
| **Validação** | Validação contínua e incremental (revisões e demonstrações ao final de cada iteração) | Validação formal em marcos definidos (revisões formais e aprovações) |
| **Adaptabilidade** | Moderadamente alta, com flexibilidade para ajustes entre iterações | Moderada, com maior rigidez no controle de mudanças |
| **Vantagens** | Equilíbrio entre estrutura e agilidade; adequado para equipes pequenas e projetos com escopo bem definido; documentação suficiente sem sobrecarga; introdução suave ao estilo ágil | Processo maduro e amplamente documentado; rastreabilidade robusta; adequado para projetos grandes e críticos; forte ênfase em arquitetura |
| **Desvantagens** | Exige compreensão prévia dos conceitos centrais do UP; menos indicado para sistemas de grande escala ou criticidade elevada | Processo pesado e burocrático para projetos pequenos; excesso de documentação; curva de aprendizado acentuada; pouco adaptável a mudanças frequentes |
| **Foco** | Projetos pequenos a médios, equipes pequenas, documentação leve | Projetos médios a grandes, equipes maiores, ambientes regulados ou críticos |
| **Conclusão** | Adequado ao projeto: o OpenUP oferece estrutura suficiente para orientar a equipe, com documentação enxuta que atende às necessidades do cliente, e flexibilidade para acomodar refinamentos durante o desenvolvimento. | Não adequado ao projeto: o UP seria excessivamente pesado e burocrático para a realidade da Creche Estação Vida, que demanda agilidade, documentação enxuta e adaptabilidade a refinamentos contínuos. |

## 4.3 Justificativa

Os motivos para escolher o OpenUP basearam-se nos seguintes fatores:

## 1. Escala e maturidade da equipe e dos stakeholders do cliente

Tanto o OpenUP quanto o UP têm sido utilizados em projetos envolvendo equipes reduzidas, como neste caso, e oferecem uma abordagem estruturada ao ciclo de vida do projeto, à estrutura gerencial e ao conjunto de artefatos. Isso é particularmente relevante neste projeto, considerando as limitações da nossa equipe de estudantes e a falta de experiência gerencial dos stakeholders do cliente. Embora o UP exija uma quantidade significativa de documentos de apoio e especificações gerenciais detalhadas, esses documentos não são essenciais para um conjunto menor de regras e objetivos bem definidos, como os previstos para este projeto específico.

## 2. Um método de trabalho estabelecido que oferece flexibilidade para mudanças iterativas no processo de desenvolvimento

Além de fornecer um conjunto consistente de documentos para implementar as diretrizes gerenciais básicas, a estrutura operacional iterativa do OpenUP oferece flexibilidade, conforme mencionado acima, em relação aos modelos de trabalho tradicionais do UP. Essa flexibilidade é valiosa para o projeto atual, pois permite o envolvimento dos stakeholders do cliente na maioria das etapas por meio do feedback contínuo, da análise e da revisão. Por exemplo, enquanto os requisitos gerais do projeto foram identificados com precisão durante a etapa de planejamento, novas exigências ainda podem surgir e ser incluídas conforme os stakeholders do cliente intervierem e ajustarem a direção do projeto. Da mesma forma, embora a estrutura de riscos do OpenUP permita que questões relacionadas a migração, segurança de dados e arquitetura recebam atenção durante as fases de conceituação e elaboração, isso não precisa ocorrer apenas uma vez, em uma fase específica.

## 3. A estrutura abrangente para a engenharia de requisitos

Como o OpenUP tem sido utilizado para definir uma abordagem bem-sucedida para as melhores práticas de engenharia de requisitos, ele serve como modelo de referência para aplicar a metodologia de engenharia de requisitos discutida nesta aula do curso. Dessa forma, a etapa de elicitação e descoberta, que utiliza entrevistas individuais e coletivas e a análise de documentação existente, pode ser combinada com as avaliações de análise e consenso, que enfatizam a importância da priorização. Depois disso, as atividades de declaração de requisitos podem ser integradas ao processo iterativo de negociação com os stakeholders do cliente. Em seguida, a descrição detalhada da relação entre casos de uso e usuários ajuda a evitar possíveis confusões e divergências entre os vários documentos. No geral, a descrição do OpenUP fornece uma compreensão detalhada de como os requisitos devem ser elaborados, apresentados e comunicados aos stakeholders do cliente. Da mesma forma, a definição transparente dos tipos de entradas e requisitos, de modo que os documentos sejam distintos, ajuda a diferenciar requisitos funcionais, não funcionais e de negócio, assim como requisitos de implementação e de arquitetura.

## 4. As semelhanças e diferenças tanto com relações gerenciais quanto com práticas de documentação do UP

A principal diferença entre o OpenUP e o UP reside nos objetivos para os quais ambos foram originalmente desenvolvidos. Enquanto o UP visa proporcionar uma estrutura abrangente para atividades de governança e gestão de projetos na implementação de projetos de grande escala, a abordagem OpenUP visa oferecer métodos ágeis e mais leves para o mesmo objetivo. Assim, apesar de a estrutura de documentação e gerenciamento do UP ser extremamente rigorosa e poderosa, ela não se tornaria economicamente viável para um projeto conduzido por uma equipe reduzida de estudantes. No geral, no que diz respeito ao projeto para a Creche Estação Vida, a decisão de seguir o OpenUP se mostrou apropriada, pois oferece uma abordagem razoavelmente simples e ágil para o mesmo escopo e estrutura gerencial do UP.