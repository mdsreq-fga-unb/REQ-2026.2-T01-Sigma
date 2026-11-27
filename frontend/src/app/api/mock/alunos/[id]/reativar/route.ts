import { NextResponse, type NextRequest } from "next/server";
import { alteracaoStatus, alunoCard, buscarAluno, registrarAlteracoes, statusAluno } from "@/mocks/alunos";
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

  const statusAntes = statusAluno(registro);
  registro.status = "ATIVO";
  registrarAlteracoes(registro, autor.nome, alteracaoStatus(statusAntes, statusAluno(registro)));
  return NextResponse.json(alunoCard(registro));
}
