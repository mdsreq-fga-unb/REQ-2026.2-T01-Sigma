import { notFound } from "next/navigation";
import { TermoCompromisso } from "@/components/alunos/termos/TermoCompromisso";
import { TermoSaida } from "@/components/alunos/termos/TermoSaida";
import { TermoUsoImagem } from "@/components/alunos/termos/TermoUsoImagem";
import { EmBreve } from "@/components/layout/EmBreve";

// Abas do card do aluno. Termos: UC04 (RF09, RF10).
export default async function AlunoAbaPage({ params }: { params: Promise<{ aba: string }> }) {
  const { aba } = await params;
  switch (aba) {
    case "uso-imagem":
      return <TermoUsoImagem />;
    case "saida":
      return <TermoSaida />;
    case "compromisso":
      return <TermoCompromisso />;
    // Ainda não implementadas nesta iteração.
    case "requerimento":
      return <EmBreve casoDeUso="UC04 – Requerimento de matrícula" />;
    case "socioeconomica":
      return <EmBreve casoDeUso="UC04 – Ficha socioeconômica" />;
    case "documentos":
      return <EmBreve casoDeUso="UC05 – Documentos digitais" />;
    case "historico":
      return <EmBreve casoDeUso="UC04 – Histórico de edições (RF17)" />;
    default:
      notFound();
  }
}
