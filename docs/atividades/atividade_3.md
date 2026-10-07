# Tabela Antiga de requisitos

### Requisitos Funcionais
 
| ID | Nome | Descrição | CP vinculada |
|---|---|---|---|
| RF01 | Disponibilizar quadro de avisos | O sistema deve disponibilizar um quadro de avisos para todos os usuários. | CP6 |
| RF02 | Lançar avisos | Permitir que qualquer usuário possa lançar avisos contendo assunto e descrição. | CP6 |
| RF03 | Notificar avisos | Notificar avisos via pop-up a todos os usuários no momento em que for lançado. | CP6 |
| RF04 | Apagar avisos | Deve ser possível apagar avisos do quadro | CP6 |
| RF05 | Cadastrar Usuários | Deve ser possível cadastrar usuários no sistema | CP1 |
| RF05 | Realizar login | Realizar login padrão com nome de usuário e senha. | CP4 |
| RF06 | Realizar logout | Deve ser possível realizar logout de sua conta | CP4 |
| RF07 | Cadastrar aluno | Deve ser possível criar card de aluno que conterá os modelos das fichas a serem preenchidas. | CP1 |
| RF10 | Inativar matrícula de aluno | Permitir a alteração do status do card do aluno para inativa, desabilitando ações do sistema com aquele card. | CP1 |
| RF11 | Reativar matrícula de aluno | Permitir a alteração do status do card de aluno para ativo, habilitando ações do sistema com aquele card | CP1 |
| RF09 | Editar fichas do card | Deve ser possível a edição de informações de qualquer ficha de qualquer card. | CP2 |
| RF08 | Preenchimento de fichas | Deve ser possível Prencher as 5 fichas do processo de matrícula dentro do card de um aluno; | CP6 |
| RF12 | Vincular aluno a turma | Deve ser capaz de vincular um aluno a uma turma | CP7 |
| RF13 | Anexar documentos | Deve ser capaz de anexar documentos dos alunos às fichas. | CP5 |
| RF14 | Editar documento | Permitir, ao clicar no botão de edição de documento, a anexação de um novo documento previamente digitalizado no formato .pdf. | CP5 |
| RF15 | Baixar fichas e documentos | Permitir baixar fichas e documentos. | CP5 |
| RF16 | Apresentar histórico de edições | Deve apresentar os dados de quem criou e das edições da ficha no histórico de edições. | CP2 |
| RF17 | Cadastrar Etapa e turma | Permitir realizar cadastro de Etapa (série de ensino) e turma | CP7 |
| RF18 | Inativar turma e etapa | Deve ser possível inativar turmas e etapas no sistema, deixando o status como inativo | CP7 |
| RF19 | Vincular turma à etapa | Deve ser possível vincular uma turma a uma etapa | CP7 |
| RF20 | Buscar aluno | Permitir buscar aluno pelo nome, retornando o card dele. | CP3 |
| RF21 | Busca de turmas e etapas | Deve ser possível turmas e etapas no sistema | CP7 |
| RF23 | Possibilitar salvamento de dados  | O sistema deve ter uma decisão de certeza ao clicar no botão de 'salvar os dados'.| |

### Requisitos Não Funcionais
 
| ID | Nome | Descrição | Classificação URPS+ |
|---|---|---|---|
| RNF01 | Privacidade de Dados e Retenção Segura | Garantir a privacidade dos dados pessoais restringindo sua visualização apenas a usuários autenticados, apoiando a segurança da informação exigida pela LGPD. | Segurança |
| RNF02 | Apenas usuários autenticados podem acessar o sistema | Acesso restrito exclusivamente a usuários que realizam autenticação válida. | Segurança |
| RNF03 | Interface responsiva e adaptável a múltiplos dispositivos | A interface do sistema deve preservar a usabilidade e adaptar os componentes visuais para resoluções de monitores desktop e dispositivos móveis. | Usabilidade |
| RNF04 | Interface com suporte a Modo Escuro alternável | O sistema deve disponibilizar a opção de "modo escuro" alternável para o usuário, aplicando uma paleta de cores escura e textos de alto contraste, preservando a legibilidade e consistência visual. | Usabilidade |
| RNF05 | Tempo de Resposta do Sistema ao Logar | Garantir tempo menor que 1 segundo para login | Desempenho |
| RNF06 | Tempo de Resposta do Sistema ao Buscar aluno | Garantir tempo menor que 1 segundo | Desempenho |
| RNF07 | Tempo de resposta do sistema para buscar turmas ou etapas | Garantir tempo menor que 1 segundo | Dese |
| RNF08 | Tempo de completo de card | | |
| RNF09 | Disponibilidade do sistema | O sistema deve estar acessível durante o funcionamento comercial da creche | Confiabilidade |

# Tabela de Decisão dos Feedbacks
 
| ID | Decisão | Justificativa ou ajuste |
|---|---|---|
| RF1 | Parc. aceito | Consideramos a comunicação interna como parte do escopo, explicitamos os perfis que acessam o quadro de avisos e o que eles poderão fazer em relação a ele. Porém, a correção afirmou que o CP necessário para o requisito não existia, sendo que ele existe sim e é adequado ao requisito. Aceitamos criar um OE de comunicação interna. |
| RF2 | Parc. aceito | Explicitamos o tipo de usuário que se beneficiará da funcionalidade entregue por esse requisito, mas desconsideramos a correção do CP, dado que o CP relacionado ao requisito já existe e é adequado. Detalhamos o requisito seguindo as recomendações da correção, além de relacioná-lo com o CP4. |
| RF3 | Parc. aceito | Explicitamos o tipo de usuário que se beneficiará da funcionalidade entregue pelo requisito, retiramos os termos "pop-up" e "card" pelo fato de estar relacionado a regras de negócio de interface, criamos um OE de comunicação interna para tornar o requisito rastreável. Novamente, desconsideramos a correção relacionada à CP correspondente, por ela já existir. Como o requisito foi gramaticalmente reformulado, não foi necessário substituir "pop-up" por "notificação". A diferença entre o RF02 e o RF03 foi esclarecida e o tratamento para usuário offline foi estabelecido. |
| RF4 | Parc. aceito | A confusão em relação às permissões de exclusão de avisos foi esclarecida: todo usuário terá permissão de excluir um aviso do quadro de avisos para si mesmo, isto é, a exclusão de um aviso não o elimina do sistema inteiro, mas só da interface do usuário em específico. Foi esclarecido também que não há tela de confirmação de exclusão e, novamente, desconsideramos a correção em relação à CP correspondente, dado o fato dela já existir. |
| RF5 | Parc. aceito | A confusão referente ao cadastro foi estabelecida: o requisito estabelece o cadastro de matrículas de alunos no sistema. Desconsideramos a correção em relação à OE correspondente, dado que claramente ela se relaciona adequadamente com sua CP e, consequentemente, com o RF05. Explicitamos o tipo de usuário que se beneficiará com a funcionalidade entregue pelo requisito. |
| RF6 | Parc. aceito | Esclarecemos o beneficiado do requisito e quem vai executá-lo. Mas não esclarecemos entre os outros perfis, porque existe apenas um tipo de perfil no sistema. |
| RF7 | Parc. aceito | Esclarecemos o beneficiado do requisito e quem vai executá-lo. Mas não esclarecemos entre os outros perfis, porque existe apenas um tipo de perfil no sistema. |
| RF8 | Parc. aceito | O nome do requisito foi refeito e a descrição foi esclarecida, mas se mantém a nomenclatura "card de aluno", já que foi pedido do cliente. |
| RF9 | Aceito | Esclarecidos nomes de termos e fichas, esclarecido o usuário da funcionalidade. |
| RF10 | Parc. aceito | Esclarecido quem será o perfil usuário e sobre o que será editado, mas não é tratado sobre cards inativos e histórico de edições por ser tratado no RF11 e RF23, e a nomenclatura "card" continua. |
| RF11 | Parc. aceito | Refeitos o nome e a descrição do requisito, padronizados os nomes e esclarecida a descrição, mas o nome "card" permanece, pois foi pedido do cliente. |
| RF12 | Aceito | Reconsideramos o nome do requisito e explicitamos quem o executará. |
| RF13 | Parc. aceito | Esclarecido o perfil que pode vincular aluno à turma, mas desconsideramos o reajuste da CP7, pois ela já foi definida. |
| RF14 | Parc. aceito | Esclarecido o perfil autorizado a anexar documentos, mas desconsiderado o ajuste da CP, pois já havia sido realizado previamente. |
| RF15 | Aceito | Indicado o perfil autorizado e o efeito da edição. |
| RF16 | Aceito | Indicado quem poderá realizar download das fichas e CP reavaliado. |
| RF17 | Parc. aceito | Esclarecido quem consulta o histórico e indicados os dados apresentáveis na edição. Ainda que avaliada, não foi alterada a CP, por ser pertinente com o requisito. |
| RF18 | Parc. aceito | Foi explicitado o tipo de usuário que pode cadastrar uma nova etapa no sistema. Também o requisito foi separado em dois, para corrigir a confusão causada pelo requisito ter duas operações em um único requisito. No entanto, foi desconsiderado o ajuste da CP7, pois ela já foi definida. |
| RF19 | Parc. aceito | Explicitamos o tipo de usuário que pode inativar e definimos as consequências da inativação. O impedimento de novos vínculos com registros inativos ficou tratado no RF20. Foi desconsiderada a correção da CP, já que a CP7 já está definida, o que torna o requisito rastreável. |
| RF20 | Parc. aceito | Explicitamos o tipo de usuário autorizado a vincular e definimos de forma clara a regra de associação. Foi desconsiderada a correção da CP, já que a CP7 já está definida dentro da solução, o que torna o requisito rastreável. |
| RF21 | Parc. aceito | Explicitamos o tipo de usuário que realiza a busca dentro do sistema e definimos os critérios de entrada aceitos para proceder com a busca. O vínculo com a CP3 foi mantido. |
| RF22 | Parc. aceito | Explicitamos o tipo de usuário que realiza a busca dentro do sistema e definimos os critérios de busca aceitos. Definimos a mensagem exibida quando não há resultados e desconsideramos a correção da CP, já que a CP7 existe na solução, o que torna o requisito rastreável. |
| RF23 | Parc. aceito | A expressão "decisão de certeza" foi removida e deixamos explícito que o sistema solicita a confirmação do usuário ao salvar o preenchimento ou a edição de uma ficha, com as opções confirmar e cancelar. O vínculo com a CP2 foi mantido, já que, na versão atual, a CP2 trata da edição e atualização de cards de matrícula. |
| RNF1 | Não aceito | O requisito foi mantido sem a inclusão de controle de acesso baseado em papéis (RBAC). Todos os usuários do sistema pertencem à equipe administrativa da creche e têm o mesmo nível de acesso aos registros de matrícula. Nesse contexto, a restrição a usuários autenticados já atende à proteção exigida pela LGPD. |
| RNF2 | Aceito | A crítica era válida. Não havíamos definido um "critério" de autenticação, e o nome do requisito estava confuso. O ajuste foi definir o método de autenticação e alterar o nome do requisito. |
| RNF3 | Aceito | O requisito foi alterado de maneira a especificar a palavra vaga "responsivo". Estabelecemos a especificação e, com isso, criamos um critério de verificação. |
| RNF4 | Não aplicável | O comentário não tem ligação com o requisito. |
| RNF5 | Parcialmente aceito | Resolvemos o erro gramatical na descrição do requisito. Tirando isso, o problema descrito não tem ligação com o requisito. |
| RNF6 | Aceito | Resolvemos o erro gramatical na descrição do requisito. Além disso, definimos o critério de mensurabilidade para o requisito, dizendo que começamos a medir a partir do momento em que o botão é clicado. |
| RNF7 | Aceito | Resolvemos o erro de concordância gramatical. Além disso, reduzimos o tempo estimado de 10 segundos para 2 segundos em funcionamento normal do servidor. |
| RNF8 | Aceito | Resolvemos o erro de gramática na descrição do requisito. Também reduzimos o tempo estimado de 10 segundos para salvamento para 5 segundos e incluímos uma necessidade de mensagem de sucesso para mitigar possível dúvida sobre a integridade do sistema. |
| RNF9 | Aceito | Estabelecemos o horário comercial e condições de aceitação para o requisito. |
| RNF10 | Aceito | Aceitamos a sugestão e alteramos a descrição para dizer que o servidor, mesmo em carga, deve manter os tempos de resposta máximos estipulados nos outros RNFs. |