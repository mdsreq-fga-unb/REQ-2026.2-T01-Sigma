# 9. Definition of Ready (DoR) e Definition of Done (DoD)

Para apoiar a condução iterativa e incremental do projeto SIGMA, foram definidos critérios de Definition of Ready (DoR) e Definition of Done (DoD). Esses acordos tornam explícito quando um item está preparado para ser selecionado para desenvolvimento e quando uma entrega pode ser considerada concluída.

Cada acordo é acompanhado de uma **forma de aplicação**: critérios verificáveis, regras de decisão e um registro por item (resultado, responsável, evidência e pendências). Os registros são mantidos nesta página e atualizados a cada iteração.

---

## 9.1 Definition of Ready (DoR)

O DoR estabelece as condições mínimas para que um Caso de Uso (UC), ou apenas um conjunto de seus fluxos, seja selecionado para a iteração. A unidade de avaliação é o **item selecionado**: um UC inteiro ou os fluxos específicos de um UC que entrarão na iteração.

### 9.1.1 Critérios

Um item está **pronto** quando todos os critérios abaixo, aplicáveis a ele, são atendidos. Um critério considerado não aplicável deve ter a justificativa registrada.

| # | Critério | Como é verificado |
|---|----------|-------------------|
| 1 | **Caso de Uso especificado** | A especificação do UC contém atores, pré-condições, pós-condições, fluxo principal e fluxos alternativos e de exceção dos fluxos selecionados, sem campos pendentes ("a definir"). |
| 2 | **Cadeia de rastreabilidade completa** | Na Matriz de Rastreabilidade, o item possui a cadeia aplicável completa: objetivo específico → característica de produto → requisito(s) funcional(is) → RNF(s) aplicável(is) → UC. Um vínculo isolado (apenas objetivo, apenas característica ou apenas requisito) não é suficiente. Elo sem aplicação ao item é marcado como "não se aplica", com justificativa. |
| 3 | **Regras de negócio consistentes** | As regras de negócio dos fluxos selecionados estão listadas por identificador e não há contradição entre RFs, regras de negócio e UC para esses fluxos. |
| 4 | **Nenhuma dúvida impeditiva em aberto** | Todas as dúvidas do item estão classificadas conforme a seção 9.1.2, e nenhuma dúvida impeditiva permanece aberta. |
| 5 | **Critérios de aceitação por fluxo** | Cada fluxo selecionado tem ao menos um cenário de aceitação verificável (condição inicial, ação e resultado esperado). |
| 6 | **Escopo definido e compatível com a iteração** | Os fluxos que entram e os que ficam para depois estão identificados (seção 9.1.3), e a estimativa da equipe para os fluxos selecionados cabe na capacidade da iteração. |
| 7 | **Dependências e riscos tratados** | As dependências técnicas (outros UCs, RFs, integrações, dados) e os riscos do item estão listados, e cada dependência está resolvida ou será entregue antes ou na mesma iteração. |
| 8 | **Protótipo disponível** | Se o item tiver impacto de interface, existe protótipo ou wireframe correspondente aos fluxos selecionados. |
| 9 | **Validação com o cliente** | O cliente (creche) ou seu representante validou o entendimento dos fluxos selecionados, com data e forma de registro (ata, mensagem ou reunião). |

### 9.1.2 Classificação de dúvidas

A expressão "compreendido" não é avaliada de forma absoluta. O que se verifica é se restam dúvidas que impedem o início.

| Tipo | O que caracteriza | Tratamento |
|------|-------------------|------------|
| **Impeditiva** | A resposta pode alterar regra de negócio, dado armazenado, fluxo de decisão, permissão de acesso, critério de aceitação, ou há contradição entre artefatos (RF, UC, regras). | Deve ser resolvida **antes** da seleção. Enquanto aberta, o item é **não pronto**. |
| **Não impeditiva** | A resposta não altera regras, dados, permissões nem critérios de aceitação (por exemplo: texto de mensagens, rótulos, ordem de campos, ajustes visuais). | Pode ser esclarecida durante o desenvolvimento. Deve ser registrada com responsável e ser resolvida antes da demonstração do item. |

### 9.1.3 Seleção de fluxos

Quando um UC agrupa várias funcionalidades, ele não é avaliado como bloco único. Antes de entrar na iteração, o UC é decomposto em fluxos, e o registro indica:

- **fluxos selecionados**, que são avaliados contra os critérios 1 a 9;
- **fluxos adiados**, com a iteração prevista, ou "a definir" quando ainda não houver previsão.

Um UC pode ser marcado como **pronto parcial**: pronto apenas para os fluxos selecionados.

### 9.1.4 Regra de decisão

A verificação é feita no planejamento de cada iteração, e o resultado é registrado na tabela 9.1.5.

- **Pronto:** todos os critérios aplicáveis atendidos.
- **Pronto parcial:** critérios atendidos somente para os fluxos listados como selecionados.
- **Não pronto:** qualquer critério não atendido ou dúvida impeditiva aberta. O item não entra na iteração até que as pendências sejam resolvidas.

### 9.1.5 Registro de aplicação do DoR

> Registro da preparação da primeira entrega (Construção prevista para 20/10). Campos entre colchetes devem ser preenchidos pela equipe com os dados reais.

| Item (UC / fluxos selecionados) | Fluxos adiados | Critérios não atendidos | Resultado | Responsável | Data | Evidência | Pendências |
|---|---|---|---|---|---|---|---|
| UC04 — [fluxos selecionados] | [fluxos adiados] | [ex.: 6] | [Pronto / Pronto parcial / Não pronto] | [nome] | [data] | [link para UC, matriz ou ata] | [descrição] |
| UC05 — [fluxos selecionados] | [fluxos adiados] | 3, 4 | Não pronto | [nome] | [data] | [link] | Contradição entre RF15 e UC05 (dúvida impeditiva) a ser resolvida e registrada. |
| UC06 — [fluxos selecionados] | [fluxos adiados] | [ex.: 6] | [Pronto / Pronto parcial / Não pronto] | [nome] | [data] | [link] | [descrição] |
| Ativação e alocação de matrículas | [a definir] | 4 | Não pronto | [nome] | [data] | [link] | Dúvidas sobre as regras de ativação e alocação (impeditivas) em aberto. |
| [demais UCs da iteração] | | | | | | | |

---

## 9.2 Definition of Done (DoD)

O DoD estabelece as condições para que uma funcionalidade seja considerada concluída. No SIGMA, concluir não significa apenas implementar: o DoD distingue **três níveis**, e cada um tem registro próprio. Assim, uma entrega nunca é apresentada como aceita pela creche só por estar tecnicamente pronta.

### 9.2.1 Níveis de conclusão

| Nível | Status | Quem atesta | Condição |
|-------|--------|-------------|----------|
| 1 | **Concluído tecnicamente** | Equipe | Critérios técnicos da seção 9.2.2 atendidos e evidenciados. |
| 2 | **Demonstrado** | Equipe, perante cliente/representante e/ou professor | Funcionalidade já concluída tecnicamente é apresentada em ambiente integrado, executando os cenários de aceitação, com registro da demonstração. |
| 3 | **Aceito pela creche** | Cliente (creche) ou representante | Cliente homologa os fluxos demonstrados, com registro (ata, mensagem ou formulário). |

Regras:

- Os níveis são sequenciais. Não se registra "Demonstrado" sem "Concluído tecnicamente", nem "Aceito" sem "Demonstrado".
- **Quando o aceite da creche é exigido:** itens que alteram fluxos usados pela creche, regras de negócio, matrículas, documentos, histórico ou controle de acesso. Para itens internos (refatoração, configuração, infraestrutura), basta o nível 1, com a justificativa "não requer aceite externo" registrada.
- Enquanto o nível 3 não estiver registrado, a documentação e as apresentações devem indicar a funcionalidade como "concluída tecnicamente" ou "demonstrada", nunca como aprovada pela creche.

### 9.2.2 Critérios de conclusão técnica (nível 1)

| # | Critério | Como é verificado |
|---|----------|-------------------|
| 1 | **Implementação conforme especificação** | Os fluxos entregues (principal, alternativos e de exceção selecionados no DoR) e as regras de negócio estão implementados como no UC. |
| 2 | **Critérios de aceitação verificados** | Todos os cenários de aceitação dos fluxos entregues foram executados, com resultado registrado. |
| 3 | **Testes exigidos executados** | Os testes exigidos para o tipo de entrega (matriz da seção 9.2.3) foram executados e passaram. O registro lista quais testes foram exigidos. |
| 4 | **Revisão de código** | Seção 9.2.4. |
| 5 | **Integração sem regressão** | O código foi integrado à base principal e os testes das funcionalidades já concluídas continuam passando. |
| 6 | **RNFs verificados** | Cada RNF associado ao item (conforme a Matriz de Rastreabilidade) tem método de verificação e resultado registrados. |
| 7 | **Interface conforme protótipo** | Quando houver impacto de interface, os fluxos foram conferidos com o protótipo aprovado, quanto à clareza das informações e à facilidade de uso. |
| 8 | **Documentação atualizada** | Estado do requisito, Matriz de Rastreabilidade e evidências de testes e revisão estão atualizados. |
| 9 | **Escopo preservado** | Não há funcionalidade fora do escopo aprovado. Mudanças pedidas durante o desenvolvimento foram registradas e avaliadas antes de incorporadas. |
| 10 | **Sem pendências bloqueantes** | Seção 9.2.5. |

### 9.2.3 Verificações exigidas por tipo de entrega

| Tipo de entrega | Verificações mínimas exigidas |
|---|---|
| Funcionalidade com fluxo de UC e regra de negócio | Teste funcional de cada cenário de aceitação; teste unitário das regras de negócio; teste de integração se envolver banco de dados ou outro módulo. |
| Funcionalidade que grava ou altera **matrículas, histórico ou documentos** | Os testes acima, mais: verificação de que o histórico não é perdido nem sobrescrito, de que os documentos permanecem íntegros e vinculados ao registro correto, e teste de regressão das funcionalidades relacionadas. |
| Funcionalidade com **controle de acesso** | Teste de acesso por perfil, nos dois sentidos: acesso permitido ao perfil autorizado e negado aos demais. |
| Funcionalidade com **interface** | Conferência com o protótipo e checklist de usabilidade. |
| Item com **RNF associado** | Verificação específica de cada RNF (segurança, desempenho, usabilidade, integridade, entre outros), com o método definido no registro. |

### 9.2.4 Revisão de código

- Toda entrega passa por revisão antes de ser integrada à base principal.
- O **revisor deve ser diferente do autor**. São exigidos [1] revisor(es) da equipe.
- A revisão e seu resultado (aprovado ou com ajustes) são registrados no **Pull Request** do repositório, que é a evidência referenciada no checklist.
- O código deve seguir os padrões técnicos da equipe: [indicar o documento ou configuração, por exemplo guia de estilo ou linter].

### 9.2.5 Tratamento de pendências

Toda pendência é registrada (por exemplo, como Issue do repositório) com descrição, impacto, prioridade e responsável.

| Classificação | Critério | Efeito sobre a conclusão |
|---|---|---|
| **Bloqueante** | Defeito ou pendência que: (a) descumpre critério de aceitação ou requisito obrigatório; (b) afeta o **histórico** (perda, sobrescrita ou alteração indevida); (c) compromete a **integridade dos documentos** (perda, corrupção, versão incorreta ou vínculo com aluno ou matrícula errados); (d) compromete o **acesso aos dados** (exposição indevida, bloqueio indevido ou permissão incorreta); (e) corrompe dados de matrícula; ou (f) causa regressão em funcionalidade já concluída. | **Impede** a conclusão técnica do item. |
| **Não bloqueante** | Demais defeitos e melhorias que não se enquadram nos critérios acima (por exemplo, ajustes visuais ou de texto). | Não impede a conclusão. Fica documentada, com impacto e prioridade, e encaminhada para tratamento posterior. |

### 9.2.6 Registro de aplicação do DoD (checklist por item)

Cada item concluído é acompanhado de um checklist neste formato, mantido junto ao Pull Request ou nesta página:

**Item:** [UC / fluxos entregues] **Versão:** [tag, commit ou Pull Request] **Data:** [data] **Responsável:** [nome]

| Verificação | Exigida? | Resultado | Evidência |
|---|---|---|---|
| Cenários de aceitação dos fluxos entregues | Sim | [Passou / Falhou] | [link para relatório ou execução] |
| Testes unitários | [Sim / Não — motivo] | [resultado] | [link] |
| Testes de integração | [Sim / Não — motivo] | [resultado] | [link] |
| Verificação de histórico, documentos e acesso | [Sim / Não — motivo] | [resultado] | [link] |
| RNF [ID] — [método] | [Sim / Não — motivo] | [resultado] | [link] |
| Conformidade com protótipo | [Sim / Não — motivo] | [resultado] | [link] |
| Revisão de código (revisor ≠ autor) | Sim | [Aprovado / Ajustes] | [link do Pull Request] |
| Documentação e Matriz de Rastreabilidade atualizadas | Sim | [Sim / Não] | [link] |

| Nível | Status | Data | Evidência |
|---|---|---|---|
| 1. Concluído tecnicamente | [Sim / Não] | [data] | [link] |
| 2. Demonstrado | [Sim / Não / Pendente] | [data] | [link da ata ou gravação] |
| 3. Aceito pela creche | [Sim / Não / Pendente / Não se aplica] | [data] | [link do registro de aceite] |

**Pendências abertas:** [Issue, classificação (bloqueante ou não), impacto, prioridade]
