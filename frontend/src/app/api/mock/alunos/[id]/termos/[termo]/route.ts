import { NextResponse, type NextRequest } from "next/server";
import {
  NOMES_FICHAS,
  temErros,
  validarTermoCompromisso,
  validarTermoSaida,
  validarTermoUsoImagem,
} from "@/lib/alunos";
import { alunoCard, buscarAluno, registrarHistorico } from "@/mocks/alunos";
import { lerTermoCompromisso, lerTermoSaida, lerTermoUsoImagem } from "@/mocks/alunosPayload";
import { erro, esperar, mockHabilitado, naoEncontrado, usuarioDaSessao } from "@/mocks/store";

/**
 * UC04 FP01/FA01 – `PUT /alunos/{id}/termos/{uso-imagem|saida|compromisso}`.
 * Valida os campos obrigatórios (RN06), bloqueia cards inativos (RN10) e registra a
 * alteração no histórico de edições (RF17).
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
  let nomeFicha: string;

  if (termo === "uso-imagem") {
    const payload = lerTermoUsoImagem(corpo);
    if (!payload) return erro(422, "DADOS_INVALIDOS");
    if (temErros(validarTermoUsoImagem(payload))) return erro(422, "FICHAS_INCOMPLETAS");
    registro.termos.usoImagem = payload;
    nomeFicha = NOMES_FICHAS.usoImagem;
  } else if (termo === "saida") {
    const payload = lerTermoSaida(corpo);
    if (!payload) return erro(422, "DADOS_INVALIDOS");
    if (temErros(validarTermoSaida(payload))) return erro(422, "FICHAS_INCOMPLETAS");
    registro.termos.saida = payload;
    nomeFicha = NOMES_FICHAS.saida;
  } else if (termo === "compromisso") {
    const payload = lerTermoCompromisso(corpo);
    if (!payload) return erro(422, "DADOS_INVALIDOS");
    if (temErros(validarTermoCompromisso(payload))) return erro(422, "FICHAS_INCOMPLETAS");
    registro.termos.compromisso = payload;
    nomeFicha = NOMES_FICHAS.compromisso;
  } else {
    return erro(404, "NAO_ENCONTRADO");
  }

  registrarHistorico(registro, autor.nome, `${nomeFicha} atualizado.`);
  return NextResponse.json(alunoCard(registro));
}
