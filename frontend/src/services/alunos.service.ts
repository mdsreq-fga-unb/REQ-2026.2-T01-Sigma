import type {
  AlunoCard,
  AlunoResumo,
  BackendRequerimentoMatricula,
  BackendSocioeconomica,
  BackendTermoImagem,
  BackendTermoSaida,
  DadosPessoaisAluno,
  FichaAluno,
  FiltroAlunos,
  ListaAlunos,
  NovoAlunoPayload,
  SituacaoFicha,
  TermoAluno,
  TermoSaida,
  TermoUsoImagem,
  TermosAluno,
} from "@/types";
import { api, isApiError, usandoApiMock } from "./api";
import {
  obterRequerimento,
  obterSocioeconomica,
  obterTermoImagem,
  obterTermoSaida,
  salvarTermoImagem,
  salvarTermoSaida,
} from "./fichas.service";

/*
 * UC04 (card do aluno) e UC08 FP01 (busca de alunos).
 * Em modo mock o frontend usa `/alunos/*`. Em modo real (backend) as fichas/termos
 * existentes usam `/matriculas/{id}/*` e o id do card é o id da matrícula.
 */

/** Segmento da URL de cada termo em `PUT /alunos/{id}/termos/{termo}` (mock). */
const ROTA_TERMO: Record<TermoAluno, string> = {
  usoImagem: "uso-imagem",
  saida: "saida",
  compromisso: "compromisso",
};

function erroNaoSuportado(mensagem: string): never {
  throw { status: 501, code: "ERRO_DESCONHECIDO", message: mensagem };
}

function situacao(completa: boolean | undefined): SituacaoFicha {
  return completa ? "PREENCHIDA" : "PENDENTE";
}

function ignorar404<T>(promessa: Promise<T>): Promise<T | null> {
  return promessa.catch((erro) => {
    if (isApiError(erro) && (erro.status === 404 || erro.code === "NAO_ENCONTRADO")) return null;
    throw erro;
  });
}

function mapTermoImagemFrontParaBack(termo: TermoUsoImagem): unknown {
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
      autoriza: Boolean(termo.autoriza),
      local: termo.local,
      data: termo.data,
    },
  };
}

function mapTermoImagemBackParaFront(termo: BackendTermoImagem | null): TermoUsoImagem | null {
  if (!termo) return null;
  return {
    responsavel: {
      nome: termo.responsavel?.nome ?? "",
      nacionalidade: termo.responsavel?.nacionalidade ?? "",
      estadoCivil: (termo.responsavel?.estado_civil as string | undefined) ?? "",
      rg: termo.responsavel?.rg ?? "",
      cpf: termo.responsavel?.cpf ?? "",
      endereco: termo.responsavel?.residente_em ?? "",
    },
    autoriza: termo.autorizacao?.autoriza ?? null,
    local: termo.autorizacao?.local ?? "",
    data: termo.autorizacao?.data ?? "",
  };
}

function mapTermoSaidaFrontParaBack(termo: TermoSaida): unknown {
  return {
    responsavel: termo.nomeResponsavel,
    periodo: termo.periodo ?? undefined,
    saida: {
      forma_saida: termo.formaSaida ?? "RESPONSAVEIS",
      descricao_outros: termo.formaSaida === "OUTROS" ? (termo.descricaoOutros ?? "") : undefined,
    },
    pessoas_autorizadas: (termo.pessoasAutorizadas ?? []).map((p) => ({
      ...(p.id ? { id: p.id } : {}),
      nome: p.nome,
      parentesco: p.parentesco,
    })),
    data: termo.data || undefined,
  };
}

function mapTermoSaidaBackParaFront(termo: BackendTermoSaida | null): TermoSaida | null {
  if (!termo) return null;
  return {
    nomeResponsavel: termo.responsavel ?? "",
    formaSaida: termo.saida?.forma_saida ?? null,
    pessoasAutorizadas: (termo.pessoas_autorizadas ?? []).map((p, i) => ({
      id: p.id ?? `pessoa-${i}`,
      nome: p.nome ?? "",
      parentesco: p.parentesco ?? "",
    })),
    local: "Escola/Creche Comunitária Social Tia Leonísia", // local fixo no backend (não editável)
    data: termo.data ?? "",
    periodo: termo.periodo ?? undefined,
    descricaoOutros: termo.saida?.descricao_outros ?? undefined,
  };
}

function alunoDeFichas(socio: BackendSocioeconomica | null, req: BackendRequerimentoMatricula | null): DadosPessoaisAluno {
  const dp = socio?.dados_pessoais;
  const nome = dp?.nome || req?.nome_aluno || "";
  const dataNascimento = dp?.data_nascimento || req?.data_nascimento || "";
  const corRaca = (dp?.cor_raca || req?.cor_raca || null) as DadosPessoaisAluno["corRaca"];
  const naturalidade = dp?.naturalidade || req?.naturalidade || "";
  const uf = dp?.naturalidade_uf || req?.uf_naturalidade || "";
  return {
    nome,
    dataNascimento,
    sexo: null,
    nis: "",
    rg: "",
    cpf: req?.cpf_aluno ?? "",
    naturalidade,
    uf,
    nacionalidade: "Brasileira",
    corRaca,
  };
}

function resumoDeFichas(socio: BackendSocioeconomica | null): { responsavel: string; parentesco: string; telefone: string; endereco: string } {
  const e = socio?.endereco;
  const endereco = e ? [e.logradouro, e.numero, e.bairro, e.uf_residencia, e.cep].filter(Boolean).join(", ") : "";
  const telefone = socio?.contato?.celular || socio?.contato?.telefone_contato || "";
  const responsavel = socio?.declaracao?.nome || "";
  return { responsavel, parentesco: "", telefone, endereco };
}

function fichasDeBackend(
  socio: BackendSocioeconomica | null,
  req: BackendRequerimentoMatricula | null,
  img: BackendTermoImagem | null,
  saida: BackendTermoSaida | null,
): Record<FichaAluno, SituacaoFicha> {
  return {
    requerimento: situacao(req?.completo),
    socioeconomica: situacao(socio?.completa),
    usoImagem: situacao(img?.completo),
    saida: situacao(saida?.completo),
    compromisso: "PENDENTE", // backend ainda não expõe termo de compromisso
  };
}

async function comporCardReal(id: string): Promise<AlunoCard> {
  const [socio, req, img, saida] = await Promise.all([
    ignorar404(obterSocioeconomica(id)),
    ignorar404(obterRequerimento(id)),
    ignorar404(obterTermoImagem(id)),
    ignorar404(obterTermoSaida(id)),
  ]);

  if (!socio && !req && !img && !saida) {
    throw { status: 404, code: "NAO_ENCONTRADO", message: "Matrícula não encontrada." };
  }

  const fichas = fichasDeBackend(socio, req, img, saida);
  const termos: TermosAluno = {
    usoImagem: mapTermoImagemBackParaFront(img),
    saida: mapTermoSaidaBackParaFront(saida),
    compromisso: null,
  };

  return {
    id,
    aluno: alunoDeFichas(socio, req),
    matricula: { anoLetivo: req?.ano ? String(req.ano) : "", dataMatricula: "" },
    etapa: null,
    turma: null,
    status: "ATIVO",
    fichas,
    termos,
    resumo: resumoDeFichas(socio),
    documentos: [],
    ultimaEdicao: null,
  };
}

export async function listarAlunos({ busca, status, turmaId, pagina, tamanhoPagina }: FiltroAlunos = {}): Promise<ListaAlunos> {
  if (!usandoApiMock) {
    // Backend não possui endpoint agregado de listagem/busca de alunos (UC08/UC04 card list).
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
  if (!usandoApiMock) return comporCardReal(id);
  const { data } = await api.get<AlunoCard>(`/alunos/${encodeURIComponent(id)}`);
  return data;
}

export async function criarAluno(payload: NovoAlunoPayload): Promise<AlunoCard> {
  if (!usandoApiMock) erroNaoSuportado("A criação do card do aluno ainda não está disponível no backend.");
  const { data } = await api.post<AlunoCard>("/alunos", payload);
  return data;
}

export async function salvarTermo<T extends TermoAluno>(
  id: string,
  termo: T,
  payload: NonNullable<TermosAluno[T]>,
): Promise<AlunoCard> {
  if (!usandoApiMock) {
    if (termo === "usoImagem") {
      await salvarTermoImagem(id, mapTermoImagemFrontParaBack(payload as TermoUsoImagem));
      return comporCardReal(id);
    }
    if (termo === "saida") {
      await salvarTermoSaida(id, mapTermoSaidaFrontParaBack(payload as TermoSaida));
      return comporCardReal(id);
    }
    erroNaoSuportado("O termo de compromisso ainda não está disponível no backend.");
  }
  const { data } = await api.put<AlunoCard>(`/alunos/${encodeURIComponent(id)}/termos/${ROTA_TERMO[termo]}`, payload);
  return data;
}

export async function inativarAluno(id: string): Promise<AlunoCard> {
  if (!usandoApiMock) erroNaoSuportado("A inativação do aluno ainda não está disponível no backend.");
  const { data } = await api.patch<AlunoCard>(`/alunos/${encodeURIComponent(id)}/inativar`);
  return data;
}

export async function reativarAluno(id: string): Promise<AlunoCard> {
  if (!usandoApiMock) erroNaoSuportado("A reativação do aluno ainda não está disponível no backend.");
  const { data } = await api.patch<AlunoCard>(`/alunos/${encodeURIComponent(id)}/reativar`);
  return data;
}

export async function vincularTurma(id: string, turmaId: string): Promise<AlunoCard> {
  if (!usandoApiMock) erroNaoSuportado("O vínculo do aluno à turma ainda não está disponível no backend.");
  const { data } = await api.patch<AlunoCard>(`/alunos/${encodeURIComponent(id)}/turma`, { turmaId });
  return data;
}
