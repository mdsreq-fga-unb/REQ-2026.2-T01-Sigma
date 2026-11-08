import { IconSearchOff } from "@/components/ui/Icons";
import styles from "./TurmasEtapas.module.css";

interface NenhumResultadoProps {
  titulo: string;
  texto: string;
}

/** UC08 FA02 – estado vazio de uma seção, anunciado por leitores de tela. */
export function NenhumResultado({ titulo, texto }: NenhumResultadoProps) {
  return (
    <div className={`${styles.cartao} ${styles.vazio}`} role="status">
      <span className={styles.vazioIcone}>
        <IconSearchOff size={22} />
      </span>
      <p className={styles.vazioTitulo}>{titulo}</p>
      <p className={styles.vazioTexto}>{texto}</p>
    </div>
  );
}
