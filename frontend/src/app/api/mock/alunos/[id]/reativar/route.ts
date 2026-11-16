import { NextResponse, type NextRequest } from "next/server";
import { alunoCard, buscarAluno, registrarHistorico } from "@/mocks/alunos";
import { erro, esperar, mockHabilitado, naoEncontrado, usuarioDaSessao } from "@/mocks/store";

/** UC04 FA03 / RF12 – `PATCH /alunos/{id}/reativar`. */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!mockHabilitado()) return naoEncontrado();
  await esperar();

  const { usuario: autor, resposta } = usuarioDaSessao(request);
  if (resposta) return resposta;

  const registro = buscarAluno((await params).id);
  if (!registro) return erro(404, "NAO_ENCONTRADO");
  if (registro.status === "ATIVO") return erro(409, "STATUS_INVALIDO");

  registro.status = "ATIVO";
  registrarHistorico(registro, autor.nome, "Card reativado.");
  return NextResponse.json(alunoCard(registro));
}
