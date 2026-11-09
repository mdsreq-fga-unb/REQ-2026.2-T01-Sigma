# 10. Mínimo Produto Viável (MVP)

O escopo do **Mínimo Produto Viável (MVP)** do sistema **SIGMA** foi estruturado a partir do [Catálogo Unificado de Requisitos](8_requisitos.md), tendo os **Casos de Uso (UC)** como representação oficial das necessidades operacionais da Creche Estação Vida.

Esta página documenta as **regras e critérios de priorização** adotados para definir o recorte do produto, justificando os itens selecionados para a primeira entrega operacional e os itens planejados para versões posteriores.

---

<span id="102-priorizacao-do-backlog-e-mvp"></span>
<span id="criterios-priorizacao"></span>
## 10.1 Critérios e Regras de Priorização do MVP

A seleção dos componentes do MVP baseou-se na ponderação conjunta entre o **Valor de Negócio** (demandado pela creche) e o **Esforço Técnico** (avaliado pela equipe de engenharia), complementada por diretrizes de conformidade regulatória.

### 1. Regra de Valor de Negócio (Cliente e Usuários)

O valor de cada necessidade funcional foi qualificado em reuniões participativas com a diretoria e a secretaria da Creche Estação Vida, aplicando os seguintes parâmetros:

- **Escala de Impacto no Negócio (1 a 4):**
    - **Nível 4 (Crítico):** Resolve o gargalo mais severo da instituição (eliminação de fichas em papel, prevenção de perda de dados de crianças, proteção de acesso). Sem este item, o sistema é inoperável.
    - **Nível 3 (Alto):** Agrega eficiência expressiva ao fluxo diário (edição segura de fichas, upload/download de comprovantes em PDF, agilidade de busca).
    - **Nível 2 (Médio):** Funcionalidades de conveniência ou processos secundários (quadro de avisos interno, relatórios complementares).
    - **Nível 1 (Baixo):** Ajustes cosméticos ou demandas dispensáveis na fase inicial.

- **Classificação MoSCoW:**
    - **Must Have (Obrigatório):** Essencial para o ciclo de matrículas e gestão escolar básica. Compõe o núcleo do MVP.
    - **Should Have (Importante):** Requisitos altamente recomendados, mantidos no MVP quando não comprometem o cronograma principal.
    - **Could Have (Desejável):** Recursos agregadores de conveniência, incorporados apenas mediante folga técnica.
    - **Won't Have (Pós-MVP):** Funcionalidades explicitamente acordadas com o cliente como escopo futuro.

---

### 2. Regra de Esforço Técnico e Capacidade de Engenharia

O esforço para concretização de cada requisito foi estimado pela equipe técnica considerando três dimensões (escala 1 a 4):

1. **Esforço de Desenvolvimento ($E$):** Volume estimado de horas de codificação e escrita de testes.
2. **Complexidade Algorítmica e de Integração ($C$):** Grau de incerteza da lógica de negócio, persistência de arquivos sensíveis e relacionamentos de dados.
3. **Lacuna de Competência da Equipe ($L$):** Necessidade de curva de aprendizado nas tecnologias e ferramentas empregadas.

O **Esforço Consolidado** resulta da média ponderada dessas dimensões, servindo de base para o cálculo de custo-benefício.

---

### 3. Relação Custo-Benefício (Valor vs. Esforço)

A priorização do MVP busca maximizar a entrega de valor com a menor complexidade de execução no menor ciclo de tempo:

$$\text{Razão de Prioridade} = \frac{\text{Valor de Negócio Médio}}{\text{Esforço Técnico Consolidado}}$$

Itens com razão $\ge 2.0$ e classificados como *Must Have* receberam prioridade imediata para integrar o MVP. Itens com menor razão ou de caráter acessório foram alocados para o backlog pós-MVP.

---

### 4. Requisitos Não Funcionais Transversais Obrigatórios

Diferente das capacidades funcionais que foram modularizadas em casos de uso, certos requisitos não funcionais constituem **condições de conformidade transversal indispensável** em todos os fluxos do MVP:

- **Proteção e Privacidade de Dados (LGPD):** Obrigação legal absoluta no manuseio de dados de menores e responsáveis vulneráveis.
- **Segurança de Acesso e Autenticação:** Restrição irrestrita de acessos não autenticados aos registros da creche.

---

## 10.2 Recorte e Composição do MVP

A aplicação das regras de priorização resultou no seguinte escopo validado para o MVP:

| ID | Caso de Uso | Compõe o MVP? | Prioridade MoSCoW | Justificativa do Recorte |
| :--- | :--- | :---: | :---: | :--- |
| [UC01](8_requisitos.md#uc01) | Gerenciar Autenticação | **SIM** | Must Have | Porta de entrada segura para dados sensíveis e conformidade de acesso. |
| [UC02](8_requisitos.md#uc02) | Gerenciar Usuários Administrativos | **SIM** | Must Have | Gestão das contas da secretaria e controle de privilégios. |
| [UC03](8_requisitos.md#uc03) | Gerenciar Quadro de Avisos | **NÃO** | Won't Have | Funcionalidade secundária de comunicação; postergada para concentrar esforços nas matrículas. |
| [UC04](8_requisitos.md#uc04) | Gerenciar Fichas de Matrícula | **SIM** | Must Have | **Núcleo essencial do sistema**. Substitui as fichas em papel e elimina a perda de históricos. Fluxos de inativação complexa foram postergados. |
| [UC05](8_requisitos.md#uc05) | Gerenciar Documentos Digitais | **SIM** | Must Have | Digitalização e armazenamento em PDF de termos, certidões e laudos essenciais. |
| [UC06](8_requisitos.md#uc06) | Gerenciar Estrutura Escolar | **SIM** | Must Have | Cadastro de turmas e etapas obrigatório para alocação de crianças. |
| [UC07](8_requisitos.md#uc07) | Alocar Alunos | **SIM** | Must Have | Enturmação e alocação de crianças nas turmas correspondentes. |
| [UC08](8_requisitos.md#uc08) | Consultar Registros (Busca) | **SIM** | Must Have | Localização ágil de alunos por nome em menos de 2 segundos, substituindo armários físicos. |

!!! tip "Consulte o Catálogo Unificado de Requisitos"
    Todas as informações completas, regras de negócio e requisitos funcionais e não funcionais estão concentradas no **[Catálogo Unificado de Requisitos](8_requisitos.md)**.
    
    Acesse o catálogo para utilizar o **filtro de MVP** e abrir os **modais interativos** com detalhes de cada requisito, prioridade e regras associadas.

---

## 10.3 Validação do MVP com o Stakeholder

A composição e os critérios do MVP foram formalmente apresentados e validados com **Cirlene Sena**, diretora e coordenadora da **Creche Estação Vida** (stakeholder principal):

- **Aprovação do Recorte:** A coordenadora confirmou que os 7 Casos de Uso selecionados (UC01, UC02, UC04, UC05, UC06, UC07 e UC08) atendem plenamente ao objetivo de *mínimo produto indispensável para operação*, cobrindo o ciclo crítico de matrículas e dispensando o uso de papéis físicos.
- **Adiamento Consciente:** Foi acordado entre cliente e equipe técnica o adiamento do mural de avisos (UC03) e das operações complexas de inativação/reativação (RF11, RF12, RF19, RF20) para o ciclo pós-MVP.
- **Evidências:** Os registros detalhados da validação estão disponíveis na seção [Atas de Reunião - Unidade 2](../reunioes/ata1.md).
