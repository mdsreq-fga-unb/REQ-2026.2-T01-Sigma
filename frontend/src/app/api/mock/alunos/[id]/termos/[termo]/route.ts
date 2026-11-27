import { NextResponse, type NextRequest } from "next/server";
import { temErros, validarTermoCompromisso, validarTermoSaida, validarTermoUsoImagem } from "@/lib/alunos";
import {
  alteracaoStatus,
  alunoCard,
  buscarAluno,
  registrarAlteracoes,
  statusAluno,
  type Alteracao,
} from "@/mocks/alunos";
import { lerTermoCompromisso, lerTermoSaida, lerTermoUsoImagem } from "@/mocks/alunosPayload";
import { alteracoesCompromisso, alteracoesSaida, alteracoesUsoImagem } from "@/mocks/historico";
import { erro, esperar, mockHabilitado, naoEncontrado, usuarioDaSessao } from "@/mocks/store";

/**
 * UC04 FP01/FA01 – `PUT /alunos/{id}/termos/{uso-imagem|saida|compromisso}`.
 * Valida os campos obrigatórios (RN06), bloqueia cards inativos (RN10) e registra no
 * histórico de edições uma linha por campo alterado (RF17).
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string; termo: string }> }) {
  if (!mockHabilitado()) return naoEncontrado();
  await esperar();

  const { usuario: autor, resposta } = usuarioDaSessao(request);
  if (resposta) return resposta;

  const { id, termo } = await params;
  const registro = buscarAluno(id);
  if (!registro) return erro(404, "NAO_ENCONTRADO");
  if (registro.status === "INATIVO") return erro(409, "MATRICULA_INATIVA");

  const corpo = await request.json().catch(() => null);
  const statusAntes = statusAluno(registro);
  let alteracoes: Alteracao[];

  if (termo === "uso-imagem") {
    const payload = lerTermoUsoImagem(corpo);
    if (!payload) return erro(422, "DADOS_INVALIDOS");
    if (temErros(validarTermoUsoImagem(payload))) return erro(422, "FICHAS_INCOMPLETAS");
    alteracoes = alteracoesUsoImagem(registro.termos.usoImagem, payload);
    registro.termos.usoImagem = payload;
  } else if (termo === "saida") {
    const payload = lerTermoSaida(corpo);
    if (!payload) return erro(422, "DADOS_INVALIDOS");
    if (temErros(validarTermoSaida(payload))) return erro(422, "FICHAS_INCOMPLETAS");
    alteracoes = alteracoesSaida(registro.termos.saida, payload);
    registro.termos.saida = payload;
  } else if (termo === "compromisso") {
    const payload = lerTermoCompromisso(corpo);
    if (!payload) return erro(422, "DADOS_INVALIDOS");
    if (temErros(validarTermoCompromisso(payload))) return erro(422, "FICHAS_INCOMPLETAS");
    alteracoes = alteracoesCompromisso(registro.termos.compromisso, payload);
    registro.termos.compromisso = payload;
  } else {
    return erro(404, "NAO_ENCONTRADO");
  }

  // Completar o último termo muda o status do card de Pendente para Ativo (RN06).
  registrarAlteracoes(registro, autor.nome, [...alteracoes, ...alteracaoStatus(statusAntes, statusAluno(registro))]);
  return NextResponse.json(alunoCard(registro));
}
