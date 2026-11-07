import type { Metadata } from "next";
import { MatriculasView } from "@/components/alunos/MatriculasView";

export const metadata: Metadata = { title: "Alunos · SIGMA" };

// UC04 – Gerenciar Fichas de Matrícula (RF08, RF09, RF10, RF11, RF12, RF17, RF23)
export default function AlunosPage() {
  return <MatriculasView />;
}
