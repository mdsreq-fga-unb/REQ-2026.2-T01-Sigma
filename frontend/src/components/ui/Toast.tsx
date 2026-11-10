"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { IconCheck, IconX } from "./Icons";
import styles from "./Toast.module.css";

interface ToastItem {
  id: number;
  message: string;
}

const ToastContext = createContext<((message: string) => void) | null>(null);

const DURACAO_MS = 4000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);

  const fechar = useCallback((id: number) => {
    setToasts((atual) => atual.filter((t) => t.id !== id));
  }, []);

  const mostrar = useCallback(
    (message: string) => {
      const id = ++nextId.current;
      setToasts((atual) => [...atual, { id, message }]);
      setTimeout(() => fechar(id), DURACAO_MS);
    },
    [fechar],
  );

  return (
    <ToastContext.Provider value={mostrar}>
      {children}
      <div className={styles.region} role="status" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className={styles.toast}>
            <span className={styles.icon}>
              <IconCheck size={14} />
            </span>
            <span className={styles.message}>{toast.message}</span>
            <button type="button" className={styles.close} onClick={() => fechar(toast.id)} aria-label="Fechar aviso">
              <IconX size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast deve ser usado dentro de <ToastProvider>");
  return ctx;
}
