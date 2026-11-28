import { NextResponse, type NextRequest } from "next/server";
import { buscarAluno, documentosAluno, registrarAlteracoes } from "@/mocks/alunos";
import { lerUpload } from "@/mocks/documentos";
import { erro, esperar, mockHabilitado, naoEncontrado, usuarioDaSessao } from "@/mocks/store";

/**
 * UC05 FA01 / RF15 – `PUT /alunos/{id}/documentos/{documentoId}` (`multipart/form-data`: `arquivo`).
 * Troca o PDF anexado: o arquivo anterior é descartado e só o novo fica salvo (sem versões).
 * Bloqueado em cards inativos (RN10). Registra no histórico os nomes antigo e novo (RF17).
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; documentoId: string }> },
) {
  if (!mockHabilitado()) return naoEncontrado();
  await esperar();

  const { usuario: autor, resposta } = usuarioDaSessao(request);
  if (resposta) return resposta;

  const { id, documentoId } = await params;
  const registro = buscarAluno(id);
  if (!registro) return erro(404, "NAO_ENCONTRADO");
  const documento = registro.documentos.find((d) => d.id === documentoId);
  if (!documento) return erro(404, "NAO_ENCONTRADO", "Documento não encontrado. Atualize a página e tente novamente.");
  if (registro.status === "INATIVO") return erro(409, "MATRICULA_INATIVA");

  const lido = await lerUpload(request);
  if ("resposta" in lido) return lido.resposta;
  const { arquivo, conteudo } = lido.upload;

  const anterior = documento.nomeArquivo;
  documento.nomeArquivo = arquivo.name;
  documento.conteudo = conteudo;
  documento.anexadoEm = new Date().toISOString();

  // Um arquivo novo com o mesmo nome também é uma substituição e precisa aparecer no histórico.
  const novo = arquivo.name === anterior ? `${arquivo.name} (novo arquivo)` : arquivo.name;
  registrarAlteracoes(registro, autor.nome, [{ ficha: "DOCUMENTOS", campo: "Anexo", anterior, novo }]);
  return NextResponse.json(documentosAluno(registro));
}
