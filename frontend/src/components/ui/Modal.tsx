"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import styles from "./Modal.module.css";

interface ModalProps {
  title: string;
  description?: string;
  onClose: () => void;
  /** Quando false, Esc e clique no overlay não fecham (ex.: durante uma requisição). */
  dismissible?: boolean;
  size?: "md" | "sm";
  children: ReactNode;
}

const FOCAVEIS =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Diálogo modal acessível: role="dialog", foco inicial no primeiro campo,
 * foco preso dentro do modal, Esc fecha e o foco volta ao elemento que o abriu.
 * Deve ser renderizado condicionalmente (montar = abrir), o que também descarta o estado ao fechar.
 */
export function Modal({ title, description, onClose, dismissible = true, size = "md", children }: ModalProps) {
  const titleId = useId();
  const descId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const dismissibleRef = useRef(dismissible);
  onCloseRef.current = onClose;
  dismissibleRef.current = dismissible;

  useEffect(() => {
    const anterior = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;
    const primeiro =
      dialog?.querySelector<HTMLElement>("input:not([disabled]), select, textarea") ??
      dialog?.querySelector<HTMLElement>(FOCAVEIS);
    (primeiro ?? dialog)?.focus();

    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.stopPropagation();
        if (dismissibleRef.current) onCloseRef.current();
        return;
      }
      if (event.key !== "Tab" || !dialog) return;

      const focaveis = Array.from(dialog.querySelectorAll<HTMLElement>(FOCAVEIS));
      if (focaveis.length === 0) {
        event.preventDefault();
        return;
      }
      const first = focaveis[0];
      const last = focaveis[focaveis.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = overflowAnterior;
      anterior?.focus();
    };
  }, []);

  return createPortal(
    <div
      className={styles.overlay}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && dismissibleRef.current) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        className={`${styles.dialog} ${size === "sm" ? styles.sm : ""}`}
      >
        <header className={styles.header}>
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
          {description && (
            <p id={descId} className={styles.description}>
              {description}
            </p>
          )}
        </header>
        {children}
      </div>
    </div>,
    document.body,
  );
}
