# Nível de Abstração dos Requisitos
 
| Código do Requisito | Nome do Requisito | Nível de Abstração | Justificativa |
|---|---|---|---|
| RF01 | Disponibilizar quadro de avisos | Produto | Descreve como o sistema deve se comportar em relação à funcionalidade, é possível verificá-lo, mensurá-lo e testá-lo e orienta uma implementação. |
| RF02 | Lançar avisos | Produto | Descreve como o sistema deve se comportar em relação à funcionalidade, é possível verificá-lo, mensurá-lo e testá-lo e orienta uma implementação. Além de trazer detalhes concretos como "preenchimento de campo obrigatório". |
| RF03 | Exibir avisos | Produto | Descreve como o sistema deve se comportar em relação à funcionalidade, é possível verificá-lo, mensurá-lo e testá-lo e orienta uma implementação. Além de trazer detalhes concretos como uma condição. |
| RF04 | Apagar avisos | Produto | Descreve como o sistema deve se comportar em relação à funcionalidade, é possível verificá-lo, mensurá-lo e testá-lo e orienta uma implementação. Além de trazer detalhes concretos como um fluxo de interação, aparente no trecho: "[...] sem confirmação de exclusão". |
| RF05 | Cadastrar Usuários | Usuário | Não descreve como o sistema deve se comportar em relação à funcionalidade e não especifica detalhes concretos, explicitando o que o usuário é capaz de fazer. |
| RF06 | Realizar login | Usuário | Mesmo identificando mecanismos intrínsecos à funcionalidade, o sujeito ainda é o usuário e o que ele é capaz de fazer. |
| RF07 | Realizar logout | Usuário | O sujeito ligado à funcionalidade é o usuário e o requisito explicita uma capacidade dele dentro do sistema. |
| RF08 | Cadastrar card de aluno | Usuário | O sujeito ligado à funcionalidade é o usuário e o requisito explicita uma capacidade dele dentro do sistema. |
| RF09 | Preenchimento de fichas | Usuário | O sujeito ligado à funcionalidade é o usuário e o requisito explicita uma capacidade dele dentro do sistema. Além disso, não menciona os detalhes de cada ficha a serem preenchidos. |
| RF10 | Editar fichas do card | Usuário | O sujeito ligado à funcionalidade é o usuário e o requisito explicita uma capacidade dele dentro do sistema. |
| RF11 | Inativar card de aluno | Produto | Mesmo identificando mecanismos intrínsecos à funcionalidade, o sujeito ainda é o usuário e o que ele é capaz de fazer. |
| RF12 | Reativar card de aluno | Produto | Descreve como o sistema deve se comportar em relação à funcionalidade, é verificável e aplica restrições de acesso. |
| RF13 | Vincular aluno a turma | Usuário | O sujeito ligado à funcionalidade é o usuário e o requisito explicita uma capacidade dele dentro do sistema. |
| RF14 | Anexar documentos | Usuário | O sujeito ligado à funcionalidade é o usuário e o requisito explicita uma capacidade dele dentro do sistema. |
| RF15 | Editar documento | Produto | Descreve um comportamento mensurável e verificável do sistema em relação à funcionalidade, abrange detalhes concretos como condições. |
| RF16 | Baixar fichas e documentos | Usuário | Mesmo identificando mecanismos intrínsecos à funcionalidade, o sujeito ainda é o usuário e o que ele é capaz de fazer. |
| RF17 | Apresentar histórico de edições | Produto | Descreve um comportamento mensurável e verificável do sistema em relação à funcionalidade, abrange detalhes concretos como condições e campos de preenchimento. |
| RF18 | Cadastrar Etapa | Usuário | O sujeito ligado à funcionalidade é o usuário e o requisito explicita uma capacidade dele dentro do sistema. |
| RF19 | Inativar turma e etapa | Produto | Descreve um comportamento mensurável e verificável do sistema em relação à funcionalidade, abrange detalhes concretos como campos de preenchimento e alteração de dados. |
| RF20 | Vincular turma à etapa | Usuário | Mesmo identificando mecanismos intrínsecos à funcionalidade, o sujeito ainda é o usuário e o que ele é capaz de fazer. |
| RF21 | Buscar aluno pelo nome | Produto | Descreve um comportamento mensurável e verificável do sistema em relação à funcionalidade, abrange detalhes concretos como campos de preenchimento e suas determinadas regras e condições, além de também descrever os detalhes de saída e retorno. |
| RF22 | Buscar turmas e etapas | Produto | Descreve um comportamento mensurável e verificável do sistema em relação à funcionalidade, abrange detalhes concretos como campos de preenchimento e suas determinadas regras e condições, além de também descrever os detalhes de saída e retorno. |
| RF23 | Possibilitar salvamento de dados | Produto | Descreve um comportamento mensurável e verificável do sistema em relação à funcionalidade, abrange detalhes concretos como fluxo de interação com "Confirmar" e "Cancelar". |
| RF24 | Cadastrar Turma | Usuário | Mesmo identificando mecanismos intrínsecos à funcionalidade, o sujeito ainda é o usuário e o que ele é capaz de fazer. |
| RNF01 | Privacidade de Dados e Retenção Segura | Produto | O requisito apresenta um comportamento detalhado e restrições verificáveis. |
| RNF02 | Restrição de Acesso não Autenticado | Produto | O requisito apresenta um comportamento detalhado e restrições verificáveis. |
| RNF03 | Interface responsiva e adaptável a múltiplos dispositivos | Produto | O requisito apresenta um comportamento detalhado e restrições verificáveis. |
| RNF04 | Interface com suporte a Modo Escuro alternável | Produto | O requisito apresenta um comportamento detalhado e restrições verificáveis. |
| RNF05 | Tempo de Resposta do Sistema ao Logar | Produto | O requisito apresenta um comportamento detalhado e restrições verificáveis. |
| RNF06 | Tempo de Resposta do Sistema ao Buscar aluno | Produto | O requisito apresenta um comportamento detalhado e restrições verificáveis. |
| RNF07 | Tempo de resposta do sistema para buscar turmas ou etapas | Produto | O requisito apresenta um comportamento detalhado e restrições verificáveis. |
| RNF08 | Tempo de resposta para salvar uma ficha | Produto | O requisito apresenta um comportamento detalhado e restrições verificáveis. |
| RNF09 | Disponibilidade do sistema | Produto | O requisito apresenta um comportamento detalhado e restrições verificáveis. |
| RNF10 | Acessos Múltiplos | Produto | O requisito apresenta um comportamento detalhado e restrições verificáveis. |

# Tecnicas de Declaração de requisitos

|TÉCNICA|TIPO|ONDE FOI USADA|
|---|---|---|
|Texto Narrativo em Linguagem Natural|Narrativa Descritiva|Concepção do Projeto|
|Lista de Requisitos - Anteriormente|Declaração Estruturada|Fase de Elicitação e Descoberta|
|Declarações Textuais Estruturadas (Templates) - Atualmente|Declaração Estruturada|Fase de avaliação em pares|
|Histórias de Usuário|Declaração Orientada á valor| Validação do MVP e Consenso|
|Glossário de dados|Catálogo e Artefato Técnico|Fase futura|

---

Para a declaração de requisitos do projeto, a equipe utilizou diferentes técnicas ao longo das etapas do projeto, adequando a forma de representação de acordo ao objetivo de cada momento. Na concepção do projeto, foram utilizados textos narrativos em linguagem natural, do tipo narrativo descritivo, para apresentar de forma geral o contexto e as necessidades do sistema. Durante a fase de elicitação e descoberta foi utilizada a lista de requisitos, apresentando os requisitos individualmente. Posteriormente, durante a avaliação em pares, a técnica utilizada foi a de declarações textuais estruturadas por templates, para maior padronização e clareza na especificação dos requisitos. Além disso, a equipe utilizou de histórias de usuário para a validação e consenso sobre o MVP, por ser uma técnica que representa as necessidades a partir da perspectiva do usuário. Por fim, a equipe pretende usar, futuramente, um glossário de dados, com o objetivo de padronizar termos e melhorar a comunicação e entendimento da equipe.
