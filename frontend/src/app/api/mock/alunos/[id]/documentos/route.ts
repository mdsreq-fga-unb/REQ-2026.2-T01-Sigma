import { NextResponse, type NextRequest } from "next/server";
import { NOMES_TIPO_DOCUMENTO, ehTipoDocumento } from "@/lib/documentos";
import { buscarAluno, documentosAluno, registrarAlteracoes } from "@/mocks/alunos";
import { lerUpload } from "@/mocks/documentos";
import { erro, esperar, mockHabilitado, naoEncontrado, novoId, usuarioDaSessao } from "@/mocks/store";

/**
 * UC05 – `GET /alunos/{id}/documentos`: anexos do card (sem o conteúdo) e a data do aceite do
 * termo de compromisso, usada no prazo das pendências. Disponível também para cards inativos.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!mockHabilitado()) return naoEncontrado();
  await esperar();

  const { resposta } = usuarioDaSessao(request);
  if (resposta) return resposta;

  const registro = buscarAluno((await params).id);
  if (!registro) return erro(404, "NAO_ENCONTRADO");
  return NextResponse.json(documentosAluno(registro));
}

/**
 * UC05 FP01 / RF14 – `POST /alunos/{id}/documentos` (`multipart/form-data`: `arquivo`, `tipo`).
 * Só PDF (RN05), um arquivo por tipo (para trocar, usar o PUT de substituição) e bloqueado em
 * cards inativos (RN10). Registra o anexo no histórico (RF17).
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!mockHabilitado()) return naoEncontrado();
  await esperar();

  const { usuario: autor, resposta } = usuarioDaSessao(request);
  if (resposta) return resposta;

  const registro = buscarAluno((await params).id);
  if (!registro) return erro(404, "NAO_ENCONTRADO");
  if (registro.status === "INATIVO") return erro(409, "MATRICULA_INATIVA");

  const lido = await lerUpload(request);
  if ("resposta" in lido) return lido.resposta;
  const { arquivo, conteudo, tipo } = lido.upload;

  if (!ehTipoDocumento(tipo)) return erro(422, "DADOS_INVALIDOS", "Selecione o tipo de documento.");
  if (registro.documentos.some((d) => d.tipo === tipo)) {
    return erro(
      409,
      "DOCUMENTO_JA_ANEXADO",
      `Já existe um arquivo de "${NOMES_TIPO_DOCUMENTO[tipo]}". Use "Substituir" para trocá-lo.`,
    );
  }

  registro.documentos.push({
    id: novoId(),
    tipo,
    nomeArquivo: arquivo.name,
    anexadoEm: new Date().toISOString(),
    conteudo,
  });
  registrarAlteracoes(registro, autor.nome, [{ ficha: "DOCUMENTOS", campo: "Anexo", anterior: null, novo: arquivo.name }]);
  return NextResponse.json(documentosAluno(registro), { status: 201 });
}
