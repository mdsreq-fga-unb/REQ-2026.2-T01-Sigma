"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { NenhumResultado } from "@/components/turmas/NenhumResultado";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { IconChevronDown, IconChevronLeft, IconChevronRight, IconSearch } from "@/components/ui/Icons";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { isoParaData } from "@/lib/alunos";
import { MSG } from "@/lib/mensagens";
import { listarAlunos } from "@/services/alunos.service";
import { listarTurmas } from "@/services/turmas.service";
import type { FiltroAlunos, ListaAlunos, StatusAluno, Turma } from "@/types";
import { mensagemErroAluno } from "./erros";
import styles from "./AlunosView.module.css";

const TAMANHO_PAGINA = 10;

type FiltroStatus = "TODOS" | StatusAluno;

type Listagem =
  | { status: "carregando" }
  | { status: "erro"; mensagem: string }
  | { status: "ok"; dados: ListaAlunos };

/**
 * UC08 FP01 – Lista e busca de alunos (RF21). A busca é disparada pelo botão "Buscar"
 * ou pela tecla Enter, como na tela de turmas. `?turma=<id>` (link "Ver alunos" da
 * tela de turmas) já abre a lista filtrada pela turma.
 */
export function AlunosView() {
  const turmaInicial = useSearchParams().get("turma") ?? "";
  const [termo, setTermo] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<FiltroStatus>("TODOS");
  const [turmaId, setTurmaId] = useState(turmaInicial);
  const [aplicado, setAplicado] = useState<FiltroAlunos>({ turmaId: turmaInicial || undefined });
  const [listagem, setListagem] = useState<Listagem>({ status: "carregando" });
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const ultimaRequisicao = useRef(0);

  const buscaId = useId();
  const statusId = useId();
  const turmaSelectId = useId();
  const dicaId = useId();

  const carregar = useCallback(async (filtro: FiltroAlunos) => {
    const requisicao = ++ultimaRequisicao.current;
    setListagem({ status: "carregando" });
    try {
      const dados = await listarAlunos({ ...filtro, tamanhoPagina: TAMANHO_PAGINA });
      if (requisicao === ultimaRequisicao.current) setListagem({ status: "ok", dados });
    } catch (error) {
      if (requisicao === ultimaRequisicao.current) {
        setListagem({ status: "erro", mensagem: mensagemErroAluno(error, "carregar") });
      }
    }
  }, []);

  // Carga inicial; as próximas buscas são disparadas por `buscar()` e pela paginação.
  useEffect(() => {
    void carregar({ turmaId: turmaInicial || undefined });
  }, [carregar, turmaInicial]);

  useEffect(() => {
    // Opções do filtro de turma. Se falhar, o filtro fica só com "Todas".
    listarTurmas().then(setTurmas, () => setTurmas([]));
  }, []);

  function buscar() {
    const filtro: FiltroAlunos = {
      busca: termo.trim() || undefined,
      status: filtroStatus === "TODOS" ? undefined : filtroStatus,
      turmaId: turmaId || undefined,
      pagina: 1,
    };
    setAplicado(filtro);
    void carregar(filtro);
  }

  function irParaPagina(pagina: number) {
    const filtro = { ...aplicado, pagina };
    setAplicado(filtro);
    void carregar(filtro);
  }

  const dados = listagem.status === "ok" ? listagem.dados : null;
  const totalCadastrados = dados?.totalCadastrados;

  return (
    <>
      <PageHeader
        title="Alunos"
        subtitle={
          totalCadastrados === undefined
            ? "Cards de matrícula"
            : `Cards de matrícula · ${totalCadastrados} ${totalCadastrados === 1 ? "aluno" : "alunos"}`
        }
        action={
          <Link href="/alunos/novo" className={styles.botaoNovo}>
            + Novo aluno
          </Link>
        }
      />

      <form
        role="search"
        className={styles.busca}
        onSubmit={(event) => {
          event.preventDefault();
          buscar();
        }}
      >
        <div className={styles.campo}>
          <label htmlFor={buscaId} className="sr-only">
            Buscar aluno pelo nome
          </label>
          <IconSearch size={18} className={styles.iconeBusca} />
          <input
            id={buscaId}
            type="search"
            className={styles.input}
            placeholder="Buscar pelo nome completo ou parte dele..."
            autoComplete="off"
            aria-describedby={dicaId}
            value={termo}
            onChange={(event) => setTermo(event.target.value)}
          />
        </div>

        <div className={styles.filtro}>
          <label htmlFor={statusId}>Status:</label>
          <select id={statusId} value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value as FiltroStatus)}>
            <option value="TODOS">Todos</option>
            <option value="ATIVO">Ativo</option>
            <option value="INATIVO">Inativo</option>
          </select>
          <IconChevronDown size={14} className={styles.chevron} />
        </div>

        <div className={styles.filtro}>
          <label htmlFor={turmaSelectId}>Turma:</label>
          <select id={turmaSelectId} value={turmaId} onChange={(e) => setTurmaId(e.target.value)}>
            <option value="">Todas</option>
            {turmas.map((turma) => (
              <option key={turma.id} value={turma.id}>
                {turma.nome}
                {turma.status === "INATIVO" ? " (inativa)" : ""}
              </option>
            ))}
          </select>
          <IconChevronDown size={14} className={styles.chevron} />
        </div>

        <Button type="submit">Buscar</Button>
      </form>
      <p id={dicaId} className={styles.dica}>
        A busca não diferencia maiúsculas, minúsculas e acentos.
      </p>

      {listagem.status === "erro" ? (
        <div className={styles.estadoErro}>
          <Alert>{listagem.mensagem}</Alert>
          <Button variant="secondary" onClick={() => void carregar(aplicado)}>
            Tentar novamente
          </Button>
        </div>
      ) : dados && dados.itens.length === 0 ? (
        // UC08 FA01 – o campo de busca continua disponível para nova tentativa.
        <NenhumResultado titulo={MSG.nenhumResultado} texto={MSG.nenhumResultadoDica} />
      ) : (
        <>
          <div className={styles.cartao}>
            <div className={styles.tabelaWrap}>
              <table className={styles.tabela} aria-busy={listagem.status === "carregando" || undefined}>
                <thead>
                  <tr>
                    <th scope="col">Nome</th>
                    <th scope="col">Nascimento</th>
                    <th scope="col">Turma</th>
                    <th scope="col">Etapa</th>
                    <th scope="col">Status</th>
                    <th scope="col">
                      <span className="sr-only">Ação</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {dados
                    ? dados.itens.map((aluno) => (
                        <tr key={aluno.id}>
                          <td className={styles.nome}>{aluno.nome}</td>
                          <td className={styles.muted}>{isoParaData(aluno.dataNascimento) || "—"}</td>
                          <td className={styles.muted}>{aluno.turma?.nome ?? "—"}</td>
                          <td className={styles.muted}>{aluno.etapa?.nome ?? "—"}</td>
                          <td>
                            <StatusBadge ativo={aluno.status === "ATIVO"} />
                          </td>
                          <td>
                            <Link
                              href={`/alunos/${encodeURIComponent(aluno.id)}`}
                              className={styles.abrir}
                              aria-label={`Abrir card de ${aluno.nome}`}
                            >
                              Abrir card →
                            </Link>
                          </td>
                        </tr>
                      ))
                    : Array.from({ length: 6 }, (_, linha) => (
                        <tr key={linha}>
                          {Array.from({ length: 6 }, (_, coluna) => (
                            <td key={coluna}>
                              <span className={styles.skeleton} />
                            </td>
                          ))}
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
          </div>

          {dados && (
            <div className={styles.rodape}>
              <p className={styles.muted}>
                Mostrando {dados.itens.length} de {dados.total} {dados.total === 1 ? "aluno" : "alunos"}
              </p>
              <Paginacao
                pagina={dados.pagina}
                totalPaginas={Math.max(Math.ceil(dados.total / dados.tamanhoPagina), 1)}
                onChange={irParaPagina}
              />
            </div>
          )}
        </>
      )}
    </>
  );
}

/** Números exibidos: primeira, última e vizinhas da atual, com "…" nos saltos. */
function paginasVisiveis(atual: number, total: number): (number | "…")[] {
  const paginas = new Set([1, 2, 3, atual - 1, atual, atual + 1, total].filter((p) => p >= 1 && p <= total));
  const ordenadas = [...paginas].sort((a, b) => a - b);
  const resultado: (number | "…")[] = [];
  ordenadas.forEach((p, i) => {
    if (i > 0 && p - ordenadas[i - 1] > 1) resultado.push("…");
    resultado.push(p);
  });
  return resultado;
}

function Paginacao({
  pagina,
  totalPaginas,
  onChange,
}: {
  pagina: number;
  totalPaginas: number;
  onChange: (pagina: number) => void;
}) {
  if (totalPaginas <= 1) return null;
  return (
    <nav aria-label="Paginação" className={styles.paginacao}>
      <button
        type="button"
        onClick={() => onChange(pagina - 1)}
        disabled={pagina === 1}
        aria-label="Página anterior"
      >
        <IconChevronLeft size={14} />
      </button>
      {paginasVisiveis(pagina, totalPaginas).map((p, i) =>
        p === "…" ? (
          <span key={`salto-${i}`} aria-hidden="true">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            aria-current={p === pagina ? "page" : undefined}
            aria-label={`Página ${p}`}
          >
            {p}
          </button>
        ),
      )}
      <button
        type="button"
        onClick={() => onChange(pagina + 1)}
        disabled={pagina === totalPaginas}
        aria-label="Próxima página"
      >
        <IconChevronRight size={14} />
      </button>
    </nav>
  );
}
