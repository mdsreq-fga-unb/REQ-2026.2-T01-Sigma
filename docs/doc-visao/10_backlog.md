# 10 Backlog do produto

Aqui vale ressaltar que todos os **casos de uso** a seguir são derivados das nossas listas de requisitos apresentado anteriormente nesse documento.
Essa é uma lista tem o intuito de atender a representação de **requisitos de produto**, pra auxiliar duranto o desenvolvimento, e tamebm é  preliminar e deverá sofrer ajustes sempre que necessário durante o desenvolvimento do produto do SIGMA;

## 10.1 Backlog Geral do produto 

A baixo está o link dos casos de uso relacionados, cada link , redireciona para a descrição respectiva de seu caso de uso.

|Casos de Uso|Status|
|---|---|
|[UC01 - Gerenciar Autenticação](casos-uso/uc01.md)| NÃO FEITO|
|[UC02 - Gerenciar Usuários Administrativos](casos-uso/uc02.md)|NÃO FEITA|
|[UC03 - Gerenciamento de quadros de avisos](casos-uso/uc03.md)|NÃO FEITA|
|[UC04 - Gerenciar Fichas de Matrícula](casos-uso/uc04.md)|NÃO FEITA|
|[UC05 - Gerenciar Documentos Digitais](casos-uso/uc05.md)|NÃO FEITA|
|[UC06 - Gerenciar Estrutura Escolar (Etapas e Turmas)](casos-uso/uc06.md)|NÃO FEITA|
|[UC07 - Alocar Alunos](casos-uso/uc07.md)|NÃO FEITA|
|[UC08 - Consultar Registros (Busca)](casos-uso/uc08.md)|NÃO FEITA|

> Também disponibilizamos [**Lista de requisitos**](./8_requisitos.md), pra fins de esclarecimento de algum requisito.

## 10.2 Priorização do Backlog e MVP



### Definição do Critério de Montagem do MVP

Para a inserção dos requisitos no MVP, efetuamos uma análise plural considerando as posições de cada requisito funcional e não-funcional na Matrix 4x4, alocando aqueles que apresentavam mais valor de negócio e menos esforço técnico. Além das posições da Matriz 4x4, foi considerado uma análise de contribuição para a solução do problema e relacionamento direto com o cumprimento dos objetivos do projeto. Em geral, acrescentamos ao MVP, aqueles requisitos indispensáveis e vitais para o desenvolvimento e implementação da solução, cujos complementam as funcionalidades que ja estariam no MVP .

### Consolidação das avaliações
 
| ID | Requisito | Justificativa do cliente | V. Negócio | Esforço | Complexidade | Lacuna de Capacidade | Esforço técnico consolidado |
|---|---|---|---|---|---|---|---|
| RF1 | Disponibilizar quadro de avisos | Se manifestou como um desejo da cliente | 2 | 2 | 3 | 1 | 2.6 |
| RF2 | Lançar avisos | Se manifestou como um desejo da cliente | 2 | 2 | 3 | 1 | 2 |
| RF3 | Exibir avisos | Se manifestou como um desejo da cliente | 2 | 2 | 3 | 1 | 2 |
| RF4 | Apagar avisos | Se manifestou como um desejo da cliente | 2 | 2 | 3 | 1 | 2 |
| RF5 | Cadastrar usuários | Necessidade da cliente, para cadastrar possíveis novos usuários | 4 | 1 | 2 | 1 | 1.3 |
| RF6 | Realizar login | O sistema deve ser protegido por login | 4 | 1 | 2 | 2 | 1.6 |
| RF7 | Realizar logout | O logout é necessário para garantir a segurança física do computador contra acessos indevidos | 4 | 1 | 2 | 2 | 1.6 |
| RF8 | Cadastrar card de aluno | Função essencial, visa resolver o problema principal | 4 | 3 | 3 | 2 | 2.6 |
| RF9 | Preenchimento de fichas | Função essencial, visa resolver o problema principal | 4 | 3 | 3 | 2 | 2.6 |
| RF10 | Editar fichas de card | Função essencial, visa resolver o problema principal | 3 | 3 | 3 | 2 | 2.6 |
| RF11 | Inativar card de aluno | Útil para organização interna | 2 | 1 | 1 | 1 | 1 |
| RF12 | Reativar card de aluno | Útil para organização interna | 2 | 1 | 1 | 1 | 1 |
| RF13 | Vincular aluno a turma | Útil para organização interna | 4 | 1 | 1 | 2 | 1.3 |
| RF14 | Anexar documentos | Função essencial, visa resolver o problema principal | 4 | 1 | 2 | 2 | 1.6 |
| RF15 | Editar documento | Função essencial, visa resolver o problema principal | 3 | 1 | 2 | 1 | 1.3 |
| RF16 | Baixar fichas e documentos | Função essencial, visa resolver o problema principal | 3 | 1 | 2 | 4 | 2.3 |
| RF17 | Apresentar histórico de edições | Útil para organização interna | 3 | 2 | 2 | 2 | 2 |
| RF18 | Cadastrar Etapa | Útil para organização interna | 4 | 1 | 1 | 1 | 1 |
| RF19 | Inativar Turma e Etapa | Útil para organização interna | 2 | 1 | 1 | 1 | 1 |
| RF20 | Vincular turma à etapa | Útil para organização interna | 2 | 1 | 1 | 2 | 1.3 |
| RF21 | Buscar aluno pelo nome | Função essencial, visa resolver o problema principal | 4 | 1 | 1 | 1 | 1 |
| RF22 | Buscar Turmas e Etapas | Útil para organização interna | 4 | 1 | 1 | 1 | 1 |
| RF23 | Possibilitar salvamento de dados | Função essencial, visa resolver o problema principal | 3 | 1 | 1 | 1 | 1 |
| RF24 | Cadastrar Turma | Útil para organização interna | 4 | 1 | 1 | 1 | 1 |
| RNF1 | Privacidade de dados e retenção segura | Necessário, obrigação legal | 4 | 3 | 4 | 4 | 3.6 |
| RNF2 | Restrição de acesso não autenticado | Necessário, proteção contra acessos indesejados | 4 | 1 | 1 | 2 | 1.3 |
| RNF3 | Interface responsiva e adaptável a múltiplos dispositivos | Útil, mas não essencial para primeiro uso | 3 | 2 | 2 | 3 | 2.3 |
| RNF4 | Interface com suporte a modo escuro alternável | Útil, mas não essencial para primeiro uso | 2 | 1 | 2 | 1 | 1.3 |
| RNF5 | Tempo de resposta do sistema ao logar | Necessário, a velocidade do sistema foi uma queixa forte do cliente | 4 | 2 | 3 | 3 | 2.6 |
| RNF6 | Tempo de resposta do sistema ao buscar aluno | Necessário, a velocidade do sistema foi uma queixa forte do cliente | 4 | 2 | 3 | 3 | 2.6 |
| RNF7 | Tempo de resposta do sistema para buscar turmas ou etapas | Necessário, a velocidade do sistema foi uma queixa forte do cliente | 4 | 2 | 3 | 3 | 2.6 |
| RNF8 | Tempo de resposta para salvar uma ficha | Necessário, a velocidade do sistema foi uma queixa forte do cliente | 4 | 2 | 3 | 3 | 2.6 |
| RNF9 | Disponibilidade do sistema | Necessário, o sistema deve permanecer acessível durante todo o expediente | 4 | 2 | 2 | 2 | 2 |
| RNF10 | Acessos múltiplos | Essencial, para acompanhar a necessidade do cliente | 3 | 2 | 2 | 2 | 2 |



### Definição de RFs do MVP

- 15 requisitos -> todos estão no MVP dos casos de uso ? ou entao todos os requisitos de todos os casos de uso estão aqui ??

| Requisito | Justificativa | Casos de uso vinculado|
|---|---|---|
| RF05 | Necessário para a segurança do sistema, alto valor de negócio. |UC02|
| RF06 | Necessário para a segurança do sistema, alto valor de negócio. |UC01|
| RF07 | Necessário para a segurança do sistema, alto valor de negócio. |UC01|
| RF08 | Necessário para a solução do problema principal, alto valor de negócio. |UC04|
| RF09 | Necessário para a solução do problema principal, alto valor de negócio. |UC04|
| RF10 | Necessário para a solução do problema principal, alto valor de negócio. |UC04|
| RF21 | Necessário para a fluidez do sistema, alto valor de negócio, baixo esforço técnico. |UC08|
| RF14 | Necessário para o funcionamento correto do sistema, alto valor de negócio, baixo esforço técnico. |UC05|
| RF15 | Necessário para o funcionamento correto do sistema, alto valor de negócio, baixo esforço técnico. |UC05|
| RF16 | Necessário para o funcionamento correto do sistema, alto valor de negócio, baixo esforço técnico. |UC05|
| RF23 | Necessário para o salvamento de dados do sistema, alto valor de negócio, baixo esforço técnico. |UC23|
| RF22 | Necessário para a solução do problema principal, alto valor de negócio, baixo esforço técnico. |UC08|
| RF24 | Necessário para a solução do problema principal, alto valor de negócio, baixo esforço técnico. |UC06|
| RF18 | Necessário para a correta implementação do sistema e cumprimento de objetivos específicos, alto valor de negócio, baixo esforço técnico. |UC06|
| RF13 | Necessário para a correta implementação do sistema e estruturação da solução do problema, alto valor de negócio, baixo esforço técnico. |UC07|

### Definição de RNFs do MVP

| Requisito | Justificativa |
|---|---|
| RNF1 | **Obrigatório para o MVP.** Trata-se de uma obrigação legal a ser seguida. |
| RNF2 | **Obrigatório para o MVP.** Relacionado à segurança. Sem isso, os dados ficam expostos. É uma condição obrigatória para que o sistema vá ao ar. |
| RNF9 | **Obrigatório para o MVP.** A justificativa exige que o sistema funcione durante o expediente. Se o sistema cai, a operação do cliente pode ser afetada. |
| RNF5 | **Associado a RFs do MVP.** Diretamente associado ao RF06. |
| RNF6 | **Associado a RFs do MVP.** Diretamente associado ao RF21. |
| RNF7 | **Associado a RFs do MVP.** Diretamente associado ao RF22. |
| RNF8 | **Associado a RFs do MVP.** Diretamente associado aos requisitos do MVP: RF09, RF10 e RF23. |
| RNF10 | **Evolutivo.** Inicialmente, o sistema não será usado por todas as funcionárias, reduzindo a carga. |
| RNF3 | **Evolutivo.** O sistema será utilizado principalmente em notebooks/desktops. A adição de suporte para outras resoluções é uma evolução futura. |
| RNF4 | **Evolutivo.** É um ganho de conforto visual, mas não impede a operação do sistema. Deve ficar para o futuro. |