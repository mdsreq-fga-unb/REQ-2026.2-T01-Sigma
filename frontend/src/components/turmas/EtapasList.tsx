import { StatusBadge } from "@/components/ui/StatusBadge";
import type { Etapa } from "@/types";
import styles from "./TurmasEtapas.module.css";

function rotuloTurmas(quantidade: number): string {
  return `${quantidade} ${quantidade === 1 ? "turma" : "turmas"}`;
}

// UC06 – listagem de etapas (RF18, RF22). Etapas inativas continuam na busca (RN12).
export function EtapasList({ etapas }: { etapas: Etapa[] }) {
  return (
    <ul className={`${styles.cartao} ${styles.etapas}`} aria-label="Etapas">
      {etapas.map((etapa) => (
        <li key={etapa.id} className={styles.etapa}>
          <div className={styles.etapaInfo}>
            <span className={styles.etapaNome}>{etapa.nome}</span>
            <span className={styles.etapaTurmas}>{rotuloTurmas(etapa.quantidadeTurmas)}</span>
          </div>
          <StatusBadge ativo={etapa.status === "ATIVO"} />
        </li>
      ))}
    </ul>
  );
}

export function EtapasListSkeleton() {
  return (
    <ul className={`${styles.cartao} ${styles.etapas}`} aria-label="Etapas" aria-busy="true">
      {Array.from({ length: 4 }, (_, i) => (
        <li key={i} className={styles.etapa}>
          <div className={styles.etapaInfo}>
            <span className={styles.skeleton} />
            <span className={`${styles.skeleton} ${styles.skeletonCurto}`} />
          </div>
        </li>
      ))}
    </ul>
  );
}
