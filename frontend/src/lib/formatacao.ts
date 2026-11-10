import type { Perfil } from "@/types";

const dataFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "America/Sao_Paulo",
});

/** ISO 8601 → dd/mm/aaaa */
export function formatarData(iso: string): string {
  return dataFormatter.format(new Date(iso));
}

export function rotuloPerfil(perfil: Perfil): string {
  return perfil === "ADMINISTRADOR" ? "Administrador" : "Usuário";
}

export function inicial(nome: string): string {
  return nome.trim().charAt(0).toUpperCase() || "?";
}
