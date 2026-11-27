import { IconChevronLeft, IconChevronRight } from "./Icons";
import styles from "./Paginacao.module.css";

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

interface PaginacaoProps {
  pagina: number;
  totalPaginas: number;
  onChange: (pagina: number) => void;
}

/** Paginação das listas (alunos, histórico do card). Some quando há uma página só. */
export function Paginacao({ pagina, totalPaginas, onChange }: PaginacaoProps) {
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
