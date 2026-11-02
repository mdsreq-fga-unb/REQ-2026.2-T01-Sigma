import { AppShell } from "@/components/layout/AppShell";

// Área autenticada. O proxy.ts já barra o acesso sem cookie de sessão (RNF02);
// o AppShell valida a sessão na API antes de renderizar qualquer conteúdo.
export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
