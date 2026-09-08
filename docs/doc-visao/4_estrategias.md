# 4. Estratégias de Engenharia de Software

## 4.1 Estratégia Priorizada

- **Abordagem:** A equipe optou pela abordagem híbrida, acolhendo tanto os valores ágeis durante a produção do software e priorizando a criação de software funcional em relação à documentação extensa, quanto os valores de dirigida por planos, onde seguiremos as fases previamente decididas pelo nosso processo de ESW. Também foi considerado que o acesso à comunicação com o cliente será viável durante todo o desenvolvimento do projeto, a fim de maior precisão de requisitos durante o desenvolvimento do projeto.

- **Ciclo de vida:** Em alinhamento com a abordagem escolhida, a equipe decidiu adotar um ciclo de vida iterativo e incremental, no qual o sistema será desenvolvido de forma progressiva por meio de ciclos de desenvolvimento. A cada iteração, serão planejadas, desenvolvidas e testadas funcionalidades específicas, permitindo que o produto evolua gradualmente ao longo do projeto.

    Essa abordagem possibilita realizar entregas incrementais e obter feedback dos usuários durante o desenvolvimento. Com isso, podemos identificar necessidades, corrigir problemas e realizar refinamentos a cada iteração, reduzindo riscos e garantindo que a solução evolua de acordo com as necessidades da Creche Estação Vida.

- **Processo:** O processo escolhido pela equipe foi o OpenUP. Esse processo foi selecionado, pois, pelo que foi discutido pela equipe durante as reuniões, escolhemos um processo que seria particularmente adequado para equipes pequenas e com projetos com escopo bem definido, como o proposto, pois o mesmo oferece um equilíbrio entre disciplina e agilidade, o que permite que a equipe foque na entrega ao cliente.

## 4.2 Quadro Comparativo

A seguir, um quadro comparativo entre os dois processos que poderiam ser utilizados no projeto.

| Critério | OpenUP | Scrum |
|---|---|---|
| Natureza | Processo abrangente, com práticas técnicas e de gerenciamento definidas. | Framework de gerenciamento ágil, focado na organização e coordenação do trabalho. |
| Abordagem | Híbrida (combina estrutura do UP com agilidade). | Ágil. |
| Ciclo de Vida | Iterativo e incremental, com fases (Concepção, Elaboração, Construção, Transição) e iterações. | Iterativo e incremental, com Sprints de duração fixa (geralmente 2 a 4 semanas). |
| Documentação | Documentação enxuta, com artefatos mínimos (Visão, Lista de Requisitos, Modelo de Casos de Uso simplificado). | Documentação minimalista, focada em Product Backlog, Sprint Backlog e Incremento. |
| Papéis | Define papéis como Analista, Desenvolvedor, Testador, Gerente de Projeto, mas com flexibilidade para adaptação. | Papéis bem definidos: Product Owner, Scrum Master e Time de Desenvolvimento. |
| Requisitos | Requisitos são refinados progressivamente ao longo das iterações, com ênfase em casos de uso leves e priorização por valor e risco. | Requisitos são gerenciados como User Stories no Product Backlog, priorizadas pelo Product Owner. |
| Validação | Validação contínua por meio de revisões e demonstrações ao final de cada iteração. | Validação ao final de cada Sprint, com Sprint Review e feedback do cliente. |
| Adaptabilidade a Mudanças | Moderada a alta, com flexibilidade para ajustes entre iterações. | Alta, com possibilidade de repriorizar o backlog a qualquer momento. |
| Forças | Equilíbrio entre estrutura e agilidade; adequado para equipes pequenas e projetos com requisitos moderadamente estáveis; oferece um caminho de transição do tradicional para o ágil. | Alta adaptabilidade; transparência contínua; feedback rápido; amplamente difundido e de fácil compreensão. |
| Limitações | Exige disciplina e familiaridade com conceitos do UP; pode ser insuficiente para sistemas de grande escala ou criticidade elevada. | Pode não fornecer documentação suficiente para certos contextos regulatórios; dependência da eficácia do Product Owner; menos estruturado para planejamento de longo prazo. |
| Adequação ao Projeto | **Alta:** O OpenUP oferece estrutura suficiente para orientar a equipe, com documentação enxuta que atende às necessidades do cliente, e flexibilidade para acomodar refinamentos durante o desenvolvimento. | **Média:** O Scrum seria viável, mas exigiria a definição de práticas técnicas complementares (como modelagem e testes) que não são prescritas pelo framework, além de demandar maior maturidade da equipe e do cliente no processo ágil. |

## 4.3 Justificativa

A escolha do processo OpenUP fundamenta-se em três aspectos.

1. **A adequação ao porte e à maturidade da equipe e do cliente:** Por ser um processo leve e escalável, projetado para equipes pequenas e projetos com escopo bem definido, se enquadra bem para o que a equipe necessita (como foi dito anteriormente). Ele oferece uma estrutura clara sem sobrecarregar a equipe com artefatos excessivos, o que é importante considerando que a equipe de desenvolvimento é formada por estudantes em formação e o cliente (Creche Estação Vida) possui baixa familiaridade com processos formais de desenvolvimento de software. A documentação do OpenUP, com artefatos como visão, lista de requisitos e modelo de casos de uso simplificado, é suficiente para garantir o alinhamento e a rastreabilidade do projeto sem criar uma barreira na comunicação entre a equipe e o cliente.

2. **Equilíbrio entre estrutura e flexibilidade:** O OpenUP combina a disciplina do UP com as práticas ágeis, permitindo que o projeto seja conduzido de forma iterativa e incremental, com entregas frequentes, mas mantendo uma visão de produto e uma arquitetura coerente. Essa é uma característica fundamental para um projeto como o da creche, no qual os requisitos, embora bem definidos inicialmente, podem sofrer refinamentos à medida que o projeto avança e o cliente interage com os protótipos e valida o entendimento acerca do sistema.

3. **Alinhamento com as atividades de Engenharia de Requisitos:** Como o OpenUP estabelece práticas claras em relação à gestão de requisitos, isso está diretamente alinhado com a abordagem de engenharia de requisitos adotada nesse projeto, que prevê atividades como elicitação e descoberta (com entrevista e observação), análise e consenso, declaração (com história de usuário e casos de uso) e representação (com diagramas e protótipos). Além disso, o OpenUP oferece um ambiente propício para que essas atividades sejam realizadas de forma integrada e iterativa.