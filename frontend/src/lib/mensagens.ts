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

  // UC04 – Gerenciar Fichas de Matrícula
  cardCriado: "Card criado com sucesso",
  fichaSalva: "Ficha salva com sucesso",
  fichaSalvaDetalhe: "alteração registrada no histórico",
  cardInativado: "Card inativado",
  cardReativado: "Card reativado",
  alunoVinculado: "Aluno vinculado à turma",
  cpfEmUso: "Já existe um aluno cadastrado com este CPF.", // FE02 (RN07)
  matriculaInativa: "Este card está inativo e não pode ser editado. Reative o card para fazer alterações.", // FE03 (RN10)
  fichaIncompleta: "Preencha todos os campos obrigatórios destacados.", // FE01 (RN06)
  falhaSalvar: "Não foi possível salvar. Verifique a conexão e tente novamente; nenhum dado foi gravado.", // FE04
  turmaIndisponivel: "Esta turma não está mais ativa. Escolha outra turma.", // RN11
  alunoNaoEncontrado: "Card não encontrado. Ele pode ter sido removido ou o endereço está incorreto.",
  termoSaidaPendente: "Ficha pendente. Sem este termo preenchido, o aluno só pode sair da escola com o responsável.",
  termoCompromissoPendente:
    "Ficha pendente. O aluno só é matriculado com cópia de toda a documentação solicitada.",
  termoImagemPendente: "Ficha pendente. Enquanto este termo não for preenchido, a imagem do aluno não pode ser usada.",

  // UC08 – Consultar Registros (FA02)
  nenhumResultado: "Nenhum resultado encontrado",
  nenhumResultadoDica: "Confira a grafia ou busque por parte do nome.",
} as const;

/** Resumo fixo das normas do Termo de Compromisso Escolar (UC04). */
export const NORMAS_TERMO_COMPROMISSO = [
  "Entrada das 07h30 às 08h00; depois disso o portão é fechado.",
  "Saída das 16h00 às 17h00; atrasos constantes podem ser comunicados ao Conselho Tutelar.",
  "Entrada só com uniforme; a escola não se responsabiliza por celulares, joias ou brinquedos.",
  "A escola não administra medicação; em caso de febre, o responsável é chamado.",
  "Todo mês um responsável assina a lista de frequência.",
  "Faltas só são justificadas com atestado médico; faltas não justificadas podem levar à perda da vaga.",
] as const;
