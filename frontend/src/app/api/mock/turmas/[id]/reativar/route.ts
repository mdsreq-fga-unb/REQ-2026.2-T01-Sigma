import { NextResponse, type NextRequest } from "next/server";
import { turmaPublica } from "@/mocks/estrutura";
import { erro, esperar, mockHabilitado, naoEncontrado, store, usuarioDaSessao } from "@/mocks/store";

// Reativar turma. Toda turma ativa precisa estar vinculada a uma etapa ativa (RN04, RN11).
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!mockHabilitado()) return naoEncontrado();
  await esperar();

  const { resposta } = usuarioDaSessao(request);
  if (resposta) return resposta;

  const { id } = await params;
  const turma = store.turmas.find((t) => t.id === id);
  if (!turma) return erro(404, "NAO_ENCONTRADO");
  if (turma.status === "ATIVO") return erro(409, "STATUS_INVALIDO", "A turma já está ativa.");

  const etapa = store.etapas.find((e) => e.id === turma.etapaId);
  if (!etapa || etapa.status !== "ATIVO") return erro(409, "ETAPA_INATIVA");

  turma.status = "ATIVO";
  return NextResponse.json(turmaPublica(turma));
}
