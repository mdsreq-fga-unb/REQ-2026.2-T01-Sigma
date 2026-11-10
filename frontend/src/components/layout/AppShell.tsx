"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { AuthProvider } from "@/hooks/useAuth";
import { MSG } from "@/lib/mensagens";
import { Sidebar } from "./Sidebar";
import styles from "./AppShell.module.css";

/** Estrutura da área autenticada: sidebar + conteúdo, renderizada apenas com sessão válida. */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <AuthProvider
      carregando={
        <div className={styles.status} role="status">
          <span className={styles.spinner} aria-hidden="true" />
          <span className="sr-only">Carregando…</span>
        </div>
      }
      erro={(tentarNovamente) => (
        <div className={styles.status}>
          <p role="alert">{MSG.falhaConexao}</p>
          <Button onClick={tentarNovamente}>Tentar novamente</Button>
        </div>
      )}
    >
      <div className={styles.shell}>
        <Sidebar />
        <main className={styles.content}>{children}</main>
      </div>
    </AuthProvider>
  );
}
