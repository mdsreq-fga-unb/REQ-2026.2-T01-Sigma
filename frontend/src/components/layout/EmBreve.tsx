import styles from "./EmBreve.module.css";

/** Conteúdo provisório para telas de casos de uso das próximas iterações. */
export function EmBreve({ casoDeUso }: { casoDeUso: string }) {
  return (
    <div className={styles.box}>
      <p className={styles.title}>Em construção</p>
      <p className={styles.text}>Esta tela será implementada em uma próxima iteração ({casoDeUso}).</p>
    </div>
  );
}
