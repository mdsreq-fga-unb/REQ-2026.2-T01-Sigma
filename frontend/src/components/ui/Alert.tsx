import type { ReactNode } from "react";
import { IconAlert, IconAlertTriangle, IconInfo } from "./Icons";
import styles from "./Alert.module.css";

interface AlertProps {
  variant?: "error" | "info" | "warning";
  children: ReactNode;
}

/** Mensagem de erro/aviso anunciada por leitores de tela. */
export function Alert({ variant = "error", children }: AlertProps) {
  const Icon = variant === "error" ? IconAlert : variant === "warning" ? IconAlertTriangle : IconInfo;
  return (
    <div role={variant === "error" ? "alert" : "status"} className={`${styles.alert} ${styles[variant]}`}>
      <Icon size={18} className={styles.icon} />
      <span>{children}</span>
    </div>
  );
}
