import { NextResponse, type NextRequest } from "next/server";
import { correspondeBusca, etapaPublica, filtroDaUrl, mesmoNome } from "@/mocks/estrutura";
import { erro, esperar, mockHabilitado, naoEncontrado, novoId, store, usuarioDaSessao } from "@/mocks/store";

// UC08 FP02 – Buscar etapas (RF22). Inativas também aparecem (RN12).
export async function GET(request: NextRequest) {
  if (!mockHabilitado()) return naoEncontrado();
  await esperar();

  const { resposta } = usuarioDaSessao(request);
  if (resposta) return resposta;

  const { busca, status } = filtroDaUrl(request);
  const etapas = store.etapas
    .filter((e) => correspondeBusca(e.nome, busca) && (!status || e.status === status))
    .map(etapaPublica);
  return NextResponse.json(etapas);
}

// UC06 FP01 – Cadastrar etapa (RF18, RN13, RN22)
export async function POST(request: NextRequest) {
  if (!mockHabilitado()) return naoEncontrado();
  await esperar();

  const { resposta } = usuarioDaSessao(request);
  if (resposta) return resposta;

  const body = await request.json().catch(() => null);
  const nome = String(body?.nome ?? "").trim();
  if (!nome) return erro(422, "DADOS_INVALIDOS"); // RN22
  if (store.etapas.some((e) => mesmoNome(e.nome, nome))) return erro(409, "ETAPA_NOME_EM_USO"); // RN13

  const nova = { id: novoId(), nome, status: "ATIVO" as const };
  store.etapas.push(nova);
  return NextResponse.json(etapaPublica(nova), { status: 201 });
}
