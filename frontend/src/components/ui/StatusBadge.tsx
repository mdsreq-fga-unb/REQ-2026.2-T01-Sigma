import styles from "./StatusBadge.module.css";

interface StatusBadgeProps {
  ativo: boolean;
  rotuloAtivo?: string;
  rotuloInativo?: string;
}

/** Badge de status com texto (não depende só da cor). */
export function StatusBadge({ ativo, rotuloAtivo = "Ativo", rotuloInativo = "Inativo" }: StatusBadgeProps) {
  return (
    <span className={`${styles.badge} ${ativo ? styles.ativo : styles.inativo}`}>
      <span className={styles.dot} aria-hidden="true" />
      {ativo ? rotuloAtivo : rotuloInativo}
    </span>
  );
}
