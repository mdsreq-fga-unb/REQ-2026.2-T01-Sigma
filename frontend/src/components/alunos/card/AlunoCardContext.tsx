"use client";

import { createContext, useContext } from "react";
import type { AlunoCard } from "@/types";

interface AlunoCardContextValue {
  card: AlunoCard;
  /** Substitui o card exibido pelo retornado pela API após uma operação. */
  atualizar: (card: AlunoCard) => void;
}

export const AlunoCardContext = createContext<AlunoCardContextValue | null>(null);

/** Card carregado pelo layout `/alunos/[id]`, compartilhado entre as abas. */
export function useAlunoCard(): AlunoCardContextValue {
  const ctx = useContext(AlunoCardContext);
  if (!ctx) throw new Error("useAlunoCard deve ser usado dentro do layout do card do aluno");
  return ctx;
}
