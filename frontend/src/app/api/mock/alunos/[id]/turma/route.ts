import { NextResponse, type NextRequest } from "next/server";
import { alunoCard, buscarAluno, registrarAlteracoes } from "@/mocks/alunos";
import { erro, esperar, mockHabilitado, naoEncontrado, store, usuarioDaSessao } from "@/mocks/store";

/**
 * UC04 – "Vincular à turma": `PATCH /alunos/{id}/turma` `{ turmaId }`.
 * Só turmas ativas de etapas ativas recebem vínculos (RN11); a etapa do aluno passa
 * a ser a etapa da turma. O mock só consulta turmas e etapas: não altera o estado da
 * tela de Turmas e etapas (que está sendo integrada ao backend).
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!mockHabilitado()) return naoEncontrado();
  await esperar();

  const { usuario: autor, resposta } = usuarioDaSessao(request);
  if (resposta) return resposta;

  const registro = buscarAluno((await params).id);
  if (!registro) return erro(404, "NAO_ENCONTRADO");
  if (registro.status === "INATIVO") return erro(409, "MATRICULA_INATIVA");

  const corpo = (await request.json().catch(() => null)) as { turmaId?: unknown } | null;
  const turma = typeof corpo?.turmaId === "string" ? store.turmas.find((t) => t.id === corpo.turmaId) : undefined;
  if (!turma) return erro(422, "DADOS_INVALIDOS");
  if (turma.status !== "ATIVO") return erro(409, "TURMA_INATIVA");
  if (store.etapas.find((e) => e.id === turma.etapaId)?.status !== "ATIVO") return erro(409, "ETAPA_INATIVA");

  if (registro.turmaId !== turma.id) {
    const nomeTurma = (id: string | null) => store.turmas.find((t) => t.id === id)?.nome ?? null;
    const nomeEtapa = (id: string | null) => store.etapas.find((e) => e.id === id)?.nome ?? null;
    const turmaAntes = nomeTurma(registro.turmaId);
    const etapaAntes = nomeEtapa(store.turmas.find((t) => t.id === registro.turmaId)?.etapaId ?? registro.etapaId);
    registro.turmaId = turma.id;
    registro.etapaId = turma.etapaId;
    registrarAlteracoes(registro, autor.nome, [
      { ficha: "CARD", campo: "Turma", anterior: turmaAntes, novo: turma.nome },
      { ficha: "CARD", campo: "Etapa", anterior: etapaAntes, novo: nomeEtapa(turma.etapaId) },
    ]);
  }
  return NextResponse.json(alunoCard(registro));
}
