import { NextResponse, type NextRequest } from "next/server";
import { fichasCompletas } from "@/lib/matriculas";
import { erro, esperar, mockHabilitado, naoEncontrado, novoId, store, usuarioDaSessao } from "@/mocks/store";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!mockHabilitado()) return naoEncontrado();
  await esperar();

  const { usuario: autor, resposta } = usuarioDaSessao(request);
  if (resposta) return resposta;

  const { id } = await params;
  const matricula = store.matriculas.find((item) => item.id === id);
  if (!matricula) return erro(404, "NAO_ENCONTRADO");
  if (matricula.status === "ATIVA") return erro(409, "DADOS_INVALIDOS", "A matrícula já está ativa.");
  if (!fichasCompletas(matricula.fichas)) return erro(422, "FICHAS_INCOMPLETAS");
  if (
    store.matriculas.some(
      (item) => item.id !== id && item.aluno.cpf === matricula.aluno.cpf && item.status === "ATIVA",
    )
  ) {
    return erro(409, "CPF_EM_USO");
  }

  const agora = new Date().toISOString();
  matricula.status = "ATIVA";
  matricula.atualizadaEm = agora;
  matricula.historico.unshift({
    id: novoId(),
    data: agora,
    autor: autor.nome,
    tipo: "REATIVACAO",
    alteracoes: ["Matrícula alterada de inativa para ativa."],
  });
  return NextResponse.json(matricula);
}
