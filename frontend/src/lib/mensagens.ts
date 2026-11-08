// Textos exibidos ao usuário, conforme a especificação dos casos de uso.
export const MSG = {
  credenciaisInvalidas: "E-mail ou senha incorretos.",
  falhaConexao: "Não foi possível conectar ao servidor. Tente novamente mais tarde.",
  contaBloqueada:
    "Conta temporariamente bloqueada por excesso de tentativas. Tente novamente em 15 minutos.",
  contaInativa: "Acesso negado. Sua conta encontra-se inativa. Procure a administração.",
  sessaoInatividade: "Sua sessão foi encerrada após 30 minutos de inatividade. Entre novamente.",
  semPermissao: "Somente administradores podem realizar esta ação.",
  emailEmUso: "Este e-mail já está em uso por outro usuário.",
  senhaForaPadrao:
    "A senha deve conter no mínimo 8 caracteres, incluindo letras, números e caracteres especiais.",
  senhasNaoCoincidem: "As senhas não coincidem.",
  erroInesperado: "Ocorreu um erro inesperado. Tente novamente.",

  // UC06 – Gerenciar Estrutura Escolar
  camposObrigatorios: "Preencha todos os campos obrigatórios.", // FE01 (RN22)
  etapaNomeEmUso: "Já existe uma etapa cadastrada com esse nome.", // FE02 (RN13)
  turmaNomeEmUso: "Já existe uma turma com esse nome na etapa.", // FE03 (RN14)
  semEtapasAtivas: "Não há etapas ativas cadastradas. Cadastre uma etapa antes de continuar.", // FE04
  vinculoInativo: "Não é possível criar vínculos com turmas ou etapas inativas.", // FE05 (RN11)
  etapaCadastrada: "Etapa cadastrada com sucesso",
  turmaCadastrada: "Turma cadastrada com sucesso",
  registroInativado: "Registro inativado com sucesso.",
  turmaReativada: "Turma reativada com sucesso.",

  // UC08 – Consultar Registros (FA02)
  nenhumResultado: "Nenhum resultado encontrado",
  nenhumResultadoDica: "Confira a grafia ou busque por parte do nome.",
} as const;
