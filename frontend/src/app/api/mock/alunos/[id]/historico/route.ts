import { NextResponse, type NextRequest } from "next/server";
import { NOMES_FICHAS_HISTORICO, OPCOES_PERIODO_HISTORICO, PERIODO_HISTORICO_PADRAO } from "@/lib/alunos";
import { buscarAluno } from "@/mocks/alunos";
import { erro, esperar, mockHabilitado, naoEncontrado, usuarioDaSessao } from "@/mocks/store";
import type { FichaHistorico, ListaHistorico } from "@/types";

const TAMANHO_PADRAO = 10;
const TAMANHO_MAXIMO = 50;
const DIA_MS = 24 * 60 * 60 * 1000;

/**
 * UC04 / RF17 – `GET /alunos/{id}/historico?ficha=&usuario=&periodo=&pagina=&tamanhoPagina=`.
 * Somente leitura, disponível também para cards inativos. Uma linha por campo alterado,
 * mais recente primeiro; campos sensíveis vêm sem valores. Exportações de PDF não são registradas.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!mockHabilitado()) return naoEncontrado();
  await esperar();

  const { resposta } = usuarioDaSessao(request);
  if (resposta) return resposta;

  const registro = buscarAluno((await params).id);
  if (!registro) return erro(404, "NAO_ENCONTRADO");

  const query = request.nextUrl.searchParams;
  const fichaParam = query.get("ficha");
  const ficha = fichaParam && fichaParam in NOMES_FICHAS_HISTORICO ? (fichaParam as FichaHistorico) : undefined;
  const usuario = query.get("usuario")?.trim() || undefined;
  const periodo =
    OPCOES_PERIODO_HISTORICO.find((o) => o.valor === query.get("periodo")) ??
    OPCOES_PERIODO_HISTORICO.find((o) => o.valor === PERIODO_HISTORICO_PADRAO)!;
  const desde = periodo.dias === null ? null : Date.now() - periodo.dias * DIA_MS;
  const tamanhoPagina = Math.min(Math.max(Number(query.get("tamanhoPagina")) || TAMANHO_PADRAO, 1), TAMANHO_MAXIMO);

  // `sort` é estável: linhas do mesmo salvamento mantêm a ordem em que foram gravadas.
  const todos = [...registro.historico].sort((a, b) => Date.parse(b.dataHora) - Date.parse(a.dataHora));
  const filtrados = todos.filter(
    (h) =>
      (!ficha || h.ficha === ficha) &&
      (!usuario || h.usuario === usuario) &&
      (desde === null || Date.parse(h.dataHora) >= desde),
  );

  const totalPaginas = Math.max(Math.ceil(filtrados.length / tamanhoPagina), 1);
  const pagina = Math.min(Math.max(Math.trunc(Number(query.get("pagina")) || 1), 1), totalPaginas);
  const inicio = (pagina - 1) * tamanhoPagina;

  const corpo: ListaHistorico = {
    itens: filtrados.slice(inicio, inicio + tamanhoPagina),
    total: filtrados.length,
    pagina,
    tamanhoPagina,
    usuarios: [...new Set(todos.map((h) => h.usuario))].sort((a, b) => a.localeCompare(b, "pt-BR")),
  };
  return NextResponse.json(corpo);
}
