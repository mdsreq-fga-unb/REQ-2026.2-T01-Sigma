# 5. Engenharia de Requisitos

Nesta seção, detalhamos a aplicação das práticas de Engenharia de Requisitos (ER) ao longo do ciclo de vida do projeto. Conforme definido anteriormente na estratégia do projeto, adotamos o processo OpenUP. Nas subseções a seguir, apresentamos como essas práticas estão distribuídas ao longo das quatro fases desse processo: Concepção, Elaboração, Construção e Transição.

## 5.1 Atividades e Técnicas de ER

### 5.1.1 Concepção

#### Prática: Elicitação e Descoberta
- **Técnicas aplicadas:** Entrevistas e Análise Documental.
- **Como foi aplicado:** Realizamos entrevistas por videochamadas com a diretora, coordenadora e secretárias da Creche Estação Vida para compreender o processo atual de cadastro, armazenamento e consulta. Em paralelo, analisamos as fichas de matrícula físicas utilizadas pela instituição.
- **Resultado esperado:** Requisitos de alto nível identificados e contexto do problema de gestão de matrículas compreendido.
- **Evidências:**
    - [Entrevista de levantamento de requisitos](https://drive.google.com/file/d/1EugRqtDabhgezjH6jpZ7e9RNyV-RaA_2/view)
    - [Modelo de documentos](https://drive.google.com/drive/folders/1R6TWeKyvV99bJH4uQt0hzWzE3_3MuSq_?usp=sharing)
    - [Resultado da Análise Documental](https://drive.google.com/drive/folders/1qECWguOMe9hr9VL2HkD24GLw3UuwnfSp?usp=sharing)

#### Prática: Análise e Consenso
- **Técnicas aplicadas:** Priorização de Requisitos (Método MoSCoW).
- **Como foi aplicado:** Os requisitos identificados foram analisados e priorizados de acordo com a sua importância para a creche, dando preferência às necessidades que apresentam maior impacto na rotina administrativa.
- **Resultado esperado:** Escopo principal do MVP acordado com a direção e a secretaria da creche.
- **Evidências:**
    - [Link para a nossa priorização](https://mdsreq-fga-unb.github.io/REQ-2026.2-T01-Sigma/atividades/atividade_4/)
    - [Link para reunião de validação do escopo do MVP](https://unbbr-my.sharepoint.com/personal/242004706_aluno_unb_br/_layouts/15/stream.aspx?id=%2Fpersonal%2F242004706%5Faluno%5Funb%5Fbr%2FDocuments%2FGrava%C3%A7%C3%B5es%2FReuni%C3%A3o%20com%20Gabriel%20Vieira%20Octacilio%20Pinheiro%2D20261006%5F193801%2DGrava%C3%A7%C3%A3o%20de%20Reuni%C3%A3o%2Emp4&nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJTdHJlYW1XZWJBcHAiLCJyZWZlcnJhbFZpZXciOiJTaGFyZURpYWxvZy1MaW5rIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXcifX0&ga=1&referrer=StreamWebApp%2EWeb&referrerScenario=AddressBarCopied%2Eview%2E38bd09c9%2D2fb7%2D481b%2Db28f%2D1b185dc1604c)
    - [Revisão curta da priorização](https://drive.google.com/drive/folders/1qLuqXaOm1OK2K8ti5_UX2JuZUx2AlEWc?usp=sharing)

#### Prática: Declaração
- **Técnicas aplicadas:** Elaboração do Documento de Visão e da Lista de Requisitos.
- **Como foi aplicado:** Foi elaborado o documento de Visão, apresentando o problema identificado, os objetivos da solução e o escopo inicial do sistema. Adicionalmente, foi criada uma lista inicial contendo as principais funcionalidades que deverão ser contempladas pelo sistema.
- **Resultado esperado:** Objetivos da solução e escopo do sistema documentados de forma clara e concisa.
- **Evidências:**
    - [Link para a nossa lista inicial de requisitos](https://mdsreq-fga-unb.github.io/REQ-2026.2-T01-Sigma/atividades/atividade_3/)

#### Prática: Representação
- **Técnicas aplicadas:** Representação Gráfica de Contexto (Rich Picture, Diagrama de Ishikawa e Mapa de Stakeholders) e Casos de Uso de Alto Nível.
- **Como foi aplicado:** Foram elaborados diagramas gráficos de contexto para representar o cenário atual da creche, os atores envolvidos e as causas do problema central (*Rich Picture*, *Diagrama de Ishikawa* e *Mapa de Stakeholders*), além de casos de uso simplificados para representar as principais funcionalidades identificadas, como cadastrar aluno, consultar ficha e atualizar informações.
- **Resultado esperado:** Contexto do problema, atores e funcionalidades críticas mapeados e representados de forma visual e concisa.
- **Evidências:**
    - [Cenário Atual: Rich Picture e Diagrama de Ishikawa](1_cenarioAtual.md#13-rich-picture)
    - [Link para casos de uso](https://mdsreq-fga-unb.github.io/REQ-2026.2-T01-Sigma/doc-visao/casos-uso/)

#### Prática: Organização e Atualização
- **Técnicas aplicadas:** Estruturação de Rastreabilidade (Catálogo Inicial de Requisitos).
- **Como foi aplicado:** Foi criada a estrutura de rastreabilidade dos requisitos funcionais e não funcionais do sistema. Além disso, os primeiros requisitos estabelecidos foram organizados nesta mesma estrutura.
- **Resultado esperado:** Catálogo inicial de requisitos estruturado.
- **Evidências:**
    - [Link para árvore de rastreabilidade](https://miro.com/app/board/uXjVEbrie7A=/?inviteKey=UkgxV1pUVE1OMGlNZysxSnRHbTBtSTRsbWR3UEI3T252ekJ5Tm1xb0YxOTlTVHpyRm5VdTRRMlFKOEVkc0svZFNGbUtUbkV0TlZqMSszVkVLV2w5YVc4QnZUb2VsQVFzc1FYMEErNjMzOUpqVjcyVGNycXNVNmRuWlNtMFZIK1FNakdSWkpBejJWRjJhRnhhb1UwcS9BPT0hdjE%3D)

---

### 5.1.2 Elaboração

#### Prática: Elicitação e Descoberta
- **Técnica aplicada:** Entrevistas de Aprofundamento.
- **Como foi aplicado:** Foram realizadas novas entrevistas com as secretárias e demais stakeholders para esclarecer dúvidas e obter informações mais detalhadas sobre os requisitos levantados na Concepção.
- **Resultado esperado:** Requisitos refinados e compreendidos em detalhe para mitigar riscos durante a implementação.
- **Evidências:**
    - [Link para reunião](https://drive.google.com/file/d/1EugRqtDabhgezjH6jpZ7e9RNyV-RaA_2/view)

#### Prática: Análise e Consenso
- **Técnicas aplicadas e a aplicar:** Análise de Impacto e Priorização (Realizadas); Prototipação para Alinhamento (Em atualização).
- **Como foi aplicado:** Os requisitos foram analisados para identificar conflitos, ambiguidades e dependências, sendo novamente priorizados com base no valor para a instituição e nos riscos de implementação. Além disso, foram criados protótipos preliminares e apresentados aos stakeholders, como ferramenta de apoio visual para facilitar a compreensão, o debate e a obtenção de consenso sobre a estrutura da solução.
- **Resultado esperado:** Conflitos resolvidos e consenso estabelecido sobre a viabilidade técnica da implementação e fluxos da interface.
- **Evidências:**
    - [Ata da reunião de analise de impacto e priorização](https://mdsreq-fga-unb.github.io/REQ-2026.2-T01-Sigma/reunioes/ata1/#__tabbed_1_2)
    - [Análise de impacto](https://drive.google.com/drive/folders/1k8KviR3GCRpRtQArNYIqqjm4O9Rca81Z?usp=sharing)
    - [Protótipo de Alta Fidelidade](https://www.figma.com/design/99K50wj2mkeuIdAPWrpCBr/Sigma---prot%C3%B3tipo--plano-free-?node-id=6-4&t=SsVQTnArufZAsepm-1)

#### Prática: Declaração
- **Técnicas em aplicação:** Detalhamento Sob Demanda (Casos de Uso Detalhados e Critérios de Aceite).
- **Como foi aplicado:** Os requisitos de maior prioridade estão sendo detalhados progressivamente, aplicando a escrita de casos de uso detalhados e a definição de critérios de aceite, com o objetivo de evitar uma especificação excessiva e antecipada.
- **Resultado esperado:** Requisitos prioritários especificados com o nível exato de detalhe necessário para o desenvolvimento.
- **Evidências:**
    - [Casos de uso detalhado](https://mdsreq-fga-unb.github.io/REQ-2026.2-T01-Sigma/doc-visao/casos-uso/)

#### Prática: Representação
- **Técnicas aplicadas:** Protótipo de Alta Fidelidade (Figma), Diagramas de Fluxo e Árvore de Rastreabilidade (Representação Gráfica Hierárquica).
- **Como foi aplicado:** Foram elaborados **protótipos de alta fidelidade** no Figma e **diagramas de fluxo** para representar visualmente as telas, a navegação e os fluxos de interação dos Casos de Uso, além da representação gráfica hierárquica na **Árvore de Rastreabilidade** conectando Problema, Objetivos Específicos (`OE`), Características do Produto (`CP`) e requisitos.
- **Resultado esperado:** Fluxos de interação, interfaces e relações entre requisitos representados visualmente para alinhamento com stakeholders e equipe técnica.
- **Evidências:**
    - [Protótipo de Alta Fidelidade](https://www.figma.com/design/99K50wj2mkeuIdAPWrpCBr/Sigma---prot%C3%B3tipo--plano-free-?node-id=6-4&t=SsVQTnArufZAsepm-1)
    - [Casos de Uso com protótipos e fluxos](casos-uso/index.md)
    - [Árvore de Rastreabilidade (Seção 8.2)](8_requisitos.md#83-arvore-de-rastreabilidade)


#### Prática: Verificação e Validação
- **Técnicas aplicadas:** Revisões com Stakeholders, Demonstrações, Walkthroughs com a Equipe (pela documentação) e Definição de Critérios de DoR e DoD (a partir de 10/10/2026).
- **Como está sendo aplicado:** Os requisitos refinados e os artefatos de especificação passam por **walkthroughs com a equipe pela documentação** (revisão por pares dos Casos de Uso, regras de negócio e protótipos) para garantir clareza e consistência antes da codificação. A partir da entrega da Unidade 2 (10/10/2026), iniciou-se a implementação dos critérios de **Definition of Ready (DoR)** e **Definition of Done (DoD)** para padronizar a prontidão e a conclusão das entregas. Junto aos usuários, os requisitos e o recorte do MVP foram revisados em sessões de demonstração para obter feedback e confirmar o alinhamento às necessidades da creche.
- **Resultados:** Confirmação de que o MVP proposto atende às expectativas dos usuários e estabelecimento dos critérios iniciais de DoR e DoD.
- **Evidências:**
    - [Link de validação do MVP](https://unbbr-my.sharepoint.com/:v:/g/personal/242004706_aluno_unb_br/IQBXti2dM-CuR44I9bXe8Ka9AedalX9A8_pG9i43LaH3-cA?e=P1HCHE&nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJTdHJlYW1XZWJBcHAiLCJyZWZlcnJhbFZpZXciOiJTaGFyZURpYWxvZy1MaW5rIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXcifX0%3D)
    - [Critérios iniciais de DoR e DoD (v2.0 — 10/10/2026)](../versoes/v2/9_dor_dod.md)
    - [Atas de Reunião e Revisões](../reunioes/ata1.md)

#### Prática: Organização e Atualização
- **Técnicas em aplicação:** Gerenciamento de Mudanças, Atualização de Rastreabilidade, Versionamento e Baselines (Snapshots).
- **Como está sendo aplicado:** A Árvore de Rastreabilidade está sendo mantida em atualização contínua. Conforme os requisitos são refinados, as alterações de escopo, novas dependências e repriorizações são registradas para manter o controle e o histórico do projeto. Paralelamente, a equipe preserva **baselines (snapshots)** por marco de entrega (como `v1.0` e `v2.0`) em repositório separado do escopo vigente, além de manter o **Histórico de Versões** em cada documento com autor, revisor e justificativa das mudanças.
- **Resultado esperado:** Alterações de escopo e novas dependências documentadas, preservando a memória das decisões e mantendo o escopo vigente limpo e coerente.
- **Evidências:**
    - [Árvore de rastreabilidade](https://miro.com/app/board/uXjVEbrie7A=/)
    - [Repositório de Versões Arquivadas (Baselines v1.0, v2.0 e v2.1)](../versoes/index.md)

---

### 5.1.3 Construção

#### Prática: Elicitação e Descoberta
- **Técnicas a serem aplicadas:** Esclarecimento Contínuo.
- **Como será aplicado:** Durante as iterações de desenvolvimento, serão realizadas comunicações diretas com os stakeholders para esclarecer dúvidas pontuais sobre as regras de negócio, garantindo que a equipa não fique bloqueada durante a implementação.
- **Resultado esperado:** Dúvidas pontuais de negócio resolvidas para não travar o desenvolvimento.
- **Evidências:**
    - [Acompanhamento das Iterações e validações](4_estrategias.md#45-acompanhamento-das-iteracoes)
    - [Protótipos e fluxos validados em 04/11](6_cronograma.md#iteracoes)

#### Prática: Análise e Consenso
- **Técnicas em aplicação:** Avaliação de Mudanças (Análise de Impacto).
- **Como está sendo aplicado:** Caso surjam novos pedidos ou alterações nos requisitos durante o desenvolvimento, está sendo aplicada a técnica de Análise de Impacto para avaliar a viabilidade técnica, o custo e o impacto dessas mudanças no escopo da iteração atual.
- **Resultado esperado:** Decisão tomada sobre a viabilidade técnica e o impacto de aceitar mudanças durante a iteração.
- **Evidências:**
    - [Histórico de Versões dos Requisitos](8_requisitos.md#historico-de-versoes)
    - [Critérios do MVP e Priorização](10_backlog.md)

#### Prática: Declaração
- **Técnicas a serem aplicadas:** Especificação Sob Demanda (Critérios de Aceite e atualização de Casos de Uso).
- **Como será aplicado:** Evitando um detalhamento antecipado desnecessário, os requisitos selecionados para a iteração atual serão especificados no momento certo, por meio da escrita de critérios de aceite e atualização dos casos de uso, documentando o que os desenvolvedores precisam para construir a funcionalidade.
- **Resultado esperado:** Regras de negócio da iteração atual documentadas para os desenvolvedores.
- **Evidências:**
    - [Catálogo Unificado de Requisitos](8_requisitos.md)
    - [Painel de Casos de Uso](casos-uso/index.md)

#### Prática: Representação
- **Técnicas em aplicação:** Refinamento Visual de Protótipo de Alta Fidelidade e Atualização de Diagramas de Fluxo.
- **Como está sendo aplicado:** Os protótipos de alta fidelidade no Figma e os diagramas de fluxo associados aos Casos de Uso são ajustados sob demanda, refletindo pequenas adaptações de tela ou de fluxo que se mostrarem necessárias ao longo do desenvolvimento do código e das validações com a cliente.
- **Resultado esperado:** Telas e fluxos ajustados conforme necessidades ou limitações que surgirem durante o desenvolvimento.
- **Evidências:**
    - [Protótipo de Alta Fidelidade](https://www.figma.com/design/99K50wj2mkeuIdAPWrpCBr/Sigma---prot%C3%B3tipo--plano-free-?node-id=6-4&t=SsVQTnArufZAsepm-1)
    - [Casos de Uso com protótipos e fluxos](casos-uso/index.md)

#### Prática: Verificação e Validação
- **Técnicas em aplicação:** Checklist de DoR e DoD (Verificação), Testes Baseados em Requisitos (Verificação), Walkthroughs com a Cliente (pelo sistema) e Demonstrações Incrementais (Validação).
- **Como está sendo aplicado:** Antes de selecionar um Caso de Uso para a iteração, a equipe aplica o checklist de **Definition of Ready (DoR)** para verificar se a especificação, regras de negócio, critérios de aceitação e protótipos estão prontos. Durante a construção, o software implementado é verificado por testes baseados em requisitos e avaliado pelos critérios do **Definition of Done (DoD)** (revisão de código, integração, testes e conformidade com RNFs). Em paralelo, durante a Construção foram realizados **walkthroughs com a cliente diretamente pelo sistema** em sessões de demonstração incremental, validando os fluxos na prática com as secretárias e coletando feedback para os próximos incrementos.
- **Resultado esperado:** Funcionalidades verificadas segundo os critérios de DoR/DoD e validadas em uso real com a cliente, com feedback recolhido para ajustes contínuos.
- **Evidências:**
    - [Critérios de DoR e DoD (v2.1 — PR #39)](9_dor_dod.md)
    - [Modelo de Registro de DoD](registros-dod/modelo.md)
    - [Entregas e PRs integrados no Cronograma](6_cronograma.md#iteracoes)

#### Prática: Organização e Atualização
- **Técnicas em aplicação:** Revisão e Manutenção do Backlog (Atualização de Requisitos e Gerenciamento de Mudanças), Consolidação em Catálogo Unificado, Atualização Contínua da Árvore de Rastreabilidade, Versionamento/Baselines e Rastreamento por Iteração e Pull Requests.
- **Como está sendo aplicado:** Os requisitos são atualizados ao final de cada iteração conforme alterações, refinamentos e feedbacks identificados durante o desenvolvimento, passando por análise de impacto e repriorização. Para evitar declarações dispersas ou duplicadas, o escopo foi consolidado no **Catálogo Unificado de Requisitos** (conectando `OE`, `CP`, `RF`, `RNF`, `RN`, `UC` e status de `MVP` em uma fonte única). A **Árvore de Rastreabilidade** no Miro é atualizada para refletir as ligações vigentes, enquanto versões antigas são movidas para **baselines** (`docs/versoes/`) e cada alteração é registrada no **Histórico de Versões** das páginas e no acompanhamento das iterações com vínculo direto aos **Pull Requests e Issues** do GitHub.
- **Resultado esperado:** Escopo vigente unificado, navegável e rastreável ao código entregue, incorporando feedbacks e preservando memória suficiente das decisões sem redundâncias.
- **Evidências:**
    - [Catálogo Unificado de Requisitos (PR #50 e PR #63)](8_requisitos.md)
    - [Árvore de Rastreabilidade no Miro](https://miro.com/app/board/uXjVEbrie7A=/) (documentada na [Seção 8.2](8_requisitos.md#83-arvore-de-rastreabilidade))
    - [Critérios do MVP integrados ao Catálogo](10_backlog.md)
    - [Repositório de Versões Arquivadas (Baselines)](../versoes/index.md)
    - [Acompanhamento das Iterações e PRs](4_estrategias.md#45-acompanhamento-das-iteracoes) e [Ciclo das Iterações](6_cronograma.md#ciclo-de-cada-iteracao)

---

### 5.1.4 Transição

#### Prática: Verificação e Validação
- **Técnicas a serem aplicadas:** Testes de Aceitação do Usuário (UAT), Aplicação final de DoD (Homologação), Walkthroughs com a Cliente (pelo sistema) e Validação com Stakeholders.
- **Como será aplicado:** Serão realizados testes de aceitação e **walkthroughs com a cliente pelo sistema** (com as principais usuárias, as secretárias) para verificar se as funcionalidades implementadas atendem aos requisitos e às necessidades reais da rotina administrativa da creche. A homologação seguirá os critérios de registro do **DoD**, avaliando a solução junto à direção, coordenação e secretárias antes da sua utilização definitiva para identificar e corrigir ajustes finais.
- **Resultado esperado:** Sistema validado de forma definitiva pelas usuárias finais no ambiente real da instituição.
- **Evidências:**
    - *Execução ainda não iniciada (prevista para a Iteração 8 — 24/11 a 03/12, quando serão registrados o Relatório de UAT e o Termo de Homologação e Aceite Final).*

#### Prática: Organização e Atualização
- **Técnicas a serem aplicadas:** Gestão de Conhecimento e Registro de Melhorias Futuras.
- **Como será aplicado:** As necessidades, novas ideias ou funcionalidades que não forem essenciais para o MVP (versão atual) serão formalmente registradas e organizadas no backlog para possíveis iterações e evoluções futuras.
- **Resultado esperado:** Novas demandas e melhorias não críticas registradas e organizadas para futuras versões do sistema.
- **Evidências:**
    - *Execução ainda não iniciada (prevista para a Iteração 9 — 04/12 a 10/12; itens fora do MVP já mapeados no [Catálogo Unificado](8_requisitos.md)).*


---

## Histórico de Versões

| Versão | Data | Descrição da Alteração | Autor(es) | Revisor(es) |
|---|---|---|---|---|
| [1.0](../versoes/v1/5_requisitos.md) | 07/09/2026 | Criação inicial do processo de Engenharia de Requisitos (Unidade 1). | Gabriel Octacilio | Equipe SIGMA |
| [2.0](../versoes/v2/5_requisitos.md) | 12/10/2026 | Reestruturação conforme novo formato, links de evidências e casos de uso (Unidade 2). | Pedro Luca | Equipe SIGMA |
| [2.1](../versoes/v2/5_requisitos.md) | 07/11/2026 | Atualização da seção de Processo de ER com base na Issue #24. | Jorge Vásquez | Gabriel Octacilio |
| 2.2 | 16/11/2026 | Substituição dos placeholders `[Inserir Link]` pelas evidências da Construção e indicação de execução futura na Transição (Issue #34). | Pedro Luca | Equipe SIGMA |
| 2.3 | 16/11/2026 | Inclusão das técnicas de Organização e Atualização aplicadas na Elaboração e Construção (Catálogo Unificado, Baselines/Versionamento, Histórico de Versões e rastreamento por Iterações/PRs). | Pedro Luca | Equipe SIGMA |
| 2.4 | 16/11/2026 | Inclusão de DoR/DoD (a partir da Elaboração/Unidade 2) e de walkthroughs com a equipe pela documentação (Elaboração) e com a cliente pelo sistema (Construção e Transição) nas práticas de Verificação e Validação. | Pedro Luca | Equipe SIGMA |
| **2.5 (Atual)** | 16/11/2026 | Inclusão das técnicas de Representação nas fases de Concepção, Elaboração e Construção (representações gráficas de contexto, diagramas de fluxo e protótipo de alta fidelidade). | Pedro Luca | Equipe SIGMA |
