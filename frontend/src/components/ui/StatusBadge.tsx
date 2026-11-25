import styles from "./StatusBadge.module.css";

export type StatusBadgeStatus = "ATIVO" | "PENDENTE" | "INATIVO";

interface StatusBadgeProps {
  ativo?: boolean;
  status?: StatusBadgeStatus;
  rotuloAtivo?: string;
  rotuloInativo?: string;
  rotuloPendente?: string;
}

/** Badge de status com texto (não depende só da cor). */
export function StatusBadge({
  ativo,
  status,
  rotuloAtivo = "Ativo",
  rotuloInativo = "Inativo",
  rotuloPendente = "Pendente",
}: StatusBadgeProps) {
  const estado: StatusBadgeStatus = status ?? (ativo ? "ATIVO" : "INATIVO");
  const rotulo = estado === "ATIVO" ? rotuloAtivo : estado === "PENDENTE" ? rotuloPendente : rotuloInativo;
  const classe = estado === "ATIVO" ? styles.ativo : estado === "PENDENTE" ? styles.pendente : styles.inativo;

  return (
    <span className={`${styles.badge} ${classe}`}>
      <span className={styles.dot} aria-hidden="true" />
      {rotulo}
    </span>
  );
}