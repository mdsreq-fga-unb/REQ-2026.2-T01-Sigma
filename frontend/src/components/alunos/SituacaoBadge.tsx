import styles from "./Alunos.module.css";

interface SituacaoBadgeProps {
  ok: boolean;
  rotuloOk?: string;
  rotuloPendente?: string;
}

/** Situação de ficha ou documento: verde quando concluída, laranja quando pendente. */
export function SituacaoBadge({ ok, rotuloOk = "Preenchida", rotuloPendente = "Pendente" }: SituacaoBadgeProps) {
  return (
    <span className={`${styles.situacao} ${ok ? styles.situacaoOk : styles.situacaoPendente}`}>
      <span className={styles.situacaoPonto} aria-hidden="true" />
      {ok ? rotuloOk : rotuloPendente}
    </span>
  );
}
