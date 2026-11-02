import type { Metadata } from "next";
import { EmBreve } from "@/components/layout/EmBreve";
import { PageHeader } from "@/components/layout/PageHeader";

export const metadata: Metadata = { title: "Alunos · SIGMA" };

// Placeholder – UC04 (Gerenciar Fichas de Matrícula)
export default function AlunosPage() {
  return (
    <>
      <PageHeader title="Alunos" subtitle="Fichas de matrícula das crianças da creche." />
      <EmBreve casoDeUso="UC04 – Gerenciar Fichas de Matrícula" />
    </>
  );
}
