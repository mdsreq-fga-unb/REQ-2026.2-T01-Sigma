import type { Credenciais, Perfil, Usuario } from "@/types";
import { api, LOGIN_TIMEOUT_MS } from "./api";
import { definirTokenSessao, removerTokenSessao } from "@/lib/sessao";

/** Resposta do backend real ao login (JWT). O mock devolve o Usuario diretamente. */
interface BackendLoginResponse {
  access_token?: string;
  token_type?: string;
  expires_in?: number;
}

/** `GET /auth/me` do backend real usa `is_Admin`; o mock usa `perfil`. */
interface BackendUserResponse {
  id: number | string;
  nome: string;
  email: string;
  is_Admin?: boolean;
  perfil?: Perfil;
  ativo: boolean;
  criadoEm?: string;
  criadoPor?: string | null;
}

function normalizarUsuario(data: BackendUserResponse): Usuario {
  return {
    id: String(data.id),
    nome: data.nome,
    email: data.email,
    perfil: data.perfil ?? (data.is_Admin ? "ADMINISTRADOR" : "USUARIO"),
    ativo: data.ativo,
    criadoEm: data.criadoEm ?? new Date().toISOString(),
    criadoPor: data.criadoPor ?? null,
  };
}

export async function login(credenciais: Credenciais): Promise<Usuario> {
  const { data } = await api.post<BackendLoginResponse & Partial<BackendUserResponse>>("/auth/login", credenciais, {
    timeout: LOGIN_TIMEOUT_MS,
  });

  // Backend real: grava o token e busca o usuário autenticado.
  if (data.access_token) {
    definirTokenSessao(data.access_token, data.expires_in);
    return sessaoAtual();
  }

  // Mock: já devolve o Usuario.
  return normalizarUsuario(data as BackendUserResponse);
}

export async function logout(): Promise<void> {
  try {
    await api.post("/auth/logout");
  } finally {
    removerTokenSessao();
  }
}

export async function sessaoAtual(): Promise<Usuario> {
  const { data } = await api.get<BackendUserResponse>("/auth/me");
  return normalizarUsuario(data);
}
