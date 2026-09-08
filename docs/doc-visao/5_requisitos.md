# 5. Engenharia de Requisitos

## 5.1 Atividades e Técnicas de ER

### Concepção

**Elicitação e Descoberta:**

- **Video-Entrevistas:** Serão realizadas entrevistas com a diretora, coordenadora e secretárias da Creche Estação Vida para compreender o processo atual de cadastro, armazenamento, consulta e atualização das fichas de matrícula, identificando as principais necessidades dos usuários.
- **Análise Documental:** As fichas de matrícula utilizadas pela instituição serão analisadas para identificar as principais informações que deverão ser consideradas na solução.

**Análise e Consenso:**

- **Priorização de Requisitos:** Os requisitos identificados serão analisados e priorizados de acordo com sua importância para a creche, dando preferência às necessidades que apresentam maior impacto na rotina administrativa.

**Declaração:**

- **Visão:** Será elaborado o documento de Visão, apresentando o problema identificado, os objetivos da solução e o escopo inicial do sistema.
- **Lista de Requisitos:** Será criada uma lista inicial contendo as principais funcionalidades que deverão ser contempladas pelo sistema.

**Representação:**

- **Casos de Uso Leves:** Serão elaborados casos de uso simplificados para representar as principais funcionalidades identificadas, como cadastrar aluno, consultar ficha e atualizar informações.

### Elaboração

**Elicitação e Descoberta:**

- **Entrevistas de Aprofundamento:** Serão realizadas novas entrevistas com as secretárias e demais stakeholders para esclarecer dúvidas e obter informações mais detalhadas sobre os requisitos levantados na Concepção.
- **Cenários de Uso:** Serão analisadas situações da rotina da creche para compreender com maior precisão como as funcionalidades deverão funcionar.

**Análise e Consenso:**

- **Análise de Requisitos:** Os requisitos serão analisados para identificar conflitos, ambiguidades, dependências e informações incompletas.
- **Priorização:** Os requisitos serão novamente priorizados considerando seu valor para a instituição e os riscos envolvidos em sua implementação.

**Declaração:**

- **Refinamento da Especificação:** Os requisitos de maior prioridade serão detalhados progressivamente conforme a necessidade de implementação, evitando uma especificação excessiva antecipadamente.

**Representação:**

- **Casos de Uso:** Os casos de uso inicialmente levantados serão refinados para representar de forma mais detalhada as interações entre os usuários e o sistema.
- **Protótipos:** Protótipos das principais telas poderão ser utilizados para representar a solução e facilitar a validação da organização das informações e das funcionalidades.

**Verificação e Validação:**

- **Revisões com Stakeholders:** Os requisitos refinados serão revisados junto aos usuários para verificar se estão de acordo com as necessidades identificadas.
- **Demonstrações:** Protótipos e versões iniciais das funcionalidades serão apresentados aos stakeholders para obter feedback e identificar possíveis ajustes.

### Construção

Os requisitos serão progressivamente refinados conforme a implementação das funcionalidades, priorizando aqueles necessários para a iteração atual e evitando detalhamento desnecessário de funcionalidades futuras.

**Verificação e Validação:**

- **Testes:** As funcionalidades implementadas serão testadas para verificar se estão de acordo com os requisitos definidos.
- **Demonstrações Incrementais:** As funcionalidades desenvolvidas serão apresentadas aos stakeholders, permitindo verificar se o sistema continua atendendo às necessidades da creche e incorporar o feedback nas próximas iterações.

**Organização e Atualização:**

- **Atualização dos Requisitos:** Os requisitos serão atualizados conforme as alterações identificadas durante o desenvolvimento.
- **Gerenciamento de Mudanças:** Novos requisitos ou modificações serão registrados e avaliados considerando seu impacto e prioridade para o projeto.

### Transição

**Verificação e Validação:**

- **Testes de Aceitação:** Serão realizados testes com as principais usuárias do sistema para verificar se as funcionalidades atendem aos requisitos e às necessidades da rotina administrativa da creche.
- **Validação com Stakeholders:** A solução será avaliada pela direção, coordenação e secretárias antes de sua utilização definitiva, permitindo identificar possíveis ajustes finais.

**Organização e Atualização:**

- **Registro de Melhorias Futuras:** Necessidades ou funcionalidades que não forem essenciais para a versão atual serão registradas e organizadas para possíveis iterações futuras.

## 5.2 Engenharia de Requisitos e o OpenUP

| Fase do OpenUP | Atividade de ER | Prática Técnica | Resultado Esperado |
|---|---|---|---|
| **Concepção** | Elicitação e Descoberta — Levantamento Inicial de Requisitos | Entrevistas com Stakeholders, Análise Documental | Requisitos de alto nível identificados e contexto do problema de gestão de matrículas compreendido |
| **Concepção** | Análise e Consenso — Priorização Estratégica Inicial | Discussões em Equipe, Análise de Valor de Negócio | Escopo principal do MVP acordado e requisitos críticos (maior impacto na rotina) priorizados |
| **Concepção** | Declaração — Registro da Visão e Escopo | Documento de Visão, Lista de Requisitos (Backlog Inicial) | Objetivos da solução e escopo do sistema documentados de forma clara e concisa |
| **Concepção** | Representação — Modelagem de Funcionalidades | Casos de Uso | Funcionalidades críticas essenciais mapeadas e representadas de forma concisa |
| **Elaboração** | Elicitação e Descoberta — Refinamento de Requisitos Críticos | Entrevistas de Aprofundamento, Cenários de Uso | Requisitos refinados e compreendidos em detalhes para mitigar os riscos arquiteturais |
| **Elaboração** | Análise e Consenso — Análise de Viabilidade e Dependências | Análise de Requisitos, Repriorização de Riscos | Conflitos resolvidos e consenso estabelecido sobre a viabilidade técnica da implementação |
| **Elaboração** | Declaração — Especificação Progressiva | Refinamento da Especificação | Requisitos prioritários especificados com o nível exato de detalhe necessário para o desenvolvimento |
| **Elaboração** | Representação — Prototipação de Interface e Interação | Casos de Uso Detalhados, Protótipos de Interface | Interações detalhadas e telas validadas visualmente para guiar a equipe de desenvolvimento |
| **Elaboração** | Verificação e Validação — Validação da Proposta de Solução | Revisões com Stakeholders, Demonstrações de Protótipos | Confirmação de que a arquitetura e as interfaces propostas atendem às expectativas dos usuários |
| **Construção** | Verificação e Validação — Validação de Funcionalidades Implementadas | Testes de Software, Demonstrações Incrementais | Funcionalidades verificadas iterativamente com o cliente e feedback coletado para os próximos passos |
| **Construção** | Organização e Atualização — Revisão e Manutenção do Backlog | Atualização de Requisitos, Gerenciamento de Mudanças | Backlog de requisitos atualizado, incorporando feedbacks e controlando novas demandas |
| **Transição** | Verificação e Validação — Validação Final do Produto | Testes de Aceitação do Usuário (UAT), Validação com Stakeholders | Sistema validado de forma definitiva pelas usuárias finais no ambiente real da instituição |
| **Transição** | Organização e Atualização — Gestão de Conhecimento e Evolução | Registro de Melhorias Futuras | Novas demandas e melhorias não críticas registradas e organizadas para futuras versões do sistema |