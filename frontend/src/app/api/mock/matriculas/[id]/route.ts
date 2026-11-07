import { NextResponse, type NextRequest } from "next/server";
import {
  alteracoesMatricula,
  cpfValido,
  dadosAlunoCompletos,
  fichasCompletas,
  obterPayloadMatricula,
} from "@/lib/matriculas";
import { erro, esperar, mockHabilitado, naoEncontrado, novoId, store, usuarioDaSessao } from "@/mocks/store";
import type { Matricula } from "@/types";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!mockHabilitado()) return naoEncontrado();
  await esperar();

  const { resposta } = usuarioDaSessao(request);
  if (resposta) return resposta;

  const { id } = await params;
  const matricula = store.matriculas.find((item) => item.id === id);
  if (!matricula) return erro(404, "NAO_ENCONTRADO");
  return NextResponse.json(matricula);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!mockHabilitado()) return naoEncontrado();
  await esperar();

  const { usuario: autor, resposta } = usuarioDaSessao(request);
  if (resposta) return resposta;

  const { id } = await params;
  const matricula = store.matriculas.find((item) => item.id === id);
  if (!matricula) return erro(404, "NAO_ENCONTRADO");
  if (matricula.status === "INATIVA") return erro(409, "MATRICULA_INATIVA");

  const payload = obterPayloadMatricula(await request.json().catch(() => null));
  if (!payload || !cpfValido(payload.aluno.cpf) || !dadosAlunoCompletos(payload.aluno)) {
    return erro(422, "DADOS_INVALIDOS");
  }
  if (!fichasCompletas(payload.fichas)) return erro(422, "FICHAS_INCOMPLETAS");
  if (store.matriculas.some((item) => item.id !== id && item.aluno.cpf === payload.aluno.cpf)) {
    return erro(409, "CPF_EM_USO");
  }
  if (
    store.matriculas.some(
      (item) =>
        item.id !== id &&
        item.aluno.numeroMatricula.toLowerCase() === payload.aluno.numeroMatricula.toLowerCase(),
    )
  ) {
    return erro(409, "MATRICULA_EM_USO");
  }

  const alteracoes = alteracoesMatricula(matricula, payload);
  if (alteracoes.length > 0) {
    matricula.aluno = payload.aluno;
    matricula.fichas = payload.fichas;
    matricula.atualizadaEm = new Date().toISOString();
    matricula.historico.unshift({
      id: novoId(),
      data: matricula.atualizadaEm,
      autor: autor.nome,
      tipo: "EDICAO",
      alteracoes,
    });
  }
  return NextResponse.json(matricula satisfies Matricula);
}
