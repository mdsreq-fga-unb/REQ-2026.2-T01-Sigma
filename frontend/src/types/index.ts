export type Perfil = "ADMINISTRADOR" | "USUARIO";

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  perfil: Perfil;
  ativo: boolean;
  criadoEm: string; // ISO 8601
  criadoPor: string | null; // nome de quem criou a conta
}

export interface Credenciais {
  email: string;
  senha: string;
}

export interface NovoUsuarioPayload {
  nome: string;
  email: string;
  administrador: boolean;
  senha: string;
}

export type StatusMatricula = "ATIVA" | "INATIVA";
export type TipoAlteracaoMatricula = "CRIACAO" | "EDICAO" | "INATIVACAO" | "REATIVACAO";

export interface DadosAluno {
  nome: string;
  cpf: string;
  numeroMatricula: string;
  dataNascimento: string;
  nomeResponsavel: string;
  telefoneResponsavel: string;
}

export interface FichasMatricula {
  socioeconomica: {
    rendaFamiliar: string;
    pessoasNaResidencia: string;
    situacaoMoradia: string;
    beneficioSocial: string;
  };
  imagem: {
    autorizada: boolean | null;
    responsavel: string;
  };
  saida: {
    autorizadaSemResponsavel: boolean | null;
    responsavel: string;
    pessoasAutorizadas: string;
  };
  compromisso: {
    aceito: boolean;
    responsavel: string;
  };
  requerimento: {
    anoLetivo: string;
    turmaPretendida: string;
    responsavel: string;
  };
}

export interface AlteracaoMatricula {
  id: string;
  data: string;
  autor: string;
  tipo: TipoAlteracaoMatricula;
  alteracoes: string[];
}

export interface Matricula {
  id: string;
  aluno: DadosAluno;
  fichas: FichasMatricula;
  status: StatusMatricula;
  criadaEm: string;
  atualizadaEm: string;
  historico: AlteracaoMatricula[];
}

export interface NovaMatriculaPayload {
  aluno: DadosAluno;
  fichas: FichasMatricula;
}

// UC06 / UC08 – Estrutura escolar (turmas e etapas)
export type StatusEstrutura = "ATIVO" | "INATIVO";

export interface EtapaResumo {
  id: string;
  nome: string;
}

export interface Etapa {
  id: string;
  nome: string;
  quantidadeTurmas: number; // turmas vinculadas, ativas e inativas (RN12)
  status: StatusEstrutura;
}

export interface Turma {
  id: string;
  nome: string;
  etapa: EtapaResumo;
  quantidadeAlunos: number;
  status: StatusEstrutura;
}

/** Parâmetros de busca (RF22). Sem `status` = todos. */
export interface FiltroEstrutura {
  busca?: string;
  status?: StatusEstrutura;
}

export interface NovaEtapaPayload {
  nome: string;
}

export interface NovaTurmaPayload {
  nome: string;
  etapaId: string;
}

/**
 * Códigos de erro do contrato com o backend. A API responde no formato do FastAPI:
 * `{ "detail": { "code": "<CODIGO>", "message": "..." } }`.
 */
export type ApiErrorCode =
  | "CREDENCIAIS_INVALIDAS" // UC01 FE01
  | "CONTA_BLOQUEADA" // UC01 FE04 (RN16)
  | "CONTA_INATIVA" // UC01 FE05 (RN18)
  | "NAO_AUTENTICADO" // UC01 FE02
  | "SEM_PERMISSAO" // UC02 – ação restrita a administradores
  | "EMAIL_EM_USO" // UC02 FE01 (RN19)
  | "SENHA_FORA_PADRAO" // UC02 FE04 (RN20)
  | "CPF_EM_USO" // UC04 FE02 (RN07)
  | "MATRICULA_EM_USO" // UC04 FE02 (RN07)
  | "MATRICULA_INATIVA" // UC04 FE03 (RN10)
  | "FICHAS_INCOMPLETAS" // UC04 FE01 (RN03, RN06)
  | "ETAPA_NOME_EM_USO" // UC06 FE02 (RN13)
  | "TURMA_NOME_EM_USO" // UC06 FE03 (RN14)
  | "ETAPA_INATIVA" // UC06 FE05 (RN11)
  | "STATUS_INVALIDO" // UC06 – turma já está no status pedido
  | "DADOS_INVALIDOS"
  | "NAO_ENCONTRADO"
  | "FALHA_CONEXAO" // UC01 FE03 / UC02 FE03 (gerado no cliente)
  | "ERRO_DESCONHECIDO";

export interface ApiError {
  status: number | null;
  code: ApiErrorCode;
  message?: string;
}
