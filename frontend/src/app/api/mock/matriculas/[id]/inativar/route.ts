import { NextResponse, type NextRequest } from "next/server";
import { erro, esperar, mockHabilitado, naoEncontrado, novoId, store, usuarioDaSessao } from "@/mocks/store";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!mockHabilitado()) return naoEncontrado();
  await esperar();

  const { usuario: autor, resposta } = usuarioDaSessao(request);
  if (resposta) return resposta;

  const { id } = await params;
  const matricula = store.matriculas.find((item) => item.id === id);
  if (!matricula) return erro(404, "NAO_ENCONTRADO");
  if (matricula.status === "INATIVA") return erro(409, "DADOS_INVALIDOS", "A matrícula já está inativa.");

  const agora = new Date().toISOString();
  matricula.status = "INATIVA";
  matricula.atualizadaEm = agora;
  matricula.historico.unshift({
    id: novoId(),
    data: agora,
    autor: autor.nome,
    tipo: "INATIVACAO",
    alteracoes: ["Matrícula alterada de ativa para inativa."],
  });
  return NextResponse.json(matricula);
}
