import type { Metadata } from "next";
import { EmBreve } from "@/components/layout/EmBreve";
import { PageHeader } from "@/components/layout/PageHeader";

export const metadata: Metadata = { title: "Turmas e etapas · SIGMA" };

// Placeholder – UC06 (Gerenciar Estrutura Escolar)
export default function TurmasPage() {
  return (
    <>
      <PageHeader title="Turmas e etapas" subtitle="Estrutura escolar da creche." />
      <EmBreve casoDeUso="UC06 – Gerenciar Estrutura Escolar" />
    </>
  );
}
