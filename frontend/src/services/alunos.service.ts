import type {
  AlunoCard,
  AlunoVisaoGeralResponse,
  FiltroAlunos,
  FiltroHistorico,
  ListaAlunos,
  ListaHistorico,
  NovoAlunoPayload,
  SituacaoFicha,
  TermoAluno,
  TermoCompromisso,
  TermoSaida,
  TermoUsoImagem,
  TermosAluno,
} from "@/types";
import { api, isApiError, usandoApiMock } from "./api";
import {
  obterTermoImagem,
  obterTermoSaida,
  salvarTermoCompromisso,
  salvarTermoImagem,
  salvarTermoSaida,
} from "./fichas.service";

const ROTA_TERMO: Record<TermoAluno, string> = {
  usoImagem: "uso-imagem",
  saida: "saida",
  compromisso: "compromisso",
};

function situacao(completa: boolean): SituacaoFicha {
  return completa ? "PREENCHIDA" : "PENDENTE";
}

const RACA_BACKEND: Record<NonNullable<NovoAlunoPayload["aluno"]["corRaca"]>, string> = {
  BRANCA: "BRANCO",
  PRETA: "PRETO",
  PARDA: "PARDO",
  AMARELA: "AMARELO",
  INDIGENA: "INDIGENA",
  NAO_DECLARADO: "NAO_DECLARADO",
};

export function mapTermoImagemFrontParaBack(termo: TermoUsoImagem) {
  return {
    responsavel: {
      nome: termo.responsavel.nome,
      nacionalidade: termo.responsavel.nacionalidade,
      estado_civil: termo.responsavel.estadoCivil,
      rg: termo.responsavel.rg,
      cpf: termo.responsavel.cpf,
      residente_em: termo.responsavel.endereco,
    },
    autorizacao: {
      autoriza: termo.autoriza,
      local: termo.local,
      data: termo.data,
    },
  };
}

export function mapTermoImagemBackParaFront(
  termo: Awaited<ReturnType<typeof obterTermoImagem>> | null,
): TermoUsoImagem | null {
  if (!termo) return null;
  return {
    responsavel: {
      nome: termo.responsavel?.nome ?? "",
      nacionalidade: termo.responsavel?.nacionalidade ?? "",
      estadoCivil: termo.responsavel?.estado_civil ?? "",
      rg: termo.responsavel?.rg ?? "",
      cpf: termo.responsavel?.cpf ?? "",
      endereco: termo.responsavel?.residente_em ?? "",
    },
    autoriza: termo.autorizacao?.autoriza ?? null,
    local: termo.autorizacao?.local ?? "",
    data: termo.autorizacao?.data ?? "",
  };
}

export function mapTermoSaidaFrontParaBack(termo: TermoSaida) {
  return {
    responsavel: { nome: termo.nomeResponsavel },
    periodo: termo.periodo || undefined,
    saida: {
      forma_saida: termo.formaSaida,
      descricao_outros: termo.formaSaida === "OUTROS" ? (termo.descricaoOutros ?? "") : undefined,
    },
    pessoas_autorizadas: (termo.pessoasAutorizadas ?? []).map((p) => ({
      ...(p.id && /^\d+$/.test(p.id) ? { id: Number(p.id) } : {}),
      nome: p.nome,
      parentesco: p.parentesco,
    })),
    data: termo.data || undefined,
  };
}

export function mapTermoSaidaBackParaFront(
  termo: Awaited<ReturnType<typeof obterTermoSaida>> | null,
): TermoSaida | null {
  if (!termo) return null;
  return {
    nomeResponsavel: termo.responsavel?.nome ?? "",
    formaSaida: termo.saida?.forma_saida ?? null,
    pessoasAutorizadas: (termo.pessoas_autorizadas ?? []).map((p) => ({
      id: p.id === null || p.id === undefined ? undefined : String(p.id),
      nome: p.nome ?? "",
      parentesco: p.parentesco ?? "",
    })),
    local: termo.local ?? "",
    data: termo.data ?? "",
    periodo: termo.periodo ?? undefined,
    descricaoOutros: termo.saida?.descricao_outros ?? undefined,
  };
}

export function mapAlunoVisaoGeral(response: AlunoVisaoGeralResponse): AlunoCard {
  const { fichas, resumo } = response;
  const termos: TermosAluno = { usoImagem: null, saida: null, compromisso: null };
  return {
    id: String(response.id_aluno),
    idMatricula: String(response.id_matricula),
    aluno: {
      nome: response.nome,
      dataNascimento: response.data_nasc,
      sexo: null,
      nis: "",
      rg: "",
      cpf: "",
      naturalidade: "",
      uf: "",
      nacionalidade: "",
      corRaca: null,
    },
    matricula: { anoLetivo: String(response.ano_letivo), dataMatricula: response.data_matricula },
    etapa: response.etapa
      ? { id: String(response.etapa.id), nome: response.etapa.nome }
      : resumo.turma_etapa.etapa
        ? { id: "", nome: resumo.turma_etapa.etapa }
        : null,
    turma: response.turma
      ? { id: String(response.turma.id), nome: response.turma.nome }
      : resumo.turma_etapa.turma
        ? { id: "", nome: resumo.turma_etapa.turma }
        : null,
    status: response.status,
    fichas: {
      requerimento: situacao(fichas.requerimento.completa),
      socioeconomica: situacao(fichas.socioeconomica.completa),
      usoImagem: situacao(fichas.termo_imagem.completa),
      saida: situacao(fichas.termo_saida.completa),
      compromisso: situacao(fichas.termo_compromisso.completa),
    },
    termos,
    resumo: {
      responsavel: resumo.responsavel.nome,
      parentesco: resumo.responsavel.parentesco,
      telefone: resumo.telefone ?? resumo.responsavel.telefone ?? "",
      endereco: resumo.endereco ?? "",
    },
    documentos: response.documentos.itens.map((documento) => ({
      nome: documento.nome,
      situacao: documento.entregue ? "ENTREGUE" : "PENDENTE",
    })),
    ultimaEdicao: response.ultima_edicao
      ? { data: response.ultima_edicao.data, autor: response.ultima_edicao.autor }
      : null,
  };
}

function payloadCadastro(payload: NovoAlunoPayload) {
  return {
    aluno: {
      nome: payload.aluno.nome,
      data_nasc: payload.aluno.dataNascimento,
      sexo: payload.aluno.sexo,
      cpf: payload.aluno.cpf,
      nis: payload.aluno.nis,
      naturalidade: payload.aluno.naturalidade,
      uf: payload.aluno.uf,
      nacionalidade: payload.aluno.nacionalidade,
      raca: payload.aluno.corRaca ? RACA_BACKEND[payload.aluno.corRaca] : undefined,
    },
    responsavel: {
      nome: payload.responsavel.nome,
      parentesco: payload.responsavel.parentesco,
      cpf: payload.responsavel.cpf || undefined,
      telefone: payload.responsavel.telefone || undefined,
    },
    matricula: {
      id_etapa: payload.matricula.etapaId ? Number(payload.matricula.etapaId) : null,
      ano: Number(payload.matricula.anoLetivo),
      data_matricula: payload.matricula.dataMatricula,
    },
  };
}

export async function listarAlunos({ busca, status, turmaId, pagina, tamanhoPagina }: FiltroAlunos = {}): Promise<ListaAlunos> {
  if (usandoApiMock) {
    return {
      itens: [],
      total: 0,
      totalCadastrados: 0,
      pagina: pagina ?? 1,
      tamanhoPagina: tamanhoPagina ?? 20,
    };
  }
  const { data } = await api.get<ListaAlunos>("/alunos", {
    params: {
      busca: busca?.trim() || undefined,
      status: status || undefined,
      turmaId: turmaId || undefined,
      pagina,
      tamanhoPagina,
    },
  });
  return data;
}

export async function obterAluno(id: string): Promise<AlunoCard> {
  if (usandoApiMock) {
    const { data } = await api.get<AlunoCard>(`/alunos/${encodeURIComponent(id)}`);
    return data;
  }
  const { data } = await api.get<AlunoVisaoGeralResponse>(`/alunos/${encodeURIComponent(id)}`);
  return mapAlunoVisaoGeral(data);
}

export async function criarAluno(payload: NovoAlunoPayload): Promise<AlunoCard> {
  if (usandoApiMock) {
    const { data } = await api.post<AlunoCard>("/alunos", payload);
    return data;
  }
  try {
    const { data } = await api.post<AlunoVisaoGeralResponse>("/alunos", payloadCadastro(payload));
    return mapAlunoVisaoGeral(data);
  } catch (error) {
    if (isApiError(error) && error.status === 404) {
      throw { ...error, message: "A etapa selecionada não foi encontrada. Atualize a lista e tente novamente." };
    }
    throw error;
  }
}

export async function salvarTermo<T extends TermoAluno>(
  idAluno: string,
  idMatricula: string,
  termo: T,
  payload: NonNullable<TermosAluno[T]>,
): Promise<AlunoCard> {
  if (usandoApiMock) {
    const { data } = await api.put<AlunoCard>(
      `/alunos/${encodeURIComponent(idAluno)}/termos/${ROTA_TERMO[termo]}`,
      payload,
    );
    return data;
  }

  if (termo === "usoImagem") {
    await salvarTermoImagem(idMatricula, mapTermoImagemFrontParaBack(payload as TermoUsoImagem));
  } else if (termo === "saida") {
    await salvarTermoSaida(idMatricula, mapTermoSaidaFrontParaBack(payload as TermoSaida));
  } else {
    const compromisso = payload as TermoCompromisso;
    await salvarTermoCompromisso(idMatricula, {
      nome_responsavel: compromisso.nomeResponsavel,
      cpf_responsavel: compromisso.cpfResponsavel,
      modalidade: compromisso.modalidade,
      regime: compromisso.regime,
      assinatura: compromisso.ciente,
      data_assinatura: compromisso.dataAssinatura || null,
    });
  }
  return obterAluno(idAluno);
}

/**
 * UC04 / RF17 – `GET /alunos/{id}/historico?ficha=&usuario=&periodo=&pagina=&tamanhoPagina=`.
 * Somente leitura. Campos sensíveis chegam sem valores (`sensivel: true`).
 */
export async function listarHistorico(
  id: string,
  { ficha, usuario, periodo, pagina, tamanhoPagina }: FiltroHistorico = {},
): Promise<ListaHistorico> {
  if (!usandoApiMock) erroNaoSuportado("O histórico de edições ainda não está integrado ao backend.");
  const { data } = await api.get<ListaHistorico>(`/alunos/${encodeURIComponent(id)}/historico`, {
    params: {
      ficha: ficha || undefined,
      usuario: usuario || undefined,
      periodo: periodo || undefined,
      pagina,
      tamanhoPagina,
    },
  });
  return data;
}

export async function inativarAluno(id: string): Promise<AlunoCard> {
  if (usandoApiMock) throw { status: 501, code: "ERRO_DESCONHECIDO", message: "A inativação do aluno ainda não está disponível no backend." };
  const { data } = await api.patch<AlunoCard>(`/alunos/${encodeURIComponent(id)}/inativar`);
  return data;
}

export async function reativarAluno(id: string): Promise<AlunoCard> {
  if (usandoApiMock) throw { status: 501, code: "ERRO_DESCONHECIDO", message: "A reativação do aluno ainda não está disponível no backend." };
  const { data } = await api.patch<AlunoCard>(`/alunos/${encodeURIComponent(id)}/reativar`);
  return data;
}

export async function vincularTurma(id: string, turmaId: string): Promise<AlunoCard> {
  if (usandoApiMock) throw { status: 501, code: "ERRO_DESCONHECIDO", message: "O vínculo do aluno à turma ainda não está disponível no backend." };
  const { data } = await api.patch<AlunoCard>(`/alunos/${encodeURIComponent(id)}/turma`, { turmaId });
  return data;
}
