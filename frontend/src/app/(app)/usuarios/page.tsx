import type { Metadata } from "next";
import { UsuariosView } from "@/components/usuarios/UsuariosView";

export const metadata: Metadata = { title: "Usuários · SIGMA" };

// UC02 – Gerenciar Usuários Administrativos (RF05)
export default function UsuariosPage() {
  return <UsuariosView />;
}
