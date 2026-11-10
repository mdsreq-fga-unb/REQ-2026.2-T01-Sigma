import { NextResponse, type NextRequest } from "next/server";
import { cpfValido, dadosAlunoCompletos, fichasCompletas, obterPayloadMatricula } from "@/lib/matriculas";
import { erro, esperar, mockHabilitado, naoEncontrado, novoId, store, usuarioDaSessao } from "@/mocks/store";
import type { AlteracaoMatricula, Matricula } from "@/types";

export async function GET(request: NextRequest) {
  if (!mockHabilitado()) return naoEncontrado();
  await esperar();

  const { resposta } = usuarioDaSessao(request);
  if (resposta) return resposta;
  return NextResponse.json(store.matriculas);
}

export async function POST(request: NextRequest) {
  if (!mockHabilitado()) return naoEncontrado();
  await esperar();

  const { usuario: autor, resposta } = usuarioDaSessao(request);
  if (resposta) return resposta;

  const payload = obterPayloadMatricula(await request.json().catch(() => null));
  if (!payload || !cpfValido(payload.aluno.cpf) || !dadosAlunoCompletos(payload.aluno)) {
    return erro(422, "DADOS_INVALIDOS");
  }
  if (!fichasCompletas(payload.fichas)) return erro(422, "FICHAS_INCOMPLETAS");
  if (store.matriculas.some((item) => item.aluno.cpf === payload.aluno.cpf)) return erro(409, "CPF_EM_USO");
  if (
    store.matriculas.some(
      (item) => item.aluno.numeroMatricula.toLowerCase() === payload.aluno.numeroMatricula.toLowerCase(),
    )
  ) {
    return erro(409, "MATRICULA_EM_USO");
  }

  const agora = new Date().toISOString();
  const historico: AlteracaoMatricula = {
    id: novoId(),
    data: agora,
    autor: autor.nome,
    tipo: "CRIACAO",
    alteracoes: ["Card criado com dados do aluno e fichas obrigatórias."],
  };
  const nova: Matricula = {
    id: novoId(),
    ...payload,
    status: "ATIVA",
    criadaEm: agora,
    atualizadaEm: agora,
    historico: [historico],
  };
  store.matriculas.push(nova);
  return NextResponse.json(nova, { status: 201 });
}
