import type { Credenciais, Usuario } from "@/types";
import { api, LOGIN_TIMEOUT_MS } from "./api";

export async function login(credenciais: Credenciais): Promise<Usuario> {
  const { data } = await api.post<Usuario>("/auth/login", credenciais, {
    timeout: LOGIN_TIMEOUT_MS,
  });
  return data;
}

export async function logout(): Promise<void> {
  await api.post("/auth/logout");
}

export async function sessaoAtual(): Promise<Usuario> {
  const { data } = await api.get<Usuario>("/auth/me");
  return data;
}
