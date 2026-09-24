# 5. Engenharia de Requisitos
 
## 5.1 Atividades e Técnicas de ER
 
### Concepção
 
**Elicitação e Descoberta:**
 
- **Entrevistas:** Serão realizadas entrevistas por meio de videochamadas, com a diretora, coordenadora e secretárias da Creche Estação Vida para compreender o processo atual de cadastro, armazenamento, consulta e atualização das fichas de matrícula, identificando as principais necessidades dos usuários.
- **Análise Documental:** As fichas de matrícula utilizadas pela instituição serão analisadas para identificar as principais informações que deverão ser consideradas na solução.

**Análise e Consenso:**
 
- **Priorização de Requisitos (MoSCoW):** Os requisitos identificados serão analisados e priorizados de acordo com sua importância para a creche, dando preferência às necessidades que apresentam maior impacto na rotina administrativa. Para realizar a priorização, utilizaremos o método MoSCoW (Must have, Should have, Could have, Won't have).
  
**Declaração:**
 
- **Visão:** Será elaborado o documento de Visão, apresentando o problema identificado, os objetivos da solução e o escopo inicial do sistema.
- **Lista de Requisitos:** Será criada uma lista inicial contendo as principais funcionalidades que deverão ser contempladas pelo sistema.

**Representação:**
 
- **Casos de Uso de Alto Nível:** Serão elaborados casos de uso simplificados para representar as principais funcionalidades identificadas, como cadastrar aluno, consultar ficha e atualizar informações.

**Organização e Atualização:**
 
- **Catálogo Inicial de Requisitos:** Será criada a estrutura de rastreabilidade dos requisitos funcionais e não funcionais do sistema. Além disso, os primeiros requisitos estabelecidos serão organizados nessa estrutura.
### Elaboração
 
**Elicitação e Descoberta:**
 
- **Entrevistas de Aprofundamento:** Serão realizadas novas entrevistas com as secretárias e demais stakeholders para esclarecer dúvidas e obter informações mais detalhadas sobre os requisitos levantados na Concepção.
- **Cenários de Uso:** Serão analisadas situações da rotina da creche para compreender com maior precisão como as funcionalidades deverão funcionar.
  
**Análise e Consenso:**
 
- **Análise de Impacto e Dependências:** Os requisitos serão analisados para identificar conflitos, ambiguidades, dependências e informações incompletas.
- **Priorização:** Os requisitos serão novamente priorizados considerando seu valor para a instituição e os riscos envolvidos em sua implementação.
  
**Declaração:**
 
- **Detalhamento Sob Demanda:** Os requisitos de maior prioridade serão detalhados progressivamente conforme a necessidade de implementação, aplicando técnicas como a escrita de casos de uso detalhados e a definição de critérios de aceite, evitando uma especificação excessiva antecipadamente.
  
**Representação:**
 
- **Casos de Uso:** Os casos de uso inicialmente levantados serão refinados para representar de forma mais detalhada as interações entre os usuários e o sistema.
- **Protótipos:** Protótipos das principais telas poderão ser utilizados para representar a solução e facilitar a validação da organização das informações e das funcionalidades.
  
**Verificação e Validação:**
 
- **Revisões com Stakeholders:** Os requisitos refinados serão revisados junto aos usuários para verificar se estão de acordo com as necessidades identificadas.
- **Demonstrações:** Protótipos e versões iniciais das funcionalidades serão apresentados aos stakeholders para obter feedback e identificar possíveis ajustes.
  
**Organização e Atualização:**
 
- **Gerenciamento de Mudanças:** A Matriz de Rastreabilidade criada na Concepção será atualizada continuamente. Conforme os requisitos são refinados e detalhados em casos de uso, as alterações de escopo, novas dependências e repriorizações serão registradas para manter o controle e histórico do projeto.
### Construção
 
Os requisitos serão progressivamente refinados conforme a implementação das funcionalidades, priorizando aqueles necessários para a iteração atual e evitando detalhamento desnecessário de funcionalidades futuras.
 
**Elicitação e Descoberta:**
 
- **Esclarecimento Contínuo:** Durante as iterações de desenvolvimento, comunicações diretas com os stakeholders serão realizadas para esclarecer dúvidas pontuais sobre as regras de negócio, garantindo que a equipe não fique travada.
  
**Análise e Consenso:**
 
- **Avaliação de Mudanças:** Caso surjam novos pedidos ou alterações nos requisitos durante o desenvolvimento, será aplicada a técnica de Análise de Impacto para avaliar a viabilidade técnica, o custo e o impacto dessas mudanças no escopo da iteração atual.
  
**Declaração:**
 
- **Especificação Sob Demanda:** Evitando detalhamento antecipado desnecessário, os requisitos selecionados para a iteração atual serão especificados no momento certo, por meio da escrita de critérios de aceite e atualização dos casos de uso, documentando o que os desenvolvedores precisam para construir a funcionalidade.
  
**Representação:**
 
- **Refinamento Visual:** Os protótipos de interface serão atualizados e ajustados sob demanda, refletindo pequenas adaptações de tela ou de fluxo que se mostrarem necessárias ao longo do desenvolvimento do código.
  
**Verificação e Validação:**
 
- **Verificação por Testes Baseados em Requisitos (Verificação):** O software implementado será verificado por meio de técnicas convencionais de teste de software, projetados e executados para averiguar objetivamente se as regras de negócio e os critérios de aceite definidos na especificação dos requisitos foram plenamente atendidos.
- **Demonstrações Incrementais (Validação):** As funcionalidades desenvolvidas serão apresentadas aos stakeholders, permitindo validar se o sistema continua atendendo às necessidades da creche e incorporar o feedback nas próximas iterações.
  
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
 
| Fases do OpenUP | Atividades de ER | Prática | Técnica | Resultado Esperado |
|---|---|---|---|---|
| **Concepção** | Elicitação e Descoberta | Levantamento Inicial de Requisitos | Entrevistas com Stakeholders, Análise Documental | Requisitos de alto nível identificados e contexto do problema de gestão de matrículas compreendido |
| | Análise e Consenso | Priorização Estratégica Inicial | Reunião de validação com a equipe e Stakeholders e aplicação do Método MoSCoW | Escopo principal do MVP acordado com a direção/secretaria da creche |
| | Declaração | Registro da Visão e Escopo | Documento de Visão, Lista de Requisitos (Backlog Inicial) | Objetivos da solução e escopo do sistema documentados de forma clara e concisa |
| | Representação | Modelagem de Funcionalidades Essenciais | Casos de Uso | Funcionalidades críticas mapeadas e representadas de forma concisa |
| | Organização e Atualização | Estruturação de Rastreabilidade | Matriz de Rastreabilidade | Catálogo inicial de requisitos estruturado |
| **Elaboração** | Elicitação e Descoberta | Refinamento de Requisitos Críticos | Entrevistas de Aprofundamento, Cenários de Uso | Requisitos refinados e compreendidos em detalhes para mitigar os riscos arquiteturais |
| | Análise e Consenso | Análise de Impacto e Dependências | Análise de Impacto, Análise de Valor vs. Risco | Conflitos resolvidos e consenso estabelecido sobre a viabilidade técnica da implementação |
| | Declaração | Refinamento da Especificação | Escrita de Casos de Uso Detalhados e Definição de Critérios de Aceite | Requisitos prioritários especificados com o nível exato de detalhe necessário para o desenvolvimento |
| | Representação | Prototipação de Interface e Interação | Casos de Uso Detalhados, Protótipos de Interface | Interações detalhadas e telas validadas visualmente para guiar a equipe de desenvolvimento |
| | Verificação e Validação | Validação da Proposta de Solução | Revisões com Stakeholders, Demonstrações de Protótipos | Confirmação de que as interfaces propostas atendem às expectativas dos usuários |
| | Organização e Atualização | Gerenciamento de Mudanças e Rastreabilidade | Atualização da Matriz de Rastreabilidade | Alterações de escopo e novas dependências registradas, mantendo o controle do projeto |
| **Construção** | Elicitação e Descoberta | Esclarecimento contínuo de requisitos da iteração | Comunicação com stakeholders por meio de aplicativos de mensagem | Dúvidas pontuais de negócio resolvidas para não travar o desenvolvimento |
| | Análise e Consenso | Avaliação de mudanças e novos pedidos | Análise de Impacto | Decisão tomada sobre a viabilidade técnica e impacto de aceitar mudanças durante a iteração |
| | Declaração | Especificação (sob demanda) | Escrita de Critérios de Aceite e atualização de Casos de Uso | Regras de negócio da iteração atual documentadas para os desenvolvedores |
| | Representação | Refinamento visual da iteração | Atualização de Protótipos de Interface | Telas e fluxos ajustados conforme necessidades ou limitações que surgiram durante o desenvolvimento |
| | Verificação e Validação | Verificação da Conformidade da Implementação, Validação por demonstrações | Testes Baseados em Requisitos e Demonstrações Incrementais | Funcionalidades verificadas iterativamente com o cliente e feedback coletado para os próximos passos |
| | Organização e Atualização | Revisão e Manutenção do Backlog | Atualização de Requisitos, Gerenciamento de Mudanças | Backlog de requisitos atualizado, incorporando feedbacks e controlando novas demandas |
| **Transição** | Verificação e Validação | Validação Final do Produto | Testes de Aceitação do Usuário (UAT), Validação com Stakeholders | Sistema validado de forma definitiva pelas usuárias finais no ambiente real da instituição |
| | Organização e Atualização | Gestão de Conhecimento e Evolução | Registro de Melhorias Futuras | Novas demandas e melhorias não críticas registradas e organizadas para futuras versões do sistema |