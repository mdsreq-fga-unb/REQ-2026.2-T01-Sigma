import type { FiltroEstrutura, NovaTurmaPayload, Turma } from "@/types";
import { api } from "./api";

interface TurmaBackend extends Omit<Turma, "id" | "etapa"> {
  id: number | string;
  etapa: { id: number | string; nome: string };
}

function normalizarTurma(turma: TurmaBackend): Turma {
  return {
    ...turma,
    id: String(turma.id),
    etapa: { ...turma.etapa, id: String(turma.etapa.id) },
  };
}

/** Remove parâmetros vazios: busca em branco e filtro "Todos" não são enviados. */
export function paramsDoFiltro({ busca, status }: FiltroEstrutura = {}) {
  return {
    busca: busca?.trim() || undefined,
    status: status || undefined,
  };
}

export async function listarTurmas(filtro?: FiltroEstrutura): Promise<Turma[]> {
  const { data } = await api.get<TurmaBackend[]>("/turmas", { params: paramsDoFiltro(filtro) });
  return data.map(normalizarTurma);
}

export async function criarTurma(payload: NovaTurmaPayload): Promise<Turma> {
  const { data } = await api.post<TurmaBackend>("/turmas", payload);
  return normalizarTurma(data);
}

export async function inativarTurma(id: string): Promise<Turma> {
  const { data } = await api.patch<TurmaBackend>(`/turmas/${encodeURIComponent(id)}/inativar`);
  return normalizarTurma(data);
}

export async function reativarTurma(id: string): Promise<Turma> {
  const { data } = await api.patch<TurmaBackend>(`/turmas/${encodeURIComponent(id)}/reativar`);
  return normalizarTurma(data);
}
