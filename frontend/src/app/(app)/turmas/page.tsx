import type { Metadata } from "next";
import { TurmasEtapasView } from "@/components/turmas/TurmasEtapasView";

export const metadata: Metadata = { title: "Turmas e etapas · SIGMA" };

// UC06 – Gerenciar Estrutura Escolar e UC08 – Consultar Registros (busca de turmas e etapas)
export default function TurmasPage() {
  return <TurmasEtapasView />;
}
