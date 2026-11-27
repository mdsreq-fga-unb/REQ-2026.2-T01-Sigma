# Histórico de Versões dos Artefatos

Esta página centraliza o acesso às versões anteriores dos documentos do projeto SIGMA, permitindo acompanhar a evolução e o amadurecimento dos artefatos ao longo das unidades e iterações sem poluir a barra de navegação principal.

## Versão 3.0 — Correções da revisão do DoD e do acompanhamento das iterações (27/11/2026)

Snapshots anteriores às correções (Issue #122: uso de "concluída" no acompanhamento das iterações):

- [4. Estratégias de Engenharia de Software (v3.0)](v3/4_estrategias.md)
- [6. Cronograma e Entregas (v3.0)](v3/6_cronograma.md)
- [9. DoR e DoD (v2.1)](v2_1/9_dor_dod.md)

### Registro de alterações da versão 3.0

| # | O que mudou | Por que mudou | Onde mudou |
|---|---|---|---|
| 1 | Criada a definição das situações usadas no acompanhamento (estrutura criada, interface iniciada, implementada, integrada e verificada, tecnicamente concluída, aguardando homologação, homologada) e as regras de uso da palavra "concluída" | O acompanhamento usava "concluída" para entregas em que as evidências descreviam só parte da funcionalidade | [9. DoR e DoD](../doc-visao/9_dor_dod.md#situacoes-utilizadas-no-acompanhamento-das-iteracoes) |
| 2 | 4.5, Iteração 4: "Concluída" passou a "Parcial": controle de acesso implementado; cadastro de cards com estrutura criada e interface iniciada | Os PRs de migração, autenticação e telas não demonstram o cadastro de cards integrado | [4.5, Iteração 4](../doc-visao/4_estrategias.md#45-acompanhamento-das-iteracoes) |
| 3 | 4.5, Iteração 5: "Concluída" passou a "Parcial: estrutura criada e interface iniciada"; histórico de edições e integração não demonstrados; pendência vinculada às issues de 23/11 e 24/11 | Tabelas e telas não equivalem a edição e histórico integrados; o cronograma prevê as fichas e o histórico na Iteração 8 | [4.5, Iteração 5](../doc-visao/4_estrategias.md#45-acompanhamento-das-iteracoes) |
| 4 | 4.5, Iteração 6: "Concluída" passou a "Parcial: estrutura criada e infraestrutura de integração"; anexar, substituir e baixar (UC05) ainda não implementado | Tabelas e integração via Docker são avanços técnicos, e não demonstram o UC05 | [4.5, Iteração 6](../doc-visao/4_estrategias.md#45-acompanhamento-das-iteracoes) |
| 5 | 4.5, Iteração 7: "Em andamento" passou a "Parcial (período encerrado em 19/11)", com o nível de cada entrega; nova linha da Iteração 8 | O período da Iteração 7 já terminou e a Iteração 8 não constava no acompanhamento | [4.5, Iterações 7 e 8](../doc-visao/4_estrategias.md#45-acompanhamento-das-iteracoes) |
| 6 | 4.5: nova tabela "Pendências identificadas", com classificação proposta entre impeditiva e não impeditiva | Pendências impeditivas não devem ficar ocultas por uma marcação genérica de conclusão | [4.5, Pendências](../doc-visao/4_estrategias.md#pendencias-identificadas) |
| 7 | Cronograma: situação das Iterações 5 a 8 ajustada ("Concluída no escopo planejado", "entrega parcial", "prazo encerrado") e legenda da coluna | Alinhar o cronograma ao acompanhamento e ao DoD | [6. Cronograma](../doc-visao/6_cronograma.md) |
| 8 | Registros de DoD: nova seção relacionando UC01, UC02 e UC06 aos demais critérios do DoD; observação sobre o PDF do UC01 e sobre a homologação | Os PDFs são validação funcional e não substituem testes, integração, revisão e RNFs | [12. Registros de DoD](../doc-visao/registros-dod/index.md#relacao-com-os-demais-criterios-do-dod) |

## Versão 2.3 — Correções das revisões da Visão e dos requisitos do MVP (26/11/2026)

Snapshots anteriores às correções das duas revisões (Issue 1: Visão de Produto e Projeto; Issue 2: requisitos centrais do MVP):

- [2. Solução Proposta (v2.2)](v2_2/2_solucao.md)
- [4. Estratégias de Engenharia de Software (v2.3)](v2_3/4_estrategias.md)
- [6. Cronograma e Entregas (v2.3)](v2_3/6_cronograma.md)
- [10. Backlog e MVP (v2.2)](v2_2/10_backlog.md)

### Registro de alterações da versão 2.3

| # | Issue | O que mudou | Por que mudou | Onde mudou |
|---|---|---|---|---|
| 1 | 1 | "Eliminar definitivamente" a perda e deterioração das fichas virou "redução do risco", com as condições necessárias (backup, restauração, controle de acesso, fichas cadastradas) | O armazenamento digital também tem riscos (falhas, perda de acesso, backup e recuperação) | `2_solucao.md` (2.7.1); `10_backlog.md` (Nível 4) |
| 2 | 1 | "Maior segurança e confiabilidade" virou "informações mais protegidas, por meio das medidas de 2.1" | Evitar afirmar mais do que está demonstrado | `2_solucao.md` (2.7.2) |
| 3 | 1 | Removido "dispensando o uso de papéis físicos"; criada a subseção "Transição gradual e uso do papel"; risco "Migração" passou a registrar a decisão | A Visão previa digitalização gradual, mas a página do MVP dizia que o papel era dispensado | `2_solucao.md` (2.1, 2.6); `10_backlog.md` (10.3); `6_cronograma.md` (Iteração 9); `4_estrategias.md` (risco Migração) |
| 4 | 1 | "Deleção" removida do CP5; exclusão de documentos declarada fora do escopo do MVP; Iteração 8 sem "exclusão" | UC05 e catálogo só têm anexar, substituir e baixar | `2_solucao.md` (CP5); `6_cronograma.md`; `10_backlog.md`; `uc05.md` |
| 5 | 1 | Segurança apresentada como conjunto de medidas; novas linhas de controle de acesso, sessão e rastreabilidade | A autenticação isolada não demonstra que a privacidade e a proteção estejam atendidas | `2_solucao.md` (2.1); `4_estrategias.md` (4.4); `10_backlog.md` |
| 6 | 1 | Perfil Administrador alinhado ao UC02 (cadastra, inativa e reativa contas) | A Solução dizia que ele só cadastrava secretárias | `2_solucao.md` (2.1, CP4) |
| 7 | 1 | "Iteração 8 (Transição)" corrigida para "Construção"; hospedagem em nuvem registrada como decisão de 06/10 | Inconsistência com o cronograma e a ata | `2_solucao.md` (2.4, 2.6) |
| 8 | 1 | Afirmação sobre contratação de integrante para manutenção trocada por "responsável ainda não definido" | Sem evidência nas atas e demais páginas | `2_solucao.md` (2.6) |
| 9 | 2 | UC04: FP01 reestruturado conforme o protótipo (card criado só com dados pessoais e etapa, sem turma; fichas preenchidas no card; matrícula nasce ainda não ativa); novo bloco com a decisão sobre a sequência | O fluxo escrito pedia turma e todas as fichas no cadastro, o que contradizia o protótipo e gerava dependência circular com o UC07 | `uc04.md` (FP01 e seção 4) |
| 10 | 2 | UC04: FA01 aceita matrícula não inativa; RN02 diz que o vínculo é feito pelo UC07; DoR e pendências atualizados (nome do estado anterior à ativação, protótipo "Card do aluno") | As fichas passam a ser editadas antes da ativação | `uc04.md` (FA01, RN02, DoR); `javascripts/modal.js` (RN02) |
| 11 | 2 | UC07: pré-condição 4, objetivo e passo 7 exigem matrícula não inativa; novo passo 11 (ativa a matrícula quando as fichas já estão completas); novo FE06 (matrícula inativa); DoR atualizado | O UC07 exigia matrícula ativa, que só existe depois do vínculo com turma | `uc07.md` |
| 12 | 2 | UC05: DoR corrigido (download já detalhado em FA02/FE02), iteração ajustada para 8 - Construção e pendência reduzida ao arquivo anterior | O DoR apontava pendente um fluxo que já existia | `uc05.md` (seção 10) |
| 13 | 2 | UC05: novo FE03 (falha no upload ou na substituição mantém o documento anterior); FA01 reorganizado | A issue pede o comportamento diante de falha | `uc05.md` (FA01, FE03) |
| 14 | 2 | UC05: tratamento do arquivo anterior marcado como decisão pendente com a creche; RF15 deixou de dizer "removendo o arquivo anterior" | Não presumir descarte nem retenção | `uc05.md` (FA01, DoR); `javascripts/modal.js` (RF15) |
| 15 | 2 | UC01: meta de 2 s, timeout e indisponibilidade distinguidos (tabela na seção 6, FA02 novo, FE03 reescrito, diagrama, RNF05 e DoR) | Resposta lenta não significa falha de conexão | `uc01.md`; `javascripts/modal.js` (RNF05) |
| 16 | 2 | Linha "Controle de acesso" da 4.4 passou a citar RN16 e RN18 com a descrição correta | Correção de referência imprecisa feita por mim na primeira rodada | `4_estrategias.md` (4.4) |

As cópias das versões anteriores das páginas alteradas (`2_solucao.md`, `10_backlog.md`, `4_estrategias.md` e `6_cronograma.md`) estão arquivadas nas pastas `v2_2` e `v2_3`, listadas acima.

### Registro de alterações nos casos de uso (versão 2.3) — detalhado por fluxo

Cada linha corresponde a um passo, fluxo, nó de diagrama ou item do DoR. Fluxos e passos não listados não foram alterados (UC01: FP01 passos 1 a 5 e 7, FA01, FE01, FE02, FE04, FE05; UC04: passos 1 e 2, FA02 a FA05, FE01 a FE04; UC05: FP01 exceto o passo 8, FA02, FE01, FE02; UC07: FP01 passos 1 a 6 e 8 a 10, FA01, FA02 e FE01 a FE05).

#### UC01 — Gerenciar Autenticar

| Fluxo ou seção | Antes | Depois | Por que mudou | Onde mudou |
|---|---|---|---|---|
| FP01, passo 6 | "O sistema autoriza o acesso em um tempo inferior a 2 segundos." | "O sistema autoriza o acesso. A meta é que isso ocorra em menos de 2 segundos sob conexão de rede estável. (RNF05, FA02)" | Os 2 s eram condição do fluxo; passam a ser meta de desempenho | [UC01 — 4. Fluxo Principal](../doc-visao/casos-uso/uc01.md#4-fluxo-principal) |
| FA02, passo 1 (novo) | Não existia. | O ator envia as credenciais e o sistema responde em mais de 2 s, mas antes do tempo limite de espera (timeout) | Dar tratamento próprio à resposta lenta | [UC01 — 5. Fluxos Alternativos](../doc-visao/casos-uso/uc01.md#5-fluxos-alternativos) |
| FA02, passo 2 (novo) | Não existia. | A tentativa segue em andamento e o fluxo continua a partir do passo 5 do FP01, ou pelo fluxo de exceção do resultado (FE01, FE04 ou FE05) | Login não é abortado por lentidão | [UC01 — 5. Fluxos Alternativos](../doc-visao/casos-uso/uc01.md#5-fluxos-alternativos) |
| FA02, passo 3 (novo) | Não existia. | A lentidão não é falha de conexão: é desvio da meta (RNF05), não indisponibilidade | Resposta lenta não significa conexão falha | [UC01 — 5. Fluxos Alternativos](../doc-visao/casos-uso/uc01.md#5-fluxos-alternativos) |
| Seção 6, introdução e tabela (novas) | Não existia. | Tabela com 3 conceitos: meta de desempenho (2 s sob conexão estável, verificada nos testes; se excedida, o login continua, FA02); timeout (tempo máximo de espera, maior que 2 s, valor ainda a definir; ao atingir, interrompe, FE03); indisponibilidade (sem comunicação com servidor ou banco; interrompe com erro, FE03) | Separar limite esperado, timeout e indisponibilidade | [UC01 — 6. Fluxos de Exceção](../doc-visao/casos-uso/uc01.md#6-fluxos-de-excecao) |
| FE03, título | "Falha de Conexão" | "Indisponibilidade do Servidor ou Timeout" | Nome passa a refletir os dois gatilhos reais | [UC01 — 6. Fluxos de Exceção](../doc-visao/casos-uso/uc01.md#6-fluxos-de-excecao) |
| FE03, passo 2 | "... há indisponibilidade de comunicação com o servidor/banco de dados." | Acrescenta "... ou a resposta não chega dentro do tempo limite de espera (timeout)." | Incluir o timeout como gatilho | [UC01 — 6. Fluxos de Exceção](../doc-visao/casos-uso/uc01.md#6-fluxos-de-excecao) |
| FE03, passo 3 | "O tempo de resposta ultrapassa o limite de 2 segundos. (RNF05)" | "O sistema interrompe a tentativa e não cria a sessão." (o passo de 2 s foi removido) | Ultrapassar 2 s deixou de ser falha | [UC01 — 6. Fluxos de Exceção](../doc-visao/casos-uso/uc01.md#6-fluxos-de-excecao) |
| FE03, passo 4 | Mensagem "Não foi possível conectar ao servidor. Tente novamente mais tarde." | Mesma mensagem (a numeração e a redação do passo foram reorganizadas) | Sem mudança de conteúdo | [UC01 — 6. Fluxos de Exceção](../doc-visao/casos-uso/uc01.md#6-fluxos-de-excecao) |
| Diagrama: decisão inicial | "Servidor respondeu em até 2 s? (RNF05)" | "Servidor respondeu antes do timeout?" | A decisão passou a ser sobre timeout, não sobre 2 s | [UC01 — 6.1 Diagrama de Atividades](../doc-visao/casos-uso/uc01.md#61-diagrama-de-atividades) |
| Diagrama: nó do FE03 | "FE03 - 'Não foi possível conectar ao servidor...'" | "FE03 - Indisponibilidade ou timeout:" mais a mesma mensagem | Acompanhar o novo título do FE03 | [UC01 — 6.1 Diagrama de Atividades](../doc-visao/casos-uso/uc01.md#61-diagrama-de-atividades) |
| Diagrama: autorização | "Autorizar em menos de 2 s e redirecionar ao dashboard (RF06, RNF05)" | Nova decisão "Resposta em até 2 s? (meta RNF05)": sim leva a "Autorizar e redirecionar ao dashboard (RF06)"; não leva ao novo nó FA02, que volta ao acesso autorizado. FA02 entrou nas classes de cor | Mostrar a meta como verificação, não como falha | [UC01 — 6.1 Diagrama de Atividades](../doc-visao/casos-uso/uc01.md#61-diagrama-de-atividades) |
| Diagrama: texto de apoio | "... o fluxo alternativo (FA01) e os fluxos de exceção (FE01 a FE05)..." | "... os fluxos alternativos (FA01 e FA02) e os fluxos de exceção (FE01 a FE05)..." | Incluir o FA02 | [UC01 — 6.1 Diagrama de Atividades](../doc-visao/casos-uso/uc01.md#61-diagrama-de-atividades) |
| RNF05 (tabela de requisitos) | "Define o tempo máximo de 2 segundos para o sistema processar a entrada após o clique." | "Define a meta de desempenho de 2 segundos ... sob conexão estável. Não define o timeout nem caracteriza falha de conexão." | Evitar ler 2 s como falha | [UC01 — 8. Requisitos Relacionados](../doc-visao/casos-uso/uc01.md#8-requisitos-relacionados) |
| DoR: fluxos e DOR01 | Fluxos selecionados: FP01, FA01, FE01 a FE05. DOR01 citava FP01, FA01 e FE01–FE05 | Fluxos selecionados incluem FA02; DOR01 cita FP01, FA01, FA02 e FE01–FE05 | Refletir o novo fluxo | [UC01 — 10. Aplicação do DoR](../doc-visao/casos-uso/uc01.md#10-aplicacao-do-dor) |
| DoR: pontos de atenção | Um ponto: confirmar testes (login válido, credenciais inválidas, sem autenticação, expiração de sessão, conta inativa) | Novo ponto: definir e registrar o valor do timeout (maior que 2 s). O ponto de testes passou a incluir resposta acima de 2 s (FA02) e indisponibilidade ou timeout (FE03) | Cobrir os casos novos e deixar a pendência clara | [UC01 — 10. Aplicação do DoR](../doc-visao/casos-uso/uc01.md#10-aplicacao-do-dor) |
| DoR: pendência não impeditiva | "Explicitar RN16 (15 min) ... e conferir o vínculo de RNF03 na seção 8." | Mesma pendência, mais "registrar o valor do timeout do login" | Registrar o que falta definir | [UC01 — 10. Aplicação do DoR](../doc-visao/casos-uso/uc01.md#10-aplicacao-do-dor) |

#### UC04 — Gerenciar Fichas de Matrícula

| Fluxo ou seção | Antes | Depois | Por que mudou | Onde mudou |
|---|---|---|---|---|
| FP01, passo 3 | "O ator preenche os dados cadastrais básicos do aluno e seleciona a turma e etapa de ensino ativa correspondente (RN02, UC07)." | "... preenche os dados cadastrais básicos do aluno e a etapa de ensino. A turma não é escolhida neste momento: o aluno é vinculado a uma turma depois, pelo UC07. (RN02)" | O protótipo "Novo aluno" cria o card sem turma | [UC04 — 4. Fluxo Principal](../doc-visao/casos-uso/uc04.md#4-fluxo-principal) |
| FP01, passo 4 | "O sistema avança para as abas ou seções de preenchimento das fichas obrigatórias." | "O ator aciona a opção de criar o card e confirma a operação. (RN15, FA05)" | O card é criado antes das fichas | [UC04 — 4. Fluxo Principal](../doc-visao/casos-uso/uc04.md#4-fluxo-principal) |
| FP01, passo 5 | "O ator preenche todas as informações necessárias nas fichas." | "O sistema valida os campos obrigatórios do cadastro e verifica duplicidade. (RN06, RN07, FE01, FE02)" | A validação passa a ser do cadastro, não das 5 fichas | [UC04 — 4. Fluxo Principal](../doc-visao/casos-uso/uc04.md#4-fluxo-principal) |
| FP01, passo 6 | "O ator aciona a opção de salvar os dados." | "O sistema registra o card em menos de 5 segundos, com a matrícula ainda não ativa, e abre o card com as fichas e os termos pendentes. (RNF08, RNF01, FE04)" | Registro do card antes das fichas; matrícula nasce não ativa | [UC04 — 4. Fluxo Principal](../doc-visao/casos-uso/uc04.md#4-fluxo-principal) |
| FP01, passo 7 | "O sistema solicita a confirmação do salvamento. (RN15, FA05)" | "O ator abre as fichas obrigatórias (Requerimento, Socioeconômica, Imagem, Saída e Compromisso Escolar) e preenche as informações, na hora ou em outro momento." | As fichas são preenchidas dentro do card | [UC04 — 4. Fluxo Principal](../doc-visao/casos-uso/uc04.md#4-fluxo-principal) |
| FP01, passo 8 | "O ator confirma a operação." | "O ator salva cada ficha e confirma; o sistema valida os campos e registra a ficha. (RN15, RN06, FA05, FE01, FE04)" | Salvamento passa a ser por ficha | [UC04 — 4. Fluxo Principal](../doc-visao/casos-uso/uc04.md#4-fluxo-principal) |
| FP01, passo 9 | "O sistema valida todos os campos obrigatórios, o vínculo com turma/etapa e duplicidade. (RN02, RN06, RN07, FE01, FE02)" | "Quando as cinco fichas estão completas e o aluno está vinculado a uma turma e etapa ativas (UC07), o sistema altera o status da matrícula para ativa e exibe mensagem de sucesso. (RN01, RN02, RN03)" | Ativação ocorre quando as duas condições da RN03 se cumprem | [UC04 — 4. Fluxo Principal](../doc-visao/casos-uso/uc04.md#4-fluxo-principal) |
| FP01, passos 10 e 11 | 10: registrar card e fichas em menos de 5 s. 11: alterar a matrícula para ativa | Removidos: o registro foi para os passos 6 e 8 e a ativação para o passo 9 | Evitar duplicidade com a nova sequência | [UC04 — 4. Fluxo Principal](../doc-visao/casos-uso/uc04.md#4-fluxo-principal) |
| Bloco de decisão (novo) | Não existia. | 4 pontos, datados de 26/11/2026: (1) o card é criado primeiro, com dados pessoais e etapa, e a matrícula nasce ainda não ativa; (2) fichas no card e turma pelo UC07, em qualquer ordem; (3) a matrícula se torna ativa quando as duas condições da RN03 se cumprem, sem matrícula ativa sem turma e sem dependência circular com o UC07; (4) o nome do estado anterior à ativação (interface e banco) está por definir | Registrar a decisão pedida pela issue | [UC04 — 4. Fluxo Principal](../doc-visao/casos-uso/uc04.md#4-fluxo-principal) |
| FA01, passo 1 | "... seleciona um aluno com matrícula ativa. (FE03)" | "... seleciona um aluno cuja matrícula não esteja inativa. (FE03)" | Fichas são editadas antes da ativação | [UC04 — 5. Fluxos Alternativos](../doc-visao/casos-uso/uc04.md#5-fluxos-alternativos) |
| RN02 (tabela de regras) | "(selecionada no cadastro ou na alocação em UC07)" | "(vinculada pelo UC07, na alocação inicial e nas transferências posteriores)" | O cadastro não escolhe mais a turma | [UC04 — 7. Regras de Negócio](../doc-visao/casos-uso/uc04.md#7-regras-de-negocio) |
| DoR: DOR04 | Atendido; sequência RN03 × RN02 "a consolidar antes da integração final" | Atendido; sequência registrada na seção 4 e alinhada ao protótipo, com a matrícula ativa quando a RN03 se cumpre | Refletir a decisão | [UC04 — 10. Aplicação do DoR](../doc-visao/casos-uso/uc04.md#10-aplicacao-do-dor) |
| DoR: ponto de atenção | "Verificar a sequência entre a ativação da matrícula ... e a exigência de vínculo com turma e etapa (RN02, no UC07)." | Sequência registrada na seção 4; definir o nome do estado anterior à ativação; atualizar o protótipo "Card do aluno", que mostra card "Ativo" com fichas pendentes (contra a RN03) | Apontar o que ainda diverge | [UC04 — 10. Aplicação do DoR](../doc-visao/casos-uso/uc04.md#10-aplicacao-do-dor) |
| DoR: pendência não impeditiva | "Consolidar entre UC04 e UC07 a ordem entre ativação ... e alocação ..." | "Definir o nome do estado de matrícula anterior à ativação (interface e banco) e atualizar o protótipo ..." | A decisão está registrada; sobra a nomeação e o protótipo | [UC04 — 10. Aplicação do DoR](../doc-visao/casos-uso/uc04.md#10-aplicacao-do-dor) |

#### UC05 — Gerenciar Documentos Digitais

| Fluxo ou seção | Antes | Depois | Por que mudou | Onde mudou |
|---|---|---|---|---|
| FP01, passo 8 | "O sistema carrega o arquivo e realiza o upload. (RNF01)" | "... realiza o upload. (RNF01, FE03)" | Também o anexo novo tem tratamento de falha | [UC05 — 4. Fluxo Principal](../doc-visao/casos-uso/uc05.md#4-fluxo-principal) |
| FA01, passo 6 | "O sistema vai realizar o upload do novo documento. (RNF01)" | "... (RNF01, FE03)" | Tratar falha na substituição | [UC05 — 5. Fluxos Alternativos](../doc-visao/casos-uso/uc05.md#5-fluxos-alternativos) |
| FA01, passos 7 e 8 | 7: "disponibilizar o download do novo documento". 8: "disponibilizar a versão atualizada" | Fundidos no passo 7: "passa a disponibilizar o novo documento como a versão atual, para visualização e download" | Passos redundantes; sem sugerir o que acontece com o arquivo anterior | [UC05 — 5. Fluxos Alternativos](../doc-visao/casos-uso/uc05.md#5-fluxos-alternativos) |
| FA01, passo 9 | "O sistema vai retornar uma mensagem de 'ação realizada com sucesso'." | Virou o passo 8, com o mesmo texto | Renumeração | [UC05 — 5. Fluxos Alternativos](../doc-visao/casos-uso/uc05.md#5-fluxos-alternativos) |
| FA01, nota (nova) | Não existia. | "Tratamento do arquivo anterior (decisão pendente com a creche)": descarte ou retenção, por quanto tempo e quem acessaria dependem do que for acordado; o fluxo não presume retenção; a falha está em FE03 | A issue pede não presumir retenção | [UC05 — 5. Fluxos Alternativos](../doc-visao/casos-uso/uc05.md#5-fluxos-alternativos) |
| FE03 (novo), passos 1 e 2 | Não existia. | 1: falha de comunicação, armazenamento ou persistência no upload (FP01) ou na substituição (FA01). 2: o sistema interrompe a operação | Definir o comportamento diante de falha | [UC05 — 6. Fluxos de Exceção](../doc-visao/casos-uso/uc05.md#6-fluxos-de-excecao) |
| FE03 (novo), passos 3 a 5 | Não existia. | 3: na substituição, o documento anterior permanece disponível e sem alteração; em novo anexo, nenhum registro parcial é criado. 4: informa que não foi possível concluir e orienta tentar de novo. 5: não apresenta a operação como concluída sem confirmação do registro | Evitar perder o documento existente e falso sucesso | [UC05 — 6. Fluxos de Exceção](../doc-visao/casos-uso/uc05.md#6-fluxos-de-excecao) |
| DoR: iteração planejada | "Iteração 6 / Transição ... implementação aguarda resolução das pendências" | "Iteração 8 - Construção, 20/11 a 26/11 (tabelas criadas na 7); a implementação de RF15 depende da decisão pendente sobre o arquivo anterior" | Corrigir a iteração | [UC05 — 10. Aplicação do DoR](../doc-visao/casos-uso/uc05.md#10-aplicacao-do-dor) |
| DoR: fluxos selecionados | "FP01, FA01 e FE01 — download individual (RF16) pendente de detalhamento" | FP01, FA01, FA02 (baixar, RF16), FE01, FE02 e FE03 | O download já estava detalhado | [UC05 — 10. Aplicação do DoR](../doc-visao/casos-uso/uc05.md#10-aplicacao-do-dor) |
| DoR: fluxos excluídos | "Nenhum excluído do MVP, porém ... pendências de RF15 e RF16." | "Nenhum fluxo descrito foi excluído do MVP. A exclusão de documentos não é fluxo deste caso de uso nem do MVP (ver CP5)... a implementação de RF15 depende de registrar a decisão sobre o arquivo anterior." | Registrar que a exclusão está fora do escopo | [UC05 — 10. Aplicação do DoR](../doc-visao/casos-uso/uc05.md#10-aplicacao-do-dor) |
| DoR: DOR01 e DOR02 | DOR01 "Não atendido" (RF16 sem fluxo). DOR02 citava Iteração 6 | DOR01 "Atendido" (download em FA02 e FE02; falha em FE03). DOR02 cita Iterações 7 e 8 | O DoR apontava pendente um fluxo que já existia | [UC05 — 10. Aplicação do DoR](../doc-visao/casos-uso/uc05.md#10-aplicacao-do-dor) |
| DoR: DOR04 | "... retenção/exclusão do documento anterior ..." | "... tratamento do arquivo anterior (descarte ou retenção) a ser acordado com a creche, sem presumir retenção de versões anteriores. O comportamento diante de falha está definido em FE03." (continua "Não atendido") | Não presumir descarte nem retenção | [UC05 — 10. Aplicação do DoR](../doc-visao/casos-uso/uc05.md#10-aplicacao-do-dor) |
| DoR: pontos de atenção, pendência e reavaliação | Download pendente; substituição pendente; pendência impeditiva: detalhar download e decidir substituição; reavaliação na "Iteração 8 - Transição" | Download marcado como resolvido; substituição pendente só quanto ao arquivo anterior (falha já em FE03); pendência impeditiva: só a decisão da creche; reavaliação na "Iteração 8 - Construção" | Manter só o que está em aberto | [UC05 — 10. Aplicação do DoR](../doc-visao/casos-uso/uc05.md#10-aplicacao-do-dor) |

#### UC07 — Alocar Alunos

| Fluxo ou seção | Antes | Depois | Por que mudou | Onde mudou |
|---|---|---|---|---|
| Objetivo | "... aloquem um card de aluno ativo a uma turma existente ... exatamente uma turma." | "... aloquem o card de um aluno cuja matrícula não esteja inativa a uma turma existente ..." mais: é a alocação inicial, depois do cadastro no UC04, e a base das transferências; quando o vínculo cumpre a RN03, a matrícula passa a ativa | Resolver a circularidade com RN02 e RN03 | [UC07 — 2. Objetivo](../doc-visao/casos-uso/uc07.md#2-objetivo) |
| Pré-condição 4 | "O aluno ... deve estar cadastrado e com matrícula ativa no sistema." | "... ter o card cadastrado (UC04) e a matrícula não inativa, isto é, ativa ou ainda não ativa por faltar a conclusão das fichas ou o vínculo com turma. (RN10)" | O UC07 exigia a ativação que só vem depois do vínculo | [UC07 — 3. Pré-Condição](../doc-visao/casos-uso/uc07.md#3-pre-condicao) |
| FP01, passo 7 | "O sistema valida se o aluno e a turma estão com status 'ativo'. (RN03, RN11, FE02)" | "O sistema valida se a matrícula do aluno não está inativa e se a turma e a etapa estão ativas. (RN10, RN11, FE02, FE06)" | Acompanhar a nova pré-condição | [UC07 — 4. Fluxo Principal](../doc-visao/casos-uso/uc07.md#4-fluxo-principal) |
| FP01, passo 11 | "O sistema exibe a mensagem de confirmação: 'Aluno alocado com sucesso.'" | Novo passo 11: "Se as cinco fichas obrigatórias já estão completas, o sistema altera o status da matrícula para ativa. (RN03)" | O vínculo é uma das condições de ativação | [UC07 — 4. Fluxo Principal](../doc-visao/casos-uso/uc07.md#4-fluxo-principal) |
| FP01, passo 12 (antigo 11) | Mensagem de confirmação no passo 11 | A mesma mensagem passou para o passo 12 | Renumeração | [UC07 — 4. Fluxo Principal](../doc-visao/casos-uso/uc07.md#4-fluxo-principal) |
| FE06 (novo), passos 1 a 3 | Não existia. | 1: o ator seleciona o card de aluno com matrícula inativa. 2: o sistema identifica o status (RN10). 3: impede a alocação ou transferência e informa que a turma só pode ser definida ou alterada em matrículas não inativas | Cobrir a busca que retorna matrícula inativa | [UC07 — 6. Fluxos de Exceção](../doc-visao/casos-uso/uc07.md#6-fluxos-de-excecao) |
| DoR: fluxos selecionados | "... FA02 (Alterar alocação) e FE01 a FE05" | "... FA02 (Alterar alocação) e FE01 a FE06" | Incluir o FE06 | [UC07 — 10. Aplicação do DoR](../doc-visao/casos-uso/uc07.md#10-aplicacao-do-dor) |
| DoR: DOR04 | "Não atendido": contradição RN02 (ativa exige turma) × RN03 (ativa após fichas) | "Atendido": sequência alinhada ao protótipo (UC04 cria o card sem turma, UC07 vincula e transfere, matrícula ativa quando a RN03 se cumpre) | A decisão resolve a contradição | [UC07 — 10. Aplicação do DoR](../doc-visao/casos-uso/uc07.md#10-aplicacao-do-dor) |
| DoR: ponto de atenção | "Há uma dependência de negócio que precisa ser resolvida antes do Ready ..." | Reescrito como resolvido: o UC07 não exige matrícula ativa e não há dependência circular | Refletir a decisão | [UC07 — 10. Aplicação do DoR](../doc-visao/casos-uso/uc07.md#10-aplicacao-do-dor) |
| DoR: pendência impeditiva | "Resolver e documentar a relação entre RN02 e RN03 entre UC04 e UC07; especificar o tratamento atômico de RN08 na transferência (FA02)." | "Especificar o tratamento atômico de RN08 na transferência de turma (FA02)." | Sobrou só a atomicidade | [UC07 — 10. Aplicação do DoR](../doc-visao/casos-uso/uc07.md#10-aplicacao-do-dor) |

**Pendências em aberto:** valor do timeout do login; nome do estado de matrícula anterior à ativação (interface e banco); protótipo "Card do aluno" ainda mostra um card "Ativo" com fichas pendentes; tratamento do arquivo anterior na substituição de documentos (decisão da creche); diagramas estáticos do UC01. Os casos de uso (UC01, UC04, UC05 e UC07) não possuem snapshot próprio nesta pasta.

## Versão 2.2 — Revisão Intermediária da Unidade 3 (16/11/2026)

Snapshot referente à atualização de status do cronograma antes da reestruturação para Casos de Uso (commit `fac4527`):

- [6. Cronograma e Entregas (v2.2)](v2_2/6_cronograma.md)

## Versão 2.1 — Revisões Intermediárias da Unidade 3 (06/11 a 08/11/2026)

Snapshots intermediários após a entrega da Unidade 2:

- [2. Solução Proposta (v2.1)](v2_1/2_solucao.md)
- [4. Estratégias de Engenharia de Software (v2.1)](v2_1/4_estrategias.md)
- [6. Cronograma e Entregas (v2.1)](v2_1/6_cronograma.md)
- [8. Requisitos do Produto (v2.1)](v2_1/8_requisitos.md)
- [10. Backlog e MVP (v2.1)](v2_1/10_backlog.md)

## Versão 2.0 — Entrega da Unidade 2 (12/10/2026)

Snapshot referente ao fechamento da Unidade 2 (commit `f992c14`):

- [1. Cenário Atual do Cliente e do Negócio (v2.0)](v2/1_cenarioAtual.md)
- [2. Solução Proposta (v2.0)](v2/2_solucao.md)
- [3. Intervenção Social (v2.0)](v2/3_intervencao.md)
- [4. Estratégias de Engenharia de Software (v2.0)](v2/4_estrategias.md)
- [5. Engenharia de Requisitos (v2.0)](v2/5_requisitos.md)
- [6. Cronograma e Entregas (v2.0)](v2/6_cronograma.md)
- [7. Interação entre Equipe e Cliente (v2.0)](v2/7_interacao.md)
- [8. Requisitos do Produto (v2.0)](v2/8_requisitos.md)
- [9. DoR e DoD (v2.0)](v2/9_dor_dod.md)
- [10. Backlog e MVP (v2.0)](v2/10_backlog.md)
- [11. Lições Aprendidas (v2.0)](v2/11_licoes.md)

## Versão 1.0 — Entrega da Unidade 1 (07/09/2026)

Snapshot referente ao fechamento da Unidade 1 (commit `f8bab22`):

- [1. Cenário Atual do Cliente e do Negócio (v1.0)](v1/1_cenarioAtual.md)
- [2. Solução Proposta (v1.0)](v1/2_solucao.md)
- [3. Intervenção Social (v1.0)](v1/3_intervencao.md)
- [4. Estratégias de Engenharia de Software (v1.0)](v1/4_estrategias.md)
- [5. Engenharia de Requisitos (v1.0)](v1/5_requisitos.md)
- [6. Cronograma e Entregas (v1.0)](v1/6_cronograma.md)
- [7. Interação entre Equipe e Cliente (v1.0)](v1/7_interacao.md)
- [11. Lições Aprendidas (v1.0)](v1/11_licoes.md)
