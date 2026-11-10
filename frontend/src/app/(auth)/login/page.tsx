import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { BrandPanel } from "@/components/layout/BrandPanel";
import styles from "./login.module.css";

export const metadata: Metadata = {
  title: "Entrar · SIGMA",
};

// UC01 – Gerenciar Autenticação (RF06, RNF02)
export default function LoginPage() {
  return (
    <div className={styles.page}>
      <div className={styles.brand}>
        <BrandPanel />
      </div>
      <main className={styles.main}>
        <Suspense>
          <LoginForm />
        </Suspense>
      </main>
    </div>
  );
}
