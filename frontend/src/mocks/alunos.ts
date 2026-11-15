import type {
  AlunoCard,
  AlunoResumo,
  DadosPessoaisAluno,
  ReferenciaNome,
  StatusAluno,
  TermosAluno,
} from "@/types";
import { DOCUMENTOS_EXIGIDOS } from "@/lib/alunos";
import { novoId, store } from "./store";

/*
 * Estado e regras do mock para o UC04 (card do aluno) e o UC08 FP01 (busca de alunos).
 * Reproduz o contrato proposto ao backend; ver README do frontend.
 */

export interface HistoricoRegistro {
  id: string;
  data: string; // ISO 8601
  autor: string;
  descricao: string;
}

export interface AlunoRegistro {
  id: string;
  aluno: DadosPessoaisAluno;
  matricula: { anoLetivo: string; dataMatricula: string };
  etapaId: string | null;
  turmaId: string | null;
  status: StatusAluno;
  // Fichas ainda não implementadas no frontend: o mock guarda só se estão preenchidas.
  requerimentoPreenchido: boolean;
  socioeconomicaPreenchida: boolean;
  termos: TermosAluno;
  resumo: AlunoCard["resumo"];
  documentosEntregues: string[];
  historico: HistoricoRegistro[]; // mais recente primeiro (RF17)
}

/** Lista de alunos do mock, criada na primeira utilização. */
export function alunos(): AlunoRegistro[] {
  return (store.alunos ??= seedAlunos());
}

export function buscarAluno(id: string): AlunoRegistro | undefined {
  return alunos().find((a) => a.id === id);
}

export function registrarHistorico(registro: AlunoRegistro, autor: string, descricao: string): void {
  registro.historico.unshift({ id: novoId(), data: new Date().toISOString(), autor, descricao });
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

export function alunoResumo(registro: AlunoRegistro): AlunoResumo {
  return {
    id: registro.id,
    nome: registro.aluno.nome,
    dataNascimento: registro.aluno.dataNascimento,
    status: registro.status,
    ...referenciaTurma(registro),
  };
}

export function alunoCard(registro: AlunoRegistro): AlunoCard {
  const { termos } = registro;
  const ultima = registro.historico[0];
  return {
    id: registro.id,
    aluno: registro.aluno,
    matricula: registro.matricula,
    status: registro.status,
    ...referenciaTurma(registro),
    fichas: {
      requerimento: registro.requerimentoPreenchido ? "PREENCHIDA" : "PENDENTE",
      socioeconomica: registro.socioeconomicaPreenchida ? "PREENCHIDA" : "PENDENTE",
      usoImagem: termos.usoImagem ? "PREENCHIDA" : "PENDENTE",
      saida: termos.saida ? "PREENCHIDA" : "PENDENTE",
      compromisso: termos.compromisso ? "PREENCHIDA" : "PENDENTE",
    },
    termos,
    resumo: registro.resumo,
    documentos: DOCUMENTOS_EXIGIDOS.map((nome) => ({
      nome,
      situacao: registro.documentosEntregues.includes(nome) ? "ENTREGUE" : "PENDENTE",
    })),
    ultimaEdicao: ultima ? { data: ultima.data, autor: ultima.autor } : null,
  };
}

// ---------- Dados de exemplo (fictícios) ----------

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
    historico: [
      { id: `${id}-h1`, data: "2026-02-02T13:00:00Z", autor: "Secretaria", descricao: "Card criado." },
    ],
    ...parcial,
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
    historico: [
      {
        id: "a1-h2",
        data: "2026-10-10T17:32:00Z",
        autor: "Secretaria",
        descricao: "Termo de autorização de uso de imagem atualizado.",
      },
      { id: "a1-h1", data: "2026-02-02T13:00:00Z", autor: "Secretaria", descricao: "Card criado." },
    ],
  });

  const prototipo: AlunoRegistro[] = [
    anaClara,
    registroBase("a2", pessoa("Bruno Henrique Lima", "2023-08-05", "MASCULINO"), "e2", "t2"),
    registroBase("a3", pessoa("Carla Mendes Rocha", "2022-01-21", "FEMININO"), "e3", "t3"),
    registroBase("a4", pessoa("Davi Oliveira Santos", "2023-06-30", "MASCULINO"), "e2", "t2", { status: "INATIVO" }),
    registroBase("a5", pessoa("Eduarda Pereira Costa", "2022-11-14", "FEMININO"), "e3", "t3"),
    registroBase("a6", pessoa("Felipe Araújo Nunes", "2024-04-09", "MASCULINO"), "e1", "t1"),
    registroBase("a7", pessoa("Giovana Ribeiro Alves", "2022-02-02", "FEMININO"), null, null),
  ];

  // Completa os 10 alunos de exemplo.
  const extras: AlunoRegistro[] = [
    registroBase("a8", pessoa("Heitor Almeida Dias", "2024-01-15", "MASCULINO"), "e1", "t1", {
      requerimentoPreenchido: true,
    }),
    registroBase("a9", pessoa("Isabela Barbosa Esteves", "2023-02-08", "FEMININO"), "e2", "t2", {
      requerimentoPreenchido: true,
      socioeconomicaPreenchida: true,
    }),
    registroBase("a10", pessoa("João Pedro Cardoso Ferreira", "2022-03-15", "MASCULINO"), "e3", "t3"),
  ];

  return [...prototipo, ...extras];
}
