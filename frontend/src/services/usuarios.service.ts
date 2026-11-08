import type { NovoUsuarioPayload, Usuario } from "@/types";
import { api } from "./api";

export async function listarUsuarios(): Promise<Usuario[]> {
  const { data } = await api.get<Usuario[]>("/usuarios");
  return data;
}

export async function criarUsuario(payload: NovoUsuarioPayload): Promise<Usuario> {
  const { data } = await api.post<Usuario>("/usuarios", payload);
  return data;
}

export async function inativarUsuario(id: string): Promise<Usuario> {
  const { data } = await api.patch<Usuario>(`/usuarios/${encodeURIComponent(id)}/inativar`);
  return data;
}

export async function reativarUsuario(id: string): Promise<Usuario> {
  const { data } = await api.patch<Usuario>(`/usuarios/${encodeURIComponent(id)}/reativar`);
  return data;
}
