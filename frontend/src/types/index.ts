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

// UC04 – Card do aluno / UC08 FP01 – busca de alunos
export type StatusAluno = "ATIVO" | "INATIVO";
export type Sexo = "MASCULINO" | "FEMININO";
export type CorRaca = "BRANCA" | "PRETA" | "PARDA" | "AMARELA" | "INDIGENA" | "NAO_DECLARADA";

export type StatusMatricula = "PENDENTE" | "ATIVA" | "INATIVA";
export type TipoAlteracaoMatricula = "CRIACAO" | "EDICAO" | "INATIVACAO" | "REATIVACAO";

/** Datas trafegam como `AAAA-MM-DD`; a interface exibe dd/mm/aaaa. */
export interface DadosPessoaisAluno {
  nome: string;
  dataNascimento: string;
  sexo: Sexo | null;
  nis: string;
  rg: string; // campo "ID" do protótipo
  cpf: string; // só dígitos; opcional
  naturalidade: string;
  uf: string;
  nacionalidade: string;
  corRaca: CorRaca | null;
}

export interface DadosMatriculaAluno {
  etapaId: string | null; // "Ano de escolaridade / etapa"
  anoLetivo: string;
  dataMatricula: string;
}

export interface DadosAluno {
  nome: string;
  cpf: string;
  numeroMatricula: string;
  dataNascimento: string;
  nomeResponsavel: string;
  telefoneResponsavel: string;
  sexo: string;
  nis: string;
  identidade: string;
  naturalidade: string;
  ufNaturalidade: string;
  nacionalidade: string;
  corRaca: string;
}

export interface DocumentoCivil {
  rg: string;
  orgaoEmissor: string;
  ufEmissor: string;
  dataExpedicao: string;
  tipoCertidao: "NASCIMENTO" | "CASAMENTO";
  numeroTermo: string;
  folha: string;
  livro: string;
  dataEmissao: string;
  nomeCartorio: string;
  ufCartorio: string;
  documentoEstrangeiro: string;
}

export interface DadosFiliacao {
  nome: string;
  escolaridade: string;
  localTrabalho: string;
  telefoneTrabalho: string;
}

export interface RenovacaoMatricula {
  data: string;
  ano: string;
  responsavel: string;
}

export interface FichaRequerimento {
  anoEscolaridade: string;
  anoLetivo: string;
  dataMatricula: string;
  documentacaoCivil: DocumentoCivil;
  filiacao: {
    pai: DadosFiliacao;
    mae: DadosFiliacao;
  };
  endereco: string;
  telefone: string;
  saude: {
    problemas: string[];
    observacoesProblemas: string;
    acompanhamentos: string[];
    observacoesAcompanhamento: string;
  };
  compromissoDocumentos: {
    responsavel: string;
    documentosEntregues: string[];
  };
  renovacoes: RenovacaoMatricula[];
  transferencia: {
    dataPedido: string;
    dataEntrega: string;
    responsavel: string;
  };
}

export interface MembroFamiliar {
  componente: string;
  profissao: string;
  idade: string;
  estadoCivil: string;
  escolaridade: string;
  rendaMensal: string;
}

export interface FichaSocioeconomica {
  endereco: {
    logradouro: string;
    numero: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
    telefone: string;
    celular: string;
    email: string;
  };
  moradia: {
    tipo: string;
    valorMensal: string;
    cedidoPor: string;
  };
  transporte: string;
  nucleoFamiliar: MembroFamiliar[];
  observacoes: string;
  outrasPropriedades: {
    possui: boolean;
    descricao: string;
  };
  declaracao: {
    responsavel: string;
    local: string;
    data: string;
  };
}

export interface FichasMatricula {
  socioeconomica: FichaSocioeconomica;
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
  requerimento: FichaRequerimento;
}

export interface HistoricoMatricula {
  id: string;
  data: string;
  autor: string;
  tipo: TipoAlteracaoMatricula;
  alteracoes: string[];
}

export type AlteracaoMatricula = HistoricoMatricula;

export interface Matricula {
  id: string;
  aluno: DadosAluno;
  fichas: FichasMatricula;
  status: StatusMatricula;
  criadaEm: string;
  atualizadaEm: string;
  historico: HistoricoMatricula[];
}

export interface NovaMatriculaPayload {
  aluno: DadosAluno;
  fichas: FichasMatricula;
}

/** RF08 – cria o card; fichas e termos são preenchidos depois, dentro do card. */
export interface NovoAlunoPayload {
  aluno: DadosPessoaisAluno;
  matricula: DadosMatriculaAluno;
}

export type FichaAluno = "requerimento" | "socioeconomica" | "usoImagem" | "saida" | "compromisso";
export type SituacaoFicha = "PREENCHIDA" | "PENDENTE";
export type SituacaoDocumento = "ENTREGUE" | "PENDENTE";

export interface ResponsavelLegal {
  nome: string;
  nacionalidade: string;
  estadoCivil: string; // texto livre
  rg: string;
  cpf: string;
  endereco: string; // "Residente em"
}

export interface TermoUsoImagem {
  responsavel: ResponsavelLegal;
  autoriza: boolean | null;
  local: string;
  data: string;
}

export type FormaSaida = "RESPONSAVEIS" | "TRANSPORTE_ESCOLAR" | "OUTROS";

export interface PessoaAutorizada {
  nome: string;
  parentesco: string;
}

export interface TermoSaida {
  nomeResponsavel: string;
  formaSaida: FormaSaida | null;
  pessoasAutorizadas: PessoaAutorizada[]; // máximo de 4
  local: string;
  data: string;
}

export interface TermoCompromisso {
  nomeResponsavel: string;
  cpfResponsavel: string;
  modalidade: string;
  regime: string;
  ciente: boolean; // "O responsável leu e assinou o termo"
  dataAssinatura: string;
}

/** Termos preenchidos no card. `null` = termo pendente. */
export interface TermosAluno {
  usoImagem: TermoUsoImagem | null;
  saida: TermoSaida | null;
  compromisso: TermoCompromisso | null;
}

export type TermoAluno = keyof TermosAluno;

export interface ReferenciaNome {
  id: string;
  nome: string;
}

export interface AlunoCard {
  id: string;
  aluno: DadosPessoaisAluno;
  matricula: { anoLetivo: string; dataMatricula: string };
  etapa: ReferenciaNome | null;
  turma: ReferenciaNome | null;
  status: StatusAluno;
  fichas: Record<FichaAluno, SituacaoFicha>;
  termos: TermosAluno;
  /** Dados do Requerimento de matrícula (ficha ainda não implementada). Vazio = não informado. */
  resumo: { responsavel: string; parentesco: string; telefone: string; endereco: string };
  documentos: { nome: string; situacao: SituacaoDocumento }[]; // UC05
  ultimaEdicao: { data: string; autor: string } | null; // RF17
}

/** Linha da lista de alunos (UC08 FP01). */
export interface AlunoResumo {
  id: string;
  nome: string;
  dataNascimento: string;
  turma: ReferenciaNome | null;
  etapa: ReferenciaNome | null;
  status: StatusAluno;
  fichas: Record<FichaAluno, SituacaoFicha>;
}

export interface FiltroAlunos {
  busca?: string;
  status?: StatusAluno;
  turmaId?: string;
  pagina?: number;
  tamanhoPagina?: number;
}

export interface ListaAlunos {
  itens: AlunoResumo[];
  total: number; // resultados do filtro
  totalCadastrados: number; // todos os cards
  pagina: number;
  tamanhoPagina: number;
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
  | "MATRICULA_EM_USO" // UC04 – matrícula já usada para outro cadastro
  | "MATRICULA_INATIVA" // UC04 FE03 (RN10)
  | "FICHAS_INCOMPLETAS" // UC04 FE01 (RN06)
  | "TURMA_INATIVA" // UC04 – vincular à turma (RN11)
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
