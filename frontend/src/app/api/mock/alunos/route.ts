import { NextResponse, type NextRequest } from "next/server";
import { normalizarBusca, temErros, validarNovoAluno } from "@/lib/alunos";
import { alunoCard, alunoResumo, alunos, statusAluno, type AlunoRegistro } from "@/mocks/alunos";
import { lerNovoAluno } from "@/mocks/alunosPayload";
import { erro, esperar, mockHabilitado, naoEncontrado, novoId, store, usuarioDaSessao } from "@/mocks/store";
import type { ListaAlunos, StatusAluno } from "@/types";

const STATUS_VALIDOS: StatusAluno[] = ["PENDENTE", "ATIVO", "INATIVO"];
const TAMANHO_PADRAO = 10;
const TAMANHO_MAXIMO = 50;

/**
 * UC08 FP01 – `GET /alunos?busca=&status=&turmaId=&pagina=&tamanhoPagina=`.
 * A busca é por nome completo ou parcial, ignorando maiúsculas, minúsculas e acentos (RF21).
 */
export async function GET(request: NextRequest) {
  if (!mockHabilitado()) return naoEncontrado();
  await esperar();

  const { resposta } = usuarioDaSessao(request);
  if (resposta) return resposta;

  const params = request.nextUrl.searchParams;
  const busca = normalizarBusca(params.get("busca") ?? "");
  const statusParam = params.get("status");
  const status = STATUS_VALIDOS.find((s) => s === statusParam);
  const turmaId = params.get("turmaId");
  const tamanhoPagina = Math.min(Math.max(Number(params.get("tamanhoPagina")) || TAMANHO_PADRAO, 1), TAMANHO_MAXIMO);

  const filtrados = alunos()
    .filter(
      (a) =>
        (!busca || normalizarBusca(a.aluno.nome).includes(busca)) &&
        (!status || statusAluno(a) === status) &&
        (!turmaId || a.turmaId === turmaId),
    )
    .sort((a, b) => a.aluno.nome.localeCompare(b.aluno.nome, "pt-BR"));

  const totalPaginas = Math.max(Math.ceil(filtrados.length / tamanhoPagina), 1);
  const pagina = Math.min(Math.max(Math.trunc(Number(params.get("pagina")) || 1), 1), totalPaginas);
  const inicio = (pagina - 1) * tamanhoPagina;

  const corpo: ListaAlunos = {
    itens: filtrados.slice(inicio, inicio + tamanhoPagina).map(alunoResumo),
    total: filtrados.length,
    totalCadastrados: alunos().length,
    pagina,
    tamanhoPagina,
  };
  return NextResponse.json(corpo);
}

/** UC04 FP01 / RF08 – cria o card do aluno. Fichas e termos são preenchidos depois. */
export async function POST(request: NextRequest) {
  if (!mockHabilitado()) return naoEncontrado();
  await esperar();

  const { usuario: autor, resposta } = usuarioDaSessao(request);
  if (resposta) return resposta;

  const payload = lerNovoAluno(await request.json().catch(() => null));
  if (!payload || temErros(validarNovoAluno(payload))) return erro(422, "DADOS_INVALIDOS");

  const { aluno, matricula } = payload;
  if (matricula.etapaId && !store.etapas.some((e) => e.id === matricula.etapaId && e.status === "ATIVO")) {
    return erro(409, "ETAPA_INATIVA");
  }
  // RN07 / RN01: um único card por CPF.
  if (aluno.cpf && alunos().some((a) => a.aluno.cpf === aluno.cpf)) return erro(409, "CPF_EM_USO");

  const agora = new Date().toISOString();
  const registro: AlunoRegistro = {
    id: novoId(),
    aluno,
    matricula: { anoLetivo: matricula.anoLetivo, dataMatricula: matricula.dataMatricula },
    etapaId: matricula.etapaId,
    turmaId: null, // vinculada depois, pelo botão "Vincular à turma"
    status: "ATIVO",
    requerimentoPreenchido: false,
    socioeconomicaPreenchida: false,
    termos: { usoImagem: null, saida: null, compromisso: null },
    resumo: { responsavel: "", parentesco: "", telefone: "", endereco: "" },
    documentosEntregues: [],
    historico: [{ id: novoId(), data: agora, autor: autor.nome, descricao: "Card criado." }],
  };
  alunos().push(registro);
  return NextResponse.json(alunoCard(registro), { status: 201 });
}
