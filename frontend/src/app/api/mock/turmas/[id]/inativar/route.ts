import { NextResponse, type NextRequest } from "next/server";
import { turmaPublica } from "@/mocks/estrutura";
import { erro, esperar, mockHabilitado, naoEncontrado, store, usuarioDaSessao } from "@/mocks/store";

// UC06 FP04 – Inativar turma (RF19). Os alunos continuam vinculados (RN12).
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!mockHabilitado()) return naoEncontrado();
  await esperar();

  const { resposta } = usuarioDaSessao(request);
  if (resposta) return resposta;

  const { id } = await params;
  const turma = store.turmas.find((t) => t.id === id);
  if (!turma) return erro(404, "NAO_ENCONTRADO");
  if (turma.status === "INATIVO") return erro(409, "STATUS_INVALIDO", "A turma já está inativa.");

  turma.status = "INATIVO";
  return NextResponse.json(turmaPublica(turma));
}
