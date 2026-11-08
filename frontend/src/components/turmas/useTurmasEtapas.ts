"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MSG } from "@/lib/mensagens";
import { isApiError } from "@/services/api";
import { listarEtapas } from "@/services/etapas.service";
import { listarTurmas } from "@/services/turmas.service";
import type { Etapa, FiltroEstrutura, StatusEstrutura, Turma } from "@/types";

export type FiltroStatus = "TODOS" | StatusEstrutura;

type Listagem =
  | { status: "carregando" }
  | { status: "erro"; mensagem: string }
  | { status: "ok"; turmas: Turma[]; etapas: Etapa[] };

/** Mensagem genérica para falhas da estrutura escolar (UC06 FE06, UC08 FE01/FE02). */
export function mensagemDeErro(error: unknown): string {
  return isApiError(error) && error.code === "FALHA_CONEXAO" ? MSG.falhaConexao : MSG.erroInesperado;
}

/**
 * Estado da tela "Turmas e etapas": as duas listagens são buscadas em paralelo
 * com o mesmo filtro (UC08 FP02). A busca só é disparada por `buscar()` (botão ou Enter).
 */
export function useTurmasEtapas() {
  const [termo, setTermo] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<FiltroStatus>("TODOS");
  const [aplicado, setAplicado] = useState<FiltroEstrutura>({});
  const [listagem, setListagem] = useState<Listagem>({ status: "carregando" });
  // Descarta respostas de buscas antigas que chegarem depois de uma mais recente.
  const ultimaRequisicao = useRef(0);

  const carregar = useCallback(async (filtro: FiltroEstrutura) => {
    const requisicao = ++ultimaRequisicao.current;
    setListagem({ status: "carregando" });
    try {
      const [turmas, etapas] = await Promise.all([listarTurmas(filtro), listarEtapas(filtro)]);
      if (requisicao === ultimaRequisicao.current) setListagem({ status: "ok", turmas, etapas });
    } catch (error) {
      if (requisicao === ultimaRequisicao.current) setListagem({ status: "erro", mensagem: mensagemDeErro(error) });
    }
  }, []);

  useEffect(() => {
    void carregar({});
  }, [carregar]);

  function buscar() {
    const filtro: FiltroEstrutura = {
      busca: termo.trim() || undefined,
      status: filtroStatus === "TODOS" ? undefined : filtroStatus,
    };
    setAplicado(filtro);
    void carregar(filtro);
  }

  function limparBusca() {
    setTermo("");
    setFiltroStatus("TODOS");
    setAplicado({});
    void carregar({});
  }

  const recarregar = useCallback(() => carregar(aplicado), [carregar, aplicado]);

  /** Atualiza uma linha após inativar/reativar, sem recarregar a página inteira. */
  function substituirTurma(turma: Turma) {
    setListagem((atual) =>
      atual.status === "ok"
        ? { ...atual, turmas: atual.turmas.map((t) => (t.id === turma.id ? turma : t)) }
        : atual,
    );
  }

  return {
    termo,
    setTermo,
    filtroStatus,
    setFiltroStatus,
    buscaAtiva: Boolean(aplicado.busca || aplicado.status),
    listagem,
    buscar,
    limparBusca,
    recarregar,
    substituirTurma,
  };
}
