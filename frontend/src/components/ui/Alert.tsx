import type { ReactNode } from "react";
import { IconAlert, IconInfo } from "./Icons";
import styles from "./Alert.module.css";

interface AlertProps {
  variant?: "error" | "info";
  children: ReactNode;
}

/** Mensagem de erro/aviso anunciada por leitores de tela. */
export function Alert({ variant = "error", children }: AlertProps) {
  const Icon = variant === "error" ? IconAlert : IconInfo;
  return (
    <div role={variant === "error" ? "alert" : "status"} className={`${styles.alert} ${styles[variant]}`}>
      <Icon size={18} className={styles.icon} />
      <span>{children}</span>
    </div>
  );
}
