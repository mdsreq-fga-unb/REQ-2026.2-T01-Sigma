# 8. Requisitos
 
## 8.1 Requisitos Funcionais
 
| ID | Nome | Descrição | CP vinculada |
|---|---|---|---|
| RF01 | Disponibilizar quadro de avisos | O sistema deve disponibilizar um quadro de avisos para todos os usuários. | CP6 |
| RF02 | Lançar avisos | Permitir que qualquer usuário possa lançar avisos contendo assunto e descrição. | CP6 |
| RF03 | Notificar avisos | Notificar avisos via pop-up a todos os usuários no momento em que for lançado. | CP6 |
| RF04 | Apagar avisos | Deve ser possível apagar avisos do quadro. | CP6 |
| RF05 | Cadastrar Usuários | Deve ser possível cadastrar usuários no sistema. | CP1 |
| RF06 | Realizar login | Realizar login padrão com nome de usuário e senha. | CP4 |
| RF07 | Realizar logout | Deve ser possível realizar logout de sua conta. | CP4 |
| RF08 | Cadastrar aluno | Deve ser possível criar card de aluno que conterá os modelos das fichas a serem preenchidas. | CP1 |
| RF09 | Preenchimento de fichas | Deve ser possível preencher as 5 fichas do processo de matrícula dentro do card de um aluno. | CP6 |
| RF10 | Editar fichas do card | Deve ser possível a edição de informações de qualquer ficha de qualquer card. | CP2 |
| RF11 | Inativar matrícula de aluno | Permitir a alteração do status do card do aluno para inativa, desabilitando ações do sistema com aquele card. | CP1 |
| RF12 | Reativar matrícula de aluno | Permitir a alteração do status do card de aluno para ativo, habilitando ações do sistema com aquele card. | CP1 |
| RF13 | Vincular aluno a turma | Deve ser capaz de vincular um aluno a uma turma. | CP7 |
| RF14 | Anexar documentos | Deve ser capaz de anexar documentos dos alunos às fichas. | CP5 |
| RF15 | Editar documento | Permitir, ao clicar no botão de edição de documento, a anexação de um novo documento previamente digitalizado no formato .pdf. | CP5 |
| RF16 | Baixar fichas e documentos | Permitir baixar fichas e documentos. | CP5 |
| RF17 | Apresentar histórico de edições | Deve apresentar os dados de quem criou e das edições da ficha no histórico de edições. | CP2 |
| RF18 | Cadastrar Etapa e turma | Permitir realizar cadastro de Etapa (série de ensino) e turma. | CP7 |
| RF19 | Inativar turma e etapa | Deve ser possível inativar turmas e etapas no sistema, deixando o status como inativo. | CP7 |
| RF20 | Vincular turma à etapa | Deve ser possível vincular uma turma a uma etapa. | CP7 |
| RF21 | Buscar card de aluno | Permitir buscar aluno pelo nome, retornando o card dele. | CP3 |
| RF22 | Buscar turmas e etapas | Deve ser possível buscar turmas e etapas no sistema. | CP7 |
| RF23 | Possibilitar salvamento de dados | O sistema deve ter uma decisão de certeza ao clicar no botão de "salvar os dados". | CP2 |
 
## 8.2 Requisitos Não Funcionais
 
| ID | Nome | Descrição | Classificação URPS+ |
|---|---|---|---|
| RNF01 | Privacidade de Dados e Retenção Segura | Garantir a privacidade dos dados pessoais restringindo sua visualização apenas a usuários autenticados, apoiando a segurança da informação exigida pela LGPD. | Segurança |
| RNF02 | Apenas usuários autenticados podem acessar o sistema | Acesso restrito exclusivamente a usuários que realizam autenticação válida. | Segurança |
| RNF03 | Interface responsiva e adaptável a múltiplos dispositivos | A interface do sistema deve preservar a usabilidade e adaptar os componentes visuais para resoluções de monitores desktop e dispositivos móveis. | Usabilidade |
| RNF04 | Interface com suporte a Modo Escuro alternável | O sistema deve disponibilizar a opção de "modo escuro" alternável para o usuário, aplicando uma paleta de cores escura e textos de alto contraste, preservando a legibilidade e consistência visual. | Usabilidade |
| RNF05 | Tempo de Resposta do Sistema ao Logar | Garantir tempo menor que 10 segundo para login. | Desempenho |
| RNF06 | Tempo de Resposta do Sistema ao Buscar aluno | Garantir tempo de resposta menor que 10 segundo. | Desempenho |
| RNF07 | Tempo de resposta do sistema para buscar turmas ou etapas | Garantir tempo de resposta menor que 10 segundo. | Desempenho |
| RNF08 | Tempo de resposta para salvar uma ficha | Garantir tempo de resposta menor que 10 segundo. | Desempenho |
| RNF09 | Disponibilidade do sistema | O sistema deve estar acessível durante o funcionamento comercial da creche. | Confiabilidade |
| RNF10 | Acessos Múltiplos | O sistema deve suportar 10 usuários simultaneamente. | Desempenho |