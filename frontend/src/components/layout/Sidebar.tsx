"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { IconLayers, IconLogOut, IconMoon, IconSun, IconUser, IconUsers } from "@/components/ui/Icons";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { Logo } from "./Logo";
import { UserCard } from "./UserCard";
import styles from "./Sidebar.module.css";

const MENU = [
  { href: "/alunos", label: "Alunos", Icon: IconUsers },
  { href: "/turmas", label: "Turmas e etapas", Icon: IconLayers },
  { href: "/usuarios", label: "Usuários", Icon: IconUser },
];

export function Sidebar() {
  const pathname = usePathname();
  const { usuario, logout } = useAuth();
  const { tema, alternar } = useTheme();
  const [saindo, setSaindo] = useState(false);

  async function sair() {
    setSaindo(true);
    await logout();
  }

  return (
    <aside className={styles.sidebar}>
      <Logo subtitle="Creche Estação Vida" />

      <nav className={styles.nav} aria-labelledby="menu-titulo">
        <p id="menu-titulo" className={styles.sectionTitle}>
          Menu
        </p>
        <ul className={styles.menu}>
          {MENU.map(({ href, label, Icon }) => {
            const ativo = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`${styles.item} ${ativo ? styles.active : ""}`}
                  aria-current={ativo ? "page" : undefined}
                >
                  <Icon />
                  <span>{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className={styles.bottom}>
        <button type="button" className={styles.item} onClick={alternar} aria-pressed={tema === "dark"}>
          {tema === "dark" ? <IconSun /> : <IconMoon />}
          <span>{tema === "dark" ? "Modo claro" : "Modo escuro"}</span>
        </button>
        <div className={styles.divider} />
        <UserCard nome={usuario.nome} email={usuario.email} />
        <button type="button" className={styles.item} onClick={sair} disabled={saindo}>
          <IconLogOut />
          <span>{saindo ? "Saindo..." : "Sair"}</span>
        </button>
      </div>
    </aside>
  );
}
