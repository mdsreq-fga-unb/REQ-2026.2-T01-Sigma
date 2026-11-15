import type { Metadata } from "next";
import { NovoAlunoForm } from "@/components/alunos/NovoAlunoForm";

export const metadata: Metadata = { title: "Novo aluno · SIGMA" };

// UC04 FP01 – Novo aluno / cadastrar card (RF08).
export default function NovoAlunoPage() {
  return <NovoAlunoForm />;
}
