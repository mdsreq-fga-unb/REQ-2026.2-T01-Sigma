import { NextResponse, type NextRequest } from "next/server";
import { alunoCard, buscarAluno, registrarHistorico } from "@/mocks/alunos";
import { erro, esperar, mockHabilitado, naoEncontrado, usuarioDaSessao } from "@/mocks/store";

/** UC04 FA02 / RF11 – `PATCH /alunos/{id}/inativar`. Os dados não são apagados. */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!mockHabilitado()) return naoEncontrado();
  await esperar();

  const { usuario: autor, resposta } = usuarioDaSessao(request);
  if (resposta) return resposta;

  const registro = buscarAluno((await params).id);
  if (!registro) return erro(404, "NAO_ENCONTRADO");
  if (registro.status === "INATIVO") return erro(409, "STATUS_INVALIDO");

  registro.status = "INATIVO";
  registrarHistorico(registro, autor.nome, "Card inativado.");
  return NextResponse.json(alunoCard(registro));
}
