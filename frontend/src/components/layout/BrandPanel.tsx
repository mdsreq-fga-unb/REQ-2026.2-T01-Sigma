import { IconCheck } from "@/components/ui/Icons";
import { Logo } from "./Logo";
import styles from "./BrandPanel.module.css";

const DESTAQUES = [
  ,
  
];

/** Painel institucional (azul escuro) da tela de login. */
export function BrandPanel() {
  return (
    <aside className={styles.panel}>
      <span className={`${styles.circle} ${styles.circleTop}`} aria-hidden="true" />
      <span className={`${styles.circle} ${styles.circleBottom}`} aria-hidden="true" />
      <span className={`${styles.circle} ${styles.circleSmall}`} aria-hidden="true" />

      <Logo subtitle="Sistema Integrado de Gestão de Matrículas" />

      <div className={styles.content}>
        <p className={styles.headline}>As fichas da creche, organizadas e seguras em um só lugar.</p>
        <ul className={styles.list}>
          {DESTAQUES.map((item) => (
            <li key={item}>
              <span className={styles.check}>
                <IconCheck size={14} />
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      <p className={styles.footer}>Creche Estação Vida · Águas Lindas de Goiás</p>
    </aside>
  );
}
