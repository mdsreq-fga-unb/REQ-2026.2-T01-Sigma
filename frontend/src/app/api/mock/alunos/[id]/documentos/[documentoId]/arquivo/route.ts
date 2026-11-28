import { type NextRequest } from "next/server";
import { buscarAluno } from "@/mocks/alunos";
import { contentDisposition } from "@/mocks/pdf";
import { erro, esperar, mockHabilitado, naoEncontrado, usuarioDaSessao } from "@/mocks/store";

/**
 * UC05 / RF16 – `GET /alunos/{id}/documentos/{documentoId}/arquivo`: baixa o PDF com o nome
 * original. Disponível também para cards inativos. Downloads não entram no histórico.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; documentoId: string }> },
) {
  if (!mockHabilitado()) return naoEncontrado();
  await esperar();

  const { resposta } = usuarioDaSessao(request);
  if (resposta) return resposta;

  const { id, documentoId } = await params;
  const registro = buscarAluno(id);
  if (!registro) return erro(404, "NAO_ENCONTRADO");
  const documento = registro.documentos.find((d) => d.id === documentoId);
  if (!documento) return erro(404, "NAO_ENCONTRADO", "Documento não encontrado. Atualize a página e tente novamente.");

  return new Response(documento.conteudo, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": contentDisposition(documento.nomeArquivo),
      "Cache-Control": "no-store",
    },
  });
}
