import { type NextRequest } from "next/server";
import { NOMES_FICHAS, isoParaData } from "@/lib/alunos";
import { buscarAluno } from "@/mocks/alunos";
import { contentDisposition, gerarPdfSimples } from "@/mocks/pdf";
import { erro, esperar, mockHabilitado, naoEncontrado, usuarioDaSessao } from "@/mocks/store";
import type { FichaAluno } from "@/types";

const FICHA_DA_ROTA: Record<string, { ficha: FichaAluno; arquivo: string }> = {
  requerimento: { ficha: "requerimento", arquivo: "requerimento" },
  socioeconomica: { ficha: "socioeconomica", arquivo: "socioeconomica" },
  "termo-imagem": { ficha: "usoImagem", arquivo: "termo-uso-imagem" },
  "termo-saida": { ficha: "saida", arquivo: "termo-saida" },
  "termo-compromisso": { ficha: "compromisso", arquivo: "termo-compromisso" },
};

/**
 * UC05 – `GET /matriculas/{id}/{ficha}/pdf`: no mock, um PDF simples com os dados do card, só
 * para exercitar os botões "Baixar fichas preenchidas em PDF". O PDF real é gerado pelo backend.
 * No mock, o id da matrícula é o próprio id do aluno.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string; ficha: string }> }) {
  if (!mockHabilitado()) return naoEncontrado();
  await esperar();

  const { resposta } = usuarioDaSessao(request);
  if (resposta) return resposta;

  const { id, ficha } = await params;
  const rota = FICHA_DA_ROTA[ficha];
  const registro = buscarAluno(id);
  if (!rota || !registro) return erro(404, "NAO_ENCONTRADO");

  const pdf = gerarPdfSimples(NOMES_FICHAS[rota.ficha], [
    `Aluno: ${registro.aluno.nome}`,
    `Data de nascimento: ${isoParaData(registro.aluno.dataNascimento)}`,
    `Responsável: ${registro.resumo.responsavel || "-"}`,
    `Ano letivo: ${registro.matricula.anoLetivo}`,
    "",
    "PDF de exemplo gerado pelo mock do SIGMA.",
    "Assinatura do responsável: ________________________________",
  ]);
  return new Response(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": contentDisposition(`${rota.arquivo}-${id}.pdf`),
      "Cache-Control": "no-store",
    },
  });
}
