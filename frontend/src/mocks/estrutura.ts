import type { NextRequest } from "next/server";
import type { Etapa, StatusEstrutura, Turma } from "@/types";
import { store, type EtapaRegistro, type TurmaRegistro } from "./store";

/*
 * Regras do mock para UC06 (turmas e etapas) e UC08 FP02 (busca de turmas e etapas).
 * Reproduz o contrato proposto ao backend; ver README do frontend.
 */

const STATUS_VALIDOS: StatusEstrutura[] = ["ATIVO", "INATIVO"];

/** Lê `?busca=` e `?status=` da URL. Status ausente ou desconhecido = todos. */
export function filtroDaUrl(request: NextRequest): { busca: string; status: StatusEstrutura | null } {
  const params = request.nextUrl.searchParams;
  const status = params.get("status") as StatusEstrutura | null;
  return {
    busca: (params.get("busca") ?? "").trim(),
    status: status && STATUS_VALIDOS.includes(status) ? status : null,
  };
}

/**
 * RF22: nome completo ou parcial. Decisão do time (ponto em aberto 4 da issue):
 * a busca de turmas e etapas NÃO ignora acentos nem maiúsculas/minúsculas.
 */
export function correspondeBusca(nome: string, busca: string): boolean {
  return !busca || nome.includes(busca);
}

/** Comparação usada nas regras de nome duplicado (RN13, RN14). */
export function mesmoNome(a: string, b: string): boolean {
  return a.trim().toLocaleLowerCase("pt-BR") === b.trim().toLocaleLowerCase("pt-BR");
}

export function etapaPublica(etapa: EtapaRegistro): Etapa {
  return {
    ...etapa,
    // RN12: turmas inativas continuam vinculadas e entram na contagem.
    quantidadeTurmas: store.turmas.filter((t) => t.etapaId === etapa.id).length,
  };
}

export function turmaPublica({ etapaId, ...turma }: TurmaRegistro): Turma {
  const etapa = store.etapas.find((e) => e.id === etapaId);
  return { ...turma, etapa: { id: etapaId, nome: etapa?.nome ?? "—" } };
}
