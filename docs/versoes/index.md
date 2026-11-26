# Histórico de Versões dos Artefatos

Esta página centraliza o acesso às versões anteriores dos documentos do projeto SIGMA, permitindo acompanhar a evolução e o amadurecimento dos artefatos ao longo das unidades e iterações sem poluir a barra de navegação principal.

## Versão 2.3 — Correções das revisões da Visão e dos requisitos do MVP (26/11/2026)

Snapshots anteriores às correções das duas revisões (Issue 1: Visão de Produto e Projeto; Issue 2: requisitos centrais do MVP):

- [2. Solução Proposta (v2.2)](v2_2/2_solucao.md)
- [4. Estratégias de Engenharia de Software (v2.3)](v2_3/4_estrategias.md)
- [6. Cronograma e Entregas (v2.3)](v2_3/6_cronograma.md)
- [10. Backlog e MVP (v2.2)](v2_2/10_backlog.md)
- [8. Requisitos (v2.3)](v2_3/8_requisitos.md)
- [9. DoR e DoD (v2.3)](v2_3/9_dor_dod.md)
- [UC01 (v2.3)](v2_3/uc01.md)
- [UC04 (v2.3)](v2_3/uc04.md)
- [UC05 (v2.3)](v2_3/uc05.md)
- [UC07 (v2.3)](v2_3/uc07.md)

### Registro de alterações da versão 2.3

| # | Issue | O que mudou | Por que mudou | Onde mudou |
|---|---|---|---|---|
| 1 | 1 | Promessa de "eliminar definitivamente" a perda e deterioração das fichas virou "redução do risco", com as condições necessárias | O armazenamento digital também tem riscos (falhas, perda de acesso, backup e recuperação) | `2_solucao.md` (2.7.1); `10_backlog.md` |
| 2 | 1 | "Maior segurança e confiabilidade" virou "informações mais protegidas, por meio das medidas de 2.1" | Evitar afirmar mais do que está demonstrado | `2_solucao.md` (2.7.2) |
| 3 | 1 | Removido "dispensando o uso de papéis físicos"; criada a subseção "Transição gradual e uso do papel" | A Visão previa digitalização gradual, mas a página do MVP dizia que o papel era dispensado | `2_solucao.md` (2.1, 2.6); `10_backlog.md` (10.3); `6_cronograma.md` (Iteração 9); `4_estrategias.md` (risco Migração) |
| 4 | 1 | "Deleção" removida do CP5; exclusão de documentos declarada fora do escopo do MVP; Iteração 8 sem "exclusão" | UC05 e catálogo só têm anexar, substituir e baixar | `2_solucao.md` (CP5); `6_cronograma.md`; `10_backlog.md`; `uc05.md` |
| 5 | 1 | Segurança apresentada como conjunto de medidas; novas linhas de controle de acesso, sessão e rastreabilidade | A autenticação isolada não demonstra que a privacidade e a proteção estejam atendidas | `2_solucao.md` (2.1); `4_estrategias.md` (4.4); `10_backlog.md` |
| 6 | 1 | Perfil Administrador alinhado ao UC02 (cadastra, inativa e reativa contas) | A Solução dizia que ele só cadastrava secretárias | `2_solucao.md` (2.1, CP4) |
| 7 | 1 | "Iteração 8 (Transição)" corrigida para "Construção"; hospedagem em nuvem registrada como decisão de 06/10 | Inconsistência com o cronograma e a ata | `2_solucao.md` (2.4, 2.6) |
| 8 | 1 | Afirmação sobre contratação de integrante para manutenção trocada por "responsável ainda não definido" | Sem evidência nas atas e demais páginas | `2_solucao.md` (2.6) |
| 9 | 2 | Alocação inicial definida no cadastro do card (UC04); UC07 passa a tratar só da alteração posterior de turma | UC07 exigia matrícula ativa, mas RN02/RN03 só a ativam com turma e fichas completas (dependência circular) | `uc04.md` (seção 4); `uc07.md` (seções 2 a 6, DoR) |
| 10 | 2 | UC04: pré-condição 7 e fluxo FE05 (nenhuma turma ativa); texto da RN02 ajustado | Fechar a lacuna da sequência de cadastro | `uc04.md` |
| 11 | 2 | UC07: antigo FA02 virou FP01; FE03 virou "turma de destino igual à atual"; novo FE06 (matrícula não ativa) | Refletir que o UC07 é só transferência | `uc07.md` |
| 12 | 2 | Descrições de UC07, RF13 e RN02 alinhadas à decisão | Consistência entre catálogo, modais e casos de uso | `8_requisitos.md`; `javascripts/modal.js` |
| 13 | 2 | UC05: DoR atualizado (download já detalhado em FA02/FE02); iteração corrigida para 8 - Construção | DoR apontava pendência de fluxo que já existia | `uc05.md` (seção 10) |
| 14 | 2 | UC05: novo FE03 (falha no upload ou na substituição mantém o documento anterior) | Definir o comportamento diante de falha | `uc05.md` |
| 15 | 2 | UC05: tratamento do arquivo anterior marcado como decisão pendente com a creche; RF15 sem "removendo o arquivo anterior" | Não presumir descarte nem retenção | `uc05.md` (FA01, DoR); `javascripts/modal.js` |
| 16 | 2 | UC01: meta de 2 s, timeout e indisponibilidade distinguidos (tabela, FA02, FE03, diagrama, RNF05) | Resposta lenta não significa falha de conexão | `uc01.md`; `javascripts/modal.js` |
| 17 | 2 | Linha "Controle de acesso" da 4.4 passou a citar RN16 e RN18 com a descrição correta | Correção de referência imprecisa | `4_estrategias.md` (4.4) |

**Pendências em aberto:** valor do timeout do login; confirmação com a creche da sequência UC04/UC07 e do tratamento do arquivo anterior na substituição; protótipo "Novo aluno" e diagramas estáticos do UC01 ainda não atualizados. Os casos de uso (UC01, UC04, UC05 e UC07) não possuem snapshot próprio nesta pasta.

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
