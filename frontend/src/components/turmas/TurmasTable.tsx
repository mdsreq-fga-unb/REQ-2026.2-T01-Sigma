import Link from "next/link";
import type { ReactNode } from "react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { Turma } from "@/types";
import styles from "./TurmasEtapas.module.css";

interface TurmasTableProps {
  turmas: Turma[];
  onInativar: (turma: Turma) => void;
  onReativar: (turma: Turma) => void;
}

const COLUNAS = ["Turma", "Etapa", "Alunos", "Status", "Ações"];

/**
 * Destino de "Ver alunos": listagem de alunos filtrada pela turma.
 * A tela de Alunos ainda não trata o parâmetro (ponto em aberto 3 da issue).
 */
export function hrefAlunosDaTurma(turma: Turma): string {
  return `/alunos?turma=${encodeURIComponent(turma.id)}`;
}

// UC06 – listagem de turmas (RF19, RF22). Turmas inativas continuam na busca (RN12).
export function TurmasTable({ turmas, onInativar, onReativar }: TurmasTableProps) {
  return (
    <TableFrame>
      <tbody>
        {turmas.map((turma) => {
          const ativa = turma.status === "ATIVO";
          return (
            <tr key={turma.id}>
              <td className={styles.nome}>{turma.nome}</td>
              <td className={styles.muted}>{turma.etapa.nome}</td>
              <td className={styles.muted}>{turma.quantidadeAlunos}</td>
              <td>
                <StatusBadge ativo={ativa} />
              </td>
              <td>
                <div className={styles.acoes}>
                  <Link href={hrefAlunosDaTurma(turma)} className={styles.acao} aria-label={`Ver alunos da ${turma.nome}`}>
                    Ver alunos
                  </Link>
                  {ativa ? (
                    <button
                      type="button"
                      className={`${styles.acao} ${styles.acaoPerigo}`}
                      onClick={() => onInativar(turma)}
                      aria-label={`Inativar ${turma.nome}`}
                    >
                      Inativar
                    </button>
                  ) : (
                    <button
                      type="button"
                      className={`${styles.acao} ${styles.acaoSucesso}`}
                      onClick={() => onReativar(turma)}
                      aria-label={`Reativar ${turma.nome}`}
                    >
                      Reativar
                    </button>
                  )}
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </TableFrame>
  );
}

/** Estado de carregamento: esqueleto da tabela. */
export function TurmasTableSkeleton() {
  return (
    <TableFrame busy>
      <tbody>
        {Array.from({ length: 4 }, (_, linha) => (
          <tr key={linha}>
            {COLUNAS.map((coluna) => (
              <td key={coluna}>
                <span className={styles.skeleton} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </TableFrame>
  );
}

function TableFrame({ busy, children }: { busy?: boolean; children: ReactNode }) {
  return (
    <div className={styles.cartao}>
      <div className={styles.tabelaWrap}>
        <table className={styles.tabela} aria-busy={busy || undefined}>
          <caption className="sr-only">Turmas</caption>
          <thead>
            <tr>
              {COLUNAS.map((coluna) => (
                <th key={coluna} scope="col">
                  {coluna}
                </th>
              ))}
            </tr>
          </thead>
          {children}
        </table>
      </div>
    </div>
  );
}
