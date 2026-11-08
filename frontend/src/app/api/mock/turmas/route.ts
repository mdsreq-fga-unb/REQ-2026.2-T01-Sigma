import { NextResponse, type NextRequest } from "next/server";
import { correspondeBusca, filtroDaUrl, mesmoNome, turmaPublica } from "@/mocks/estrutura";
import { erro, esperar, mockHabilitado, naoEncontrado, novoId, store, usuarioDaSessao } from "@/mocks/store";

// UC08 FP02 – Buscar turmas (RF22). Inativas também aparecem (RN12).
export async function GET(request: NextRequest) {
  if (!mockHabilitado()) return naoEncontrado();
  await esperar();

  const { resposta } = usuarioDaSessao(request);
  if (resposta) return resposta;

  const { busca, status } = filtroDaUrl(request);
  const turmas = store.turmas
    .filter((t) => correspondeBusca(t.nome, busca) && (!status || t.status === status))
    .map(turmaPublica);
  return NextResponse.json(turmas);
}

// UC06 FP02 – Cadastrar turma (RF24, RN04, RN11, RN14, RN22)
export async function POST(request: NextRequest) {
  if (!mockHabilitado()) return naoEncontrado();
  await esperar();

  const { resposta } = usuarioDaSessao(request);
  if (resposta) return resposta;

  const body = await request.json().catch(() => null);
  const nome = String(body?.nome ?? "").trim();
  const etapaId = String(body?.etapaId ?? "");
  if (!nome || !etapaId) return erro(422, "DADOS_INVALIDOS"); // RN22

  const etapa = store.etapas.find((e) => e.id === etapaId);
  if (!etapa) return erro(422, "DADOS_INVALIDOS"); // RN04
  if (etapa.status !== "ATIVO") return erro(409, "ETAPA_INATIVA"); // RN11
  if (store.turmas.some((t) => t.etapaId === etapaId && mesmoNome(t.nome, nome))) {
    return erro(409, "TURMA_NOME_EM_USO"); // RN14
  }

  const nova = { id: novoId(), nome, etapaId, quantidadeAlunos: 0, status: "ATIVO" as const };
  store.turmas.push(nova);
  return NextResponse.json(turmaPublica(nova), { status: 201 });
}
