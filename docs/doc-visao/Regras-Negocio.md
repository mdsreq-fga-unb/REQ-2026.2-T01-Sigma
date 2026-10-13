# Regras de Negócio
 
| ID | Regra de Negócio | Justificativa | Requisitos Relacionados |
|---|---|---|---|
| RN01 | Cada aluno pode ter apenas uma matrícula ativa por vez. | Evita duplicidade de registros e conflitos de turma. | RF08, RF09 |
| RN02 | Toda matrícula deve estar vinculada a exatamente uma turma e a uma etapa. | Estrutura organizacional da creche. | RF13, RF18, RF24 |
| RN03 | Uma matrícula só pode ser considerada ativa após o preenchimento completo das fichas obrigatórias: Termo de compromisso escolar, Termo de Autorização de uso de Imagem, Termo de autorização saída de aluno sem os responsáveis, Socioeconômica e Requerimento de Matrícula. | Garantir conformidade e documentação completa. | RF09, RF10 |
| RN04 | Uma turma deve estar obrigatoriamente vinculada a uma etapa existente. | Não pode existir turma solta. | RF18, RF24 |
| RN05 | Todos os documentos anexados devem estar em formato PDF. | Padronização e compatibilidade. | RF14, RF15 |
| RN06 | Campos obrigatórios devem ser validados antes do salvamento. | Garantir conformidade. | RF09, RF10, RF13 |
| RN07 | Impedir cadastro de dois alunos com a mesma matrícula ou CPF. | Evita conflito de dados. | RF08, RF21 |
| RN08 | Um aluno não pode estar matriculado em duas turmas simultaneamente. | Evitar duplicidade e conflito de horários. | RF13 |
| RN09 | A criação de um aviso exige data e autor registrados e só poderá ser publicado quando o assunto e descrição estiverem devidamente preenchidos. | Garante identificação e rastreabilidade. | RF02 |
| RN10 | Uma matrícula inativa correspondente a um aluno não poderá ser editada, só pode ser consultada e reativada. | Garante que registros inativos não sejam alterados. | RF10, RF11, RF13, RF14 |
| RN11 | Só turmas e etapas ativas podem receber novos vínculos. | Evita alocar matrículas em estruturas inativas. | RF13, RF20, RF24 |
| RN12 | Inativar uma turma ou etapa não elimina os vínculos existentes. | Preserva o histórico de alocação dos alunos. | RF19 |
| RN13 | Impedir cadastro de duas etapas com o mesmo nome. | Evita conflito de dados. | RF18, RF22 |
| RN14 | Impedir cadastro de duas turmas com o mesmo nome dentro da mesma etapa. | Evita conflito de dados. | RF22, RF24 |
| RN15 | As alterações na matrícula só são aplicadas após a confirmação. Se a operação for cancelada, os dados não serão salvos. | Evita salvamentos acidentais. | RF23, RF10 |
| RN16 | O sistema deve bloquear o acesso após 5 tentativas consecutivas de login inválidas. | Previne ataques de força bruta e garante a segurança do sistema. | RF06, RNF02 |
| RN17 | A sessão do usuário deve ser encerrada após 30 minutos de inatividade contínua. | Protege os dados sensíveis dos alunos caso o usuário tenha que sair do sistema e deixar ele logado. | RF07, RNF01, RNF02 |
| RN18 | Apenas contas com status "Ativo" podem acessar o sistema. Contas inativadas devem ser bloqueadas do sistema imediatamente. | Garantir que ex-funcionários e/ou pessoas não autorizadas percam acesso total ao sistema e aos dados nele contidos. | RF05, RF06, RNF02 |
| RN19 | Cada usuário deverá ser cadastrado no sistema com um e-mail único. | O e-mail atua como chave de identificação no login. E-mails duplicados geram falhas de autenticação e conflitos de contas. | RF05 |
| RN20 | O cadastro da senha de um novo usuário do sistema deve conter obrigatoriamente 8 caracteres, incluindo letras, números e caracteres especiais. | Garantir o nível mínimo de segurança contra acessos indevidos, apoiando a proteção de dados exigida pela LGPD. | RF05, RNF01 |
| RN21 | Um usuário não pode ter sua conta excluída de forma definitiva do banco de dados, apenas inativado. | Preservar a consistência e a rastreabilidade do sistema (manter o registro de quem criou um aviso ou editou uma matrícula, por exemplo). | RF05 |
| RN22 | O cadastro de etapa exige obrigatoriamente o nome. O cadastro de turma exige obrigatoriamente o nome e a etapa vinculada. | Sem o nome, não é possível aplicar as regras de unicidade (RN13 e RN14) nem buscar turmas e etapas. | RF18, RF24 |