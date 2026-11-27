"use client";

import { useEffect, useId, useState } from "react";
import { NenhumResultado } from "@/components/turmas/NenhumResultado";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { IconChevronDown } from "@/components/ui/Icons";
import { Paginacao } from "@/components/ui/Paginacao";
import {
  NOMES_FICHAS_HISTORICO,
  OPCOES_PERIODO_HISTORICO,
  PERIODO_HISTORICO_PADRAO,
  formatarDataHora,
} from "@/lib/alunos";
import { listarHistorico } from "@/services/alunos.service";
import type { FichaHistorico, ListaHistorico, PeriodoHistorico, RegistroHistorico } from "@/types";
import { mensagemErroAluno } from "../erros";
import { useAlunoCard } from "./AlunoCardContext";
import lista from "../AlunosView.module.css";
import styles from "./Historico.module.css";

const TAMANHO_PAGINA = 10;
const COLUNAS = ["Data e hora", "Usuário", "Ficha", "Campo alterado", "Valor anterior", "Valor novo"];
const FICHAS = Object.entries(NOMES_FICHAS_HISTORICO) as [FichaHistorico, string][];

interface Filtro {
  ficha: FichaHistorico | ""; // "" = Todas
  usuario: string; // "" = Todos
  periodo: PeriodoHistorico;
  pagina: number;
}

const FILTRO_PADRAO: Filtro = { ficha: "", usuario: "", periodo: PERIODO_HISTORICO_PADRAO, pagina: 1 };

type Carga = { status: "carregando" } | { status: "erro"; mensagem: string } | { status: "ok"; dados: ListaHistorico };

/** "10/10/2026 14:32" */
function dataHora(iso: string): string {
  return formatarDataHora(iso).replace(",", "");
}

/**
 * UC04 / RF17 – Aba Histórico do card: lista somente leitura das alterações no card e nas
 * fichas, uma linha por campo alterado, com filtros por ficha, usuário e período.
 */
export function Historico() {
  const { card } = useAlunoCard();
  const [filtro, setFiltro] = useState<Filtro>(FILTRO_PADRAO);
  const [carga, setCarga] = useState<Carga>({ status: "carregando" });
  const [usuarios, setUsuarios] = useState<string[]>([]);
  const [tentativa, setTentativa] = useState(0);

  const fichaId = useId();
  const usuarioId = useId();
  const periodoId = useId();

  // Recarrega quando o card recebe uma nova edição (ex.: reativação feita pelo cabeçalho).
  const ultimaEdicao = card.ultimaEdicao?.data;

  useEffect(() => {
    let ativo = true;
    setCarga({ status: "carregando" });
    listarHistorico(card.id, {
      ficha: filtro.ficha || undefined,
      usuario: filtro.usuario || undefined,
      periodo: filtro.periodo,
      pagina: filtro.pagina,
      tamanhoPagina: TAMANHO_PAGINA,
    }).then(
      (dados) => {
        if (!ativo) return;
        setCarga({ status: "ok", dados });
        // As opções de "Usuário" vêm do próprio histórico, não da lista de usuários do sistema.
        setUsuarios(dados.usuarios);
      },
      (error) => {
        if (ativo) setCarga({ status: "erro", mensagem: mensagemErroAluno(error, "carregar") });
      },
    );
    return () => {
      ativo = false;
    };
  }, [card.id, filtro, tentativa, ultimaEdicao]);

  /** Qualquer mudança de filtro volta para a página 1. */
  function filtrar(mudanca: Partial<Omit<Filtro, "pagina">>) {
    setFiltro((atual) => ({ ...atual, ...mudanca, pagina: 1 }));
  }

  const filtroPadrao =
    filtro.ficha === FILTRO_PADRAO.ficha &&
    filtro.usuario === FILTRO_PADRAO.usuario &&
    filtro.periodo === FILTRO_PADRAO.periodo;
  const dados = carga.status === "ok" ? carga.dados : null;

  return (
    <>
      <div className={styles.filtros} role="group" aria-label="Filtros do histórico">
        <div className={lista.filtro}>
          <label htmlFor={fichaId}>Ficha:</label>
          <select
            id={fichaId}
            value={filtro.ficha}
            onChange={(e) => filtrar({ ficha: e.target.value as Filtro["ficha"] })}
          >
            <option value="">Todas</option>
            {FICHAS.map(([valor, rotulo]) => (
              <option key={valor} value={valor}>
                {rotulo}
              </option>
            ))}
          </select>
          <IconChevronDown size={14} className={lista.chevron} />
        </div>

        <div className={lista.filtro}>
          <label htmlFor={usuarioId}>Usuário:</label>
          <select id={usuarioId} value={filtro.usuario} onChange={(e) => filtrar({ usuario: e.target.value })}>
            <option value="">Todos</option>
            {usuarios.map((nome) => (
              <option key={nome} value={nome}>
                {nome}
              </option>
            ))}
          </select>
          <IconChevronDown size={14} className={lista.chevron} />
        </div>

        <div className={lista.filtro}>
          <label htmlFor={periodoId}>Período:</label>
          <select
            id={periodoId}
            value={filtro.periodo}
            onChange={(e) => filtrar({ periodo: e.target.value as PeriodoHistorico })}
          >
            {OPCOES_PERIODO_HISTORICO.map((opcao) => (
              <option key={opcao.valor} value={opcao.valor}>
                {opcao.rotulo}
              </option>
            ))}
          </select>
          <IconChevronDown size={14} className={lista.chevron} />
        </div>
      </div>

      {carga.status === "erro" ? (
        <div className={lista.estadoErro}>
          <Alert>{carga.mensagem}</Alert>
          <Button variant="secondary" onClick={() => setTentativa((n) => n + 1)}>
            Tentar novamente
          </Button>
        </div>
      ) : dados && dados.itens.length === 0 ? (
        <div className={styles.vazio}>
          <NenhumResultado
            titulo="Nenhuma alteração encontrada para os filtros selecionados."
            texto={
              filtroPadrao
                ? "Não houve alterações nos últimos 30 dias. Amplie o período para ver registros mais antigos."
                : "Altere ou limpe os filtros para ver outras alterações."
            }
          />
          {filtroPadrao ? (
            <Button variant="secondary" onClick={() => filtrar({ periodo: "TODO" })}>
              Ver todo o período
            </Button>
          ) : (
            <Button variant="secondary" onClick={() => setFiltro(FILTRO_PADRAO)}>
              Limpar filtros
            </Button>
          )}
        </div>
      ) : (
        <div className={lista.cartao}>
          <div className={lista.tabelaWrap}>
            <table
              className={`${lista.tabela} ${styles.tabela}`}
              aria-busy={carga.status === "carregando" || undefined}
            >
              <caption className="sr-only">Histórico de edições de {card.aluno.nome}</caption>
              <thead>
                <tr>
                  {COLUNAS.map((coluna) => (
                    <th key={coluna} scope="col">
                      {coluna}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dados
                  ? dados.itens.map((registro) => <Linha key={registro.id} registro={registro} />)
                  : Array.from({ length: 6 }, (_, linha) => (
                      <tr key={linha}>
                        {COLUNAS.map((coluna) => (
                          <td key={coluna}>
                            <span className={lista.skeleton} />
                          </td>
                        ))}
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className={styles.rodape}>
        <p className={styles.nota}>O histórico é somente leitura: nenhum usuário pode editar ou apagar registros.</p>
        {dados && (
          <Paginacao
            pagina={dados.pagina}
            totalPaginas={Math.max(Math.ceil(dados.total / dados.tamanhoPagina), 1)}
            onChange={(pagina) => setFiltro((atual) => ({ ...atual, pagina }))}
          />
        )}
      </div>
    </>
  );
}

function Linha({ registro }: { registro: RegistroHistorico }) {
  return (
    <tr>
      <td className={styles.data}>{dataHora(registro.dataHora)}</td>
      <td className={lista.muted}>{registro.usuario}</td>
      <td className={lista.muted}>{NOMES_FICHAS_HISTORICO[registro.ficha] ?? registro.ficha}</td>
      <td className={`${lista.muted} ${styles.quebra}`}>{registro.campo}</td>
      <td className={`${styles.anterior} ${styles.quebra}`}>
        <Valor registro={registro} valor={registro.valorAnterior} />
      </td>
      <td className={`${styles.novo} ${styles.quebra}`}>
        <Valor registro={registro} valor={registro.valorNovo} />
      </td>
    </tr>
  );
}

/** Campos sensíveis não mostram conteúdo: quem decide é o backend, que nem grava os valores. */
function Valor({ registro, valor }: { registro: RegistroHistorico; valor: string | null }) {
  if (registro.sensivel) {
    return (
      <span className={styles.sensivel} title="Campo sensível: o conteúdo não é exibido.">
        Valor alterado
      </span>
    );
  }
  return <>{valor || "—"}</>;
}
