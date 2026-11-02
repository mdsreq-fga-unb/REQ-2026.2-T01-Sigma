import styles from "./Logo.module.css";

interface LogoProps {
  subtitle: string;
}

export function Logo({ subtitle }: LogoProps) {
  return (
    <div className={styles.logo}>
      <span className={styles.mark} aria-hidden="true">
        Σ
      </span>
      <span className={styles.text}>
        <span className={styles.name}>SIGMA</span>
        <span className={styles.subtitle}>{subtitle}</span>
      </span>
    </div>
  );
}
