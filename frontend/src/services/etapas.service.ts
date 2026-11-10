import type { Etapa, FiltroEstrutura, NovaEtapaPayload } from "@/types";
import { api } from "./api";
import { paramsDoFiltro } from "./turmas.service";

interface BackendEtapa {
  id: number | string;
  nome: string;
  quantidadeTurmas?: number;
  status?: Etapa["status"];
}

export async function listarEtapas(filtro?: FiltroEstrutura): Promise<Etapa[]> {
  const { data } = await api.get<BackendEtapa[]>("/etapas", { params: paramsDoFiltro(filtro) });
  return data.map((etapa) => ({
    id: String(etapa.id),
    nome: etapa.nome,
    quantidadeTurmas: etapa.quantidadeTurmas ?? 0,
    status: etapa.status ?? "ATIVO",
  }));
}

export async function criarEtapa(payload: NovaEtapaPayload): Promise<Etapa> {
  const { data } = await api.post<BackendEtapa>("/etapas", payload);
  return {
    id: String(data.id),
    nome: data.nome,
    quantidadeTurmas: data.quantidadeTurmas ?? 0,
    status: data.status ?? "ATIVO",
  };
}
