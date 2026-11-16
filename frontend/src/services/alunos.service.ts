import type { AlunoCard, FiltroAlunos, ListaAlunos, NovoAlunoPayload, TermoAluno, TermosAluno } from "@/types";
import { api } from "./api";

/*
 * UC04 (card do aluno) e UC08 FP01 (busca de alunos).
 * O backend ainda não implementa estas rotas: em `npm run dev` elas são atendidas pelo mock
 * (`app/api/mock/alunos`). O contrato está descrito no README do frontend.
 */

/** Segmento da URL de cada termo em `PUT /alunos/{id}/termos/{termo}`. */
const ROTA_TERMO: Record<TermoAluno, string> = {
  usoImagem: "uso-imagem",
  saida: "saida",
  compromisso: "compromisso",
};

export async function listarAlunos({ busca, status, turmaId, pagina, tamanhoPagina }: FiltroAlunos = {}): Promise<ListaAlunos> {
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
  const { data } = await api.get<AlunoCard>(`/alunos/${encodeURIComponent(id)}`);
  return data;
}

export async function criarAluno(payload: NovoAlunoPayload): Promise<AlunoCard> {
  const { data } = await api.post<AlunoCard>("/alunos", payload);
  return data;
}

export async function salvarTermo<T extends TermoAluno>(
  id: string,
  termo: T,
  payload: NonNullable<TermosAluno[T]>,
): Promise<AlunoCard> {
  const { data } = await api.put<AlunoCard>(`/alunos/${encodeURIComponent(id)}/termos/${ROTA_TERMO[termo]}`, payload);
  return data;
}

export async function inativarAluno(id: string): Promise<AlunoCard> {
  const { data } = await api.patch<AlunoCard>(`/alunos/${encodeURIComponent(id)}/inativar`);
  return data;
}

export async function reativarAluno(id: string): Promise<AlunoCard> {
  const { data } = await api.patch<AlunoCard>(`/alunos/${encodeURIComponent(id)}/reativar`);
  return data;
}

export async function vincularTurma(id: string, turmaId: string): Promise<AlunoCard> {
  const { data } = await api.patch<AlunoCard>(`/alunos/${encodeURIComponent(id)}/turma`, { turmaId });
  return data;
}
