import type {
  AlunoCard,
  AlunoResumo,
  DadosPessoaisAluno,
  FichaAluno,
  FichaHistorico,
  ReferenciaNome,
  RegistroHistorico,
  SituacaoFicha,
  StatusAluno,
  TermosAluno,
} from "@/types";
import { DOCUMENTOS_EXIGIDOS } from "@/lib/alunos";
import { novoId, store } from "./store";

/*
 * Estado e regras do mock para o UC04 (card do aluno) e o UC08 FP01 (busca de alunos).
 * Reproduz o contrato proposto ao backend; ver README do frontend.
 */

/**
 * Alteração de um campo, antes de ser gravada no histórico. Os valores de campos sensíveis
 * servem só para saber se houve mudança e são descartados ao gravar (`registrarAlteracoes`).
 */
export interface Alteracao {
  ficha: FichaHistorico;
  campo: string;
  anterior: string | null;
  novo: string | null;
  sensivel?: boolean;
}

export const ROTULO_STATUS: Record<StatusAluno, string> = {
  PENDENTE: "Pendente",
  ATIVO: "Ativo",
  INATIVO: "Inativo",
};

export interface AlunoRegistro {
  id: string;
  aluno: DadosPessoaisAluno;
  matricula: { anoLetivo: string; dataMatricula: string };
  etapaId: string | null;
  turmaId: string | null;
  /** Só guarda a inativação; PENDENTE/ATIVO é calculado pelas fichas (`statusAluno`). */
  status: "ATIVO" | "INATIVO";
  // Fichas ainda não implementadas no frontend: o mock guarda só se estão preenchidas.
  requerimentoPreenchido: boolean;
  socioeconomicaPreenchida: boolean;
  termos: TermosAluno;
  resumo: AlunoCard["resumo"];
  documentosEntregues: string[];
  historico: RegistroHistorico[]; // mais recente primeiro (RF17)
}

/** Lista de alunos do mock, criada na primeira utilização. */
export function alunos(): AlunoRegistro[] {
  return (store.alunos ??= seedAlunos());
}

export function buscarAluno(id: string): AlunoRegistro | undefined {
  return alunos().find((a) => a.id === id);
}

function texto(valor: string | null): string {
  return valor?.trim() ?? "";
}

/**
 * RF17 – grava uma linha por campo alterado, todas com a mesma data/hora e usuário.
 * Campos sem mudança são ignorados; campos sensíveis são gravados sem os valores.
 */
export function registrarAlteracoes(
  registro: AlunoRegistro,
  usuario: string,
  alteracoes: Alteracao[],
  dataHora = new Date().toISOString(),
): void {
  const linhas: RegistroHistorico[] = alteracoes
    .filter((a) => texto(a.anterior) !== texto(a.novo))
    .map((a) => {
      const sensivel = Boolean(a.sensivel);
      return {
        id: novoId(),
        dataHora,
        usuario,
        ficha: a.ficha,
        campo: a.campo,
        valorAnterior: sensivel ? null : texto(a.anterior) || null,
        valorNovo: sensivel ? null : texto(a.novo) || null,
        sensivel,
      };
    });
  registro.historico.unshift(...linhas);
}

/** Linha "Status" do card quando a operação muda o status calculado (RN06) ou a inativação. */
export function alteracaoStatus(antes: StatusAluno, depois: StatusAluno): Alteracao[] {
  return antes === depois ? [] : [{ ficha: "CARD", campo: "Status", anterior: ROTULO_STATUS[antes], novo: ROTULO_STATUS[depois] }];
}

function referenciaTurma(registro: AlunoRegistro): { turma: ReferenciaNome | null; etapa: ReferenciaNome | null } {
  const turma = registro.turmaId ? store.turmas.find((t) => t.id === registro.turmaId) : undefined;
  // A etapa do aluno passa a ser a etapa da turma vinculada.
  const etapaId = turma?.etapaId ?? registro.etapaId;
  const etapa = etapaId ? store.etapas.find((e) => e.id === etapaId) : undefined;
  return {
    turma: turma ? { id: turma.id, nome: turma.nome } : null,
    etapa: etapa ? { id: etapa.id, nome: etapa.nome } : null,
  };
}

function situacaoFichas(registro: AlunoRegistro): Record<FichaAluno, SituacaoFicha> {
  const { termos } = registro;
  return {
    requerimento: registro.requerimentoPreenchido ? "PREENCHIDA" : "PENDENTE",
    socioeconomica: registro.socioeconomicaPreenchida ? "PREENCHIDA" : "PENDENTE",
    usoImagem: termos.usoImagem ? "PREENCHIDA" : "PENDENTE",
    saida: termos.saida ? "PREENCHIDA" : "PENDENTE",
    compromisso: termos.compromisso ? "PREENCHIDA" : "PENDENTE",
  };
}

/** RN06: a matrícula só fica ativa com todas as fichas completas; até lá, Pendente. */
export function statusAluno(registro: AlunoRegistro): StatusAluno {
  if (registro.status === "INATIVO") return "INATIVO";
  const completas = Object.values(situacaoFichas(registro)).every((situacao) => situacao === "PREENCHIDA");
  return completas ? "ATIVO" : "PENDENTE";
}

export function alunoResumo(registro: AlunoRegistro): AlunoResumo {
  return {
    id: registro.id,
    nome: registro.aluno.nome,
    dataNascimento: registro.aluno.dataNascimento,
    status: statusAluno(registro),
    ...referenciaTurma(registro),
    fichas: situacaoFichas(registro),
  };
}

export function alunoCard(registro: AlunoRegistro): AlunoCard {
  const ultima = registro.historico[0];
  return {
    id: registro.id,
    aluno: registro.aluno,
    matricula: registro.matricula,
    status: statusAluno(registro),
    ...referenciaTurma(registro),
    fichas: situacaoFichas(registro),
    termos: registro.termos,
    resumo: registro.resumo,
    documentos: DOCUMENTOS_EXIGIDOS.map((nome) => ({
      nome,
      situacao: registro.documentosEntregues.includes(nome) ? "ENTREGUE" : "PENDENTE",
    })),
    // O registro mais recente do histórico é o mesmo exibido em "Última edição em..." (RF17).
    ultimaEdicao: ultima ? { data: ultima.dataHora, autor: ultima.usuario } : null,
  };
}

// ---------- Dados de exemplo (fictícios) ----------

const CRIACAO_SEED = "2026-02-02T13:00:00Z";

/** Linha de histórico do seed. Campos sensíveis são criados sem valores, como no backend. */
function linha(
  id: string,
  dataHora: string,
  usuario: string,
  ficha: FichaHistorico,
  campo: string,
  valorAnterior: string | null,
  valorNovo: string | null,
): RegistroHistorico {
  return { id, dataHora, usuario, ficha, campo, valorAnterior, valorNovo, sensivel: false };
}

function linhaSensivel(id: string, dataHora: string, usuario: string, ficha: FichaHistorico, campo: string): RegistroHistorico {
  return { id, dataHora, usuario, ficha, campo, valorAnterior: null, valorNovo: null, sensivel: true };
}

function linhaCriacao(id: string, dataHora = CRIACAO_SEED, usuario = "Secretaria"): RegistroHistorico {
  return linha(`${id}-h0`, dataHora, usuario, "CARD", "Status", null, "Pendente (card criado)");
}

/**
 * Data/hora relativa ao início do servidor, no horário de Brasília (UTC−3), para que o
 * filtro padrão "Últimos 30 dias" sempre tenha registros na demonstração.
 */
function diasAtras(dias: number, hora: number, minuto: number): string {
  const data = new Date();
  data.setUTCDate(data.getUTCDate() - dias);
  data.setUTCHours(hora + 3, minuto, 0, 0);
  return data.toISOString();
}

/** Histórico de exemplo da Ana Clara, baseado no protótipo "UC04 – Histórico de edições". */
function historicoAnaClara(): RegistroHistorico[] {
  const d1 = diasAtras(1, 14, 32);
  const d3 = diasAtras(3, 9, 15);
  const d12 = diasAtras(12, 16, 40);
  const d18 = diasAtras(18, 11, 20);
  const d25 = diasAtras(25, 8, 47);
  const d45 = diasAtras(45, 10, 5);
  const d60 = diasAtras(60, 15, 10);
  const d120 = diasAtras(120, 10, 2);
  return [
    linha("a1-h14", d1, "Secretaria", "REQUERIMENTO", "Telefone", "(61) 9 1111-1111", "(61) 9 0000-0000"),
    linha("a1-h13", d3, "Secretária 2", "SOCIOECONOMICA", "Moradia", "Cedido", "Alugado"),
    linha("a1-h12", d3, "Secretária 2", "SOCIOECONOMICA", "Valor mensal pago", null, "R$ 0,00"),
    linhaSensivel("a1-h11", d3, "Secretária 2", "SOCIOECONOMICA", "Renda familiar"),
    linha("a1-h10", d12, "Secretaria", "USO_IMAGEM", "Autoriza uso da imagem", "Não autoriza", "Sim, autoriza"),
    linha(
      "a1-h9",
      d18,
      "Secretaria",
      "REQUERIMENTO",
      "Endereço",
      "Quadra 00, Conjunto B, Setor 3 — Águas Lindas de Goiás",
      "Quadra 00, Conjunto A, Setor 5 — Águas Lindas de Goiás",
    ),
    linhaSensivel("a1-h8", d18, "Secretaria", "REQUERIMENTO", "Problemas de saúde"),
    linha("a1-h7", d25, "Secretária 2", "REQUERIMENTO", "Parentesco do responsável", null, "mãe"),
    linha("a1-h6", d45, "Secretaria", "DOCUMENTOS", "Anexo", null, "requerimento-assinado.pdf"),
    linha("a1-h5", d45, "Secretaria", "DOCUMENTOS", "Comprovante de residência", "Pendente", "Entregue"),
    linhaSensivel("a1-h4", d60, "Secretaria", "REQUERIMENTO", "CPF do aluno"),
    linhaSensivel("a1-h3", d60, "Secretaria", "REQUERIMENTO", "Cor/raça"),
    linha("a1-h2", d120, "Secretaria", "USO_IMAGEM", "Autoriza uso da imagem", null, "Não autoriza"),
    linha("a1-h1", d120, "Secretaria", "USO_IMAGEM", "Responsável legal", null, "Maria Souza"),
    linhaCriacao("a1"),
  ];
}

function pessoa(nome: string, dataNascimento: string, sexo: DadosPessoaisAluno["sexo"]): DadosPessoaisAluno {
  return {
    nome,
    dataNascimento,
    sexo,
    nis: "",
    rg: "",
    cpf: "",
    naturalidade: "Águas Lindas de Goiás",
    uf: "GO",
    nacionalidade: "Brasileira",
    corRaca: null,
  };
}

function registroBase(
  id: string,
  aluno: DadosPessoaisAluno,
  etapaId: string | null,
  turmaId: string | null,
  parcial: Partial<AlunoRegistro> = {},
): AlunoRegistro {
  return {
    id,
    aluno,
    matricula: { anoLetivo: "2026", dataMatricula: "2026-02-02" },
    etapaId,
    turmaId,
    status: "ATIVO",
    requerimentoPreenchido: false,
    socioeconomicaPreenchida: false,
    termos: { usoImagem: null, saida: null, compromisso: null },
    resumo: { responsavel: "", parentesco: "", telefone: "", endereco: "" },
    documentosEntregues: [],
    historico: [linhaCriacao(id)],
    ...parcial,
  };
}

/** Fichas e termos todos preenchidos: o aluno aparece como Ativo (RN06). */
function fichasCompletas(responsavel: string, parentesco: string, endereco: string): Partial<AlunoRegistro> {
  return {
    requerimentoPreenchido: true,
    socioeconomicaPreenchida: true,
    termos: {
      usoImagem: {
        responsavel: {
          nome: responsavel,
          nacionalidade: "Brasileira",
          estadoCivil: "Casada",
          rg: "0000000",
          cpf: "00000000000",
          endereco,
        },
        autoriza: true,
        local: "Águas Lindas de Goiás",
        data: "2026-02-03",
      },
      saida: {
        nomeResponsavel: responsavel,
        formaSaida: "RESPONSAVEIS",
        pessoasAutorizadas: [],
        local: "Águas Lindas de Goiás",
        data: "2026-02-03",
      },
      compromisso: {
        nomeResponsavel: responsavel,
        cpfResponsavel: "00000000000",
        modalidade: "Creche",
        regime: "Tempo integral",
        ciente: true,
        dataAssinatura: "2026-02-03",
      },
    },
    resumo: { responsavel, parentesco, telefone: "(61) 9 0000-0000", endereco },
  };
}

function seedAlunos(): AlunoRegistro[] {
  const endereco = "Quadra 00, Conjunto A, Lote 00, Setor 5 — Águas Lindas de Goiás";
  const anaClara = registroBase("a1", pessoa("Ana Clara Souza", "2024-03-12", "FEMININO"), "e1", "t1", {
    requerimentoPreenchido: true,
    socioeconomicaPreenchida: true,
    termos: {
      usoImagem: {
        responsavel: {
          nome: "Maria Souza",
          nacionalidade: "Brasileira",
          estadoCivil: "Solteira",
          rg: "0000000",
          cpf: "00000000000",
          endereco,
        },
        autoriza: true,
        local: "Águas Lindas de Goiás",
        data: "2026-02-03",
      },
      saida: null,
      compromisso: null,
    },
    resumo: {
      responsavel: "Maria Souza",
      parentesco: "mãe",
      telefone: "(61) 9 0000-0000",
      endereco: "Quadra 00, Conjunto A, Setor 5 — Águas Lindas de Goiás",
    },
    documentosEntregues: DOCUMENTOS_EXIGIDOS.slice(0, 3),
    historico: historicoAnaClara(),
  });

  const prototipo: AlunoRegistro[] = [
    anaClara,
    registroBase("a2", pessoa("Bruno Henrique Lima", "2023-08-05", "MASCULINO"), "e2", "t2"),
    registroBase(
      "a3",
      pessoa("Carla Mendes Rocha", "2022-01-21", "FEMININO"),
      "e3",
      "t3",
      fichasCompletas("Juliana Mendes", "mãe", endereco),
    ),
    registroBase("a4", pessoa("Davi Oliveira Santos", "2023-06-30", "MASCULINO"), "e2", "t2", {
      status: "INATIVO",
      // O histórico continua disponível para cards inativos.
      historico: [linha("a4-h1", diasAtras(20, 10, 30), "Coordenação", "CARD", "Status", "Pendente", "Inativo"), linhaCriacao("a4")],
    }),
    registroBase(
      "a5",
      pessoa("Eduarda Pereira Costa", "2022-11-14", "FEMININO"),
      "e3",
      "t3",
      fichasCompletas("Roberto Costa", "pai", endereco),
    ),
    registroBase("a6", pessoa("Felipe Araújo Nunes", "2024-04-09", "MASCULINO"), "e1", "t1"),
    registroBase("a7", pessoa("Giovana Ribeiro Alves", "2022-02-02", "FEMININO"), null, null),
  ];

  // Completa os 10 alunos de exemplo.
  const extras: AlunoRegistro[] = [
    registroBase("a8", pessoa("Heitor Almeida Dias", "2024-01-15", "MASCULINO"), "e1", "t1", {
      requerimentoPreenchido: true,
    }),
    registroBase(
      "a9",
      pessoa("Isabela Barbosa Esteves", "2023-02-08", "FEMININO"),
      "e2",
      "t2",
      fichasCompletas("Patrícia Barbosa", "mãe", endereco),
    ),
    registroBase("a10", pessoa("João Pedro Cardoso Ferreira", "2022-03-15", "MASCULINO"), "e3", "t3"),
  ];

  return [...prototipo, ...extras];
}
