import { NextResponse, type NextRequest } from "next/server";
import { alunoCard, buscarAluno } from "@/mocks/alunos";
import { erro, esperar, mockHabilitado, naoEncontrado, usuarioDaSessao } from "@/mocks/store";

/** UC08 FP01 (abrir card) / UC04 – `GET /alunos/{id}`. */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!mockHabilitado()) return naoEncontrado();
  await esperar();

  const { resposta } = usuarioDaSessao(request);
  if (resposta) return resposta;

  const registro = buscarAluno((await params).id);
  if (!registro) return erro(404, "NAO_ENCONTRADO");
  return NextResponse.json(alunoCard(registro));
}
