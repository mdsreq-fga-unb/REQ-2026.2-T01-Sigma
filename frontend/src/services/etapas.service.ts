import type { Etapa, FiltroEstrutura, NovaEtapaPayload, StatusEstrutura } from "@/types";
import { api } from "./api";
import { paramsDoFiltro } from "./turmas.service";

/** O modelo de Etapa do backend não tem `status` nem `quantidadeTurmas`: toda etapa cadastrada é ativa. */
interface BackendEtapa {
  id: number | string;
  nome: string;
  quantidadeTurmas?: number;
  status?: StatusEstrutura;
}

function normalizarEtapa(e: BackendEtapa): Etapa {
  return {
    id: String(e.id),
    nome: e.nome,
    quantidadeTurmas: e.quantidadeTurmas ?? 0,
    status: e.status ?? "ATIVO",
  };
}

export async function listarEtapas(filtro?: FiltroEstrutura): Promise<Etapa[]> {
  const { data } = await api.get<BackendEtapa[]>("/etapas", { params: paramsDoFiltro(filtro) });
  return data.map(normalizarEtapa);
}

export async function criarEtapa(payload: NovaEtapaPayload): Promise<Etapa> {
  const { data } = await api.post<BackendEtapa>("/etapas", payload);
  return normalizarEtapa(data);
}
