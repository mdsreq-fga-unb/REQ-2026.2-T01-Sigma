import type { FiltroEstrutura, NovaTurmaPayload, Turma } from "@/types";
import { api } from "./api";

/** Remove parâmetros vazios: busca em branco e filtro "Todos" não são enviados. */
export function paramsDoFiltro({ busca, status }: FiltroEstrutura = {}) {
  return {
    busca: busca?.trim() || undefined,
    status: status || undefined,
  };
}

export async function listarTurmas(filtro?: FiltroEstrutura): Promise<Turma[]> {
  const { data } = await api.get<Turma[]>("/turmas", { params: paramsDoFiltro(filtro) });
  return data;
}

export async function criarTurma(payload: NovaTurmaPayload): Promise<Turma> {
  const { data } = await api.post<Turma>("/turmas", payload);
  return data;
}

export async function inativarTurma(id: string): Promise<Turma> {
  const { data } = await api.patch<Turma>(`/turmas/${encodeURIComponent(id)}/inativar`);
  return data;
}

export async function reativarTurma(id: string): Promise<Turma> {
  const { data } = await api.patch<Turma>(`/turmas/${encodeURIComponent(id)}/reativar`);
  return data;
}
