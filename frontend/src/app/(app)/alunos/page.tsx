import type { Metadata } from "next";
import { Suspense } from "react";
import { AlunosView } from "@/components/alunos/AlunosView";

export const metadata: Metadata = { title: "Alunos · SIGMA" };

// UC08 FP01 – Lista e busca de alunos (RF21). Abre o card do aluno (UC04).
export default function AlunosPage() {
  // useSearchParams (filtro `?turma=`) exige um limite de Suspense.
  return (
    <Suspense>
      <AlunosView />
    </Suspense>
  );
}
