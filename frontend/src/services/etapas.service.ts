import type { Etapa, FiltroEstrutura, NovaEtapaPayload } from "@/types";
import { api } from "./api";
import { paramsDoFiltro } from "./turmas.service";

export async function listarEtapas(filtro?: FiltroEstrutura): Promise<Etapa[]> {
  const { data } = await api.get<Etapa[]>("/etapas", { params: paramsDoFiltro(filtro) });
  return data;
}

export async function criarEtapa(payload: NovaEtapaPayload): Promise<Etapa> {
  const { data } = await api.post<Etapa>("/etapas", payload);
  return data;
}
