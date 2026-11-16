import type { Metadata } from "next";
import { AlunoCardShell } from "@/components/alunos/card/AlunoCardShell";

export const metadata: Metadata = { title: "Card do aluno · SIGMA" };

// UC04 – Card do aluno: cabeçalho, ações e abas compartilhados por todas as fichas.
export default function AlunoCardLayout({ children }: { children: React.ReactNode }) {
  return <AlunoCardShell>{children}</AlunoCardShell>;
}
